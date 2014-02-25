define([
  'underscore',
  'backbone',
  'models/playlist-model'
], function(_, Backbone, PlaylistModel) {
  'use strict';

  var PlaylistCollection = Backbone.Collection.extend({
    model: PlaylistModel
  });

  return PlaylistCollection;
});
