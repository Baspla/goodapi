import {isDev, VERSION} from "../env.js";
import {router as debugRouter} from "./v1/debug.js";
import express, {Request, Response} from "express";
import {router as authRouter} from "./v1/auth.js";
import {requireAdmin, requireAuth} from "../middleware/auth.js";
import {router as usersRouter} from "./v1/users.js";
import {router as recommendationsRouter} from "./v1/recommendations.js";
import {router as logsRouter} from "./v1/logs.js";

export const v1router = express.Router();

if (isDev()) {
    v1router.use('/debug', debugRouter);
}
v1router.get('/', function (req: Request, res: Response) {
    res.json({
        "version": VERSION
    })
});
v1router.use('/auth', authRouter);
v1router.use('/users', requireAuth, usersRouter);
v1router.use('/recommendations', requireAuth, recommendationsRouter);
v1router.use('/logs', requireAdmin, logsRouter);