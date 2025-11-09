// src/pages/api/profiles.json.ts
import type { APIRoute } from 'astro';
import { db, Profile } from 'astro:db';

export const prerender = false; // ← Add this line

export const GET: APIRoute = async () => {
  try {
    const profiles = await db.select().from(Profile).all();
    
    return new Response(JSON.stringify(profiles), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch profiles' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};