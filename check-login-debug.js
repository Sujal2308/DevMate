// Debug login issue
console.log("🔍 Debugging Login Issue...");
console.log("Environment:", process.env.NODE_ENV);
console.log(
  "API Base URL:",
  process.env.NODE_ENV === "production"
    ? "https://devmate-server.onrender.com"
    : "http://localhost:5000"
);

// Test API connectivity
const testAPI = async () => {
  try {
    const response = await fetch(
      process.env.NODE_ENV === "production"
        ? "https://devmate-server.onrender.com/api/health"
        : "http://localhost:5000/api/health"
    );
    const data = await response.json();
    console.log("✅ API Health Check:", data);
  } catch (error) {
    console.error("❌ API Connection Failed:", error);
  }
};

testAPI();
