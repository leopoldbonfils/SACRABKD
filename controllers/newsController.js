const { Op } = require('sequelize');
const News = require('../models/News');

// @desc    Get all news articles (with search, filter, sort)
// @route   GET /api/news
// @access  Public
exports.getAll = async (req, res) => {
  const { search, category, status, sort } = req.query;

  try {
    const whereConditions = {};

    // Apply search query
    if (search) {
      whereConditions[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { author: { [Op.iLike]: `%${search}%` } },
        { sub: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Apply category filter
    if (category && category !== 'All Categories') {
      whereConditions.category = category;
    }

    // Apply status filter
    if (status && status !== 'All') {
      whereConditions.status = status;
    }

    // Determine sort order
    let order = [['createdAt', 'DESC']]; // default sorting
    if (sort === 'oldest') {
      order = [['createdAt', 'ASC']];
    } else if (sort === 'title') {
      order = [['title', 'ASC']];
    }

    const newsList = await News.findAll({
      where: whereConditions,
      order: order
    });

    res.json(newsList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single news article
// @route   GET /api/news/:id
// @access  Public
exports.getById = async (req, res) => {
  try {
    const article = await News.findByPk(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'News article not found' });
    }
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a news article
// @route   POST /api/news
// @access  Private (Admin/Editor)
exports.create = async (req, res) => {
  const { title, sub, content, category, author, status, thumb, slug, seoTitle, metaDesc } = req.body;

  try {
    const article = await News.create({
      title,
      sub,
      content,
      category,
      author: author || req.user.name,
      status: status || 'Draft',
      thumb,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      seoTitle,
      metaDesc
    });

    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a news article
// @route   PUT /api/news/:id
// @access  Private (Admin/Editor)
exports.update = async (req, res) => {
  try {
    const article = await News.findByPk(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'News article not found' });
    }

    await article.update(req.body);
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a news article
// @route   DELETE /api/news/:id
// @access  Private (Admin/Editor)
exports.remove = async (req, res) => {
  try {
    const article = await News.findByPk(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'News article not found' });
    }

    await article.destroy();
    res.json({ message: 'News article deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Publish a news article
// @route   PATCH /api/news/:id/publish
// @access  Private (Admin/Editor)
exports.publish = async (req, res) => {
  try {
    const article = await News.findByPk(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'News article not found' });
    }

    article.status = 'Published';
    await article.save();

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Archive a news article
// @route   PATCH /api/news/:id/archive
// @access  Private (Admin/Editor)
exports.archive = async (req, res) => {
  try {
    const article = await News.findByPk(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'News article not found' });
    }

    article.status = 'Archived';
    await article.save();

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
