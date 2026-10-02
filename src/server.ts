import express from "express";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

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

// Start server
app.listen(PORT, async () => {
  try {
    await pool.query("SELECT NOW()");

    console.log("Connected to PostgreSQL successfully");
    console.log(`Server is running on http://localhost:${PORT}`);
  } catch (error) {
    console.error("Database connection failed:", error);
  }
});
