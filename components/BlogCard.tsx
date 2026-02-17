import Link from 'next/link';
import { urlFor } from '@/lib/sanity/imageUrl';

type BlogCardProps = {
  post: {
    _id: string;
    title: string;
    slug: { current: string };
    coverImage: any;
    excerpt: string;
    publishedAt: string;
    author: string;
  };
};

export default function BlogCard({ post }: BlogCardProps) {
  // Generate optimized cover image URL with Sanity CDN
  // - width/height: 800x450 for 16:9 aspect ratio
  // - fit('crop'): Uses hotspot for focal point (enabled in schema)
  // - auto('format'): Serves WebP/AVIF automatically to supporting browsers
  const imageUrl = post.coverImage
    ? urlFor(post.coverImage)
        .width(800)
        .height(450)
        .fit('crop')
        .auto('format')
        .url()
    : null;

  // Format date for display (e.g., "February 17, 2026")
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link
      href={`/blog/${post.slug.current}`}
      className="group block overflow-hidden rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all hover:scale-105"
    >
      {/* Cover Image */}
      {imageUrl && (
        <div className="aspect-video overflow-hidden">
          <img
            src={imageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h2 className="text-2xl font-bold mb-3 group-hover:text-gray-200 transition-colors">
          {post.title}
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-gray-400 mb-4 line-clamp-2">
            {post.excerpt}
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{post.author}</span>
          <span>•</span>
          <time dateTime={post.publishedAt}>{formattedDate}</time>
        </div>
      </div>
    </Link>
  );
}
