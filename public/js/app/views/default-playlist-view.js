define([
  'jquery',
  'underscore',
  'backbone'
], function($, _, Backbone) {
  'use strict';

  var DefaultPlaylistView = Backbone.View.extend({
		initialize: function(){
			this.template = Handlebars.compile(this.el);
			this.render();
		},
		render: function(){			
			var html = this.template();
			this.$el.html(html);
			return this;
		}
	});

  return DefaultPlaylistView;
});



