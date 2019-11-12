let mongoose = require('mongoose');
let Schema   = mongoose.Schema;

let userSchema = new Schema({
    username: { type: String, trim: true, unique: true, required: true },
    password: { type: String },
    fullname: String,
    email: String,
    comfirmed: { type: Boolean, default: false },
    birthday: {type: String},
    phone: {type: String},
    avatar:{ type: String},
    /**
     * list người dùng đã gửi kết bạn cho mình
     */
    guestsRequest: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    /**
     * list người dùng mình gửi lời mời kết bạn
     */
    usersRequest: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    /**
     * list bạn bè
     */
    friends: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    ]
});
let User = mongoose.model('user', userSchema);
exports.USER_MODEL = User;