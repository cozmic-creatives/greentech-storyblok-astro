import { defineConfig } from 'astro/config';
import { storyblok } from '@storyblok/astro';
import { loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import path from 'path';
import node from '@astrojs/node';
import react from '@astrojs/react';

const env = loadEnv('', process.cwd(), 'STORYBLOK');
const isPreview = process.env.PUBLIC_ENV === 'preview';
const bridge = isPreview ? { customParent: 'https://app.storyblok.com' } : false;

// https://astro.build/config
export default defineConfig({
  output: isPreview ? 'server' : 'static',
  adapter: isPreview ? node({ mode: 'standalone' }) : undefined,

  integrations: [
    storyblok({
      accessToken: env.STORYBLOK_PREVIEW_TOKEN,
      apiOptions: {
        region: '',
      },
      bridge,
      components: {
        button: 'storyblok/Button',
        page: 'storyblok/Page',
        hero: 'storyblok/Hero',
        grid: 'storyblok/Grid',
        row: 'storyblok/Row',
        teaser: 'storyblok/Teaser',
        text: 'storyblok/Text',
        partnersSection: 'storyblok/PartnersSection',
        card: 'storyblok/Card/index',
      },
    }),
    react(),
  ],

  vite: {
    plugins: [basicSsl(), tailwindcss()],
    server: {
      https: true,
    },
    resolve: {
      alias: {
        '~': path.resolve('./src'),
      },
    },
  },
});
