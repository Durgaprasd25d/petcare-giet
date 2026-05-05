const Review = require('../models/Review');
const Booking = require('../models/Booking');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (Pet Owner)
exports.createReview = async (req, res) => {
    try {
        const { serviceId, bookingId, rating, comment } = req.body;

        // Verify that the user has a completed booking for this service
        const booking = await Booking.findById(bookingId);

        if (!booking || booking.owner.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Booking not found or unauthorized' });
        }

        if (booking.status !== 'Completed') {
            return res.status(400).json({ message: 'You can only review a completed service' });
        }

        // Check if review already exists for this booking
        const alreadyReviewed = await Review.findOne({ booking: bookingId });
        if (alreadyReviewed) {
            return res.status(400).json({ message: 'You have already reviewed this booking' });
        }

        const review = await Review.create({
            user: req.user._id,
            service: serviceId,
            booking: bookingId,
            rating: Number(rating),
            comment
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reviews for a specific service
// @route   GET /api/reviews/service/:serviceId
// @access  Public
exports.getServiceReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ service: req.params.serviceId })
            .populate('user', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
