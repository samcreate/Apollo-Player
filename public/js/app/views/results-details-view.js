define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'handelbars-helpers'
], function($, _, Backbone,Handlebars) {
  'use strict';

  var ResultsDetailsView = Backbone.View.extend({
		tagName: 'div',
		className: '.row',
		initialize: function(){
			this.collection.on('sync', this.render,this);
		},
		render: function(){
			debug.log(this.collection.length);
			var source = $('#results-details-template').html();
			var template = Handlebars.compile(source);
			debug.log(this.collection.toJSON());
			var html = template({total:this.collection.length,term:this.collection.search_term});
			this.$el.html(html);
			return this;
		}
	});

  return ResultsDetailsView;
});