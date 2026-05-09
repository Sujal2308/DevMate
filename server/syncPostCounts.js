const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Community = require("./models/Community");
const Post = require("./models/Post");

dotenv.config();

const syncPostCounts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("🚀 Connected to MongoDB");

    const communities = await Community.find();
    console.log(`🔍 Found ${communities.length} communities. Syncing post counts...`);

    for (const community of communities) {
      const actualPostCount = await Post.countDocuments({ community: community._id });
      
      if (community.postCount !== actualPostCount) {
        console.log(`✅ Updating "${community.name}": ${community.postCount} -> ${actualPostCount}`);
        community.postCount = actualPostCount;
        await community.save();
      }
    }

    console.log("✨ All community post counts synced successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error syncing post counts:", error);
    process.exit(1);
  }
};

syncPostCounts();
