// netlify/functions/steam-profile.ts
import type { Handler } from '@netlify/functions';

const STEAM_API_KEY = process.env.STEAM_API_KEY!;

export const handler: Handler = async (event) => {
    try {
        // Extract steamid from cookies
        const cookies = event.headers.cookie || '';
        const steamid = cookies
            .split(';')
            .map(c => c.trim())
            .find(c => c.startsWith('steamId='))
            ?.split('=')[1];

        if (!steamid) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Not logged in (no steamid cookie)' }),
            };
        }

        // Fetch player data from Steam Web API
        const apiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamid}`;
        const res = await fetch(apiUrl);

        if (!res.ok) {
            return {
                statusCode: 502,
                body: JSON.stringify({ error: 'Steam API error', status: res.status }),
            };
        }

        const data = await res.json();

        // Return JSON to the frontend
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data.response.players[0] ?? {}),
        };

    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error', details: String(err) }),
        };
    }
};
