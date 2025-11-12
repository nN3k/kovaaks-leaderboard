import type { APIRoute } from 'astro';
import { serialize } from 'cookie';

export const GET: APIRoute = async ({ redirect }) => {
  const cookie = serialize('steam_user', '', {
    path: '/',
    maxAge: 0, // Expire immediately
  });

  return new Response(null, {
    status: 302,
    headers: {
      'Set-Cookie': cookie,
      Location: '/',
    },
  });
};
