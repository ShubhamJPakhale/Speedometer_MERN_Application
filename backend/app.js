const express = require("express");
const cors = require("cors");
const { initializeDatabase } = require("./config/database");

const app = express();
app.use(cors());
app.use(express.json());
const speedRouter = require("./routes/speedRouter");
app.use("/", speedRouter);

const startSensorSimulation = () => {
  const { getPool } = require("./config/database");
  const pool = getPool();
  setInterval(async () => {
    try {
      const speed = Math.floor(Math.random() * 200);
      const connection = await pool.getConnection();
      try {
        await connection.execute("INSERT INTO speeds (speed) VALUES (?)", [
          speed,
        ]);
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error("Error simulating speed data:", error);
    }
  }, 1000);
};

const startServer = async () => {
  try {
    // Initialize database first
    await initializeDatabase();

    // Start sensor simulation
    startSensorSimulation();

    // Start Express server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on Port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
