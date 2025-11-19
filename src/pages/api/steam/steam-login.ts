// src/pages/api/steam/steam-login.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
    const STEAM_RETURN_TO = import.meta.env.PUBLIC_NGROK_URL + '/api/steam/steam-callback';
    const REALM = import.meta.env.PUBLIC_NGROK_URL;

    const params = new URLSearchParams({
        'openid.ns': 'http://specs.openid.net/auth/2.0',
        'openid.mode': 'checkid_setup',
        'openid.return_to': STEAM_RETURN_TO,
        'openid.realm': REALM,
        'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
        'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
    });

    const redirectUrl = 'https://steamcommunity.com/openid/login?' + params.toString();
    console.log('Redirecting user to:', redirectUrl);

    return new Response(null, {
        status: 302,
        headers: { Location: redirectUrl },
    });
};
