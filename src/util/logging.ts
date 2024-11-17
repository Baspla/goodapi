import {createLog, Log} from "../db/operations/logs.js";

enum LogLevel {

}

export function logEvent(message: string, meta?: any, userId?: number): void {
    const logData = {
        message,
        meta,
        userId
    };
    createLog(logData).catch(e => console.error('Error logging event:', e));
}