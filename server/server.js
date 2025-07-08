const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");

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
    origin: "*",
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
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", checkDBConnection, require("./routes/auth"));
app.use("/api/users", checkDBConnection, require("./routes/users"));
app.use("/api/posts", checkDBConnection, require("./routes/posts"));
app.use(
  "/api/notifications",
  checkDBConnection,
  require("./routes/notifications")
);

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

// IMPORTANT: Only use server.listen, NOT app.listen!
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
