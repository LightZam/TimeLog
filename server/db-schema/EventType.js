var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// 事件名稱的DB
var EventTypeSchema = new Schema({
    name: { type: String, require: true },
    enable: { type: Boolean, default: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', require: true }
});

module.exports = mongoose.model('EventType', EventTypeSchema);