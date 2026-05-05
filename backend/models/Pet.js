const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    species: { type: String, required: true },
    breed: String,
    age: Number,
    gender: { type: String, enum: ['Male', 'Female'] },
    weight: Number,
    medicalHistory: [{
        condition: String,
        date: Date,
        treatment: String,
        notes: String
    }],
    vaccinationRecords: [{
        vaccine: String,
        date: Date,
        dueDate: Date
    }],
    image: String
}, { timestamps: true });

module.exports = mongoose.model('Pet', petSchema);
