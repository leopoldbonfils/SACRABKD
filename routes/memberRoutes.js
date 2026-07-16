const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { protect, restrictTo } = require('../middleware/auth');

// Public endpoint for prospective members to apply from user portal
router.post('/apply', memberController.create);

// Protect all other member routes
router.use(protect);
router.use(restrictTo('super_admin', 'admin', 'editor'));

// Specific requests endpoints (must precede /:id)
router.get('/requests', memberController.getRequests);
router.patch('/requests/:id/approve', memberController.approveRequest);
router.patch('/requests/:id/reject', memberController.rejectRequest);

// General member endpoints
router.get('/', memberController.getAll);
router.get('/:id', memberController.getById);
router.post('/', memberController.create);
router.put('/:id', memberController.update);
router.delete('/:id', memberController.remove);
router.patch('/:id/status', memberController.updateStatus);

module.exports = router;
