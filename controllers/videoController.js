const { Op } = require('sequelize');
const Video = require('../models/Video');

// @desc    Get all videos
// @route   GET /api/videos
// @access  Public
exports.getAll = async (req, res) => {
  const { search, category } = req.query;

  try {
    const whereConditions = {};

    if (search) {
      whereConditions[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (category) {
      whereConditions.category = category;
    }

    const videos = await Video.findAll({
      where: whereConditions,
      order: [['createdAt', 'DESC']]
    });

    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single video
// @route   GET /api/videos/:id
// @access  Public
exports.getById = async (req, res) => {
  try {
    const video = await Video.findByPk(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a video
// @route   POST /api/videos
// @access  Private (Admin/Editor)
exports.create = async (req, res) => {
  const { title, description, url, category } = req.body;

  try {
    const video = await Video.create({
      title,
      description,
      url,
      category
    });

    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a video
// @route   PUT /api/videos/:id
// @access  Private (Admin/Editor)
exports.update = async (req, res) => {
  try {
    const video = await Video.findByPk(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    await video.update(req.body);
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a video
// @route   DELETE /api/videos/:id
// @access  Private (Admin/Editor)
exports.remove = async (req, res) => {
  try {
    const video = await Video.findByPk(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    await video.destroy();
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
