import express, {NextFunction, Request, Response} from 'express';
import {
    createRecommendation, deleteRecommendation,
    getRecommendationById,
    getRecommendations,
    NewRecommendation, updateRecommendation
} from "../../db/operations/recommendations.js";
import {logEvent} from "../../util/logging.js";
import assert from "node:assert";

export var router = express.Router();

router.get('/', function (req: Request, res: Response, next: NextFunction) {
    const page = parseInt(req.query.page as string) || 0;
    const limit = parseInt(req.query.limit as string) || 20;
    const searchterm = req.query.searchterm as string || '';
    const sortBy = req.query.sortBy as 'created_at' | 'updated_at' | 'title' || 'created_at';
    const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';

    getRecommendations(page, limit, searchterm, sortBy, sortOrder).then(recommendations => {
        res.json({recommendations});
    }).catch(next);

});

router.get('/:id', function (req: Request, res: Response, next: NextFunction) {
    getRecommendationById(parseInt(req.params.id)).then(recommendation => {
        if (recommendation) {
            res.json({recommendation});
        } else {
            throw {status: 404, message: 'Recommendation not found'};
        }
    }).catch(next);
});

router.post('/', function (req: Request, res: Response, next: NextFunction) {
    const {title, url, imageUrl} = req.body;
    const newRecommendation: NewRecommendation = {
        title: title,
        url: url,
        imageUrl: imageUrl,
        userId: req.user.id
    }
    createRecommendation(newRecommendation).then(recommendation => {
        res.json({recommendation});
        return recommendation;
    }).then(recommendation => {
        logEvent(`Created recommendation: ${recommendation.id}`, recommendation, req.user.id);
    })
        .catch(next);
});

router.delete('/:id', function (req: Request, res: Response, next: NextFunction) {
    getRecommendationById(parseInt(req.params.id)).then(recommendation => {
        if (recommendation) {
            if (recommendation.userId !== req.user.id) {
                throw {status: 403, message: 'Unauthorized'};
            }
            return recommendation;
        } else {
            throw {status: 404, message: 'Recommendation not found'};
        }
    }).then(recommendation => {
        if (recommendation) {
            return deleteRecommendation(recommendation.id);
        } else {

        }
    }).then(() => {
        res.json({success: true});
    }).catch(next);
});

router.patch('/:id', function (req: Request, res: Response, next: NextFunction) {
    getRecommendationById(parseInt(req.params.id)).then(recommendation => {
        if (recommendation) {
            if (recommendation.userId !== req.user.id) {
                throw {status: 403, message: 'Unauthorized'};
            }
            return recommendation;
        } else {
            throw {status: 404, message: 'Recommendation not found'};
        }
    }).then(recommendation => {
        const {title, url, imageUrl} = req.body;
        const newRecommendation: NewRecommendation = {
            title: title,
            url: url,
            imageUrl: imageUrl,
            userId: req.user.id
        }
        return updateRecommendation(recommendation.id, newRecommendation);
    }).then(recommendation => {
        assert(recommendation);
        res.json({recommendation});
        logEvent(`Updated recommendation: ${recommendation.title}`, recommendation.id, req.user.id);
        return recommendation;
    }).catch(next);
});