define([
  'jquery',
  'underscore',
  'backbone',
  'handlebars',
  'notification'
], function($, _, Backbone,Handlebars,Notification) {
  'use strict';

  debug.log("resutsView: ",arguments);
  var ResultView = Backbone.View.extend({
		tagName: 'tr',
		className: '',
		events: {
			'click .addtrack:not(.added)': 'addtrack',
			'click .preview_popup' : 'preview_track'
		},
		render: function(){
			var source = $('#result-template').html();
			var template = Handlebars.compile(source);
			var html = template(this.model.toJSON());
			this.$el.html(html);
			return this;
		},
		addtrack : function(e){
			e.preventDefault();
			var _track = this.model.toJSON();
			var _scope = this;
			$(e.target).addClass('added');

			_scope.loadingController(e.target);

			$.ajax({ 
			    type: 'POST', 
			    data: _track,
			    url: '/api/player/playlist/add/', 
			    dataType: 'json',
			    success: function (data) { 
			    	if(data.status == "success"){
			    		
				        _scope.disable(e.target);
				        _scope.loadingController(e.target);

				        debug.log("Notification: ",Notification);
				        var n = new Notification( 'Track:', {
				            body: _track.name+" was added", 
				            icon : "/images/apollo.png"
				        });
				        setTimeout(function(){
				              n.close();
				         },3000);

				        $(".playlist").animate({ scrollTop: $('.playlist')[0].scrollHeight}, 1000);
			    	}
			        
			    }
			});
		},
		disable : function(target){
			$(target).addClass('added');
			$(target).parent().parent().addClass('added');
		},
		loadingController: function(target){

			if($(target).hasClass('loading')){
				$(target).removeClass('loading');
			}else{
				$(target).addClass('loading');
			}
			
		},
		preview_track: function(e){
			e.preventDefault();
			newwindow=window.open($(e.target).attr('href'),this.model.get('name'),'height=304,width=224,scrollbars=0,resizable=0');
	      
		}
	});

  return ResultView;
});



