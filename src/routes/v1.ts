import {isDev, VERSION} from "../env.js";
import {router as debugRouter} from "./v1/debug.js";
import express, {Request, Response} from "express";
import {router as authRouter} from "./v1/auth.js";
import {requireAdmin, requireAuth} from "../middleware/auth.js";
import {router as usersRouter} from "./v1/users.js";
import {router as recommendationsRouter} from "./v1/recommendations.js";
import {router as logsRouter} from "./v1/logs.js";
import {router as tagsRouter} from "./v1/tags.js";
import {router as utilRouter} from "./v1/util.js";
import {router as meRouter} from "./v1/me.js";
import {router as searchRouter} from "./v1/search.js";

const router = express.Router();

if (isDev()) {
    router.use('/debug', debugRouter);
}
router.get('/', function (req: Request, res: Response) {
    res.json({
        "version": VERSION
    })
});
router.use('/auth', authRouter);
router.use('/util', utilRouter);
router.use('/users', requireAuth, usersRouter);
router.use('/recommendations', requireAuth, recommendationsRouter);
router.use('/logs', requireAdmin, logsRouter);
router.use('/tags', requireAuth, tagsRouter);
router.use('/me', requireAuth, meRouter);
router.use('/serach', requireAuth, searchRouter);

export default router;