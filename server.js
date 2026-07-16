const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { connectDB, sequelize } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { uploadSingle } = require('./middleware/upload');
const { protect } = require('./middleware/auth');
const { cloudinary } = require('./config/cloudinary');

// Initialize Express App
const app = express();

// Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local static file uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const newsRoutes = require('./routes/newsRoutes');
const eventRoutes = require('./routes/eventRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const videoRoutes = require('./routes/videoRoutes');
const researchRoutes = require('./routes/researchRoutes');
const memberRoutes = require('./routes/memberRoutes');
const contactRoutes = require('./routes/contactRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/contact', contactRoutes);

// General/Generic Upload route for admin's uploadService.js
app.post('/api/upload', protect, uploadSingle('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ url: req.file.url });
});

// Generic Delete uploaded file route for admin's uploadService.js
app.delete('/api/upload', protect, async (req, res) => {
  const { fileKey } = req.body;
  if (!fileKey) {
    return res.status(400).json({ message: 'File key/url is required' });
  }

  try {
    // If it's a Cloudinary file, parse public_id and delete it
    if (fileKey.includes('cloudinary.com')) {
      // e.g. https://res.cloudinary.com/demo/image/upload/v123456/sacra/images/filename.jpg
      const parts = fileKey.split('/');
      const publicIdWithExtension = parts.slice(parts.indexOf('upload') + 2).join('/'); // sacra/images/filename.jpg
      const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
      
      let resourceType = 'image';
      if (fileKey.includes('/video/')) resourceType = 'video';
      else if (fileKey.includes('/raw/')) resourceType = 'raw';

      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } else {
      // Local file delete
      const filename = path.basename(fileKey);
      const localPath = path.join(__dirname, 'uploads', filename);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    }
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Resources Placeholder route to prevent 404 for dashboard Library
app.use('/api/resources', (req, res) => res.json([]));

// Test Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Global Error Handler Middleware
app.use(errorHandler);

// Start server after connecting to PostgreSQL DB and syncing models
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Sync models - in development we can use { alter: true } or { force: false }
    // Force: false ensures we do NOT wipe existing tables
    await sequelize.sync({ force: false });
    console.log('PostgreSQL database schemas synchronized successfully.');

    app.listen(PORT, () => {
      console.log(`Express server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
