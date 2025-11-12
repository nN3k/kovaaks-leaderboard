import { Handler } from '@netlify/functions';
import { serialize } from 'cookie';

export const handler: Handler = async () => {
  // Overwrite the cookie with an expired one
  const cookie = serialize('steamId', '', {
    httpOnly: true,
    path: '/',
    expires: new Date(0), // set expiry in the past
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return {
    statusCode: 302,
    headers: {
      'Set-Cookie': cookie,
      Location: '/', // redirect after logout
    },
  };
};
