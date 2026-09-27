import express from "express";
import pool from "./config/db.js";

const app = express();

const PORT = 3000;

app.use(express.json());

app.listen(PORT, async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("Connected to PostgreSQL successfully");
    console.log(`Server is running on http://localhost:${PORT}`);
  } catch (error) {
    console.error("Database connection failed:", error);
  }
});