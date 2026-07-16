const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.get('/me', protect, authController.getProfile);
router.put('/me', protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);

module.exports = router;
