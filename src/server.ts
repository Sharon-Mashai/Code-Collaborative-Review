import express from "express";
import { createServer } from "http";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { setupWebSocket } from "./websocket.js";

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

const PORT = 3000;

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api", commentRoutes);
app.use("/api/submissions", reviewRoutes);
app.use("/api/users", notificationRoutes);

// Handles routes that do not exist
app.use(notFound);

// Global error handler

app.use(errorHandler);

// Create HTTP server
const server = createServer(app);

// Setup WebSocket server
setupWebSocket(server);

// Start server
server.listen(PORT, async () => {
  try {
    await pool.query("SELECT NOW()");

    console.log("Connected to PostgreSQL successfully");

    console.log(`Server is running on http://localhost:${PORT}`);

    console.log(`WebSocket server is running on ws://localhost:${PORT}`);
  } catch (error) {
    console.error("Database connection failed:", error);
  }
});
