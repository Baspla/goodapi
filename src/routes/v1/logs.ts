import express, {NextFunction, Request, Response} from 'express';
import {getLogById, getLogs} from "../../db/operations/logs.js";
export var router = express.Router();

router.get('/', function(req: Request, res: Response, next: NextFunction) {
    getLogs().then(logs => {
        res.json({ logs });
    }).catch(next);
});

router.get('/:id', function(req: Request, res: Response, next: NextFunction) {
    getLogById(parseInt(req.params.id)).then(log => {
        if (log) {
            res.json({ log });
        } else {
            throw { status: 404, message: 'Log not found' };
        }
    }).catch(next);
});
