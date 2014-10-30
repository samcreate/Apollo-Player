define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'notification'
], function($, _, Backbone,Handlebars,Notification) {
  'use strict';
 
  var ProfileView = Backbone.View.extend({
		tagName: 'section',
		className: 'profile row',
		events: {
			'click .addtrack:not(.added)': 'addtrack',
			'click .bomb' : 'bomb_track'
		},
		initialize: function(){
			this.model.on('sync', this.render,this);
		},
		render: function(){
			var source = $('#profile-template').html();
			var template = Handlebars.compile(source);
			var html = template(this.model.toJSON());
			this.$el.html(html);
			
			return this;
		}
	});

  return ProfileView;
});