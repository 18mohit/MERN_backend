const mongoose = require('mongoose');

const senseiStudentSchema = new mongoose.Schema({
    studentname: {
        type: String,
        minLength: 3,
        trim: true
    },
    date: {
        type: Date,
        require: true,
    },
    certificate: {
        type: String,
        require: true,
    },
    Added_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    }
}, {timestamps: true});

module.exports = mongoose.model('SenseiStu', senseiStudentSchema);
