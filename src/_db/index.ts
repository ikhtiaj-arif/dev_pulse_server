import { Pool } from "pg";
import config from "../config";

export const pool = new Pool({
  connectionString: config.db_connection_string,
});

export const initDB = async () => {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(20),
        email VARCHAR(20) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'contributor',

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
            `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues(
      id SERIAL PRIMARY KEY,
      title VARCHAR(150),
      description TEXT,
      type VARCHAR(20) DEFAULT 'bug',
      status VARCHAR(20) DEFAULT 'open',

      reporter_id INT REFERENCES users(id) ON DELETE CASCADE,

      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      )  
        `);

    console.log("Database connected!");
  } catch (error) {
    console.log("Database failed connecting!");
    console.log(error);
  }
};
