var events = require('events');
var Mopidy = require("mopidy");
var res_json = require('../util/response_helper');
var request = require('request');
var usersController = require('./usersController');
var defaultPlaylist = require('./defaultPlaylist');
var config = require('../config');

Player.prototype = new events.EventEmitter;


function Player (app,server) {
	'use strict';

	var self = this;

	// We need to maintain a datastructure to store the
	// enhanced track objects (added requestor and cover
	// art). Otherwise, the browser won't show a cover
	// or the name of the user who has requested the track.
	var map = {};

	events.EventEmitter.call(this);

	this.mopidy = new Mopidy({
	    webSocketUrl: "ws://localhost:6680/mopidy/ws/"
	});

	this.status = {
		'now_playing' : null,
		'error_offline_msg' : "Music Server is offline",
		'playbackstatus':''
	};

	this.online = false;

	this.bombThreshold = 3;

	this.bomb_track = "spotify:track:1JFeNGtkTjiTWgSSz0iHq5";

	this.bomb_switch = false;

	this.default_playlist_uri = config.default_playlist_uri;

	this.default_playlist = null;

	this.stop = function(req, res){
		// console.log('self.mopidy.tracklist',self.mopidy);
		res_json.success(res,"");
	}
	this.pause = function(){
		this.status.playbackstatus = 'PAUSED';
		this.mopidy.playback.pause().then(null, console.error.bind(console));
	}
	this.play = function(track){
		this.status.playbackstatus = 'PLAYING';
		this.mopidy.playback.play().then(null, console.error.bind(console));
	}
	this.playpause = function(req, res){
		if(self.status.playbackstatus == "PLAYING"){
			self.pause();
		}else{
			self.play();
		}
		self.emit('player:playpause',self.status.playbackstatus);
		res_json.success(res, {'message': self.status.playbackstatus });
	}

	this.add = function(req, res){
		if(self.online === false) return res_json.error(res, self.status.error_offline_msg);
		
		var _track = req.body;

		// attach the name of the user who has added this track
		_track.by = req.user || "???";

		// Try to figure out if this track is already part of the tracklist
		// If track is already part of tracklist, don't add it.
		// Otherwise get the album art and add to tracklist afterwards.
		self.mopidy.tracklist.filter({'uri': [_track.uri]}).then(function(tl_tracks) {
			if (tl_tracks.length == 0){
				self.util.getArt(_track,function(err,track){
					if(err) return res_json.error(res,err);
					
					self.mopidy.library.lookup(_track.uri).then(function(t){
						// Lookup track and add to tracklist
						self.mopidy.tracklist.add(t);
						self.emit('player:track:added');
						map[_track.uri] = _track;
						res_json.success(res,_track);
					});
				});
			}else{
				var _msg = 'Track is a duplicate';
				self.emit('log',_msg);
				res_json.error(res,_msg);
			}
		});
	}


	this.playlist = function(req, res){
		self.mopidy.tracklist.getTlTracks().then(function(tl_tracks){
			if(tl_tracks.length == 0){
				res_json.error(res, "No tracks added yet");
			}else{
				// Remove all tracks from tl_tracks that have already been played. Thus,
				// get the currently playing track and slice tl_tracks accordingly.
				self.mopidy.playback.getCurrentTlTrack().then(function(current_tl_track) {
					self.mopidy.tracklist.index(current_tl_track).then(function(idx){
						self.mopidy.tracklist.getLength().then(function(length){
							self.mopidy.tracklist.slice(idx, length).then(function(tl_tracks){
								// extract track objs from tl_track wrappers
								var tracks = [];
								for (var i = 0; i < tl_tracks.length; ++i) {
									var cacheHit = map[tl_tracks[i].track.uri];
									if (typeof cacheHit == 'undefined'){
										// cache miss (the track has been added to the backend
										// by another frontend)
										cacheHit = tl_tracks[i].track;
										// it does not have a user object associated
										cacheHit.by = req.user;
										cacheHit.by.name = "???";
										cacheHit.by.id = "???";
										cacheHit.by.username = "???";
										// nor has it cover artwork
										//TODO add album from looked up at spotify.com
										cacheHit.album.art = 'images/apollo.png';
										// Finally add to cache
										map[cacheHit.uri] = cacheHit;
									}
									tracks[i] = cacheHit;
								}
								res_json.success(res, {'tracks':tracks});
							});
						});
					});
				});
			}
		});
	}


	this.search = function(req, res){
		var term = req.params.query;
		if (term.indexOf('spotify:') != -1){
			self.mopidy.library.lookup(term).then(function(tracks) {
				var tracks = self.util.removeAlreadyAdded(tracks);
				return res_json.success(res, {'tracks':tracks,'term':term});
			});
		}else{
			self.mopidy.library.search({any:[term]}).then(function(data){
				// merge all result arrays of all backends
				// (they might have duplicates though which we tolerate)
				var results = {'tracks': [], 'artists': [], 'albums': []};
				for (var i = 0; i < data.length; ++i) {
					for (var prop in results) {
						if (data[i][prop] && data[i][prop].length) {
							results[prop] = results[prop].concat(data[i][prop]);
						}
					}
				}
				var tracks = self.util.removeAlreadyAdded(results.tracks);
				return res_json.success(res, {'tracks':tracks,'term':term});
			});
		}
	}

	this.bomb = function(req, res){
		
		//check if there's anything in the playlist
		var current_track = self.current_track;
		if(!current_track){
			return res_json.error(res, "No tracks have been added yet!");
		}


		if(current_track.hasOwnProperty('bombers')){

			current_track.bombers[req.user.id] = "vote";

			var count = Object.keys(current_track.bombers).length;

			current_track.bomb_count = count;

			if(count >= self.bombThreshold){

				self.bomb_switch = true;

				self.mopidy.library.lookup(self.bomb_track).then(function(track) {
					
					self.mopidy.tracklist.clear();

					self.mopidy.tracklist.add(track);
				
					self.play();

					setTimeout(function(){
						self.bomb_switch = false;
					},1700);
					
				
				});
			}

		}else{
			current_track.bombers = {};
			current_track.bombers[req.user.id] = "vote";
			current_track.bomb_count = 1;
		}
		self.emit('player:bomb:update', current_track.bomb_count);
		res_json.success(res, {track:current_track});
	}


	this.loadDefaultPlayList = function(){
		var uri = self.default_playlist_uri;
		if(uri === ''){
			console.log('No default playlist uri given, thus cannot fallback to tracks on empty tracklist');
			return;
		}
		self.mopidy.library.lookup(uri).then(function(tracks) {
			self.util.shuffle(tracks);
			self.default_playlist = tracks;
			self.emit('playback:defaultTracks', self.default_playlist);
			//console.log('playback:defaultTracks', self.default_playlist);
		});
	}


	this._playbackStarted = function(track){
		self.emit('playback:started', track);
		console.log('playback:started', track);
	}

	this._playbackEnded = function(lastTlTrack){
		console.log('_playbackEnded: ', lastTlTrack);
		
		self.mopidy.playback.getCurrentTlTrack().then(function(tl_track) {
			if (tl_track == null){
				console.log('Tracklist has reached its end, add one more track from the default playlist');
				// remove first track from default playlist and have it played
				var track = self.default_playlist.shift();
				self.mopidy.library.lookup(track.uri).then(function(track) {
					self.mopidy.tracklist.add(track).then(function(addedTracks){
						self.mopidy.playback.play(addedTracks[0]);
						self.emit('playback:queue', [_track]);
					});
				});
			}
		});
/*		self.mopidy.tracklist.getLength().then(function(length){
			// The end of the tracklist has been reached, if
			// the length of the tracklist (minus one due to array counting)
			// is equal to the tracklist track id
			console.log('tracklist length: ', length);
			if((length - 1) == parseInt(lastTlTrack.tl_track.tlid)){
				console.log('Tracklist has reached its end, add one more track from the default playlist');
				// remove first track from default playlist and have it played
				var track = self.default_playlist.shift();
				self.mopidy.library.lookup(track.uri).then(function(track) {
					self.mopidy.tracklist.add(track);
					self.play();
				});
			}
		});
*/	}

		// This check "filters" duplicate playback ended events
		// which seem to be emitted by the javascript mopidy client.
		// A duplicate causes Apollo to skip two or more tracks in
		// quick succession potentially emptying the playlist.
/*		if(lastTrack.tl_track.track.uri === self.lastPlaybackEnded){
			console.log('Skipping what appears to be a duplicate event');
			return;
		}
		self.lastPlaybackEnded = lastTrack.tl_track.track.uri;

		if(self.bomb_switch) {
			return;
		}
*/
	this._online = function (){
		console.info('[Player.js]: Online');
		self.online = true;
		self.loadDefaultPlayList();
	}

	this._offline = function(){
		console.info('[Player.js]: Offline');
		this.online = false;
	}

	this._disconnect = function() {
		// Close the WebSocket without reconnecting. Letting the object be garbage
		// collected will have the same effect, so this isn't strictly necessary.
		this.mopidy.close();
		// Unregister all event listeners. If you don't do this, you may have
		// lingering references to the object causing the garbage collector to not
		// clean up after it.
		this.mopidy.off();
		// Delete your reference to the object, so it can be garbage collected.
		this.mopidy = null;
	}

	//this.mopidy.on(console.log.bind(console)); // prints ALL events to console
	this.mopidy.on("state:online", this._online.bind(this));
	this.mopidy.on("state:offline", this._offline.bind(this));
	this.mopidy.on('event:trackPlaybackStarted', this._playbackStarted.bind(this));
	this.mopidy.on('event:trackPlaybackEnded', this._playbackEnded.bind(this));
	//this.mopidy.on('event:playbackStateChanged', ...); // Called if state changes between stopped and playing (which happens after each track)

	this.util = {
		getArt : function(p_track, p_callback){
			console.log('Getting cover for: ',p_track);
			// Only send cover art request to spotify if track uri points to spotify
			if (p_track.uri.substr(0, 'spotify:'.length) === 'spotify:') {
				request({
				  uri: "https://embed.spotify.com/oembed/?url="+p_track.uri,
				  method: "GET",
				  headers: {
			          'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:25.0) Gecko/20100101 Firefox/25.0'
				}
			}, function(error, response, body) {
					var response = JSON.parse(body);
					var album_art_640 = function(str){
						str = str.split('cover');
						return str[0]+'640'+str[1];
					}(response.thumbnail_url);

					p_track.album.art = album_art_640;
					p_callback.apply(self,[error,p_track]);
			});
			}else{
				// return dummy image as track
				p_track.album.art = 'images/apollo.png';
				p_callback.apply(self,[null, p_track]);
			}
		},

		removeAlreadyAdded : function(tracks){
			//TODO check current tracklist
			return tracks;
		},

		createSubset: function(arr, amount){
			var i = arr.length;
			while (--i) {
			  var j = Math.floor(Math.random() * (i + 1))
			  var temp = arr[i];
			  arr[i] = arr[j];
			  arr[j] = temp;
			}
			var subset = arr.slice(0,amount);
			return subset;
		},

		shuffle: function(array) {
			var counter = array.length, temp, index;
			// While there are elements in the array
			while (counter > 0) {
				// Pick a random index
				index = Math.floor(Math.random() * counter);
				// Decrease counter by 1
				counter--;
				// And swap the last element with it
				temp = array[counter];
				array[counter] = array[index];
				array[index] = temp;
			}
			return array;
		}
	};
}

exports = module.exports =  Player;

