let mongoose = require('mongoose');

let trackitemSchema = mongoose.Schema({
    email: String,
    sku: String,
    name: String,
    price: String
});

module.exports = mongoose.model('TrackItem', trackitemSchema);