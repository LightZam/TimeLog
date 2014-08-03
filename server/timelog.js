var User = require('./db-schema/User.js');
var EventType = require('./db-schema/EventType.js');
var Timelog = require('./db-schema/Timelog.js');
var ObjectTool = require('./tools/ObjectTool.js');

/* User Op */
exports.signup = function(req, res, next) {
	if (ObjectTool.isEmpty(req.body)) {
		res.end('Input Account and Password');
		return;
	}
	User.create(req.body, function(err, user) {
		if (err) {
			res.end('The Account has been used.');
			return;
		}
		console.log("Success add " + user);
		req.session.user = user;
		res.end('Success');
	});
}

exports.signin = function(req, res, next) {
	console.log(req.body);
	if (ObjectTool.isEmpty(req.body)) {
		res.end('Input Account and Password');
		return;
	}
	User.findOne(req.body, function(err, user) {
		if (!user) {
			res.end('Account or Password incorrect');
			return;
		}
		req.session.user = user;
		res.end('Success');
	});
}

/* EventType Op */
exports.addEventType = function(req, res, next) {
	if (ObjectTool.isEmpty(req.body)) {
		res.end('Input EventType Name');
		return;
	}
	req.body.user = req.session.user._id;
	EventType.create(req.body, function(err, result) {
		if (err) {
			res.end(err.toString());
			return;
		}
		res.end('Success');
	});
}

exports.getEventType = function(req, res, next) {
	var query = {
		user: req.session.user._id,
		enable: true
	};
	EventType.find(query, function(err, typeList) {
		if (err) {
			res.end(err.toString());
			return;
		}
		res.send(typeList);
	});
}

exports.editEventType = function(req, res, next) {
	var update = {
		name: req.body.name
	};
	EventType.findByIdAndUpdate(req.body._id, update, function(err, result) {
		if (err) {
			res.end(err.toString());
			return;
		}
		res.end('Success');
	});
}

/* Timelog Op */
exports.addTimelog = function(req, res, next) {
	if (ObjectTool.isEmpty(req.body)) {
		res.end('Input EventType Name');
		return;
	}
	req.body.user = req.session.user._id;
	Timelog.create(req.body, function(err, result) {
		if (err) {
			res.end(err.toString());
			return;
		}
		console.log(result);
		res.end('Success');
	});
}

exports.getTimelogByDate = function(req, res, next) {
	var query = {
		user: req.session.user._id,
		date: req.params.date
	};
	Timelog.find(query).populate('eventType').exec(function(err, logList) {
		if (err) {
			res.end(err.toString());
			return;
		}
		res.send(logList);
	});
}

exports.editTimelog = function(req, res, next) {
	console.log(req);
	req.body.user = req.session.user._id;
	req.body.eventType = req.body.eventType._id;
	var update = req.body;
	update._id = undefined;
	console.log(update);
	Timelog.findByIdAndUpdate(req.body._id, update, function(err, result) {
		if (err) {
			res.end(err.toString());
			return;
		}
		res.send(result);
	});
}

exports.deleteTimelog = function(req, res, next) {
	var query = {
		user: req.session.user._id,
		_id: req.params._id
	};
	Timelog.remove(query, function(err, result) {
		if (err) {
			res.end(err.toString());
			return;
		}
		res.end('Success');
	});
}