// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

import db from '@astrojs/db';

import netlify from '@astrojs/netlify';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({

  integrations: [react(), db()],

  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['localhost', 'unpunctuating-rihanna-nondynastically.ngrok-free.dev'],
    },
  },

  adapter: vercel()
});