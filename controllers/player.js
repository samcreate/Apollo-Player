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

	this.queue = [];

	this.current_track;

	this.lastPlaybackEnded;

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
	this.add = function( req, res){


		if(self.online === false) return res_json.error(res, self.status.error_offline_msg);
		
		var _track = req.body;
		console.log('add: ', _track.name);
		console.log('add: ', _track.uri);
		if(self.util.check4dup(_track.uri)){

			var _msg = 'Track is a duplicate';

			self.emit('log',_msg);

			res_json.error(res,_msg);

		}else{


			_track.by = req.user || "fart";

			self.util.getArt(_track,function(err,track){

				if(err) return res_json.error(res,err);

				if(self.default_playlist != null){
					self.default_playlist= null;
					self.mopidy.playback.stop();
					self.mopidy.tracklist.clear();
				};

				if(self.status.now_playing){

					self.queue.push(_track);

				}else{
					console.log('add#lookupAndPlay');
					self.lookupAndPlay(_track);

				}
				self.emit('player:track:added');
				res_json.success(res,_track);

			});

			


		}

	}


	this.playlist = function(req, res){

		
		var _playlist = self.util.buildPlaylist();

		if(_playlist[0] === "empty"){
			res_json.error(res, "No tracks added yet");
		}else{
			res_json.success(res, {'tracks':_playlist});
		}

		
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


	this.lookupAndPlay = function(p_track){

		if (typeof p_track === 'undefined' || p_track === null) return;

		this.current_track = p_track;

		self.mopidy.library.lookup(p_track.uri).then(function(track) {
					
			self.mopidy.tracklist.clear();

			self.mopidy.tracklist.add(track);
			console.log("lookupAndPlay: ", p_track.name);
			self.play();
		
		});
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

		if(uri === '') return;

		self.mopidy.library.lookup(uri).then(function(tracks) {

			//get an random array of 34 tracks.
			var subsetTracks = self.util.createSubset(tracks,34);
			self.default_playlist = subsetTracks;
			self.mopidy.tracklist.clear();
			self.mopidy.tracklist.add(subsetTracks);
			self.mopidy.tracklist.shuffle();
			self.play();
			self.emit('playback:defaultTracks', subsetTracks);
			console.log('playback:defaultTracks', subsetTracks);
		});

		
		
		
	}


	this._playbackStarted = function(track){

		if(self.default_playlist != null) return;

		self.status.now_playing = track;

		self.emit('playback:started', track);

		console.log('playback:started', track);
	}

	this._playbackEnded = function(lastTrack){
		console.log('_playbackEnded: ', lastTrack);

		// This check "filters" duplicate playback ended events
		// which seem to be emitted by the javascript mopidy client.
		// A duplicate causes Apollo to skip two or more tracks in
		// quick succession potentially emptying the playlist.
		if(lastTrack.tl_track.track.uri === self.lastPlaybackEnded){
			console.log('Skipping what appears to be a duplicate event');
			return;
		}
		self.lastPlaybackEnded = lastTrack.tl_track.track.uri;

		if(self.default_playlist != null) {

			return; 
		}


		if(self.bomb_switch) {
			return;
		}

		if(self.queue[0]) {

			var to_be_played = self.queue.shift();
			console.log('playbackEnded#lookupAndPlay');
			self.lookupAndPlay(to_be_played);

			self.emit('playback:queue', self.util.buildPlaylist() );

			console.log('playback:queue');

		} else {
			self.status.now_playing = null;

			if(self.current_track.uri == lastTrack.tl_track.track.uri){
				self.current_track = null;
				self.loadDefaultPlayList();
			}
			self.emit('playback:queue', self.util.buildPlaylist() );

		}
	}

	this._online = function (){

		console.info('[Player.js]: Online');
		//console.log(self.mopidy);
		//console.log(self.mopidy.tracklist);
		//console.log(self.mopidy.playback);
		self.online = true;
		self.mopidy.tracklist.clear();
		self.lookupAndPlay(self.current_track);
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

	// this.mopidy.on('state:online', this.online.bind(this));
	this.mopidy.on("state:online", this._online.bind(this));
	this.mopidy.on("state:offline", this._offline.bind(this));
	this.mopidy.on('event:trackPlaybackStarted', this._playbackStarted.bind(this));
	this.mopidy.on('event:trackPlaybackEnded', this._playbackEnded.bind(this));

	this.util = {
		getArt : function(p_track, p_callback){
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
		check4dup : function(uri){

			for (var x in self.queue) {
				if(self.queue[x].uri === uri) return true
			}

			return false;

		},
		buildPlaylist : function(){
			if(self.queue.length > 0){
				var _tmp_array = self.queue.slice(0);
				_tmp_array.splice(0,0,self.current_track);
				return _tmp_array;
			}else{
				return [ self.current_track || "empty" ];
			}
			
		},
		removeAlreadyAdded : function(tracks){
			if(self.queue.length > 0){
				var keepers = [];
				for (var i = 0; i < tracks.length; i++) {
					
					for (var x = 0; x < self.queue.length; x++) {
						
						if(tracks[i].uri == self.queue[x].uri){
							tracks.splice(i,1);
							
						}
					};

				}
				for (var y = 0; y < tracks.length; y++) {
					
					if(self.current_track.uri == tracks[y].uri){
						tracks.splice(y,1);
					}
				};
				
				return tracks;
			}else{
				return tracks;
			}

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
		}
	};
}

exports = module.exports =  Player;

