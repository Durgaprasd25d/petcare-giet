const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    serviceType: { 
        type: String, 
        enum: ['Veterinary', 'Grooming', 'Training', 'Walking'], 
        required: true 
    },
    date: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Accepted', 'Rejected', 'Completed', 'Cancelled'], 
        default: 'Pending' 
    },
    paymentStatus: { 
        type: String, 
        enum: ['Pending', 'Paid', 'Failed'], 
        default: 'Pending' 
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    amount: { type: Number, required: true },
    notes: String
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
