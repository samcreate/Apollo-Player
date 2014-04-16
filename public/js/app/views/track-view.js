define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars'
], function($, _, Backbone,Handlebars) {
  'use strict';

  var TrackView = Backbone.View.extend({
		tagName: 'div',
		className: 'row track',
		events: {
			'change input' : 'complete'
		},
		render: function(){
			var source = $('#playlist-template').html();
			var template = Handlebars.compile(source);
			var html = template(this.model.toJSON());
			this.$el.html(html);
			return this;
		},
		complete: function(){
			
			this.model.complete();
		}
	});

  return TrackView;
});



