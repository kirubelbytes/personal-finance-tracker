import pg from "pg"
import dotenv from "dotenv"
dotenv.config();
const { Pool } =pg;

const pool = new Pool({
    connectionString : process.env.DATABASE_URI,
     ssl: {
    rejectUnauthorized: false, // use this only for development
  }
})

export default pool;