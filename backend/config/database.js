const mysql = require("mysql2/promise");
require("dotenv").config();

const Poolfields = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool;

async function initializeDatabase() {
  try {
    const setupPool = mysql.createPool(Poolfields);
    const setupConnection = await setupPool.getConnection();
    try {
      const dbName = process.env.DB_NAME || "speedometer";
      await setupConnection.execute(
        `CREATE DATABASE IF NOT EXISTS \`${dbName}\``,
      );
      console.log(`Database '${dbName}' ready`);
    } finally {
      setupConnection.release();
    }

    pool = mysql.createPool({
      ...Poolfields,
      database: process.env.DB_NAME || "speedometer",
    });

    const connection = await pool.getConnection();
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS speeds (
          id INT AUTO_INCREMENT PRIMARY KEY,
          speed INT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } finally {
      connection.release();
    }

    console.log("Database initialization completed successfully");
  } catch (error) {
    console.error("Database initialization error:", error.message);
    process.exit(1);
  }
}

function getPool() {
  return pool;
}

module.exports = { initializeDatabase, getPool };
