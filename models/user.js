var events = require('events');

User.prototype = new events.EventEmitter;


function User (p_google_raw) {
	'use strict';

	var self = this;

	console.log(p_google_raw);

	events.EventEmitter.call(this);
	self.username = p_google_raw.displayName;
	self.id = p_google_raw.emails[0].value;
	self.name = p_google_raw.displayName;
	self.profile_image = p_google_raw.profile_photo;
	self.profile_image_lg = p_google_raw.profile_photo;
	
	self.emit('user:updated');
	self.bombed = {has:false};

	return self;

}




exports = module.exports = User;

