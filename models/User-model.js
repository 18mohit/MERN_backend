const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        minLength: 3,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum:["Student", "Sensei", "Owner"],
        required: true
    },
    photo: {
        type: String
    },
    certificate: {
        type: String
    },
    profile: {
        bio: {type: String},
        skills: {type: String},        
        // Position: {type: Position}, 
        photoOriginalName: {type: String},    
        certificateOriginalName: {type: String},
        location: {type: String}
    },
    Students: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'SenseiStu',
    }],
}, {timestamps: true});

module.exports = mongoose.model('User', userSchema);
