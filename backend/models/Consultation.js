const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
    petOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vet: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Active', 'Closed'], default: 'Active' },
    lastMessageAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Consultation', consultationSchema);
