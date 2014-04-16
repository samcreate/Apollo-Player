requirejs.config({
    "paths": {
		handlebars: '../vendor/handlebars/handlebars',
		jquery: '../vendor/jquery/dist/jquery.min',
		underscore: '../vendor/underscore-amd/underscore-min',
		backbone: '../vendor/backbone-amd/backbone-min',
		player: "player",
		notification: 'notification',
		bootstrap: "../vendor/bootstrap/dist/js/bootstrap.min",
    },
    shim: {
	  handlebars: {
	    exports: 'Handlebars'
	  },
	  bootstrap: {
        deps: ["jquery"]
      }
	}
});