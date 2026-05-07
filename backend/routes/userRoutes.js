const express = require('express');
const router = express.Router();
const { 
    getUsers, 
    getPendingApprovals, 
    approveUser, 
    rejectUser, 
    getAdminStats, 
    updateUserProfile,
    toggleSuspension,
    getAdminServices,
    getVets
} = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/vets', protect, getVets);
router.get('/stats', protect, authorize('Admin'), getAdminStats);
router.get('/', protect, authorize('Admin'), getUsers);
router.get('/pending', protect, authorize('Admin'), getPendingApprovals);
router.get('/services', protect, authorize('Admin'), getAdminServices);
router.put('/:id/approve', protect, authorize('Admin'), approveUser);
router.put('/:id/suspend', protect, authorize('Admin'), toggleSuspension);
router.delete('/:id/reject', protect, authorize('Admin'), rejectUser);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
