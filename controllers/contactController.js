const Contact = require('../models/Contact');

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private (Admin/Editor)
exports.getAll = async (req, res) => {
  try {
    const messages = await Contact.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single contact message
// @route   GET /api/contact/:id
// @access  Private (Admin/Editor)
exports.getById = async (req, res) => {
  try {
    const message = await Contact.findByPk(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark message as read
// @route   PATCH /api/contact/:id/read
// @access  Private (Admin/Editor)
exports.markRead = async (req, res) => {
  try {
    const message = await Contact.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.isRead = true;
    await message.save();

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reply to a contact message
// @route   POST /api/contact/:id/reply
// @access  Private (Admin/Editor)
exports.reply = async (req, res) => {
  const { message: replyContent } = req.body;

  try {
    const message = await Contact.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.replyMessage = replyContent;
    message.isRead = true; // replying automatically marks it as read
    await message.save();

    console.log(`[REPLY MOCK SENT] To: ${message.email} | Content: ${replyContent}`);

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a message
// @route   DELETE /api/contact/:id
// @access  Private (Admin/Editor)
exports.remove = async (req, res) => {
  try {
    const message = await Contact.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.destroy();
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get unread messages count
// @route   GET /api/contact/unread/count
// @access  Private (Admin/Editor)
exports.getUnread = async (req, res) => {
  try {
    const count = await Contact.count({ where: { isRead: false } });
    res.json(count); // returns count as a simple integer response per service implementation
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit new message (from user portal)
// @route   POST /api/contact
// @access  Public
exports.submitMessage = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  try {
    const inquiry = await Contact.create({
      name,
      email,
      phone,
      subject,
      message
    });

    res.status(201).json(inquiry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
