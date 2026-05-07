const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");

const makeAdmin = async () => {
  const username = process.argv[2];

  if (!username) {
    console.error("❌ Please provide a username. Example: node makeAdmin.js your_username");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to database");

    const user = await User.findOne({ username });

    if (!user) {
      console.error(`❌ User not found with username: ${username}`);
      process.exit(1);
    }

    user.role = "admin";
    await user.save();

    console.log(`🎉 Success! ${username} is now an admin.`);
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

makeAdmin();
