const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    mongoose.set('bufferCommands', false);
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cctv_system';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Please ensure MongoDB is installed and running.');
    console.error('Download MongoDB: https://www.mongodb.com/try/download/community');
    return false;
  }
};

module.exports = connectDB;
