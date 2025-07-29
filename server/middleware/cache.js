const { cache } = require("../config/redis");

// Cache middleware for GET requests
const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Create user-specific cache key to avoid data leaks
    const userId = req.user ? req.user._id.toString() : "anonymous";
    const cacheKey = `${req.originalUrl}_user:${userId}`;

    try {
      // Try to get from cache
      const cachedData = await cache.get(cacheKey);

      if (cachedData) {
        // Add cache headers
        res.set({
          "X-Cache": "HIT",
          "X-Cache-Key": cacheKey,
          "Cache-Control": "private, max-age=" + duration,
        });
        return res.json(cachedData);
      }

      // Store original res.json
      const originalJson = res.json;

      // Override res.json to cache the response
      res.json = function (data) {
        // Cache the response
        cache.set(cacheKey, data, duration);

        // Add cache headers
        res.set({
          "X-Cache": "MISS",
          "X-Cache-Key": cacheKey,
        });

        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      next();
    }
  };
};

// Middleware to invalidate cache on data changes
const invalidateCacheMiddleware = (patterns) => {
  return async (req, res, next) => {
    // Store original res.json
    const originalJson = res.json;

    // Override res.json to invalidate cache after successful response
    res.json = function (data) {
      // Call original json method first
      const result = originalJson.call(this, data);

      // Invalidate cache patterns if response was successful
      if (res.statusCode >= 200 && res.statusCode < 300) {
        patterns.forEach((pattern) => {
          cache.delPattern(pattern);
        });
      }

      return result;
    };

    next();
  };
};

module.exports = { cacheMiddleware, invalidateCacheMiddleware };
