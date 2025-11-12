// src/pages/api/steam/steam-callback.ts
import type { APIRoute } from 'astro';
import fetch from 'node-fetch';

export const GET: APIRoute = async ({ request }) => {
  try {
    console.log('Request URL:', request.url);


    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());

    console.log('🌐 Incoming callback URL:', request.url);
    console.log('🔍 OpenID params:', params);

    const verificationParams = new URLSearchParams({ 'openid.mode': 'check_authentication' });
    for (const key in params) {
      verificationParams.append(key, params[key]);
    }

    const steamResponse = await fetch('https://steamcommunity.com/openid/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: verificationParams.toString(),
    });

    const text = await steamResponse.text();
    console.log('📨 Steam verification response:', text);

    if (!text.includes('is_valid:true')) {
      console.error('❌ Steam OpenID verification failed');
      return new Response('Steam login failed', { status: 400 });
    }

    const claimedId = params['openid.claimed_id'];
    const steamIdMatch = claimedId?.match(/https?:\/\/steamcommunity\.com\/openid\/id\/(\d+)/);
    const steamId = steamIdMatch ? steamIdMatch[1] : null;

    console.log('✅ SteamID:', steamId);

    return new Response(`Logged in as SteamID: ${steamId}`, { status: 200 });
  } catch (err) {
    console.error('🔥 Error in Steam callback:', err);
    return new Response('Internal server error', { status: 500 });
  }
};
