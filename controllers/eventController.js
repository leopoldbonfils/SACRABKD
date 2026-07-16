const { Op } = require('sequelize');
const Event = require('../models/Event');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getAll = async (req, res) => {
  const { search, tab, status } = req.query;

  try {
    const whereConditions = {};

    // Search query filter
    if (search) {
      whereConditions[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Filter by tab/status from Admin (tabs: All Events, Draft, Live, Past)
    if (tab && tab !== 'All Events') {
      whereConditions.status = tab; // e.g. Draft, Live, Past
    }

    // Direct status filter
    if (status) {
      whereConditions.status = status;
    }

    const events = await Event.findAll({
      where: whereConditions,
      order: [['date', 'ASC']]
    });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an event
// @route   POST /api/events
// @access  Private (Admin/Editor)
exports.create = async (req, res) => {
  const { title, description, date, location, category, status } = req.body;

  try {
    const event = await Event.create({
      title,
      description,
      date,
      location,
      category,
      status: status || 'Draft'
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Admin/Editor)
exports.update = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await event.update(req.body);
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Admin/Editor)
exports.remove = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await event.destroy();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel an event
// @route   PATCH /api/events/:id/cancel
// @access  Private (Admin/Editor)
exports.cancel = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.status = 'Cancelled';
    await event.save();

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
