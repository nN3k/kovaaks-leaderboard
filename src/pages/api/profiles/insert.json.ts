// src/pages/api/profiles/insert.json.ts
import type { APIRoute } from 'astro';
import { db, Profile } from 'astro:db';

export const prerender = false; // ← Add this line

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.steamId || !data.steamName) {
      return new Response(JSON.stringify({ error: 'steamId and steamName are required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const result = await db.insert(Profile).values(data).run();
    
    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Insert error:', error);
    return new Response(JSON.stringify({ error: 'Failed to insert profile' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};