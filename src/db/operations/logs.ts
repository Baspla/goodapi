import {logs} from "../schema.js";
import db from "../db.js";
import {desc, eq} from "drizzle-orm";

export type Log = typeof logs.$inferSelect;
export type NewLog = typeof logs.$inferInsert;

export async function createLog(logData: NewLog): Promise<Log> {
    console.debug('Creating log:', logData);
    try {
        const result = await db.insert(logs).values(logData).returning();
        return result[0];
    } catch (error) {
        console.error('Error creating log:', error);
        throw error;
    }
}

export async function getLogs(): Promise<Log[]> {
    console.debug('Getting logs');
    try {
        return await db.select().from(logs).orderBy(desc(logs.timestamp));
    } catch (error) {
        console.error('Error getting logs:', error);
        throw error;
    }
}

export async function getLogById(logId: number): Promise<Log | undefined> {
    console.debug('Getting log by id:', logId);
    try {
        const result = await db.select().from(logs).where(eq(logs.id, logId));
        return result[0];
    } catch (error) {
        console.error('Error getting log:', error);
        throw error;
    }
}
