define(["jquery","app/router","underscore","backbone","perspective"], function($, router, _, Backbone, perspective) {
  
  var _module = {

    init : function(){

      debug.group("# [player.js]");

        debug.log('[player.js] - initialized'); 

          //--> sof private functions

        
          window.onresize = function() {
            window.scrollTo(0, 0);
          } 

         
        router.initialize();
        perspective.init();

      debug.groupEnd();
    }
  };
  return _module;

});