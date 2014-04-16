define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  'use strict';

  var ResultModel = Backbone.Model.extend({
    defaults: {
		"album": {
		  "artists": [
		    {
		      "name": "Search Unknown",
		    }
		  ],
		  "name": "Search Unknown"
		},
		"name": "Search Unknown",
		"uri": "Search Unknown",
		"length": 0
	},
	added: function(){
		
	}
  });

  return ResultModel;
});




