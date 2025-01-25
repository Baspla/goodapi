import express, {NextFunction, Request, Response} from 'express';

export var router = express.Router();

router.get('/', async function(req: Request, res: Response, next: NextFunction) {
    try {
        res.json(req.user);
    } catch (error) {
        next(error);
    }
});
