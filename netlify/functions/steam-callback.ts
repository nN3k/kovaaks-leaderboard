import { Handler } from '@netlify/functions';
import { serialize } from 'cookie';
import fetch from 'node-fetch';

const STEAM_API_KEY = process.env.STEAM_API_KEY;

export const handler: Handler = async (event) => {
    try {
        const urlParams = new URLSearchParams(event.queryStringParameters as any);
        const openidMode = urlParams.get('openid.mode');

        if (openidMode !== 'id_res') {
            return { statusCode: 400, body: 'Invalid Steam login response' };
        }

        // Extract the Steam ID from OpenID claimed_id
        const claimedId = urlParams.get('openid.claimed_id');
        if (!claimedId) {
            return { statusCode: 400, body: 'No Steam ID found' };
        }

        const steamId = claimedId.split('/').filter(Boolean).pop(); // last part of URL
        if (!steamId) {
            return { statusCode: 400, body: 'Invalid Steam ID' };
        }

        // Set HTTP-only cookie for login
        const cookie = serialize('steamId', steamId, {
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

        return {
            statusCode: 302,
            headers: {
                'Set-Cookie': cookie,
                Location: '/', // redirect to home page
            },
        };
    } catch (err) {
        return { statusCode: 500, body: 'Steam login failed: ' + err };
    }
};
