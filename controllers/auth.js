var usersController = require('./usersController');
var gravatar = require('gravatar');

module.exports = function () {

	var config,
		UserController,
		passport,
		GoogleStrategy;

	var self = {

			init : function (p_app) {

				self.app = p_app;
				config = require('../config.js');
				self.passport = passport = require('passport')

				GoogleStrategy  = require('passport-google-oauth').OAuth2Strategy;
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

	passport.use( new GoogleStrategy({
				clientID: config.consumerKey,
				clientSecret: config.consumerSecret,
				callbackURL: config.callback
			},
				function(request, accessToken, refreshToken, profile, done) {
					var profile_photo_url = gravatar.url(profile.picture, {s: '200'});
					profile.profile_photo = profile_photo_url;
					profile.identifier = profile.name;

					usersController.findOrCreate(profile,function(profile){
						return done(null, profile);
					});
				}
		));
	}
}();
