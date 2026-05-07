const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    consultation: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
