const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', newsController.getAll);
router.get('/:id', newsController.getById);

// Admin / Editor only routes
router.post('/', protect, restrictTo('super_admin', 'admin', 'editor'), newsController.create);
router.put('/:id', protect, restrictTo('super_admin', 'admin', 'editor'), newsController.update);
router.delete('/:id', protect, restrictTo('super_admin', 'admin', 'editor'), newsController.remove);
router.patch('/:id/publish', protect, restrictTo('super_admin', 'admin', 'editor'), newsController.publish);
router.patch('/:id/archive', protect, restrictTo('super_admin', 'admin', 'editor'), newsController.archive);

module.exports = router;
