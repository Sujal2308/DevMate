const redis = require("redis");

// Test Redis URL
const testRedisURL = async (redisUrl) => {
  console.log("🧪 Testing Redis URL:", redisUrl.replace(/:[^:]*@/, ":****@")); // Hide password

  const client = redis.createClient({
    url: redisUrl,
  });

  try {
    console.log("🔗 Connecting to Redis...");
    await client.connect();
    console.log("✅ Redis connected successfully!");

    // Test basic operations
    console.log("📝 Testing SET operation...");
    await client.set("test_key", "Hello DevMate!", { EX: 10 });

    console.log("📖 Testing GET operation...");
    const result = await client.get("test_key");
    console.log("🎯 Retrieved value:", result);

    console.log("🧹 Cleaning up...");
    await client.del("test_key");

    await client.disconnect();
    console.log("✅ Redis test completed successfully!");
    return true;
  } catch (error) {
    console.error("❌ Redis connection failed:");
    console.error("Error:", error.message);

    if (error.message.includes("ENOTFOUND")) {
      console.log("💡 Suggestion: Check if hostname is correct");
    } else if (error.message.includes("auth")) {
      console.log("💡 Suggestion: Check if password is correct");
    } else if (error.message.includes("timeout")) {
      console.log("💡 Suggestion: Check if port and URL format is correct");
    }

    return false;
  }
};

// Replace with your actual Redis URL
const REDIS_URL = "redis://red-xxxxxxxxx:password@hostname.render.com:6379";

console.log("🚀 Starting Redis connection test...");
testRedisURL(REDIS_URL);
