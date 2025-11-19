import type { Handler } from '@netlify/functions';
import { serialize } from 'cookie';

export const handler: Handler = async (event) => {
    try {
        const body = JSON.parse(event.body || '{}');
        const steamID = body.steamId;

        if (!steamID) {
            return {
                statusCode: 400,
                body: 'Missing steamId'
            };
        }

        const cookie = serialize('steamId', steamID, {
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

        return {
            statusCode: 200,
            headers: {
                'Set-Cookie': cookie,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ok: true })
        };
    } catch (err) {
        return { statusCode: 500, body: 'Steam login failed: ' + err };
    }
};
