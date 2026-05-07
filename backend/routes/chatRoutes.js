const express = require('express');
const router = express.Router();
const { getConsultations, createConsultation, getMessages } = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getConsultations);
router.post('/', protect, createConsultation);
router.get('/:consultationId/messages', protect, getMessages);

module.exports = router;
