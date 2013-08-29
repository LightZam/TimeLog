var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// 事件名稱的DB
var EventTypeSchema = new Schema({
    name: String,
    enable: { type: Boolean, default: false },
    user: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('EventType', EventTypeSchema);