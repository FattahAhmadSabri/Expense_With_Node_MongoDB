const mongoose = require("mongoose");
const mongoUrl = process.env.MONGO_URL;

const dbConfig = async () => {
  try {
    await mongoose.connect(mongoUrl);

    console.log("MongoDB connected successfully");
    console.log("retryWrites:", mongoose.connection.client.options.retryWrites);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
    throw error;
  }
};

module.exports = dbConfig;
