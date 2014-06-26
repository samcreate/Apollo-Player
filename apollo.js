'use strict';
//pagekite.py 3000 apollomusic.pagekite.me
// Module dependencies
var express = require('express'),
    http = require('http'),
    path = require('path'),
    routes = require('./routes'),
    config = require('./config'),
    auth = require('./controllers/auth');
   
// Create server
var app = express();
var server = http.createServer(app);
    auth.init(app);



// Configure server
app.set('hostname', config.server.host);
app.set('port', config.server.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.compress());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.session({ secret: 'fartknockers', cookie: { maxAge: 3600000000 }}));
app.use(auth.passport.initialize());
app.use(auth.passport.session());
app.use(app.router);
app.locals.pretty = config.htmlPretty;
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req, res) {
  res.status(404).render('404', {title: 'Not Found :('});
});
app.use(express.errorHandler());


server.listen(app.get('port'), app.get('hostname'), function(){
  console.log('Express server listening on port ' + app.get('port'));
  routes(app,auth,server);
});




