define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  'use strict';

  var TrackModel = Backbone.Model.extend({
    defaults: {
		"album": {
			"artists": [
				{
					"name": "Unknown"
				}
			],
			"name": "Unknown",
			"art": {
				"small": "/images/default_cover.png",
				"large": "/images/default_cover.png"
			}
		},
		"name": "Unknown",
		"uri": "Unknown",
		"length": 0,
		"by": {
			"username": "Unknown",
			"id": "Unknown",
			"name": "Unknown",
			"profile_image": "default.jpg",
			"profile_image_lg": "default.jpg"
		}
	},
	sync: function(method, model, options){
		
	}
  });

  return TrackModel;
});


