import type { APIRoute } from 'astro';
import { actions } from 'astro:actions';
import { db, Profile } from 'astro:db';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    // Example: Call a server action directly


    return new Response(
        JSON.stringify({ message: 'Server function executed successfully!' }),
        {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        }
    );
};
