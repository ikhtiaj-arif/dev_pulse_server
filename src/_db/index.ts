import { Pool } from "pg";
import config from "../config";

const pool = new Pool({
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
        role VARCHAR(10) DEFAULT 'user',

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
            `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues(
      id SERIAL PRIMARY KEY,
      title VARCHAR(150),
      description TEXT,
      type VARCHAR(10) DEFAULT 'bug',
      status VARCHAR(10) DEFAULT 'open',

      reporter_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,

      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      )  
        `);
  } catch (error) {
    console.log(error);
  }
};
