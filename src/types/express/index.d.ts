// src/types/express/index.d.ts
import { User } from '../../models/user.js';

declare global {
    namespace Express {
        interface Request {
            user?: User; // Add `user` to the request object, it might be undefined
        }
    }
}