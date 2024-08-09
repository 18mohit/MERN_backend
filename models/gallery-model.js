const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    description: String,
    image: String,
});

module.exports = mongoose.model('Gallery', gallerySchema);
