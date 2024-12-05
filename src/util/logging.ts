import {createLog} from "../db/operations/logs.js";

export async function logEvent(message: string, meta?: any, userId?: number): Promise<void> {
    const logData = {
        message,
        meta,
        userId
    };
    try {
        await createLog(logData);
    } catch (e) {
        console.error('Error logging event:', e);
    }
}