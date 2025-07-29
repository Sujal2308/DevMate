const express = require("express");
const { cache } = require("../config/redis");

const router = express.Router();

// Health check endpoint
router.get("/health", async (req, res) => {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      api: "healthy",
      database: "unknown", // You can add DB check here
      redis: cache.isConnected() ? "healthy" : "unhealthy",
    },
  };

  // Test Redis with a simple operation
  try {
    await cache.set("health_check", "ok", 10);
    const result = await cache.get("health_check");
    if (result === "ok") {
      health.services.redis = "healthy";
    }
  } catch (error) {
    health.services.redis = "unhealthy";
    health.redis_error = error.message;
  }

  // Return appropriate status code
  const allHealthy = Object.values(health.services).every(
    (s) => s === "healthy" || s === "unknown"
  );

  res.status(allHealthy ? 200 : 503).json(health);
});

// Cache statistics endpoint
router.get("/cache-stats", async (req, res) => {
  try {
    if (!cache.isConnected()) {
      return res.status(503).json({ error: "Redis not connected" });
    }

    // Get basic cache info
    const stats = {
      connected: cache.isConnected(),
      uptime: process.uptime(),
      memory_usage: process.memoryUsage(),
      cache_info: "Available",
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
