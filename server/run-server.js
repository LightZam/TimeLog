if (!process.env.NODE_ENV) process.env.NODE_ENV='development'

var express = require('express'), 
	http = require('http'), 
	path = require('path'), 
	colors = require('colors'),
	reload = require('reload');
var timeLog = require('./timelog.js');
var app = express();
var webDir = path.join(__dirname, '../web-content');

// db connect
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Timelog_Develop');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {});
var MemStore = express.session.MemoryStore;

app.configure(function() {
	app.set('port', process.env.PORT || 8000);
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.static(webDir));
	app.use(express.cookieParser('timelog'));
	app.use(express.session());
	app.use(app.router);
});

app.configure('development', function() {
	app.use(express.errorHandler());
});

function checkAuth(req, res, next) {
	if (!req.session.user) {
		res.sendfile(path.join(webDir, 'signin.html'));
	} else {
		next();
	}
}

app.get('/', checkAuth, function(req, res) {
	res.sendfile(path.join(webDir, 'main.html'));
});
app.post('/signup', timeLog.signup);
app.post('/signin', timeLog.signin, function(req, res) {
	res.redirect('/');
});

var server = http.createServer(app);
reload(server, app);
server.listen(app.get('port'), function() {
	console.log("Web server listening in %s on port %d", colors.red(process.env.NODE_ENV), app.get('port'));
});



