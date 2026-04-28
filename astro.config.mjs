// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';

// https://astro.build/config
export default defineConfig({
  site: 'https://e-d.github.io',
  base: '/ai_training/',
  integrations: [mdx(), preact()]
});