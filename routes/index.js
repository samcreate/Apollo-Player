var home = require('../controllers/home');
var Player = require('../controllers/player');
var Socket = require('../controllers/socket');
var res_json = require('../util/response_helper');

module.exports = function (app,auth,server) {


	var player = new Player(app,server);
	var socket = new Socket(server, player);

	app.get('/', auth.ensureAuthenticatedHome, home.index);
	app.get('/api/player/search/:query', player.search);
	app.post('/api/player/playlist/add/', auth.ensureAuthenticated, player.add);
	app.get('/api/player/playlist', player.playlist);
	app.get('/api/player/status', player.search);
	app.get('/api/player/pause', player.playpause);
	app.get('/api/player/play', player.playpause);
	app.get('/api/player/stop', player.stop);
	app.post('/api/player/bomb', player.bomb);
	app.get('/api/player/user', auth.ensureAuthenticated, function(req, res){
		res_json.success(res, {'user': req.user });
	});
	app.get('/player', auth.ensureAuthenticated ,function( req, res) { 
	  res.render('player', { title: 'APOLLO: Player', page:"player", user: req.user }); 
	});

	app.get('/test', player.stop);

	// local auth
//	app.get('/', function(req, res){
//		res.render('login', { user: req.user, message: 'req.user' });
//	});
	app.post('/',
		auth.passport.authenticate('local', { successRedirect: '/player', failureRedirect: '/' }));
	app.get('/logout', function(req, res){
	  req.logout();
	  res.redirect('/');
	});


};