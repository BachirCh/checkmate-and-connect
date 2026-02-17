import { client } from '@/lib/sanity/client';
import { blogPostBySlugQuery } from '@/lib/sanity/queries';
import { urlFor } from '@/lib/sanity/imageUrl';
import { notFound } from 'next/navigation';
import BlogPostContent from '@/components/BlogPostContent';
import ShareButton from '@/components/ShareButton';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  // Fetch all blog post slugs for static generation at build time
  const slugs = await client.fetch<{ slug: string }[]>(
    `*[_type == "blogPost" && defined(slug.current)] { "slug": slug.current }`
  );

  return slugs.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // Fetch post for metadata
  const post = await client.fetch(blogPostBySlugQuery, { slug });

  if (!post) {
    return {
      title: 'Post Not Found | Checkmate & Connect',
    };
  }

  // Generate Open Graph image URL (1200x630 per OG spec)
  const ogImage = post.coverImage
    ? urlFor(post.coverImage).width(1200).height(630).url()
    : null;

  return {
    title: `${post.title} | Checkmate & Connect`,
    description: post.excerpt || 'Read the latest from Checkmate & Connect',
    openGraph: {
      title: post.title,
      description: post.excerpt || 'Read the latest from Checkmate & Connect',
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: ogImage ? [ogImage] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || 'Read the latest from Checkmate & Connect',
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  // Fetch full post including body
  const post = await client.fetch(blogPostBySlugQuery, { slug });

  if (!post) {
    notFound();
  }

  // Generate full URL for sharing
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  const fullUrl = `${baseUrl}/blog/${slug}`;

  // Create JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || '',
    image: post.coverImage
      ? urlFor(post.coverImage).width(1200).height(630).url()
      : undefined,
    datePublished: post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Checkmate & Connect',
      url: baseUrl,
    },
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-3xl mx-auto px-4 py-16">
        <BlogPostContent post={post} />

        {/* Social sharing button */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <ShareButton
            title={post.title}
            text={post.excerpt || post.title}
            url={fullUrl}
          />
        </div>
      </article>
    </main>
  );
}
