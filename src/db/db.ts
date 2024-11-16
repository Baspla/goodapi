import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import {DATABASE_URL} from "../env.js";

const pool = new pg.Pool({
    connectionString: DATABASE_URL,
});

const db = drizzle(pool);

export default db;