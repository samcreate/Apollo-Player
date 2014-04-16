define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  'use strict';

  var UserModel = Backbone.Model.extend({

  	url: '/api/player/user',
    
  	parse: function(response) {
  		if(response.status === 'success'){
         return response.data.user;
  		}else{	

  		}
  	}
    
  });

  return UserModel;
});




