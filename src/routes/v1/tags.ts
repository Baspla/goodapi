import express, {NextFunction, Request, Response} from 'express';
import {getTagById, getTagByName, getTags, searchTagsByName} from "../../db/operations/tags.js";
export var router = express.Router();

//get all tags or search by name if query is provided
router.get('/', function(req: Request, res: Response,next : NextFunction) {
    if (req.query.search) {
        const search = req.query.name as string;
        searchTagsByName(search).then(tags => {
            res.json({ tags });
        }).catch(next);
    } else {
        getTags().then(tags => {
            res.json({ tags });
        }).catch(next);
    }
});

//get tag by name
router.get('/name/:name', function(req: Request, res: Response, next: NextFunction) {
    getTagByName(req.params.name).then(tag => {
        if (tag) {
            res.json({ tag });
        } else {
            throw { status: 404, message: 'Tag not found' };
        }
    }).catch(next);
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