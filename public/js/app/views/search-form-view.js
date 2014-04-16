define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'handelbars-helpers',
  'notification'
], function($, _, Backbone,Handlebars,Notification) {
  'use strict';

  var SearchForm = Backbone.View.extend({
		tagName: 'form',
		className: 'form-search',
		events: {
			'submit' : 'submit'
		},
		initialize: function(){
			this.collection.on('add', this.addOne,this);
			this.collection.on('sync', this.reset,this);
			this.collection.on('error', this.error,this);
		},
		render: function(){
			var source = $('#search-form-template').html();
			var template = Handlebars.compile(source);

			this.$el.html(template);
			return this;
		},
		submit: function(e){
			e.preventDefault();
			var search_term = this.$el.find('input.search-query').val();
			if(search_term){
				this.collection.search_term = search_term;
				this.collection.update();
				this.$el.find('.btn').addClass('loading');
			}
		},
		reset: function(){
			this.$el.find('.btn').removeClass('loading');
		},
		error: function(e){
			this.$el.find('.btn').removeClass('loading');
			var n = new Notification( 'Error:', {
	            body: "There was a problem with your search ", 
	            icon : "/images/apollo.png"
	        });
	        setTimeout(function(){
              n.close();
     		},3000);
		}
	});

  return SearchForm;
});



