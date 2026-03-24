const express = require("express");
const { getPool } = require("../config/database");

const speedRouter = express.Router();

speedRouter.post("/api/speed", async (req, res) => {
  const pool = getPool();
  try {
    const { speed } = req.body;
    const connection = await pool.getConnection();
    try {
      const result = await connection.execute(
        "INSERT INTO speeds (speed) VALUES (?)",
        [speed],
      );
      res.status(201).json({
        id: result[0].insertId,
        speed: speed,
        timestamp: new Date(),
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error inserting speed:", error);
    res.status(500).json({ error: "Failed to insert speed data" });
  }
});

speedRouter.get("/api/speed/stream", async (req, res) => {
  const pool = getPool();
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.write('data: {"message": "Connected to speed stream"}\n\n');

  try {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        "SELECT * FROM speeds ORDER BY timestamp DESC LIMIT 1",
      );
      if (rows.length > 0) {
        res.write(`data: ${JSON.stringify(rows[0])}\n\n`);
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching initial speed:", error);
  }

  const interval = setInterval(async () => {
    try {
      const connection = await pool.getConnection();
      try {
        const [rows] = await connection.execute(
          "SELECT * FROM speeds ORDER BY timestamp DESC LIMIT 1",
        );
        if (rows.length > 0) {
          res.write(`data: ${JSON.stringify(rows[0])}\n\n`);
        }
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error("Error in SSE stream:", error);
    }
  }, 1000);

  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });
});

speedRouter.get("/api/speed/history", async (req, res) => {
  const pool = getPool();
  try {
    const limit = req.query.limit || 100;
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        "SELECT * FROM speeds ORDER BY timestamp DESC LIMIT ?",
        [parseInt(limit)],
      );
      res.json(rows);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

module.exports = speedRouter;
