import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  console.log('NGROK_URL:', process.env.NGROK_URL);
  return new Response(process.env.NGROK_URL || 'undefined');
};
