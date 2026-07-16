const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

// Public routes
router.get('/', galleryController.getAll);
router.get('/albums', galleryController.getAlbums);
router.get('/:id', galleryController.getById);

// Admin / Editor only routes
router.post('/upload', protect, restrictTo('super_admin', 'admin', 'editor'), uploadSingle('file'), galleryController.upload);
router.put('/:id', protect, restrictTo('super_admin', 'admin', 'editor'), galleryController.update);
router.delete('/:id', protect, restrictTo('super_admin', 'admin', 'editor'), galleryController.remove);

router.post('/albums', protect, restrictTo('super_admin', 'admin', 'editor'), galleryController.createAlbum);
router.delete('/albums/:id', protect, restrictTo('super_admin', 'admin', 'editor'), galleryController.deleteAlbum);

module.exports = router;
