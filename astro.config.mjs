import { defineConfig } from 'astro/config';
import { storyblok } from '@storyblok/astro';
import { loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import path from 'path';
import preact from '@astrojs/preact';
const env = loadEnv('', process.cwd(), 'STORYBLOK');

// https://astro.build/config
export default defineConfig({
  integrations: [
    storyblok({
      //accessToken: env.STORYBLOK_TOKEN,
      // previewToken: env.STORYBLOK_PREVIEW_TOKEN,
      accessToken: env.STORYBLOK_PREVIEW_TOKEN,
      apiOptions: {
        region: '',
      },
      bridge: {
        customParent: 'https://app.storyblok.com',
      },
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
