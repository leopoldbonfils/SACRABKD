const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Gallery = sequelize.define('Gallery', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true // e.g. JPEG Image, PDF, etc.
  },
  size: {
    type: DataTypes.STRING,
    allowNull: true // e.g. 2.4 MB
  },
  dimensions: {
    type: DataTypes.STRING,
    allowNull: true // e.g. 4200 x 5600 px
  },
  uploadedBy: {
    type: DataTypes.STRING,
    allowNull: true
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  public_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Images' // Images, Videos, Documents, Logos
  },
  album: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true
});

const Album = sequelize.define('Album', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = { Gallery, Album };
