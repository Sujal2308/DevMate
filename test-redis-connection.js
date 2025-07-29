// Quick Redis connection test
const redis = require("redis");

const testRedis = async () => {
  const client = redis.createClient({
    url: "YOUR_REDIS_URL_HERE", // Replace with actual URL
  });

  try {
    await client.connect();
    console.log("✅ Redis connected successfully!");

    // Test set/get
    await client.set("test", "Hello Redis!");
    const result = await client.get("test");
    console.log("🎯 Test result:", result);

    await client.disconnect();
    console.log("✅ Redis test completed!");
  } catch (error) {
    console.error("❌ Redis connection failed:", error.message);
  }
};

testRedis();
