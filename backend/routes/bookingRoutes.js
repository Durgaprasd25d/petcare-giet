const express = require('express');
const router = express.Router();
const { 
    createBooking, 
    verifyPayment, 
    getMyBookings,
    getProviderBookings,
    updateBookingStatus
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/', protect, authorize('Pet Owner'), createBooking);
router.post('/verify', protect, authorize('Pet Owner'), verifyPayment);
router.get('/mybookings', protect, authorize('Pet Owner'), getMyBookings);
router.get('/provider', protect, authorize('Veterinarian', 'Service Provider'), getProviderBookings);
router.put('/:id/status', protect, authorize('Veterinarian', 'Service Provider'), updateBookingStatus);

module.exports = router;
