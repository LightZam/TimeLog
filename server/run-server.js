if (!process.env.NODE_ENV) process.env.NODE_ENV='development'

var express = require('express'), 
	http = require('http'), 
	path = require('path'), 
	colors = require('colors'),
	reload = require('reload');

var timeLog = require('./time-log.js');
var app = express();

var webDir = path.join(__dirname, '../web-content')

app.configure(function() {
	app.set('port', process.env.PORT || 8000);
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(app.router);
	app.use(express.static(webDir));
});

app.configure('development', function() {
	app.use(express.errorHandler());
})

app.get('/', function(req, res) {
	res.sendfile(path.join(webDir, 'index.html'));
});

// app.post('/create', timeLog.create);
// app.get('/read', timeLog.read); //sometimes called 'show'
// app.put('/update/:id', timeLog.update);
// app.del('/delete/:id', timeLog.delete);

var server = http.createServer(app);
reload(server, app);
server.listen(app.get('port'), function() {
	console.log("Web server listening in %s on port %d", colors.red(process.env.NODE_ENV), app.get('port'));
});



