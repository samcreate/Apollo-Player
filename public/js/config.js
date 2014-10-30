requirejs.config({
    "paths": {
		handlebars: '../vendor/handlebars/handlebars',
		jquery: '../vendor/jquery/dist/jquery.min',
		underscore: '../vendor/underscore-amd/underscore-min',
		backbone: '../vendor/backbone-amd/backbone-min',
		player: "player",
		notification: 'notification',
		bootstrap: "//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min" ,
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