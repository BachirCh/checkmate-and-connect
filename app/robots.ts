import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || site.url;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /certificate holds per-recipient hackathon pages that are
        // deliberately unlisted — they are noindex, and keeping crawlers out
        // stops the set becoming enumerable.
        disallow: ['/studio/', '/admin/', '/api/', '/certificate/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
