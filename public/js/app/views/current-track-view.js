define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'handelbars-helpers'
], function($, _, Backbone,Handlebars) {
  'use strict';

  var CurrentTrackView = Backbone.View.extend({
		tagName: 'div',
		className: 'row current_track',
		events: {
			'click .controls': 'playPauseClick',
			'click .bomb' : 'bomb_track'
		},
		initialize : function() {

          
        }, 
		render: function(){
			var source = $('#current-track-template').html();
			var template = Handlebars.compile(source);
			var html = template(this.model.toJSON());
			this.$el.html(html);
			this.$el.find('.bomb').tooltip();
			return this;
		},
		playPauseClick: function(e){
			e.preventDefault();

			var $target = $(e.target);

			if($target.hasClass('pause')){
				
				$.get( "/api/player/pause").done(function( data ) {
			  	});
			}else{
				$.get( "/api/player/play").done(function( data ) {
			  	});
			}

		},
		playPauseSocket: function(pp){
			this.$el.find('.controls').removeClass('PAUSED PLAYING').addClass(pp);

		},
		bomb_track: function(e){
			e.preventDefault();
			var $el = $(e.target);
			
			if($el.hasClass('bombed')) return;

				$.ajax({ 
				    type: 'POST', 
				    url: '/api/player/bomb', 
				    dataType: 'json',
				    success: function (response) {

				    	var title; 
				    	if(response.status != "success"){
				    		title = 'Error:';
				    	}else{
				    		title = 'Success:';

				    	}
				    	$el.addClass('bombed');
				    	return;

				    	
				        
				    }
				});


		},
		updateBombCount: function(count){
			var $count = this.$el.find('.count');
				$count.text(count);
			var $bomb = this.$el.find('.bomb');
			debug.log($bomb[0])
				$bomb[0].style.webkitAnimationName = "";
				setTimeout(function(){
						$bomb[0].style.webkitAnimationName = "count-animation";
					},100);

			var bomb_threshold = 3;
			if(count >= bomb_threshold){
				document.getElementById("bomb").style.webkitAnimationName = "";
				setTimeout(function(){
						document.getElementById("bomb").style.webkitAnimationName = "bomb-animation";
					},100);
				

			}
		}

	});

  return CurrentTrackView;
});



