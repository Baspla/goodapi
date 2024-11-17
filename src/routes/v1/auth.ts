import express, {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    DISCORD_GUILD_ID,
    isDev,
    JWT_SECRET,
    REDIRECT_BASE, REDIRECT_URI_APP,
    REDIRECT_URI_WEB
} from "../../env.js";
import {createUser, getUserByDiscordId, getUserById, updateLastLogin} from "../../db/operations/users.js";
import assert from "node:assert";
import {logEvent} from "../../util/logging.js";

export var router = express.Router();

const scopes = 'identify email guilds';
const guild_id = DISCORD_GUILD_ID;

type JWTPayload = {
    userId: number;
};

if(REDIRECT_URI_WEB) {
    router.get('/discord/web', createRedirectFunction(REDIRECT_BASE + "/v1/auth/discord/web/callback"));
    router.get('/discord/web/callback',createCallbackFunction(REDIRECT_BASE+"/v1/auth/discord/web/callback",REDIRECT_URI_WEB));
}else{
    console.warn('No REDIRECT_URI_WEB set, skipping web authentication');
}

if(REDIRECT_URI_APP) {
    router.get('/discord/app', createRedirectFunction(REDIRECT_BASE+"/v1/auth/discord/app/callback"));
    router.get('/discord/app/callback',createCallbackFunction(REDIRECT_BASE+"/v1/auth/discord/app/callback",REDIRECT_URI_APP));
} else {
    console.warn('No REDIRECT_URI_APP set, skipping app authentication');
}


function createRedirectFunction(redirect_url: string) {
    return function (req: Request, res: Response) {
        res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${redirect_url}&response_type=code&scope=${scopes}`);
        return;
    }
}

function createCallbackFunction(redirect_url: string,application_redirect_url: string) {
    return async function (req: Request, res: Response,next: NextFunction) {
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
                    redirect_uri: String(redirect_url),
                    scope: scopes
                })
            });

            const jsonResponse: any = await tokenResponse.json();

            const accessToken = jsonResponse.access_token;

            console.debug('Access token:', accessToken);

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

            const discordUserData: any = await userResponse.json();

            const userData = {
                discordId: discordUserData.id,
                username: discordUserData.username,
                email: discordUserData.email
            };

            const user = await getUserByDiscordId(userData.discordId);

            if (user) {
                await updateLastLogin(user.id);
                logEvent('User logged in',null, user.id);
                const payload: JWTPayload = {userId: user.id};
                res.redirect(application_redirect_url + '?token=' + jwt.sign(payload, JWT_SECRET, {expiresIn: '1h'}));
            } else {
                const isMember = await checkGuildMembership(accessToken, guild_id);
                if (isMember) {
                    const user = await createUser(userData).catch(err => {
                        logEvent('User creation failed', {error: err.message});
                        throw err;
                    })
                    assert(user, 'Users creation failed');
                    logEvent('User account created', {userId: user.id}, user.id);
                    const payload: JWTPayload = {userId: user.id};
                    res.redirect(application_redirect_url + '?token=' + jwt.sign(payload, JWT_SECRET, {expiresIn: '1h'}));
                } else {
                    res.redirect(application_redirect_url + '?error=' + encodeURIComponent('You need to be a member of the server to use this application')+ '&code=403');
                }
            }

        } catch (err: any) {
            console.error('Authentication error:', err);
            res.redirect(application_redirect_url + '?error=' + encodeURIComponent(err.message)+ '&code=500');
        }
    }
}

async function checkGuildMembership(access_token: string, guild_id: string) {
    const response = await fetch(`https://discord.com/api/users/@me/guilds`, {
        headers: {
            authorization: `Bearer ${access_token}`
        }
    });
    if (!response.ok) {
        throw new Error('Failed to check guild membership (HTTP status: ' + response.status + ')');
    }
    const guilds: any = await response.json();
    console.log('Guilds:', guilds);
    return guilds.some((guild: { id: string; }) => guild.id === guild_id);
}