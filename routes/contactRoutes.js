const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { protect, restrictTo } = require('../middleware/auth');

// Public route to submit a message from the User portal
router.post('/', contactController.submitMessage);

// Protected admin/editor routes
router.get('/unread/count', protect, restrictTo('super_admin', 'admin', 'editor'), contactController.getUnread);
router.get('/', protect, restrictTo('super_admin', 'admin', 'editor'), contactController.getAll);
router.get('/:id', protect, restrictTo('super_admin', 'admin', 'editor'), contactController.getById);
router.patch('/:id/read', protect, restrictTo('super_admin', 'admin', 'editor'), contactController.markRead);
router.post('/:id/reply', protect, restrictTo('super_admin', 'admin', 'editor'), contactController.reply);
router.delete('/:id', protect, restrictTo('super_admin', 'admin', 'editor'), contactController.remove);

module.exports = router;
