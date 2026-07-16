const express = require('express');
const router = express.Router();
const researchController = require('../controllers/researchController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', researchController.getAll);
router.get('/:id', researchController.getById);

// Admin / Editor only routes
router.post('/', protect, restrictTo('super_admin', 'admin', 'editor'), researchController.create);
router.put('/:id', protect, restrictTo('super_admin', 'admin', 'editor'), researchController.update);
router.delete('/:id', protect, restrictTo('super_admin', 'admin', 'editor'), researchController.remove);
router.patch('/:id/publish', protect, restrictTo('super_admin', 'admin', 'editor'), researchController.publish);

module.exports = router;
