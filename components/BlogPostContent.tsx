'use client';

import { PortableText } from '@portabletext/react';
import { portableTextComponents } from '@/lib/sanity/portableTextComponents';
import { urlFor } from '@/lib/sanity/imageUrl';

type BlogPostContentProps = {
  post: {
    title: string;
    coverImage: any;
    publishedAt: string;
    author: string;
    excerpt?: string;
    body: any[];
  };
};

export default function BlogPostContent({ post }: BlogPostContentProps) {
  // Generate cover image URL if exists
  const coverImageUrl = post.coverImage
    ? urlFor(post.coverImage)
        .width(1200)
        .height(600)
        .fit('crop')
        .auto('format')
        .url()
    : null;

  // Format date for display
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      {/* Cover Image */}
      {coverImageUrl && (
        <img
          src={coverImageUrl}
          alt={post.title}
          className="w-full rounded-lg mb-8"
        />
      )}

      {/* Header Section */}
      <header className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <span>{post.author}</span>
          <span>•</span>
          <time dateTime={post.publishedAt}>{formattedDate}</time>
        </div>
      </header>

      {/* Body Content with Prose Typography */}
      <div className="prose prose-invert prose-lg max-w-none">
        <PortableText value={post.body} components={portableTextComponents} />
      </div>
    </>
  );
}
