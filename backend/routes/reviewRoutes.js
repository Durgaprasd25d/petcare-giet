const express = require('express');
const router = express.Router();
const { createReview, getServiceReviews } = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, createReview);
router.get('/service/:serviceId', getServiceReviews);

module.exports = router;
