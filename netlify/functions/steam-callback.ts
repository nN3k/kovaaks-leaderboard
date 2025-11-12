import type { Handler } from '@netlify/functions';
import fetch from 'node-fetch';

export const handler: Handler = async (event) => {
  const params = event.queryStringParameters || {};

  if (!params['openid.claimed_id']) {
    return {
      statusCode: 400,
      body: 'Missing OpenID claimed_id',
    };
  }

  // Prepare verification request
  const body = new URLSearchParams({
    ...params,
    'openid.mode': 'check_authentication',
  });

  try {
    const response = await fetch('https://steamcommunity.com/openid/login', {
      method: 'POST',
      body,
    });

    const text = await response.text();
    const isValid = text.includes('is_valid:true');

    if (!isValid) {
      return {
        statusCode: 400,
        body: '❌ Steam OpenID verification failed',
      };
    }

    // Extract SteamID
    const steamID = params['openid.claimed_id'].split('/').pop();

    return {
      statusCode: 200,
      body: `✅ Logged in! SteamID: ${steamID}`,
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: 'Server error',
    };
  }
};
