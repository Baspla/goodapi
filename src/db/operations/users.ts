
// Types
import {users} from "../schema.js";
import {and, eq, ilike} from "drizzle-orm";
import db from "../db.js";
import {isDev} from "../../env.js";
import {logEvent} from "../../util/logging.js";

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Users operations
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

export async function getUserById(userId: number): Promise<User | undefined> {
    console.debug('Getting user by ID:', userId);
    try {
        const result = await db.select().from(users).where(eq(users.id, userId));
        return result[0];
    } catch (error) {
        console.error('Error getting user by ID:', error);
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

export async function updateEmail(userId: number, email: string): Promise<void> {
    //update email if the current email is ends with @example.com
    console.debug('Updating email for user if ends with @example.com:', userId, email);
    try {
        await db.update(users)
            .set( { email } )
            .where(and(eq(users.id, userId), ilike(users.email, '%@example.com')));
    } catch (error) {
        console.error('Error updating email:', error);
        throw error;
    }
}

export async function getUsers(): Promise<User[]> {
    console.debug('Getting all users');
    try {
        return await db.select().from(users);
    } catch (error) {
        console.error('Error getting all users:', error);
        throw error;
    }
}

export async function setUserAdmin(userId: number, isAdmin: boolean): Promise<void> {
    if (!isDev()) {
        console.warn('Attempted to set user admin in non-dev environment');
        return;
    }
    console.debug('Setting user admin:', userId, isAdmin);
    try {
        await db.update(users)
            .set({ role: isAdmin ? 'admin' : 'user' })
            .where(eq(users.id, userId));
        logEvent(`Set admin status for user ${userId} to ${isAdmin}`, { isAdmin }, userId);
    } catch (error) {
        console.error('Error setting user admin:', error);
        throw error;
    }
}

export async function deleteUser(userId: number): Promise<void> {
    console.debug('Deleting user:', userId);
    try {
        await db.delete(users).where(eq(users.id, userId));
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}

export async function deleteAllUsers(): Promise<void> {
    console.debug('Deleting all users');
    try {
        await db.delete(users);
    } catch (error) {
        console.error('Error deleting all users:', error);
        throw error;
    }
}