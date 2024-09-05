const mongoose = require('mongoose');

const contactusSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    number: { type: Number, required: true },
    message: { type: String },
},{ timestamps: true });

module.exports = mongoose.model('Contactus', contactusSchema);
