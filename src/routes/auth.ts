import express, {Request, response, Response} from 'express';

export var router = express.Router();
import jwt from 'jsonwebtoken';
import {DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_GUILD_ID, JWT_SECRET, REDIRECT_URI} from "../env.js";
import {createUser, getUserByDiscordId, updateLastLogin} from "../db/user.js";
import assert from "node:assert";

const scopes = 'identify email guilds';
const guild_id = DISCORD_GUILD_ID;

router.get('/discord', (req: Request, res: Response) => {
    res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${scopes}`);
});

type JWTPayload = {
    userId: number;
};

router.get('/discord/callback', async (req: Request, res: Response) => {
    const {code} = req.query;

    try {
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                code: String(code),
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI,
                scope: scopes
            })
        });

        const jsonResponse = await tokenResponse.json();

        const accessToken = jsonResponse.access_token;

        console.log('Access token:', accessToken);

        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                authorization: `Bearer ${accessToken}`
            }
        }).then(response => {
            if (!response.ok) {
                throw new Error('Failed to get user data (HTTP status: ' + response.status + ')');
            }
            return response;
        })

        const discordUserData = await userResponse.json();

        const userData = {
            discordId: discordUserData.id,
            username: discordUserData.username,
            email: discordUserData.email
        };

        const user = await getUserByDiscordId(userData.discordId);

        if (user) {
            await updateLastLogin(user.id);
            const payload: JWTPayload = {userId: user.id};
            res.json({token: jwt.sign(payload, JWT_SECRET, {expiresIn: '1h'})});
        } else {
            const isMember = await checkGuildMembership(accessToken, guild_id);
            if (isMember) {
                const user = await createUser(userData);
                assert(user, 'User creation failed');
                const payload: JWTPayload = {userId: user.id};
                res.json({token: jwt.sign(payload, JWT_SECRET, {expiresIn: '1h'})});
            } else {
                res.status(401).json({error: 'You are not a member of the guild'});
            }
        }

    } catch (err) {
        console.error('Authentication error:', err);
        res.status(500).json({error: 'Authentication failed'});
    }
});


function checkGuildMembership(access_token: string, guild_id: string) {
    return fetch(`https://discord.com/api/users/@me/guilds`, {
        headers: {
            authorization: `Bearer ${access_token}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to check guild membership (HTTP status: ' + response.status + ')');
            }
            return response.json();
        })
        .then(guilds => {
            console.log('Guilds:', guilds);
            return guilds.some((guild: { id: string; }) => guild.id === guild_id);
        });
}


export const authenticateJWT = (req: Request, res: Response, next: () => void) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
            if (err) {
                return res.sendStatus(403);
            }

            // @ts-ignore
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

router.get('/protected', authenticateJWT, (req: Request, res: Response) => {
    // @ts-ignore
    res.json({message: 'Dies ist eine geschützte Route', user: req.user});
});