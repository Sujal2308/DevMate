const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env vars
dotenv.config({ path: path.join(__dirname, ".env") });

const Community = require("./models/Community");

const seedFlairs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("🚀 Connected to MongoDB Atlas");

    const communities = await Community.find();

    const universalFlairs = [
      { name: "Question", color: "#1d9bf0" },
      { name: "Bug Help", color: "#f4212e" },
      { name: "Discussion", color: "#ffd33d" },
      { name: "Resource", color: "#00ba7c" },
      { name: "Show & Tell", color: "#7856ff" },
      { name: "Code Review", color: "#ff7b72" },
      { name: "Optimization", color: "#00ba7c" },
      { name: "Project Help", color: "#1d9bf0" },
      { name: "Interview Prep", color: "#f4212e" },
      { name: "Trending / Hot", color: "#ff7b72" }
    ];

    for (const comm of communities) {
      console.log(`📦 Removing emojis and applying text-only flairs to ${comm.name}...`);
      comm.flairs = universalFlairs;
      await comm.save();
    }

    console.log("✅ All communities updated with text-only Universal Flairs!");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedFlairs();
