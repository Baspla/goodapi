import {defineConfig} from "drizzle-kit";

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
    dialect: 'postgresql', // Database dialect
    schema: "./src/db/schema.ts", // Path to your schema definitions
    out: "./drizzle/migrations", // Path to output migration files
    dbCredentials: {
        url: process.env.DATABASE_URL || "", // Database URL
    }
});