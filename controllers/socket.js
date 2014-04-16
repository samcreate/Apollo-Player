var events = require('events');

Socket.prototype = new events.EventEmitter;


function Socket (server, player) {
	'use strict';

	var self = this;
	var PLAYLIST_UPDATE = 'playlist:update';

	this.io = require('socket.io').listen(server);

	this.io.sockets.on('connection', function (socket) {
	  
	  player.on('playback:queue',function(){
			socket.emit(PLAYLIST_UPDATE);
	  });
	  player.on('player:track:added',function(){
			socket.emit(PLAYLIST_UPDATE);
	  });
	  player.on('player:playpause',function(status){
	  		socket.emit('player:playpause',status);
	  });	
	  player.on('player:playpause',function(status){
	  		socket.emit('player:playpause',status);
	  });	

	  player.on('player:bomb:update',function(status){
	  		socket.emit('player:bomb:update',status);
	  });
	  player.on('playback:notracks',function(){
	  		socket.emit('playback:notracks');
	  });
	  
	});
	

	events.EventEmitter.call(this);
}

exports = module.exports =  Socket;

