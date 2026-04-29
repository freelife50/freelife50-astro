// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://freelife50.com',
  integrations: [sitemap()],
  output: 'static',
});
