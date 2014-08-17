var usersController = require('./usersController');

module.exports = function () {
	// =================================================
	// = Private variables (example: var _foo = bar; ) =
	// =================================================
	var config,
		UserController,
		passport,
		LocalStrategy;

	// =================================================
	// = public functions                              =
	// =================================================
	var self = {
		
		init : function (p_app) {

			self.app = p_app;
			config = require('../config.js');
			self.passport = passport = require('passport');
			LocalStrategy = require('passport-local').Strategy;
			_setup_passport();
			console.log("AUTH INIT")

		},
		ensureAuthenticated : function(req, res, next){
			
			if (req.isAuthenticated()) { return next(); }
  				res.redirect('/')
		},
		ensureAuthenticatedHome : function(req, res, next){
			
			
			if (req.isAuthenticated()) { res.redirect('/player') }
				 return next();
  				
		},
		passport: function(){
			return passport;
		},
		app: ''
		
	};
	
	return self;

	function _setup_passport () {



		passport.serializeUser(function(user, done) {
		  done(null, user);
		});

		passport.deserializeUser(function(user, done) {
		  done(null, user);
		});
		passport.use(new LocalStrategy(
		  function(username, password, done) {

		    usersController.findOrCreate(username,function(user){
		      done(null, user);
		    });

		  }
		));
	}
	
}();