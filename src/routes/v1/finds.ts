import express, {NextFunction, Request, Response} from 'express';
import {
    createFind, deleteFind,
    getFindById, getFinds,
    NewFind, updateFind
} from "../../db/operations/finds.js";
import {logEvent} from "../../util/logging.js";
import assert from "node:assert";

export var router = express.Router();

router.get('/', async function (req: Request, res: Response, next: NextFunction) {
    try {
        const page = parseInt(req.query.page as string) || 0;
        const limit = parseInt(req.query.limit as string) || 20;
        const searchterm = req.query.searchterm as string || '';
        const sortBy = req.query.sortBy as 'created_at' | 'updated_at' | 'title' || 'created_at';
        const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';

        const finds = await getFinds(page, limit, searchterm, sortBy, sortOrder);
        res.json({ finds });
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async function (req: Request, res: Response, next: NextFunction) {
    try {
        const find = await getFindById(parseInt(req.params.id));
        if (find) {
            res.json({ find });
        } else {
            throw { status: 404, message: 'Find not found' };
        }
    } catch (error) {
        next(error);
    }
});

router.post('/', async function (req: Request, res: Response, next: NextFunction) {
    try {
        const { title, url, imageUrl } = req.body;
        const newFind: NewFind = {
            title: title,
            url: url,
            imageUrl: imageUrl,
            userId: req.user.id
        };
        const find = await createFind(newFind);
        res.json({ find });
        logEvent(`Created find: ${find.id}`, find, req.user.id);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async function (req: Request, res: Response, next: NextFunction) {
    try {
        const find = await getFindById(parseInt(req.params.id));
        if (!find) {
            throw { status: 404, message: 'Find not found' };
        }
        if (find.userId !== req.user.id) {
            throw { status: 403, message: 'Unauthorized' };
        }
        await deleteFind(find.id);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

router.patch('/:id', async function (req: Request, res: Response, next: NextFunction) {
    try {
        const find = await getFindById(parseInt(req.params.id));
        if (!find) {
            throw { status: 404, message: 'Find not found' };
        }
        if (find.userId !== req.user.id) {
            throw { status: 403, message: 'Unauthorized' };
        }

        const { title, url, imageUrl } = req.body;
        const newFind: NewFind = {
            title: title,
            url: url,
            imageUrl: imageUrl,
            userId: req.user.id
        };

        const updatedFind = await updateFind(find.id, newFind);
        assert(updatedFind);

        res.json({ find: updatedFind });
        logEvent(`Updated find: ${updatedFind.title}`, updatedFind.id, req.user.id);
    } catch (error) {
        next(error);
    }
});