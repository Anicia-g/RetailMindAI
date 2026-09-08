const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.post('/', protect, requireRole('ADMIN'), categoryController.createCategory);
router.put('/:id', protect, requireRole('ADMIN'), categoryController.updateCategory);
router.delete('/:id', protect, requireRole('ADMIN'), categoryController.deleteCategory);

module.exports = router;
