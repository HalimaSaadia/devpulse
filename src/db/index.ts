import { Pool } from "pg";
import { config } from "../config/config";
export const pool = new Pool({
  connectionString: config.CONNECTION_STRING,
});

export const initDB = async () => {
  try {
    pool.query(`
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'contributor',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    )`);
    
    pool.query(`
    CREATE TABLE IF NOT EXISTS issues (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT CHECK (LENGTH(description) >= 50) NOT NULL,
        type VARCHAR(255) CHECK (type IN ('bug', 'feature_request')),
        status VARCHAR(255)  CHECK (status IN ('open', 'in_progress', 'resolved')) DEFAULT 'open',
        reporter_id INTEGER  NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    )`);
    console.log("Successfully created collection");
  } catch (err) {
    console.error("Error creating users table:", err);
  }
};
