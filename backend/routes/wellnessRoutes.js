const express = require('express');
const router = express.Router();
const { getWellnessPlan, updateMilestone } = require('../controllers/wellnessController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/:petId', protect, getWellnessPlan);
router.put('/:petId/milestone/:milestoneId', protect, updateMilestone);

module.exports = router;
