const { Sequelize } = require('sequelize');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/sacra';

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries in console
  dialectOptions: {
    // If you are connecting to an external DB requiring SSL, uncomment the lines below:
    /*
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
    */
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL database connected successfully via Sequelize ORM.');
  } catch (error) {
    console.error('Unable to connect to the PostgreSQL database:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
