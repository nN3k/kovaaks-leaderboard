import type { APIRoute } from 'astro';

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
