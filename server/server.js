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

// Global variable to track DB connection status
let isDBConnected = false;

// Connect to database
const initializeDatabase = async () => {
  isDBConnected = await connectDB();
  if (!isDBConnected) {
    console.log("⚠️ Server starting without database connection");
    console.log("🔄 Will attempt to reconnect automatically");
  }
};

initializeDatabase();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "*", // Restrict in production
    methods: ["GET", "POST"],
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
app.use(helmet());
app.use(cors());
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

// CORS
app.use(
  cors({
    origin: [
      "https://strong-arithmetic-3b534a.netlify.app",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

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

// Serve static files from React build
app.use(
  express.static(path.join(__dirname, "client/build"), {
    maxAge: process.env.NODE_ENV === "production" ? "1d" : 0,
    setHeaders: (res, path) => {
      if (path.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      }
    },
  })
);

// Serve React app for all non-API routes
app.get("*", (req, res) => {
  // Don't serve React for API routes
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "API route not found" });
  }
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
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
