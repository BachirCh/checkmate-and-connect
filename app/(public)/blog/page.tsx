import { client } from '@/lib/sanity/client';
import { blogPostsQuery } from '@/lib/sanity/queries';
import BlogCard from '@/components/BlogCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | Checkmate & Connect',
  description: 'Read about our latest meetups, community highlights, and key takeaways from our chess and business strategy events in Casablanca.',
};

type BlogPost = {
  _id: string;
  title: string;
  slug: { current: string };
  coverImage: any;
  excerpt: string;
  publishedAt: string;
  author: string;
};

export default async function BlogPage() {
  // Fetch published blog posts from Sanity - CRITICAL: defined(publishedAt) filter for draft protection
  const posts: BlogPost[] = await client.fetch(blogPostsQuery);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Blog
          </h1>
          <p className="text-gray-400 text-lg">
            {posts.length > 0
              ? `${posts.length} post${posts.length === 1 ? '' : 's'}`
              : 'No posts yet. Check back soon!'}
          </p>
        </div>

        {/* Blog Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">
              No posts yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
