import {NextFunction, Request, Response} from "express";
import {isDev, JWT_SECRET} from "../env.js";
import jwt from "jsonwebtoken";
import {getUserById} from "../db/operations/users.js";

export function isAuthorized(req: Request) {
    return req.user !== undefined;
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (isAuthorized(req)) {
        next();
    } else {
        next({status: 401, message: 'Unauthorized'});
    }
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (isAuthorized(req) && req.user.role === "admin") {
        next();
    } else {
        next({status: 403, message: 'Forbidden'});
    }
}

export const processAuth = async (req: Request, res: Response, next: NextFunction) => {
    console.debug('Checking authorization header');
    const authHeader = req.headers.authorization;

    if (isDev()) {
        console.log('Running in development mode, using test user');
        req.user = { id: 1, discordId: '1234567890', username: 'test', email: 'test@test.de', lastLogin: new Date(), createdAt: new Date(), admin: true };
        next();
        return;
    }

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        try {
            const payload: any = await new Promise((resolve, reject) => {
                jwt.verify(token, JWT_SECRET, (err, decoded) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(decoded);
                    }
                });
            });

            const userId: number = payload.userId;
            const user = await getUserById(userId);

            if (user) {
                req.user = user;
                next();
            } else {
                next({ status: 403, message: 'Forbidden' });
            }
        } catch (err) {
            console.debug('Authentication failed:', err);
            next({ status: 403, message: 'Forbidden' });
        }
    } else {
        next();
    }
};