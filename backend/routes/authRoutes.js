const express = require('express');
const router = express.Router();
const { register, login, getMe, verifyOTP } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/verify', verifyOTP);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
