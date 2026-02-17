import { client } from '@/lib/sanity/client';
import { blogPostBySlugQuery } from '@/lib/sanity/queries';
import { urlFor } from '@/lib/sanity/imageUrl';
import { notFound } from 'next/navigation';
import BlogPostContent from '@/components/BlogPostContent';
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

  return (
    <main className="min-h-screen bg-black text-white">
      <article className="max-w-3xl mx-auto px-4 py-16">
        <BlogPostContent post={post} />
      </article>
    </main>
  );
}
