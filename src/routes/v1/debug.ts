import express, {NextFunction, Request, Response} from 'express';
import {requireAdmin, requireAuth} from "../../middleware/auth.js";
import {
    createUser,
    deleteAllUsers,
    deleteUser,
    getUserByDiscordId,
    getUsers,
    NewUser,
    setUserAdmin, User
} from "../../db/operations/users.js";
import {
    createFind, deleteFind, getFindById, getFinds,
    getFindsByUserId
} from "../../db/operations/finds.js";
import {createTag, deleteAllTags, deleteTag, getTags} from "../../db/operations/tags.js";
import {createFindToTag, getTagsByFindId} from "../../db/operations/findsToTags.js";

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
        finds: await getFinds(), //20 limit
        tags: await getTags(),
    });
});

router.post('/legacyUsers', async function (req: Request, res: Response) {
    const users = req.body;
    if (!users) {
        res.status(400).json({error: 'No users provided'});
        return;
    }
    try {
        for (const userdata of users) {
            let user : NewUser = {
                discordId: userdata.discord,
                username: userdata.username,
                email: userdata.email,
                role: 'user'
            }
            await createUser(user);
        }
        res.json({ok: true});
    } catch (error) {
        console.error('Error creating users:', error);
        res.status(500).json({error: 'Error creating users'});
    }
})

router.post('/legacyFinds', async function (req: Request, res: Response) {
    /*
    {
    "author": "3jwcaf23vjxgdpn",
    "created": "2024-05-01 19:34:13.537Z",
    "description": "Cool Youtube Channel",
    "id": "azgmzhe3yolcuey",
    "image_url": "https://yt3.googleusercontent.com/ytc/AIdro_nxrDGcxMGo8yKf2_Dw0eaGEWj39IAIdZQjAuz-_mBHjUI=s900-c-k-c0x00ffffff-no-rj",
    "is_request": 0,
    "title": "CGP Grey",
    "topic": "uh3nqw4tmbpujct",
    "updated": "2024-05-01 19:34:13.537Z",
    "url": "https://www.youtube.com/@CGPGrey",
    "discord": "197433566102028288"
  }
     */
    const finds = req.body;
    if (!finds) {
        res.status(400).json({error: 'No finds provided'});
        return;
    }
    try {
        for (const find of finds) {
            //find user by discord id
            const user:User|undefined = await getUserByDiscordId(find.discord);
            if (!user) {
                console.error('User not found:', find.discord, ' for find:', find.title);
                continue;
            }
            await createFind({
                userId: user.id,
                title: find.title,
                url: find.url,
                imageUrl: find.image_url,
                createdAt: new Date(find.created),
            });
        }
        res.json({ok: true});
    } catch (error) {
        console.error('Error creating finds:', error);
        res.status(500).json({error: 'Error creating finds'});
    }
})

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
                role: i === 0 ? 'admin' : 'user',
                avatarUrl: `https://picsum.photos/seed/${i}/150`,
            });
            for (let j = 0; j < 5; j++) {
                const find = await createFind({
                    userId: user.id,
                    title: `Find ${j}`,
                    url: `https://example.com/${j}`,
                    imageUrl: `https://picsum.photos/seed/${j}${i}/${300+j*100}/${400+i*100}`,
                });
                await createFindToTag(find.id, tags[j % 3].id);
            }
        }
        res.json({ok: true});

    } catch (error) {
        console.error('Error deleting users:', error);
        res.status(500).json({error: 'Error deleting users'});
    }
});

router.get('/testCaseCreateAndDeleteFind', requireAuth, async function (req: Request, res: Response) {
    try {
        const user = await createUser({
            discordId: '123456',
            username: 'TestUser',
            email: 'test@test.de'
        });
        const createdFind = await createFind({
            userId: user.id,
            title: 'Test',
            url: 'https://example.com',
        });
        const tag = await createTag({
            name: 'TestTag'
        });
        await createFindToTag(createdFind.id, tag.id);
        await deleteTag(tag.id);
        const find = await getFindById(createdFind.id);
        const tagsForFind = await getTagsByFindId(createdFind.id);
        const finds = await getFindsByUserId(user.id);
        await deleteFind(createdFind.id);
        await deleteUser(user.id);
        res.json({user, createdFind, tag, tagsForFind, find, finds});
    } catch (error) {
        console.error('Error creating find:', error);
        res.status(500).json({error: 'Error creating find'});
    }
});