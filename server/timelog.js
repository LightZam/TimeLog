var User = require('./db-schema/User.js');
var EventType = require('./db-schema/EventType.js');
var Timelog = require('./db-schema/Timelog.js');
var ObjectTool = require('./tools/ObjectTool.js');

exports.signup = function(req, res, next) {
	if (ObjectTool.isEmpty(req.body)) {
		res.end('Input Account and Password');
		return;
	}
	User.create(req.body, function (err, user) {
		if (err) {
			res.end('The Account has been used.');
			return;
		}
		console.log("Success add " + user);
		req.session.user = user.user;
	});
}

exports.signin = function(req, res, next) {
	console.log(req.body);
	if (ObjectTool.isEmpty(req.body)) {
		res.end('Input Account and Password');
		return;
	}
	User.findOne(req.body, function (err, user) {
		if (!user) {
			res.end('Account or Password incorrect');
			return;
		}
		req.session.user = user;
		next();
		// res.end('Success');
	});
}