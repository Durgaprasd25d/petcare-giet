const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');
const { protect } = require('../middlewares/authMiddleware');

// Get all pets for a user
router.get('/', protect, async (req, res) => {
    try {
        const pets = await Pet.find({ owner: req.user._id });
        res.json(pets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add new pet
router.post('/', protect, async (req, res) => {
    try {
        const { name, species, breed, age, gender, weight, image } = req.body;
        const pet = await Pet.create({
            owner: req.user._id,
            name, species, breed, age, gender, weight, image
        });
        res.status(201).json(pet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
