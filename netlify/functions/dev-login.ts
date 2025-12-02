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

        const steamIdCookie = serialize('steamId', steamID, {
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

            
        const personaNameCookie = serialize('personaName', "Dev", {
            httpOnly: false,
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

        const avatarCookie = serialize('avatar', "https://media2.dev.to/dynamic/image/width=775%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Forganization%2Fprofile_image%2F1%2Fd908a186-5651-4a5a-9f76-15200bc6801f.jpg", {
            httpOnly: false,
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

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
