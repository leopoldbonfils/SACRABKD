const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', eventController.getAll);
router.get('/:id', eventController.getById);

// Admin / Editor only routes
router.post('/', protect, restrictTo('super_admin', 'admin', 'editor'), eventController.create);
router.put('/:id', protect, restrictTo('super_admin', 'admin', 'editor'), eventController.update);
router.delete('/:id', protect, restrictTo('super_admin', 'admin', 'editor'), eventController.remove);
router.patch('/:id/cancel', protect, restrictTo('super_admin', 'admin', 'editor'), eventController.cancel);

module.exports = router;
