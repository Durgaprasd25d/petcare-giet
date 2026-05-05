const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const crypto = require('crypto');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Helper to send real-time notification
const sendNotification = async (req, recipient, title, message, type, relatedId) => {
  const io = req.app.get('io');
  const notification = await Notification.create({
    recipient,
    sender: req.user._id,
    title,
    message,
    type,
    relatedId
  });
  
  if (io) {
    io.to(recipient.toString()).emit('notification', notification);
  }
};

// @desc    Create a new booking + Razorpay order
// @route   POST /api/bookings
// @access  Private (Pet Owner)
exports.createBooking = async (req, res) => {
    try {
        const { petId, providerId, serviceType, date, amount, notes } = req.body;

        const booking = await Booking.create({
            owner: req.user._id,
            pet: petId,
            provider: providerId,
            serviceType,
            date,
            amount,
            notes
        });

        // Send Notification to Provider
        const io = req.app.get('io');
        await sendNotification(
          req, 
          providerId, 
          'New Booking Request 🐾', 
          `You have a new ${serviceType} request for ${date}`, 
          'BookingNew', 
          booking._id
        );

        if (io) {
          // Fetch the populated booking to send a rich object
          const populatedBooking = await Booking.findById(booking._id)
            .populate('pet', 'name species breed image')
            .populate('owner', 'name email')
            .populate('provider', 'name');
          
          // Notify Provider
          io.to(providerId.toString()).emit('bookingCreated', populatedBooking);
          // Notify Owner
          io.to(req.user._id.toString()).emit('bookingCreated', populatedBooking);
        }

        // Create real Razorpay order
        const order = await razorpay.orders.create({
            amount: amount * 100, // paise
            currency: 'INR',
            receipt: `receipt_${booking._id}`,
        });

        res.status(201).json({ booking, order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/bookings/verify
// @access  Private (Pet Owner)
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
        }

        res.status(200).json({ message: 'Payment verified successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user's bookings (Owner)
// @route   GET /api/bookings/mybookings
// @access  Private
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ owner: req.user._id })
            .populate('pet', 'name')
            .populate('provider', 'name');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in provider's bookings
// @route   GET /api/bookings/provider
// @access  Private (Provider/Vet)
exports.getProviderBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ provider: req.user._id })
            .populate('pet', 'name species breed')
            .populate('owner', 'name email');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update booking status (Accept/Reject/Complete)
// @route   PUT /api/bookings/:id/status
// @access  Private (Provider/Vet)
exports.updateBookingStatus = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.provider.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this booking' });
        }

        const oldStatus = booking.status;
        booking.status = req.body.status || booking.status;
        const updatedBooking = await booking.save();

        // Notify Owner about status change
        if (oldStatus !== updatedBooking.status) {
          const io = req.app.get('io');
          await sendNotification(
            req,
            booking.owner,
            'Booking Update 🔔',
            `Your booking for ${booking.serviceType} has been ${updatedBooking.status.toLowerCase()}`,
            'BookingStatus',
            booking._id
          );
          
          if (io) {
            io.to(booking.owner.toString()).emit('bookingUpdated', updatedBooking);
          }
        }

        res.json(updatedBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
