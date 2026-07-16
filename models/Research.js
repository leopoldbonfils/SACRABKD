const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Research = sequelize.define('Research', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  investigator: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Active' // Active, Recruiting, Completed
  },
  progress: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0 // percentage
  },
  authors: {
    type: DataTypes.STRING,
    allowNull: true // e.g. Dr. Alice Chen, et al.
  },
  journal: {
    type: DataTypes.STRING,
    allowNull: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tag: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Peer Reviewed'
  },
  specialty: {
    type: DataTypes.STRING,
    allowNull: true // e.g. Neuroanesthesia, Obstetric, etc.
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'study' // study (active trial) OR publication (peer-reviewed paper)
  }
}, {
  timestamps: true
});

module.exports = Research;
