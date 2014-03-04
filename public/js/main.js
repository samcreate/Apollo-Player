define(["jquery","player"], function($, player) {

  var start = function() {
    $(document).ready(function() {
    	if($('body').data('page') === "player"){
    			player.init();
    	}
     		
    });
  }
  return {"start":start};

});