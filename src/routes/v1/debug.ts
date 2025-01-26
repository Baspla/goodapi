import express, {NextFunction, Request, Response} from 'express';
import {requireAdmin, requireAuth} from "../../middleware/auth.js";
import {createUser, deleteAllUsers, deleteUser, getUsers, setUserAdmin} from "../../db/operations/users.js";
import {
    createRecommendation, deleteRecommendation, getRecommendationById, getRecommendations,
    getRecommendationsByUserId
} from "../../db/operations/recommendations.js";
import {createTag, deleteAllTags, deleteTag, getTags} from "../../db/operations/tags.js";
import {createRecommendationToTag, getTagsByRecommendationId} from "../../db/operations/recommendationsToTags.js";

export var router = express.Router();

// Hauptseite für Debugging
router.get('/', function (req: Request, res: Response) {
    // return all routes of this router
    res.json(router.stack.map(r => r.route?.path));
});

// Test ob error handling funktioniert
router.get('/error', function (req: Request, res: Response, next: NextFunction) {
    next(new Error('This is a test error'));
});

// Tests ob requireAuth funktioniert
router.get('/superprotected', requireAdmin, function (req: Request, res: Response) {
    res.json({ok: true});
});

router.get('/protected', requireAuth, function (req: Request, res: Response) {
    res.json({ok: true});
});

router.get('/unprotected', function (req: Request, res: Response) {
    res.json({ok: true});
});

// Info über den eingeloggten User
router.get('/userinfo', function (req: Request, res: Response) {
    res.json({user: req.user});
});

router.get('/userlist', async function (req: Request, res: Response) {
    res.json({users: await getUsers()});
})

router.get('/grantAdmin', async function (req: Request, res: Response, next: NextFunction) {
    try {
        await setUserAdmin(req.user.id, true);
        res.json({ok: true});
    } catch (error) {
        next(error);
    }
});

router.get('/stats', async function (req: Request, res: Response) {
    res.json({
        users: await getUsers(),
        recommendations: await getRecommendations(), //20 limit
        tags: await getTags(),
    });
});

router.get('/setupSampleData', async function (req: Request, res: Response) {
    try {
        await deleteAllUsers();
        await deleteAllTags();

        const tags = [];
        for (let k = 0; k < 3; k++) {
            tags.push(await createTag({
                name: `Tag ${k}`
            }));
        }
        for (let i = 0; i < 5; i++) {
            const user = await createUser({
                discordId: i.toString(),
                username: `User${i}`,
                email: `user${i}@test.de`,
                role: i === 0 ? 'admin' : 'user'
            });
            for (let j = 0; j < 5; j++) {
                const recommendation = await createRecommendation({
                    userId: user.id,
                    title: `Recommendation ${j}`,
                    url: `https://example.com/${j}`,
                    imageUrl: `https://picsum.photos/seed/${j}${i}/${300+j*100}/${400+i*100}`,
                });
                await createRecommendationToTag(recommendation.id, tags[j % 3].id);
            }
        }
        res.json({ok: true});

    } catch (error) {
        console.error('Error deleting users:', error);
        res.status(500).json({error: 'Error deleting users'});
    }
});

router.get('/testCaseCreateAndDeleteRecommendation', requireAuth, async function (req: Request, res: Response) {
    try {
        const user = await createUser({
            discordId: '123456',
            username: 'TestUser',
            email: 'test@test.de'
        });
        const createdRecommendation = await createRecommendation({
            userId: user.id,
            title: 'Test',
            url: 'https://example.com',
        });
        const tag = await createTag({
            name: 'TestTag'
        });
        await createRecommendationToTag(createdRecommendation.id, tag.id);
        await deleteTag(tag.id);
        const recommendation = await getRecommendationById(createdRecommendation.id);
        const tagsForRecommendation = await getTagsByRecommendationId(createdRecommendation.id);
        const recommendations = await getRecommendationsByUserId(user.id);
        await deleteRecommendation(createdRecommendation.id);
        await deleteUser(user.id);
        res.json({user, createdRecommendation, tag, tagsForRecommendation, recommendation, recommendations});
    } catch (error) {
        console.error('Error creating recommendation:', error);
        res.status(500).json({error: 'Error creating recommendation'});
    }
});