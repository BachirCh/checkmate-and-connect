import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/members`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Only fetch blog posts if Sanity is configured
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    console.warn('Sanity not configured - returning static sitemap only');
    return staticPages;
  }

  try {
    // Dynamic import to avoid build-time errors when env vars missing
    const { client } = await import('@/lib/sanity/client');

    // Fetch blog post slugs from Sanity
    const blogPosts = await client.fetch<Array<{ slug: string; _updatedAt: string }>>(
      `*[_type == "post" && defined(slug.current)] | order(_updatedAt desc) {
        "slug": slug.current,
        _updatedAt
      }`
    );

    const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post._updatedAt),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

    return [...staticPages, ...blogPages];
  } catch (error) {
    // Gracefully handle Sanity errors
    console.warn('Failed to fetch blog posts for sitemap:', error);
    return staticPages;
  }
}
