import express, {NextFunction, Request, Response} from 'express';
import {requireAuth} from "../../middleware/auth.js";
import {getUsers, setUserAdmin} from "../../db/operations/users.js";
import {createRecommendation, getRecommendationsByUserId} from "../../db/operations/recommendations.js";
export var router = express.Router();

/* GET home page. */
router.get('/', function(req: Request, res: Response, next: () => void){
    // return all routes of this router
    res.json(router.stack.map(r => r.route?.path));
});

router.get('/error', function(req: Request, res: Response, next: NextFunction){
    next(new Error('This is a test error'));
});

router.get('/protected', requireAuth, function(req: Request, res: Response, next: NextFunction){
    res.json({ ok: true });
});

router.get('/unprotected', function(req: Request, res: Response, next: NextFunction){
    res.json({ ok: true });
});

router.get('/userinfo', requireAuth, function(req: Request, res: Response, next: NextFunction){
    res.json({ user: req.user });
});

router.get('/userlist',async function (req: Request, res: Response, next: NextFunction) {
    res.json({users: await getUsers()});
})

router.get('/rectest',requireAuth, async function (req: Request, res: Response, next: NextFunction) {
    // create a new recommendation then list all recommendations for the user
    const recommendation = await createRecommendation({
        userId: req.user.id,
        title: 'Test',
        url: 'https://example.com'
    });
    const recommendations = await getRecommendationsByUserId(req.user.id);
    res.json({recommendation, recommendations});

});

router.get('/op', function(req: Request, res: Response, next: NextFunction){
    setUserAdmin(req.user.id, true).then(() => {
        res.json({ ok: true });
    }).catch(next);
});
