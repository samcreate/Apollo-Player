define([
  'underscore',
  'backbone',
  'app/models/track-model',
  'notification'
], function(_, Backbone, TrackModel, Notification) {
  'use strict';
  var PlaylistCollection = Backbone.Collection.extend({
  	url: '/api/player/playlist',
    
  	parse: function(response) {
  		if(response.status === 'success'){
              var _first_track = response.data.tracks.splice(0,1)[0];
              this.current_track = _first_track;
              this.trigger('current_track_ready');
  			 return response.data.tracks;
  		}else{	

        var n = new Notification( 'Player Error:', {
            body: response.message, 
            icon : "/images/apollo.png"
        });
        setTimeout(function(){
              n.close();
         },3000);
        this.trigger('notracks');
        

  		}
  	},
    model: TrackModel,
    current_track : '',
    track_count: 1,
    update : function(){
      this.current_track = null;
      this.fetch({reset: true});
      this.track_count = 1;
    }
  });

  return PlaylistCollection;
});
