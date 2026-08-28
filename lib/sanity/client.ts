import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  // Deliberately not the CDN. Pages are statically rendered and rebuilt by the
  // Sanity webhook (app/api/revalidate), so a fetch only happens at build or
  // revalidation time — there is no per-request cost to skipping the CDN, and
  // it removes the ~60s cache lag that would otherwise let a revalidation
  // rebuild the page with the *old* content.
  useCdn: false,
});
