let mongoose = require('mongoose');
let Schema   = mongoose.Schema;

let tokenSchema = new Schema({
    token:String,
    _userId: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
});
let Token = mongoose.model('token', tokenSchema);
exports.TOKEN_CONFIRM_MODEL = Token;