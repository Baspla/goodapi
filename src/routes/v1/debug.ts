import express, {NextFunction, Request, Response} from 'express';
import {requireAuth} from "../../middleware/auth.js";
import {getUsers, setUserAdmin} from "../../db/operations/users.js";
import {
    createRecommendation, getRecommendationById2,
    getRecommendationsByUserId
} from "../../db/operations/recommendations.js";
import {createTag} from "../../db/operations/tags.js";
import {createRecommendationToTag} from "../../db/operations/recommendationsToTags.js";
export var router = express.Router();

/* GET home page. */
router.get('/', function(req: Request, res: Response){
    // return all routes of this router
    res.json(router.stack.map(r => r.route?.path));
});

router.get('/error', function(req: Request, res: Response, next: NextFunction){
    next(new Error('This is a test error'));
});

router.get('/protected', requireAuth, function(req: Request, res: Response){
    res.json({ ok: true });
});

router.get('/unprotected', function(req: Request, res: Response){
    res.json({ ok: true });
});

router.get('/userinfo', requireAuth, function(req: Request, res: Response){
    res.json({ user: req.user });
});

router.get('/userlist',async function (req: Request, res: Response) {
    res.json({users: await getUsers()});
})

router.get('/rectest',requireAuth, async function (req: Request, res: Response) {
    // create a new recommendation then list all recommendations for the user
    const recommendation = await createRecommendation({
        userId: req.user.id,
        title: 'Test',
        url: 'https://example.com'
    });
    const recommendations = await getRecommendationsByUserId(req.user.id);
    res.json({recommendation, recommendations});

});

router.get('/tag1', async function (req: Request, res: Response, next: NextFunction) {
    try {
        const data = await createRecommendationToTag(1, 1);
        res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get('/op', async function (req: Request, res: Response, next: NextFunction) {
    try {
        await setUserAdmin(req.user.id, true);
        res.json({ok: true});
    } catch (error) {
        next(error);
    }
});

router.get('/q', async function(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await getRecommendationById2(1);
        res.json(data);
    } catch (error) {
        next(error);
    }
});

router.get('/tagtest', async function(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await createTag({name: 'test'});
        res.json(data);
    } catch (error) {
        next(error);
    }
});

