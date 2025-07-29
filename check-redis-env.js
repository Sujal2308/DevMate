// Check environment variables
console.log("🔍 Environment Variable Check:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("REDIS_URL exists:", !!process.env.REDIS_URL);

if (process.env.REDIS_URL) {
  // Hide password for security
  const maskedUrl = process.env.REDIS_URL.replace(/:[^:]*@/, ":****@");
  console.log("REDIS_URL (masked):", maskedUrl);

  // Parse URL components
  try {
    const url = new URL(process.env.REDIS_URL);
    console.log("✅ URL Components:");
    console.log("  Protocol:", url.protocol);
    console.log("  Hostname:", url.hostname);
    console.log("  Port:", url.port);
    console.log("  Username:", url.username);
    console.log("  Password:", url.password ? "****" : "Not set");
  } catch (error) {
    console.error("❌ Invalid URL format:", error.message);
  }
} else {
  console.log("❌ REDIS_URL not found in environment variables");
}
