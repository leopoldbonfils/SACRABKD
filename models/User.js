const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user' // super_admin, admin, editor, viewer, user
  },
  membershipStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending' // pending, active, inactive, banned
  },
  university: {
    type: DataTypes.STRING,
    allowNull: true
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true
  },
  studyYear: {
    type: DataTypes.STRING,
    allowNull: true
  },
  initials: {
    type: DataTypes.STRING,
    allowNull: true
  },
  avatarBg: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '#3b82f6'
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetPasswordExpire: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true // adds createdAt and updatedAt columns
});

module.exports = User;
