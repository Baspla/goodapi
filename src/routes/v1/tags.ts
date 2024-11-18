import express, {NextFunction, Request, Response} from 'express';
import {getTagById, getTags} from "../../db/operations/tags.js";
export var router = express.Router();

router.get('/', function(req: Request, res: Response,next : NextFunction) {
    //return list of tags
    getTags().then(tags => {
        res.json({ tags });
    }).catch(err => {
        next(err);
    });
});

router.get('/:id', function(req: Request, res: Response, next: NextFunction) {
    //return tag by id
    getTagById(parseInt(req.params.id)).then(tag => {
        if (tag) {
            res.json({ tag });
        } else {
            throw { status: 404, message: 'Tag not found' };
        }
    }).catch(next);
});
