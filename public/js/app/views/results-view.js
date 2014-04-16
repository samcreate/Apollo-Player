define([
  'jquery',
  'underscore',
  'backbone',
  'app/views/result-view'
], function($, _, Backbone,ResultView) {
  'use strict';

  var ResultsView = Backbone.View.extend({
		tagName: 'tbody',
		className: 'search_results',
		initialize: function(){
			this.collection.on('add', this.addOne,this);
			this.collection.on('reset', this.reset,this);
		},
		addOne: function(track){
			var resultView = new ResultView({model: track});
			this.$el.append((resultView.render()).el);
		 },
		render: function(){
			this.collection.forEach(this.addOne, this);
		},
		reset: function(){
			this.$el.empty();
			this.$el.scrollTop(0);
			this.render();
			
		}
	});

  return ResultsView;
});