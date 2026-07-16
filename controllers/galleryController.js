const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const { Gallery, Album } = require('../models/Gallery');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all gallery media files
// @route   GET /api/gallery
// @access  Public
exports.getAll = async (req, res) => {
  const { search, category, album } = req.query;

  try {
    const whereConditions = {};

    if (search) {
      whereConditions.name = { [Op.iLike]: `%${search}%` };
    }

    if (category && category !== 'All' && category !== 'Images' && category !== 'Videos' && category !== 'Documents' && category !== 'Logos') {
      // If client requests tabs like 'Workshops', 'Symposiums', etc. (User app uses these values)
      whereConditions[Op.or] = [
        { category: category },
        { album: category }
      ];
    } else if (category && category !== 'All') {
      // Standard category tabs
      whereConditions.category = category;
    }

    if (album) {
      whereConditions.album = album;
    }

    const items = await Gallery.findAll({
      where: whereConditions,
      order: [['createdAt', 'DESC']]
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single media file by ID
// @route   GET /api/gallery/:id
// @access  Public
exports.getById = async (req, res) => {
  try {
    const item = await Gallery.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Media item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload media item
// @route   POST /api/gallery/upload
// @access  Private (Admin/Editor)
exports.upload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Determine category based on mimetype if not explicitly set
    let category = req.body.category || 'Images';
    const mimetype = req.file.mimetype;
    
    if (mimetype.startsWith('video/')) {
      category = 'Videos';
    } else if (mimetype.startsWith('application/') || mimetype.startsWith('text/')) {
      category = 'Documents';
    }

    const item = await Gallery.create({
      name: req.body.name || req.file.originalname,
      type: mimetype,
      size: req.file.formattedSize || `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`,
      dimensions: req.file.dimensions || 'N/A',
      uploadedBy: req.user ? req.user.name : 'System Admin',
      url: req.file.url,
      public_id: req.file.public_id || null,
      category: category,
      album: req.body.album || null
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update media item details
// @route   PUT /api/gallery/:id
// @access  Private (Admin/Editor)
exports.update = async (req, res) => {
  try {
    const item = await Gallery.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Media item not found' });
    }

    await item.update({
      name: req.body.name || item.name,
      album: req.body.album !== undefined ? req.body.album : item.album,
      category: req.body.category || item.category
    });

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove media item
// @route   DELETE /api/gallery/:id
// @access  Private (Admin/Editor)
exports.remove = async (req, res) => {
  try {
    const item = await Gallery.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Media item not found' });
    }

    // 1. Delete from Cloudinary if hosted there
    if (item.public_id) {
      try {
        let resourceType = 'image';
        if (item.category === 'Videos') {
          resourceType = 'video';
        } else if (item.category === 'Documents') {
          resourceType = 'raw';
        }
        await cloudinary.uploader.destroy(item.public_id, { resource_type: resourceType });
      } catch (cloudErr) {
        console.error('Failed to delete asset from Cloudinary:', cloudErr.message);
      }
    } else {
      // 2. Delete locally if uploaded locally
      const filename = path.basename(item.url);
      const localPath = path.join(__dirname, '../uploads', filename);
      if (fs.existsSync(localPath)) {
        try {
          fs.unlinkSync(localPath);
        } catch (fileErr) {
          console.error('Failed to delete local file:', fileErr.message);
        }
      }
    }

    await item.destroy();
    res.json({ message: 'Media item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all albums
// @route   GET /api/gallery/albums
// @access  Public
exports.getAlbums = async (req, res) => {
  try {
    const albums = await Album.findAll({ order: [['name', 'ASC']] });
    res.json(albums);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create album
// @route   POST /api/gallery/albums
// @access  Private (Admin/Editor)
exports.createAlbum = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Album name is required' });
    }

    const album = await Album.create({ name, description });
    res.status(201).json(album);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete album
// @route   DELETE /api/gallery/albums/:id
// @access  Private (Admin/Editor)
exports.deleteAlbum = async (req, res) => {
  try {
    const album = await Album.findByPk(req.params.id);

    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    await album.destroy();
    res.json({ message: 'Album deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
