import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://pete-builds.github.io',
  output: 'static',
  integrations: [sitemap()],
  build: {
    format: 'directory',
  },
});
