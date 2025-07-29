const { cache } = require("../config/redis");

// Cache performance monitoring
class CacheMonitor {
  constructor() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      errors: 0,
      totalRequests: 0,
    };
  }

  recordHit() {
    this.stats.hits++;
    this.stats.totalRequests++;
  }

  recordMiss() {
    this.stats.misses++;
    this.stats.totalRequests++;
  }

  recordSet() {
    this.stats.sets++;
  }

  recordError() {
    this.stats.errors++;
  }

  getStats() {
    const hitRate =
      this.stats.totalRequests > 0
        ? ((this.stats.hits / this.stats.totalRequests) * 100).toFixed(2)
        : 0;

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      uptime: process.uptime(),
    };
  }

  reset() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      errors: 0,
      totalRequests: 0,
    };
  }
}

const monitor = new CacheMonitor();

// Enhanced cache functions with monitoring
const monitoredCache = {
  async get(key) {
    try {
      const result = await cache.get(key);
      if (result) {
        monitor.recordHit();
        console.log(`🎯 Cache HIT: ${key}`);
      } else {
        monitor.recordMiss();
        console.log(`🔍 Cache MISS: ${key}`);
      }
      return result;
    } catch (error) {
      monitor.recordError();
      console.error(`❌ Cache GET error: ${error.message}`);
      return null;
    }
  },

  async set(key, data, expiration = 300) {
    try {
      const result = await cache.set(key, data, expiration);
      if (result) {
        monitor.recordSet();
        console.log(`📦 Cache SET: ${key}`);
      }
      return result;
    } catch (error) {
      monitor.recordError();
      console.error(`❌ Cache SET error: ${error.message}`);
      return false;
    }
  },

  async del(key) {
    return await cache.del(key);
  },

  async delPattern(pattern) {
    return await cache.delPattern(pattern);
  },

  isConnected() {
    return cache.isConnected();
  },

  getStats() {
    return monitor.getStats();
  },
};

module.exports = { monitoredCache, monitor };
