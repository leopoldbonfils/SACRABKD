const { Op } = require('sequelize');
const Research = require('../models/Research');

// @desc    Get all research items
// @route   GET /api/research
// @access  Public
exports.getAll = async (req, res) => {
  const { search, type, specialty, status } = req.query;

  try {
    const whereConditions = {};

    if (search) {
      whereConditions[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { specialty: { [Op.iLike]: `%${search}%` } },
        { investigator: { [Op.iLike]: `%${search}%` } },
        { authors: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (type) {
      whereConditions.type = type; // study OR publication
    }

    if (specialty && specialty !== 'All Departments') {
      whereConditions.specialty = specialty;
    }

    if (status) {
      whereConditions.status = status;
    }

    const items = await Research.findAll({
      where: whereConditions,
      order: [['createdAt', 'DESC']]
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single research item
// @route   GET /api/research/:id
// @access  Public
exports.getById = async (req, res) => {
  try {
    const item = await Research.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Research item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a research item
// @route   POST /api/research
// @access  Private (Admin/Editor)
exports.create = async (req, res) => {
  const { title, description, investigator, status, progress, authors, journal, date, url, tag, specialty, type } = req.body;

  try {
    const item = await Research.create({
      title,
      description,
      investigator,
      status: status || 'Active',
      progress: progress || 0,
      authors,
      journal,
      date,
      url,
      tag: tag || 'Peer Reviewed',
      specialty,
      type: type || 'study'
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a research item
// @route   PUT /api/research/:id
// @access  Private (Admin/Editor)
exports.update = async (req, res) => {
  try {
    const item = await Research.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Research item not found' });
    }

    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a research item
// @route   DELETE /api/research/:id
// @access  Private (Admin/Editor)
exports.remove = async (req, res) => {
  try {
    const item = await Research.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Research item not found' });
    }

    await item.destroy();
    res.json({ message: 'Research item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Publish a research item
// @route   PATCH /api/research/:id/publish
// @access  Private (Admin/Editor)
exports.publish = async (req, res) => {
  try {
    const item = await Research.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Research item not found' });
    }

    item.status = 'Completed';
    await item.save();

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
