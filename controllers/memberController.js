const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const User = require('../models/User');

// @desc    Get all members
// @route   GET /api/members
// @access  Private (Admin/Editor)
exports.getAll = async (req, res) => {
  const { search, role, status } = req.query;

  try {
    const whereConditions = {};

    // Standard members list should exclude super_admins or list everyone depending on search
    if (search) {
      whereConditions[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { university: { [Op.iLike]: `%${search}%` } },
        { department: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (role) {
      whereConditions.role = role;
    }

    if (status) {
      whereConditions.membershipStatus = status;
    }

    const members = await User.findAll({
      where: whereConditions,
      order: [['createdAt', 'DESC']]
    });

    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get member by ID
// @route   GET /api/members/:id
// @access  Private (Admin/Editor)
exports.getById = async (req, res) => {
  try {
    const member = await User.findByPk(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new member manually
// @route   POST /api/members
// @access  Private (Admin/Editor)
exports.create = async (req, res) => {
  const { name, email, password, role, membershipStatus, university, department, studyYear } = req.body;

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'sacra123', salt); // default password if none provided

    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#7c3aed', '#db2777', '#06b6d4', '#4b5563'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const member = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      membershipStatus: membershipStatus || 'pending',
      university,
      department,
      studyYear,
      initials,
      avatarBg: randomColor
    });

    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a member
// @route   PUT /api/members/:id
// @access  Private (Admin/Editor)
exports.update = async (req, res) => {
  try {
    const member = await User.findByPk(req.params.id);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    await member.update(req.body);
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a member
// @route   DELETE /api/members/:id
// @access  Private (Admin/Editor)
exports.remove = async (req, res) => {
  try {
    const member = await User.findByPk(req.params.id);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    await member.destroy();
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all membership requests (pending status)
// @route   GET /api/members/requests
// @access  Private (Admin/Editor)
exports.getRequests = async (req, res) => {
  try {
    const requests = await User.findAll({
      where: { membershipStatus: 'pending' },
      order: [['createdAt', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve membership request
// @route   PATCH /api/members/requests/:id/approve
// @access  Private (Admin/Editor)
exports.approveRequest = async (req, res) => {
  try {
    const member = await User.findByPk(req.params.id);

    if (!member) {
      return res.status(404).json({ message: 'Member request not found' });
    }

    member.membershipStatus = 'active';
    await member.save();

    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject membership request
// @route   PATCH /api/members/requests/:id/reject
// @access  Private (Admin/Editor)
exports.rejectRequest = async (req, res) => {
  try {
    const member = await User.findByPk(req.params.id);

    if (!member) {
      return res.status(404).json({ message: 'Member request not found' });
    }

    // Set to inactive on rejection
    member.membershipStatus = 'inactive';
    await member.save();

    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update member status directly
// @route   PATCH /api/members/:id/status
// @access  Private (Admin/Editor)
exports.updateStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const member = await User.findByPk(req.params.id);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.membershipStatus = status;
    await member.save();

    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
