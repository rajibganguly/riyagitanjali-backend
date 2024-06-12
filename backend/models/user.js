const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    role_type: {
        type: String,
        required: true
    },
    payment: {
        type: Boolean
    },
    phone_number: String,
    blockflat: String,
    timestamp: { type: String, default: () => new Date().toISOString() }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
