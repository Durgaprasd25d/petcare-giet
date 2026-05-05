const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { 
        type: String, 
        enum: ['Veterinary', 'Grooming', 'Training', 'Walking', 'Sitting'], 
        required: true 
    },
    price: { type: Number, required: true },
    duration: { type: Number, required: true }, // in minutes
    image: { type: String }, // Cloudinary URL
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
