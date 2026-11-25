// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Used for absolute og:image URLs. Override with SITE_URL at build time.
  site: process.env.SITE_URL ?? 'https://www.era-residence.com',
  build: {
    // Keep the large Webflow stylesheet as a cacheable file instead of inlining it.
    inlineStylesheets: 'never',
  },
});
