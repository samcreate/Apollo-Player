var events = require('events');

User.prototype = new events.EventEmitter;


function User (p_twitter_raw) {
	'use strict';

	var self = this;

	events.EventEmitter.call(this);
	self.username = p_twitter_raw.username;
	self.id = p_twitter_raw.id;
	self.name = p_twitter_raw.displayName;
	self.profile_image = p_twitter_raw.photos[0].value;
	self.profile_image_lg = function(p_url){
		var ar = p_url.split('_normal');
	  	return ar[0]+ar[1];
	}(self.profile_image);
	
	self.emit('user:updated');
	self.bombed = {has:false};

	return self;

}




exports = module.exports = User;

