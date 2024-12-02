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

router.get('/tag1', function(req: Request, res: Response) {
    createRecommendationToTag(1, 1).then((data) => {
        res.json(data);
    })
});

router.get('/op', function(req: Request, res: Response, next: NextFunction){
    setUserAdmin(req.user.id, true).then(() => {
        res.json({ ok: true });
    }).catch(next);
});

router.get('/q', function(req: Request, res: Response) {
    getRecommendationById2(1).then((data) => {
        res.json(data);
    });
});

router.get('/tagtest', function(req: Request, res: Response, next: NextFunction){
    createTag({name: 'test'}).then((data) => {
        res.json(data);
    }).catch((error) => {
        next(error);
    });
});

