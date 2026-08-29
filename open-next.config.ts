import { defineCloudflareConfig } from '@opennextjs/cloudflare';

/**
 * OpenNext adapter config for Cloudflare Workers.
 *
 * Left at defaults deliberately. The site is almost entirely static — the
 * homepage and /about are ISR pages rebuilt by the Sanity webhook, and the
 * only dynamic surfaces are /admin, /studio and the API routes. Adding an
 * incremental-cache or queue binding would mean provisioning KV/R2/D1 for a
 * workload that does not need it, and every extra binding is another thing
 * that has to exist before a deploy can succeed.
 *
 * If ISR-across-regions or on-demand revalidation at scale becomes a
 * requirement, add `incrementalCache` here and provision the matching R2
 * bucket in wrangler.jsonc.
 */
export default defineCloudflareConfig();
