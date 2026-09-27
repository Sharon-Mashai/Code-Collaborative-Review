import pool from "./config/db.js";

async function testDatabaseConnection() {
  try {
    const client = await pool.connect();

    console.log("Connected to PostgreSQL successfully");

    client.release();
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

testDatabaseConnection();