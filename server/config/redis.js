const redis = require("redis");

// Create Redis client with production-ready config
let client;

if (process.env.REDIS_URL) {
  // Production: use full Redis URL (Render, Railway, Heroku format)
  client = redis.createClient({
    url: process.env.REDIS_URL,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });
} else {
  // Development: use individual settings
  client = redis.createClient({
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });
}

// Track Redis connection status
let isRedisConnected = false;

// Handle Redis connection events
client.on("connect", () => {
  console.log("🔗 Redis client connected");
  isRedisConnected = true;
});

client.on("error", (err) => {
  console.log("❌ Redis client error:", err.message);
  isRedisConnected = false;
});

client.on("ready", () => {
  console.log("✅ Redis client ready");
  isRedisConnected = true;
});

client.on("end", () => {
  console.log("📴 Redis client disconnected");
  isRedisConnected = false;
});

// Helper functions with fallback
const cache = {
  // Set data with expiration (in seconds)
  set: async (key, data, expiration = 300) => {
    if (!isRedisConnected) {
      console.log("⚠️ Redis not connected, skipping cache set");
      return false;
    }

    try {
      await client.setEx(key, expiration, JSON.stringify(data));
      console.log(`📦 Cached: ${key} (expires in ${expiration}s)`);
      return true;
    } catch (error) {
      console.error("❌ Cache set error:", error.message);
      return false;
    }
  },

  // Get data from cache
  get: async (key) => {
    if (!isRedisConnected) {
      console.log("⚠️ Redis not connected, skipping cache get");
      return null;
    }

    try {
      const data = await client.get(key);
      if (data) {
        console.log(`🎯 Cache hit: ${key}`);
        return JSON.parse(data);
      }
      console.log(`🔍 Cache miss: ${key}`);
      return null;
    } catch (error) {
      console.error("❌ Cache get error:", error.message);
      return null;
    }
  },

  // Delete from cache
  del: async (key) => {
    if (!isRedisConnected) {
      return false;
    }

    try {
      await client.del(key);
      console.log(`🗑️ Cache deleted: ${key}`);
      return true;
    } catch (error) {
      console.error("❌ Cache delete error:", error.message);
      return false;
    }
  },

  // Delete multiple keys by pattern
  delPattern: async (pattern) => {
    if (!isRedisConnected) {
      return false;
    }

    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
        console.log(
          `🗑️ Cache cleared: ${keys.length} keys matching ${pattern}`
        );
      }
      return true;
    } catch (error) {
      console.error("❌ Cache pattern delete error:", error.message);
      return false;
    }
  },

  // Health check
  isConnected: () => isRedisConnected,
};

module.exports = { client, cache };
