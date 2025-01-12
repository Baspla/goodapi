import express, {NextFunction, Request, Response} from 'express';
import {logEvent} from "../../util/logging.js";
import assert from "node:assert";
import {
    createReview,
    deleteReview,
    getReviewById,
    getReviews,
    NewReview,
    updateReview
} from "../../db/operations/reviews.js";

export var router = express.Router();
//reviews
router.get('/', async function (req: Request, res: Response, next: NextFunction) {
    try {
        const page = parseInt(req.query.page as string) || 0;
        const limit = parseInt(req.query.limit as string) || 20;
        const searchterm = req.query.searchterm as string || '';
        const sortBy = req.query.sortBy as 'created_at' | 'updated_at' | 'title' || 'created_at';
        const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';

        const reviews = await getReviews(page, limit, searchterm, sortBy, sortOrder);
        res.json({ reviews });
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async function (req: Request, res: Response, next: NextFunction) {
    try {
        const review = await getReviewById(parseInt(req.params.id));
        if (review) {
            res.json({ review });
        } else {
            throw { status: 404, message: 'Review not found' };
        }
    } catch (error) {
        next(error);
    }
});

router.post('/', async function (req: Request, res: Response, next: NextFunction) {
    try {
        const { title, content, rating, recommendationId } = req.body;
        const newReview: NewReview = {
            content: content,
            rating: rating,
            userId: req.user.id,
            recommendationId: recommendationId
        };
        const review = await createReview(newReview);
        res.json({ review });
        await logEvent(`Created review: ${review.id}`, review, req.user.id);
    } catch (error) {
        next(error);
    }
});

router.patch('/:id', async function (req: Request, res: Response, next: NextFunction) {
    try {
        const review = await getReviewById(parseInt(req.params.id));
        if (!review) {
            throw { status: 404, message: 'Review not found' };
        }
        if (req.body.content) {
            review.content = req.body.content;
        }
        if (req.body.rating) {
            review.rating = req.body.rating;
        }
        const newReview: NewReview = {
            content: review.content,
            rating: review.rating,
            userId: review.userId,
            recommendationId: review.recommendationId
        }

        const updatedReview = await updateReview(review.id, newReview);
        res.json({ updatedReview });
        await logEvent(`Updated review: ${updatedReview.id}`, updatedReview, req.user.id);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async function (req: Request, res: Response, next: NextFunction) {
    try {
        const review = await getReviewById(parseInt(req.params.id));
        if (!review) {
            throw { status: 404, message: 'Review not found' };
        }
        await deleteReview(review.id);
        res.json({ message: 'Review deleted' });
        await logEvent(`Deleted review: ${review.id}`, review, req.user.id);
    } catch (error) {
        next(error);
    }
});

export default router;