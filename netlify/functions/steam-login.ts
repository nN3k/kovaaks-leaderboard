import type { Handler } from '@netlify/functions';

const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login';

export const handler: Handler = async () => {
  const PUBLIC_NETLIFY_URL = process.env.PUBLIC_NETLIFY_URL;
  if (!PUBLIC_NETLIFY_URL) {
    return {
      statusCode: 500,
      body: 'PUBLIC_NETLIFY_URL not set',
    };
  }

  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': `${PUBLIC_NETLIFY_URL}/.netlify/functions/steam-callback`,
    'openid.realm': PUBLIC_NETLIFY_URL,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  });

  return {
    statusCode: 302,
    headers: {
      Location: `${STEAM_OPENID_URL}?${params.toString()}`,
    },
  };
};
