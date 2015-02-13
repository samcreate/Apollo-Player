var events = require('events');

User.prototype = new events.EventEmitter;


function User (p_google_raw) {
	'use strict';

	var self = this;

	events.EventEmitter.call(this);
	self.username = p_google_raw.displayName;
	self.id = p_google_raw.emails[0].value;
	self.name = p_google_raw.displayName;
	self.profile_image = p_google_raw._json.picture;
	self.profile_image_lg = p_google_raw._json.picture;
	self.profile_link = p_google_raw._json.link;

	self.emit('user:updated');
	self.bombed = {has:false};

	return self;

}




exports = module.exports = User;

