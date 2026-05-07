const express = require('express');
const router = express.Router();
const { analyzeSymptoms } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/analyze', protect, analyzeSymptoms);

module.exports = router;
