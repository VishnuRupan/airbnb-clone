let mongoose = require('mongoose');
var Schema = mongoose.Schema;


let UserSchema = Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    birthday:{
        type: Date,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
})


const User = module.exports = mongoose.model('User', UserSchema)
