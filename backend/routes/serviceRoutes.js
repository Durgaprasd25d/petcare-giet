const express = require('express');
const router = express.Router();
const { 
    createService, 
    getProviderServices, 
    getAllServices, 
    updateService, 
    deleteService 
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/', protect, authorize('Veterinarian', 'Service Provider'), createService);
router.get('/provider', protect, authorize('Veterinarian', 'Service Provider'), getProviderServices);
router.get('/', protect, getAllServices);
router.put('/:id', protect, authorize('Veterinarian', 'Service Provider'), updateService);
router.delete('/:id', protect, authorize('Veterinarian', 'Service Provider'), deleteService);

module.exports = router;
