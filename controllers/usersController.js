var events = require('events');
var User = require('../models/user');

UsersController.prototype = new events.EventEmitter;


function UsersController () {
	'use strict';

	var self = this;

	this.users_list = [];

	events.EventEmitter.call(this);

	this.findOrCreate = function(p_user,p_callback){

		for (var x in self.users_list) {
			if(self.users_list[x].id === p_user.id){
				p_callback(self.users_list[x]);
				return;
			}
		}
		var new_user = new User(p_user);
		this.users_list.push(new_user);
		p_callback(new_user);
	}

}




exports = module.exports = new UsersController;

