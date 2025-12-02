import type { Handler } from '@netlify/functions';
import cookie from 'cookie';

export const handler: Handler = async (event) => {
    
    const cookieHeader = event.headers.cookie;

    if (!cookieHeader) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                steamId: null,
                personaName: null,
                avatar: null,
            }),
        };
    }

    
    const cookies = cookie.parse(cookieHeader);

    
    const steamId = cookies['steamId'] || null;
    const personaName = cookies['personaName'] || null;
    const avatar = cookies['avatar'] || null;

    
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            steamId,
            personaName,
            avatar,
        }),
    };
};
