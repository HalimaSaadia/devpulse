import {Pool} from "pg"
const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_yfUAtDu5VN4H@ep-old-river-aqhq1n7f-pooler.c-8.us-east-1.aws.neon.tech/neondb?uselibpqcompat=true&sslmode=require&channel_binding=require",
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
  console.log("Successfully created collection");
} catch (err) {
  console.error("Error creating users table:", err);
}
}
