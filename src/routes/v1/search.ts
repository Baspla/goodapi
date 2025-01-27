import express from "express";
import {getRecommendations} from "../../db/operations/recommendations.js";
import {getReviews} from "../../db/operations/reviews.js";
import {getTags} from "../../db/operations/tags.js";
import {getUsers} from "../../db/operations/users.js";

export var router = express.Router();

// Universal search endpoint recommendations, reviews, tags and users

router.get('/', async function (req, res, next) {
    try {
        const limit = parseInt(req.query.limit as string) || 5;
        const searchterm = req.query.searchterm as string || '';
        const recommendations = await getRecommendations(0,limit, searchterm, 'created_at', 'desc');
        const reviews = await getReviews(0,limit, searchterm, 'created_at', 'desc');
        const tags = await getTags(0,limit, searchterm, 'created_at', 'desc');
        const users = await getUsers(0,limit, searchterm, 'created_at', 'desc');
        res.json({recommendations, reviews, tags, users});
    } catch (error) {
        next(error);
    }
});