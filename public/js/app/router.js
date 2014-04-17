define([
  'jquery',
  'underscore',
  'backbone',
  'app/views/playlist-view',
  'app/models/track-model',
  'app/collections/playlist-collection',
  'app/views/current-track-view',
  'app/views/search-form-view',
  'app/collections/search-collection',
  'app/views/results-view',
  'app/views/results-details-view',
  'app/views/profile-view',
  'app/models/user-model',
  'app/views/default-playlist-view'
], function($, _, Backbone, PlayListView, TrackModel, PlayListCollection, CurrentTrackView, SearchFormView, SearchCollection, ResultsView, ResultsDetailsView, ProfileView, UserModel, DefaultPlaylistView) {
  
  var AppRouter = Backbone.Router.extend({
    routes: {
      
      ''          : 'setupPlayerSearch',
      '*actions'  : 'defaultAction'
    }
  });
  
  var initialize = function(){
    var app_router = new AppRouter;

    app_router.on('route:setupPlayerSearch', function(){
        
        var scope = this;

        //playlist
        this.playList = new PlayListCollection();
        this.playListView = new PlayListView({
            collection: this.playList
        });
        this.playList = this.playList;
        this.playListView = this.playListView;
        this.playList.fetch();

        $('.playlist').empty().append(this.playListView.el);

        this.currentTrackModel = new TrackModel();
        this.currentTrackView = new CurrentTrackView({model:this.currentTrackModel});

        this.defaultView = new DefaultPlaylistView({el: document.getElementById('default_playlist_container')});
        
        this.playList.on("current_track_ready",function(){
          scope.currentTrackView.$el.show();
          scope.currentTrackModel.clear();
          scope.currentTrackModel.set(this.current_track);
          scope.currentTrackView.render();
          $('.current_track').append(scope.currentTrackView.el);
          $('.album_bg').css({"background-image":'url('+scope.currentTrackModel.get('album').art.large+')'});
        });
        this.playList.on("notracks",function(){
          scope.currentTrackView.$el.hide();
          $('.album_bg').css({"background-image":''});
        });


        //search / search form / profile
        this.searchCollection =  new SearchCollection();
        this.searchFormView = new SearchFormView({
            collection: this.searchCollection
        });
        this.resultsView =  new ResultsView({
            collection: this.searchCollection
        });
        this.resultsDetailsView = new ResultsDetailsView({
          collection: this.searchCollection
        });

        this.searchFormView.render();
        $('.form_holder').append(this.searchFormView.el);
        $('#results_holder').empty().append(this.resultsView.el);
        $('.results_details_holder').append(this.resultsDetailsView.el);

        this.userModel = new UserModel();
        this.userModel.fetch();
        this.profileView = new ProfileView({
          model: this.userModel
        });
        $('.outer-nav').prepend(this.profileView.el);
        
      
        
        //socket connection to server
        var socket = io.connect();
        socket.on('playlist:update', function (data) {
          scope.playList.update();
          $('.playlist').empty().append(scope.playListView.el);
        });
        socket.on('player:playpause', function (data) {
            scope.currentTrackView.playPauseSocket(data);
        });
        socket.on('player:bomb:update', function (count) {
            scope.currentTrackView.updateBombCount(count);
        });
      
        

    });

    Backbone.history.start();
  };
  return { 
    initialize: initialize
  };
});