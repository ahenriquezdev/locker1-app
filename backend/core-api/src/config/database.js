const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongooseOptions = {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      minPoolSize: 0,
      maxIdleTimeMS: 30000,
    };

    await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);

    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
