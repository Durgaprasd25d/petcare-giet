const express = require('express');
const router = express.Router();
const upload = require('../utils/cloudinary');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        res.json({
            message: 'Image uploaded successfully',
            imageUrl: req.file.path // Cloudinary secure URL
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
