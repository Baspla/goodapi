import express, {NextFunction, Request, Response} from 'express';
import {getLogById, getLogs} from "../../db/operations/logs.js";
export var router = express.Router();

router.get('/', async function(req: Request, res: Response, next: NextFunction) {
    try {
        const logs = await getLogs();
        res.json({ logs });
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async function(req: Request, res: Response, next: NextFunction) {
    try {
        const log = await getLogById(parseInt(req.params.id));
        if (log) {
            res.json({ log });
        } else {
            throw { status: 404, message: 'Log not found' };
        }
    } catch (error) {
        next(error);
    }
});
