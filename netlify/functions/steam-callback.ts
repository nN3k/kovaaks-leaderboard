import type { Handler } from '@netlify/functions';
import { serialize } from 'cookie';


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


        const steamIdCookie = serialize('steamId', steamId, {
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });


        let personaNameCookie = "";
        let avatarCookie = "";

        try {
            const res = await fetch('/.netlify/functions/steam-profile', {
                credentials: 'include',
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            
            personaNameCookie = serialize('personaName', data.personaname, {
                httpOnly: false,
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 1 week
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
            });

            avatarCookie = serialize('avatar', data.avatarfull, {
                httpOnly: false,
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 1 week
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
            });

        } catch (e: any) {
            // Handle fetch error if needed
        }

        return {
            statusCode: 302,
            multiValueHeaders: {
                'Set-Cookie': [
                    steamIdCookie,
                    personaNameCookie,
                    avatarCookie
                    ],
                Location: ['/'],
            },
        };
    } catch (err) {
        return { statusCode: 500, body: 'Steam login failed: ' + err };
    }
};
