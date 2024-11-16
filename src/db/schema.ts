import {pgTable, serial, text, timestamp, varchar} from "drizzle-orm/pg-core";

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    discordId: varchar('discord_id', { length: 255 }).notNull().unique(),
    username: varchar('username', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    avatarUrl: text('avatar_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    lastLogin: timestamp('last_login').defaultNow().notNull()
});