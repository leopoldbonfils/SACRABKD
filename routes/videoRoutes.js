const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', videoController.getAll);
router.get('/:id', videoController.getById);

// Admin / Editor only routes
router.post('/', protect, restrictTo('super_admin', 'admin', 'editor'), videoController.create);
router.put('/:id', protect, restrictTo('super_admin', 'admin', 'editor'), videoController.update);
router.delete('/:id', protect, restrictTo('super_admin', 'admin', 'editor'), videoController.remove);

module.exports = router;
