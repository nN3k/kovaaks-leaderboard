import type { Handler } from '@netlify/functions';
import { parse } from 'cookie';

export const handler: Handler = async (event) => {
  const cookies = event.headers.cookie ? parse(event.headers.cookie) : {};
  const steamId = cookies.steamId;

  if (!steamId) {
    return { statusCode: 401, body: JSON.stringify({ loggedIn: false }) };
  }

  return { statusCode: 200, body: JSON.stringify({ loggedIn: true, steamId }) };
};
