require('dotenv').config();

module.exports = {
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/mindloo',
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
};