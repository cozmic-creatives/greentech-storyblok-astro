import { defineConfig } from 'astro/config';
import { storyblok } from '@storyblok/astro';
import { loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import mkcert from 'vite-plugin-mkcert';
import path from 'path';
import node from '@astrojs/node';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { redirects } from './src/config/redirects.ts';

const env = loadEnv('', process.cwd(), 'STORYBLOK');
const isPreview = process.env.PUBLIC_ENV === 'preview';
const isDev = process.env.NODE_ENV === 'development';
const isProduction = process.env.PUBLIC_ENV === 'production';
const bridge = isPreview ? { customParent: 'https://app.storyblok.com' } : false;

// Use public token for production, preview token for preview/dev
const storyblokToken = isProduction ? env.STORYBLOK_TOKEN : env.STORYBLOK_PREVIEW_TOKEN;

// https://astro.build/config
export default defineConfig({
  site: 'https://greentechmachinery.co.za', // Update with your actual domain
  output: isPreview ? 'server' : 'static', // Server for preview, static for production
  adapter: node({ mode: 'standalone' }),
  redirects,
  image: {
    format: 'webp',
  },

  build: {
    inlineStylesheets: 'auto',
    assets: '_assets',
    split: true,
  },

  compressHTML: true,

  integrations: [
    storyblok({
      accessToken: storyblokToken,
      apiOptions: {
        region: '',
      },
      bridge,
      components: {
        article: 'storyblok/Article/index',
        button: 'storyblok/Button',
        page: 'storyblok/Page',
        hero: 'storyblok/Hero/index',
        grid: 'storyblok/Grid',
        row: 'storyblok/Row',
        text: 'storyblok/Text',
        richText: 'storyblok/RichText',
        carousel: 'storyblok/Carousel',
        card: 'storyblok/Card/index',
        list: 'storyblok/List',
        navItem: 'storyblok/NavItem',
        component: 'storyblok/Component/index',
        link: 'storyblok/Link',
        badge: 'storyblok/Badge',
        form: 'storyblok/Form/index',
        input: 'storyblok/Input',
        button: 'storyblok/Button',
        accordion: 'storyblok/Accordion',
        visual: 'storyblok/Visual',
        tabs: 'storyblok/Tabs',
        tabItem: 'storyblok/TabItem',
        gallery: 'storyblok/Gallery',
        menu: 'storyblok/Menu/index',
      },
    }),
    react(),
    sitemap(),
  ],

  vite: {
    plugins: [...(isDev ? [mkcert()] : []), tailwindcss()],
    resolve: {
      alias: {
        '~': path.resolve('./src'),
      },
    },
  },
});
