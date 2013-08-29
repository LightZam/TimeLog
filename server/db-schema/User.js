var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    account: String,
    password: String,
    name: String
});

module.exports = mongoose.model('User', UserSchema);