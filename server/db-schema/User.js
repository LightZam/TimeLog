var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    account: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String
});

module.exports = mongoose.model('User', UserSchema);