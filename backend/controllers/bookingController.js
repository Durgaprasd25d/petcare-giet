const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

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

// @desc    Create a new booking (Simplified - No Payment Gateway)
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
            notes,
            status: 'Pending' // All bookings start as pending
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
          const populatedBooking = await Booking.findById(booking._id)
            .populate('pet', 'name species breed image')
            .populate('owner', 'name email')
            .populate('provider', 'name');
          
          io.to(providerId.toString()).emit('bookingCreated', populatedBooking);
          io.to(req.user._id.toString()).emit('bookingCreated', populatedBooking);
        }

        res.status(201).json({ 
            success: true,
            message: 'Booking created successfully',
            booking 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Payment Signature (Deprecated - Now returns success instantly)
// @route   POST /api/bookings/verify
// @access  Private (Pet Owner)
exports.verifyPayment = async (req, res) => {
    res.status(200).json({ message: 'Payment bypassed successfully' });
};

// @desc    Get logged in user's bookings (Owner)
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ owner: req.user._id })
            .populate('pet', 'name')
            .populate('provider', 'name')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in provider's bookings
exports.getProviderBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ provider: req.user._id })
            .populate('pet', 'name species breed')
            .populate('owner', 'name email')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update booking status (Accept/Reject/Complete)
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
