let mongoose = require('mongoose');
var Schema = mongoose.Schema;

let roomsList = Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    img: {
        type: String,
        required: true,
        default: '1'
    },
    location: {
        type: String,
        required: true,
        default: 'Toronto'
    },
    desc: {
        type: String,
        required: true,
        default: 'Nice place'
    },
    adminsemail: {
        type: String,
        default: 'null'
    }
})


let Roomers = module.exports = mongoose.model('therooms', roomsList);