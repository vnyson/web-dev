import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static',
  outDir: './dist',
  adapter: cloudflare(),
  integrations: [tailwind()],
  site: 'https://radio.richmondfan.club',
});
