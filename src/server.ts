import express, { type Request, type Response } from "express";
import { Pool } from "pg";
import config from "./config";


const app = express();
const port = config.port;
const db_connection_string = config.db_connection_string;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Express Server running!",
    author: "ikhtiaj_arif",
    port: port,
  });
});

const pool = new Pool({
  connectionString: db_connection_string,
});

const initDB = async () => {
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

initDB();
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
