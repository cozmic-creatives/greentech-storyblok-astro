import { defineConfig } from 'astro/config';
import { storyblok } from '@storyblok/astro';
import { loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import path from 'path';
import node from '@astrojs/node';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

const env = loadEnv('', process.cwd(), 'STORYBLOK');
const isPreview = process.env.PUBLIC_ENV === 'preview';
const bridge = isPreview ? { customParent: 'https://app.storyblok.com' } : false;

// https://astro.build/config
export default defineConfig({
  site: 'https://greentech.matthewbracke.com', // Update with your actual domain
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
        article: 'storyblok/Article/index',
        button: 'storyblok/Button',
        page: 'storyblok/Page',
        hero: 'storyblok/Hero',
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
      },
    }),
    react(),
    sitemap(),
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
