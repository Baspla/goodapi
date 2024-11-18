// noinspection JSUnusedGlobalSymbols

import {boolean, integer, pgTable, serial, text, timestamp, varchar} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    discordId: varchar('discord_id', {length: 255}).notNull().unique(),
    username: varchar('username', {length: 255}).notNull(),
    email: varchar('email', {length: 255}).notNull().unique(),
    avatarUrl: text('avatar_url'),
    isAdmin: boolean('is_admin').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    lastLogin: timestamp('last_login').defaultNow().notNull()
});

export const userRelations = relations(users, ({many}) => ({
    recommendations: many(recommendations),
    logs: many(logs)
}));

export const recommendations = pgTable('recommendation', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, {onDelete: 'cascade'}).notNull(),
    title: varchar('title', {length: 255}).notNull(),
    url: text('url'),
    imageUrl: text('image_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const recommendationRelations = relations(recommendations, ({one, many}) => ({
    user: one(users, {
        fields: [recommendations.userId],
        references: [users.id],
    }),
    tags: many(tags)
}));

export const logs = pgTable('logs', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, {onDelete: 'set null'}),
    message: text('message').notNull(),
    meta: text('meta'),
    timestamp: timestamp('timestamp').defaultNow().notNull()
});

export const logRelations = relations(logs, ({one}) => ({
    user: one(users, {
        fields: [logs.userId],
        references: [users.id]
    })
}));

export const tags = pgTable('tags', {
    id: serial('id').primaryKey(),
    name: varchar('name', {length: 255}).notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

export const tagRelations = relations(tags, ({many}) => ({
    recommendations: many(recommendations)
}));

