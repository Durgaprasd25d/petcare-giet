const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markSingleAsRead } = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getNotifications);
router.put('/read', protect, markAsRead);
router.put('/:id/read', protect, markSingleAsRead);

module.exports = router;
