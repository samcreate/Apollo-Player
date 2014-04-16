define([
  'underscore',
  'backbone',
  'app/models/result-model',
  'notification'
], function(_, Backbone, ResultModel,Notification) {
  'use strict';
  var SearchCollection = Backbone.Collection.extend({
    search_term: '',
  	url: function(){
      return '/api/player/search/'+this.search_term;
    },
  	parse: function(response) {
  		if(response.status === 'success'){

            return response.data.tracks;

  		}else{	
        var n = new Notification( 'Search:', {
            body: 'No search results', 
            icon : "/images/apollo.png"
        });
        setTimeout(function(){
              n.close();
         },3000);
  		}
  	},
    update : function(){
      this.fetch({reset: true});
    },
    model: ResultModel
  });

  return SearchCollection;
});
