// Trigger Server Restart for Communities Route
const express = require("express");
const cors = require("cors");
const helmet = require("helmet"); // Security middleware
const rateLimit = require("express-rate-limit"); // Rate limiting
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

// Load environment variables
require("dotenv").config();

// Startup Check: Verify critical environment variables
const requiredVars = ["MONGODB_URI", "JWT_SECRET", "CLIENT_ORIGIN"];
console.log("🛠️ Starting Production Environment Check...");
requiredVars.forEach((v) => {
  if (!process.env[v]) {
    console.warn(`⚠️ WARNING: Missing environment variable: ${v}`);
  } else {
    console.log(`✅ ${v} is set`);
  }
});

// Fail-safe for unhandled exceptions
process.on("uncaughtException", (err) => {
  console.error("FATAL ERROR (Uncaught Exception):", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("FATAL ERROR (Unhandled Rejection):", reason);
});

// Global variable to track DB connection status
let isDBConnected = false;

// Handle MongoDB connection events globally
const mongoose = require("mongoose");
mongoose.connection.on("connected", () => {
  isDBConnected = true;
});
mongoose.connection.on("disconnected", () => {
  isDBConnected = false;
});
mongoose.connection.on("error", () => {
  isDBConnected = false;
});

// Connect to database
const initializeDatabase = async () => {
  const connected = await connectDB();
  if (!connected) {
    console.log("⚠️ Server starting without database connection");
    console.log("🔄 Will attempt to reconnect automatically");
  }
};

initializeDatabase();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_ORIGIN,
      "https://devmate-app.netlify.app",
      "https://strong-arithmetic-3b534a.netlify.app",
      "http://localhost:3000",
    ].filter(Boolean),
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store userId <-> socketId mapping
const userSocketMap = {};

io.on("connection", (socket) => {
  // Expect userId in query or handshake
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }
  socket.on("disconnect", () => {
    if (userId) delete userSocketMap[userId];
  });
});

app.set("io", io);
app.set("userSocketMap", userSocketMap);

// Middleware to check database connection
const checkDBConnection = (req, res, next) => {
  if (!isDBConnected) {
    return res.status(503).json({
      message: "Database not connected. Please ensure MongoDB is running.",
      error: "DATABASE_NOT_CONNECTED",
      help: "Make sure MongoDB is installed and running on your system",
    });
  }
  next();
};

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Log only on blocks (handled below)


      const allowedOrigins = [
        process.env.CLIENT_ORIGIN,
        "https://devmate-app.netlify.app",
        "https://strong-arithmetic-3b534a.netlify.app",
        "http://localhost:3000",
      ];

      // Allow if origin is in whitelist or ends with .netlify.app
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".netlify.app")
      ) {
        callback(null, true);
      } else {
        console.warn(`🛑 CORS Blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    optionsSuccessStatus: 200,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting (apply only to API routes, not static assets)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased limit for development - limit each IP to 500 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for static assets and favicon
    return (
      req.url.startsWith("/static/") ||
      req.url === "/favicon.ico" ||
      req.url === "/manifest.json" ||
      req.url.startsWith("/logo") ||
      req.url.endsWith(".ico") ||
      req.url.endsWith(".png") ||
      req.url.endsWith(".jpg") ||
      req.url.endsWith(".css") ||
      req.url.endsWith(".js")
    );
  },
});

// Apply rate limiting to API routes only
app.use("/api", limiter);



// Routes
app.use("/api/auth", checkDBConnection, require("./routes/auth"));
app.use("/api/users", checkDBConnection, require("./routes/users"));
app.use("/api/posts", checkDBConnection, require("./routes/posts"));
app.use(
  "/api/notifications",
  checkDBConnection,
  require("./routes/notifications")
);
const messagesRouter = require("./routes/messages");
app.use("/api/messages", messagesRouter);
app.use("/api", require("./routes/report"));
app.use("/api/communities", checkDBConnection, require("./routes/communities"));
app.use("/api/news", require("./routes/news"));
app.use("/api/admin", checkDBConnection, require("./routes/admin"));

// Root route for API welcome
app.get("/", (req, res) => {
  res.status(200).send(`
    <div style="font-family: sans-serif; padding: 40px; text-align: center; background: #000000; color: white; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
      <h1 style="color: #1d9bf0; margin-bottom: 10px;">🚀 DevMate API</h1>
      <p style="color: #94a3b8; font-size: 1.1rem;">The backend server is running in decoupled mode.</p>
      <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        <p style="margin: 0;">Access frontend at: <a href="https://devmate.dev" style="color: #1d9bf0; text-decoration: none; font-weight: bold;">devmate.dev</a></p>
      </div>
      <p style="margin-top: 30px; font-size: 0.8rem; color: #4b5563;">Status: <span style="color: #10b981;">Online</span></p>
    </div>
  `);
});

// Health check route (doesn't require DB)
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database: isDBConnected ? "Connected" : "Disconnected",
    message: isDBConnected
      ? "All systems operational"
      : "Database connection required",
  });
});

// Database status route
app.get("/api/db-status", (req, res) => {
  res.json({
    connected: isDBConnected,
    status: isDBConnected ? "Connected to MongoDB" : "MongoDB not connected",
    help: !isDBConnected ? "Please start MongoDB service" : null,
  });
});

// Debug environment variables (for troubleshooting)
app.get("/api/debug/env", (req, res) => {
  const envVars = {
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_SERVICE: process.env.EMAIL_SERVICE,
    RESEND_API_KEY: process.env.RESEND_API_KEY ? "Set" : "Not set",
    NODE_ENV: process.env.NODE_ENV,
    EMAIL_USER: process.env.EMAIL_USER ? "Set (Should be removed)" : "Not set",
    EMAIL_PASS: process.env.EMAIL_PASS ? "Set (Should be removed)" : "Not set",
  };

  res.json({
    message: "Environment Variables Check",
    variables: envVars,
    timestamp: new Date().toISOString(),
  });
});

// Test forgot password email functionality
app.post("/api/test-forgot-email", async (req, res) => {
  const { sendEmail } = require("./utils/email");
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    console.log("=== Testing Forgot Password Email ===");
    console.log("Target email:", email);

    const testResetUrl = `${
      process.env.CLIENT_ORIGIN || "https://devmate.dev"
    }/reset-password?token=test-token-12345`;

    const htmlTemplate = `
    <h2>🧪 TEST EMAIL - Password Reset Request</h2>
    <p>This is a test of the forgot password email functionality.</p>
    <p>Reset URL: <a href="${testResetUrl}">${testResetUrl}</a></p>
    <p>Environment: ${process.env.NODE_ENV}</p>
    <p>FROM Address: ${process.env.EMAIL_FROM}</p>`;

    const result = await sendEmail({
      to: email,
      subject: "🧪 TEST: DevMate Password Reset",
      text: `TEST: Reset URL: ${testResetUrl}`,
      html: htmlTemplate,
    });

    res.json({
      success: true,
      message: "Test email sent successfully",
      emailId: result.id,
      environment: {
        EMAIL_FROM: process.env.EMAIL_FROM,
        RESEND_API_KEY_SET: !!process.env.RESEND_API_KEY,
      },
    });
  } catch (error) {
    console.error("Test email failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send test email",
      error: error.message,
    });
  }
});

// Error handling for 404
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "API route not found" });
  }
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;

// IMPORTANT: Only use server.listen, NOT app.listen!
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
