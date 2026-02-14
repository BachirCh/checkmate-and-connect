import { createClient } from '@sanity/client';

export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false, // CRITICAL: writes must not use CDN
  token: process.env.SANITY_WRITE_TOKEN!, // server-only, NO NEXT_PUBLIC_ prefix
});
