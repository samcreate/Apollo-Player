define([
  'jquery',
  'underscore',
  'backbone',
  'app/views/track-view'
], function($, _, Backbone,TrackView) {
  'use strict';

  var PlaylistView = Backbone.View.extend({
		tagName: 'div',
		className: 'col-md-12 tracks col-lg-offset-0 col-lg-12',
		initialize: function(){
			this.collection.on('add', this.addOne,this);
			this.collection.on('reset', this.reset,this);
		},
		addOne: function(track){
			
			track.set({index:this.collection.track_count});
			var trackView = new TrackView({model: track});
			this.$el.append((trackView.render()).el);
			this.collection.track_count++;
		 },
		render: function(){
			this.collection.forEach(this.addOne, this);
		},
		reset: function(){
			this.$el.empty();
			this.render();
			
		}
	});

  return PlaylistView;
});



