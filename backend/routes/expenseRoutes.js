const express = require('express');
const router = express.Router();
const { addExpense, getExpenses, deleteExpense } = require('../controllers/expenseController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, addExpense);
router.get('/', protect, getExpenses);
router.delete('/:id', protect, deleteExpense);

module.exports = router;
