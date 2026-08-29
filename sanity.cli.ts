import { defineCliConfig } from 'sanity/cli';

/**
 * Sanity Studio is hosted by Sanity, not embedded in this app.
 *
 * Embedding it at /studio pushed the Cloudflare Worker to 5.16 MiB gzipped,
 * over the 3 MiB free-tier ceiling. Hosting it separately brings the Worker to
 * 1.56 MiB and costs nothing — the Studio still reads this repo's schemas.
 *
 *   npm run studio:dev      # http://localhost:3333
 *   npm run studio:deploy   # publishes to <studioHost>.sanity.studio
 */
export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  },
  studioHost: 'checkmate-connect',
});
