import express, {NextFunction, Request, Response} from 'express';
import {requireAuth} from "../../middleware/auth.js";
import {
    createRecommendation, deleteRecommendation,
    getRecommendationById,
    getRecommendations,
    NewRecommendation
} from "../../db/operations/recommendations.js";
import {validateUrl} from "../../util/validation.js";
import {validateTitle} from "../../util/validation.js";
import {logEvent} from "../../util/logging.js";
export var router = express.Router();

router.get('/', function(req: Request, res: Response, next: NextFunction) {
    getRecommendations().then(recommendations => {
        res.json({ recommendations });
    }).catch(next);
});

router.get('/:id', function(req: Request, res: Response, next: NextFunction) {
    getRecommendationById(parseInt(req.params.id)).then(recommendation => {
        if (recommendation) {
            res.json({ recommendation });
        } else {
            throw { status: 404, message: 'Recommendation not found' };
        }
    }).catch(next);
});

router.post('/', requireAuth, function(req: Request, res: Response, next: NextFunction) {
    const {title, url, imageUrl} = req.body;
    if (!title) {
        next({ status: 400, message: 'Title is required' });
        return;
    }
    if (!validateTitle(title)) {
        next({ status: 400, message: 'Invalid title' });
        return;
    }
    if (url&&!validateUrl(url)) {
        next({ status: 400, message: 'Invalid URL' });
        return;
    }
    if (imageUrl&&!validateUrl(imageUrl)) {
        next({ status: 400, message: 'Invalid image URL' });
        return;
    }
    const newRecommendation: NewRecommendation = {
        title: title,
        url: url,
        imageUrl: imageUrl,
        userId: req.user.id
    }
    createRecommendation(newRecommendation).then(recommendation => {
        res.json({ recommendation });
        return recommendation;
    }).then(recommendation =>{
        logEvent(`Created recommendation: ${recommendation.id}`, recommendation, req.user.id);
    })
        .catch(next);
});

router.delete('/:id', requireAuth, function(req: Request, res: Response, next: NextFunction) {
    getRecommendationById(parseInt(req.params.id)).then(recommendation => {
        if (recommendation) {
            if (recommendation.userId !== req.user.id) {
                throw { status: 403, message: 'Unauthorized' };
            }
            return recommendation;
        } else {
            throw { status: 404, message: 'Recommendation not found' };
        }
    }).then(recommendation => {
        if (recommendation) {
            return deleteRecommendation(recommendation.id);
        }else{

        }
    }).then(() => {
        res.json({ success: true });
    } ).catch(next);
});
