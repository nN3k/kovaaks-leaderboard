import type { Handler } from '@netlify/functions';

const STEAM_REALM = process.env.PUBLIC_NETLIFY_URL;
const STEAM_RETURN = `${STEAM_REALM}/.netlify/functions/steam-callback`;

export const handler: Handler = async () => {
  const steamLoginUrl = `https://steamcommunity.com/openid/login?` +
    `openid.ns=http://specs.openid.net/auth/2.0` +
    `&openid.mode=checkid_setup` +
    `&openid.return_to=${encodeURIComponent(STEAM_RETURN)}` +
    `&openid.realm=${encodeURIComponent(STEAM_REALM)}` +
    `&openid.identity=http://specs.openid.net/auth/2.0/identifier_select` +
    `&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select`;

  return {
    statusCode: 302,
    headers: { Location: steamLoginUrl },
  };
};
