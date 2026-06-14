const mongoose = require('mongoose');

const connectDB = async () => {
  // Essaie d'abord Atlas (cloud)
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 1000,
      connectTimeoutMS: 1000,
    });
    console.log(`✅ MongoDB Atlas connecté: ${conn.connection.host}`);
  } catch (err) {
    console.warn(`⚠️ Atlas indisponible — bascule vers MongoDB local...`);
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI_LOCAL);
      console.log(`✅ MongoDB Local connecté: ${conn.connection.host}`);
    } catch (localErr) {
      console.error(`❌ MongoDB local error: ${localErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;