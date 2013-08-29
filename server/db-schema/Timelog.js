var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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

module.exports = mongoose.model('Timelog', TimelogSchema);