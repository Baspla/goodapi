// src/types/express/index.d.ts
import { User } from '../../db/schema.js';

declare global {
    namespace Express {
        // noinspection JSUnusedGlobalSymbols
        interface Request {
            user: User; // Add `user` to the request object, it might be undefined
        }
    }
}