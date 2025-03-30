import { defineConfig } from 'astro/config';
import { storyblok } from '@storyblok/astro';
import { loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import path from 'path';
import preact from '@astrojs/preact';
import node from '@astrojs/node';

const env = loadEnv('', process.cwd(), 'STORYBLOK');
const isProduction = process.env.PUBLIC_ENV === 'production';
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
        page: 'storyblok/Page',
        feature: 'storyblok/Feature',
        grid: 'storyblok/Grid',
        teaser: 'storyblok/Teaser',
      },
    }),
    preact(),
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
