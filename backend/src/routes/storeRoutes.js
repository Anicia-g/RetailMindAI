const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', storeController.getAllStores);
router.get('/:id', storeController.getStoreById);
router.post('/', protect, requireRole('ADMIN'), storeController.createStore);
router.put('/:id', protect, requireRole('ADMIN'), storeController.updateStore);
router.delete('/:id', protect, requireRole('ADMIN'), storeController.deleteStore);

module.exports = router;
