// src/types/express/index.d.ts
import { User } from '../../models/user.js';

declare global {
    namespace Express {
        // noinspection JSUnusedGlobalSymbols
        interface Request {
            user?: User; // Add `user` to the request object, it might be undefined
        }
    }
}