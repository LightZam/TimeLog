var mongoose = require('mongoose');
var Schema = mongoose.Schema;


mongoose.connect('mongodb://localhost/Timelog_Develop');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {});

var UserSchema = new Schema({
    account: String,
    password: String,
    name: String
});

// 事件名稱的DB
var EventTypeSchema = new Schema({
    name: String,
    enable: { type: Boolean, default: false },
    user: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

// startTime="13:15" endTime="17:40" event="" type="EzScrum" deltaTime="04:25" interruptTime="00:00" date="2013-08-26" durationTime="15900000"
var TimelogSchema = new Schema({
    date: { type: String, require: true },
	startTime: { type: String, require: true },
	endTime: { type: String, require: true },
	deltaTime: String,
	interruptTime: String,
	description: String,
    User: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    eventType: [{ type: Schema.Types.ObjectId, ref: 'EventType' }]
});    

// 對Schema做建構編譯
var User = mongoose.model('User', UserSchema);
var EventType = mongoose.model('EventType', EventTypeSchema);
var Timelog = mongoose.model('Timelog', TimelogSchema);

// 讓require的js檔可以使用這三個參數
module.exports = User;
module.exports = EventType;
module.exports = Timelog;