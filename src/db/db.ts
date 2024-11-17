import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import {DATABASE_URL} from "../env.js";
import {migrate} from "drizzle-orm/node-postgres/migrator";

const pool = new pg.Pool({
    connectionString: DATABASE_URL,
});

const db = drizzle(pool);

console.log("Migrating database");
await migrate(db, {migrationsFolder: "./drizzle/migrations"}).then(() => {
    console.log("Database migrated");
}).catch(err => {
    console.error("Error migrating database", err);
    process.exit(1);
});

export default db;