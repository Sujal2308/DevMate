const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    // Use MONGODB_URI (Atlas format) or MONGO_URI (local format)
    let mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    // If username and password are provided and no URI is available, construct a local URI (fallback only)
    if (process.env.MONGO_USERNAME && process.env.MONGO_PASSWORD && !mongoUri) {
      const username = encodeURIComponent(process.env.MONGO_USERNAME);
      const password = encodeURIComponent(process.env.MONGO_PASSWORD);
      mongoUri = `mongodb://${username}:${password}@localhost:27017/devmate`;
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message);
    console.log("\n📝 MongoDB Connection Help:");
    console.log("1. Make sure MongoDB is installed and running");
    console.log("2. Check if mongod service is started");
    console.log("3. Verify MONGO_URI in .env file");
    console.log("4. If using auth, check MONGO_USERNAME and MONGO_PASSWORD");
    console.log("5. Default: mongodb://localhost:27017/devmate");
    console.log("\n🔧 To start MongoDB:");
    console.log("   Windows: mongod --dbpath data\\db");
    console.log("   Mac/Linux: mongod\n");
    return false;
  }
};

// Handle MongoDB connection events
mongoose.connection.on("connected", () => {
  console.log("✅ Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ Mongoose disconnected from MongoDB");
});

module.exports = connectDB;
