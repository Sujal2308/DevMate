const mongoose = require("mongoose");

const testConnection = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/devmate");
    console.log("✅ MongoDB Connected Successfully!");
    console.log("📊 Connection State:", mongoose.connection.readyState);
    await mongoose.disconnect();
    console.log("🔒 Disconnected from MongoDB");
  } catch (error) {
    console.log("❌ MongoDB Connection Error:", error.message);
  }
};

testConnection();
