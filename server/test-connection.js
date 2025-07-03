const connectDB = require("./config/db");

console.log("🔍 Testing MongoDB connection...");
connectDB()
  .then(() => {
    console.log("✅ MongoDB connection test successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.log("❌ MongoDB connection test failed:", error.message);
    process.exit(1);
  });
