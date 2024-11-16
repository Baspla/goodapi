
// Types
import {users} from "./schema.js";
import {eq} from "drizzle-orm";
import db from "./db.js";

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// User operations
export async function createUser(userData: NewUser): Promise<User> {
    console.debug('Creating user:', userData);
    try {
        const result = await db.insert(users).values(userData).returning();
        return result[0];
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

export async function getUserByDiscordId(discordId: string): Promise<User | undefined> {
    console.debug('Getting user by Discord ID:', discordId);
    try {
        const result = await db.select().from(users).where(eq(users.discordId, discordId));
        return result[0];
    } catch (error) {
        console.error('Error getting user by Discord ID:', error);
        throw error;
    }
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
    console.debug('Getting user by email:', email);
    try {
        const result = await db.select().from(users).where(eq(users.email, email));
        return result[0];
    } catch (error) {
        console.error('Error getting user by email:', error);
        throw error;
    }
}

export async function userExists(discordId: string): Promise<boolean> {
    console.debug('Checking if user exists:', discordId);
    try {
        const result = await db.select({ count: users.id }).from(users).where(eq(users.discordId, discordId));
        return (result[0]?.count ?? 0) > 0;
    } catch (error) {
        console.error('Error checking if user exists:', error);
        throw error;
    }
}

export async function updateLastLogin(userId: number): Promise<void> {
    console.debug('Updating last login for user:', userId);
    try {
        await db.update(users)
            .set( { lastLogin: new Date() } )
            .where(eq(users.id, userId));
    } catch (error) {
        console.error('Error updating last login:', error);
        throw error;
    }
}
