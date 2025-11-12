import type { APIRoute } from 'astro';
import { db, Profile } from 'astro:db';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  console.log('Server-side code running!');
  await db.insert(Profile).values({
        steamId: 0,
        steamName: 'Added User',
        country: 'GER',
        isBanned: false,
    })

  return new Response(
    JSON.stringify({ message: 'Server function executed successfully!' }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
