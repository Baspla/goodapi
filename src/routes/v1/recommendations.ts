import express, {NextFunction, Request, Response} from 'express';
import {
    createRecommendation, deleteRecommendation,
    getRecommendationById,
    getRecommendations, getRecommendationsWithUsers,
    NewRecommendation, updateRecommendation
} from "../../db/operations/recommendations.js";
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

        const recommendations = await getRecommendationsWithUsers(page, limit, searchterm, sortBy, sortOrder);
        res.json({ recommendations });
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async function (req: Request, res: Response, next: NextFunction) {
    try {
        const recommendation = await getRecommendationById(parseInt(req.params.id));
        if (recommendation) {
            res.json({ recommendation });
        } else {
            throw { status: 404, message: 'Recommendation not found' };
        }
    } catch (error) {
        next(error);
    }
});

router.post('/', async function (req: Request, res: Response, next: NextFunction) {
    try {
        const { title, url, imageUrl } = req.body;
        const newRecommendation: NewRecommendation = {
            title: title,
            url: url,
            imageUrl: imageUrl,
            userId: req.user.id
        };
        const recommendation = await createRecommendation(newRecommendation);
        res.json({ recommendation });
        logEvent(`Created recommendation: ${recommendation.id}`, recommendation, req.user.id);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async function (req: Request, res: Response, next: NextFunction) {
    try {
        const recommendation = await getRecommendationById(parseInt(req.params.id));
        if (!recommendation) {
            throw { status: 404, message: 'Recommendation not found' };
        }
        if (recommendation.userId !== req.user.id) {
            throw { status: 403, message: 'Unauthorized' };
        }
        await deleteRecommendation(recommendation.id);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

router.patch('/:id', async function (req: Request, res: Response, next: NextFunction) {
    try {
        const recommendation = await getRecommendationById(parseInt(req.params.id));
        if (!recommendation) {
            throw { status: 404, message: 'Recommendation not found' };
        }
        if (recommendation.userId !== req.user.id) {
            throw { status: 403, message: 'Unauthorized' };
        }

        const { title, url, imageUrl } = req.body;
        const newRecommendation: NewRecommendation = {
            title: title,
            url: url,
            imageUrl: imageUrl,
            userId: req.user.id
        };

        const updatedRecommendation = await updateRecommendation(recommendation.id, newRecommendation);
        assert(updatedRecommendation);

        res.json({ recommendation: updatedRecommendation });
        logEvent(`Updated recommendation: ${updatedRecommendation.title}`, updatedRecommendation.id, req.user.id);
    } catch (error) {
        next(error);
    }
});