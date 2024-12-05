import express, {NextFunction, Request, Response} from 'express';
import {getTagById, getTagByName, getTags, searchTagsByName} from "../../db/operations/tags.js";
export var router = express.Router();

//get all tags or search by name if query is provided
router.get('/', async function(req: Request, res: Response, next: NextFunction) {
    try {
        if (req.query.search) {
            const search = req.query.name as string;
            const tags = await searchTagsByName(search);
            res.json({ tags });
        } else {
            const tags = await getTags();
            res.json({ tags });
        }
    } catch (error) {
        next(error);
    }
});

//get tag by name
router.get('/name/:name', async function(req: Request, res: Response, next: NextFunction) {
    try {
        const tag = await getTagByName(req.params.name);
        if (tag) {
            res.json({ tag });
        } else {
            throw { status: 404, message: 'Tag not found' };
        }
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async function(req: Request, res: Response, next: NextFunction) {
    try {
        const tag = await getTagById(parseInt(req.params.id));
        if (tag) {
            res.json({ tag });
        } else {
            throw { status: 404, message: 'Tag not found' };
        }
    } catch (error) {
        next(error);
    }
});