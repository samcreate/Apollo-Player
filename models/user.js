var events = require('events');

User.prototype = new events.EventEmitter;


function User (username) {
	'use strict';

	var self = this;

	events.EventEmitter.call(this);
	self.username = username;
	self.id = username;
	self.name = username;
	
	self.emit('user:updated');
	self.bombed = {has:false};

	return self;

}




exports = module.exports = User;

