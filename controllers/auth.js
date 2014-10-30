var usersController = require('./usersController');
var gravatar = require('gravatar');

module.exports = function () {
	// =================================================
	// = Private variables (example: var _foo = bar; ) =
	// =================================================
	var config,
		UserController,
		passport,
		GoogleStrategy;

	// =================================================
	// = public functions                              =
	// =================================================
	var self = {
		
		init : function (p_app) {

			self.app = p_app;
			config = require('../config.js');
			self.passport = passport = require('passport');
			GoogleStrategy = require('passport-google').Strategy;
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
		
		passport.use(new GoogleStrategy({
		    returnURL: 'http://localhost:3000/auth/google/return',
    		realm: 'http://localhost:3000/'
		  },
		  function(identifier, profile, done) {
		    // asynchronous verification, for effect...
		    process.nextTick(function () {
		      
		      // To keep the example simple, the user's Google profile is returned to
		      // represent the logged-in user.  In a typical application, you would want
		      // to associate the Google account with a user record in your database,
		      // and return that user instead.
		      
		      var profile_photo_url = gravatar.url(profile.emails[0].value, {s: '200'});
			      profile.profile_photo = profile_photo_url;
			      profile.identifier = identifier;

			      
				usersController.findOrCreate(profile,function(profile){
					return done(null, profile);
				});
		      
		    });
		  }
		));
	}
	
}();