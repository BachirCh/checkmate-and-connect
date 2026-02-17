# Phase 7: Add Blog Functionality - Research

**Researched:** 2026-02-17
**Domain:** Next.js 16 App Router, Sanity CMS blog implementation, Portable Text rendering
**Confidence:** HIGH

## Summary

Phase 7 implements public-facing blog functionality for content already configured in Phase 1. The blog post schema (title, slug, coverImage, excerpt, body with Portable Text, publishedAt, author) exists in Sanity Studio at `/studio`. This phase builds the public blog pages: listing view at `/blog` showing posts in reverse chronological order, and detail view at `/blog/[slug]` for individual posts.

The implementation follows established patterns from Phase 5's member directory: Server Components for data fetching (eliminates loading states, better SEO), Sanity CDN image optimization with `urlFor()` helper, and revalidation with `revalidatePath` for cache invalidation. Blog-specific additions include Portable Text rendering with `@portabletext/react` (already installed), Open Graph metadata for social sharing, JSON-LD structured data for SEO, and optional webhook endpoint for on-demand revalidation when posts are published in Sanity.

**Primary recommendation:** Use Next.js App Router Server Components with Portable Text for blog content rendering. Implement ISR with on-demand revalidation via Sanity webhooks. Add metadata API for Open Graph tags and JSON-LD structured data. Follow existing member directory patterns for consistency.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@portabletext/react` | 6.0.2 | Render Sanity Portable Text | Official package from Sanity, already installed in Phase 1 |
| `@sanity/image-url` | 2.0.3 | Generate optimized image URLs | Official Sanity CDN integration, already configured |
| `next-sanity` | 12.1.0 | Sanity integration utilities | Official Sanity toolkit for Next.js, already installed |
| Next.js Metadata API | 16.1.6 | SEO, Open Graph, structured data | Built into Next.js 16, native support |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-share` | 5.x | Social sharing buttons (optional) | If custom sharing UI needed beyond native browser sharing |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@portabletext/react` | `@sanity/block-content-to-react` | Deprecated in 2022, don't use |
| Server Components | Client Components with SWR | Worse SEO, loading states, more complex |
| Metadata API | `next-seo` package | Unnecessary dependency, Next.js 16 has native support |

**Installation:**
```bash
# No new packages needed - all dependencies already installed in Phase 1
# Verify with: npm list @portabletext/react @sanity/image-url next-sanity
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── (public)/
│   └── blog/
│       ├── page.tsx              # Blog listing page
│       └── [slug]/
│           └── page.tsx          # Individual blog post
├── api/
│   └── revalidate/
│       └── route.ts              # Webhook endpoint (optional)
└── actions/
    └── blog.ts                   # Server Actions (if needed)

components/
├── BlogCard.tsx                  # Blog post card for listing
├── BlogPostContent.tsx           # Portable Text renderer
└── ShareButtons.tsx              # Social sharing (optional)

lib/sanity/
├── queries.ts                    # GROQ queries (already has blogPostsQuery, blogPostBySlugQuery)
└── portableTextComponents.tsx    # Custom Portable Text components
```

### Pattern 1: Server Component Data Fetching (Blog Listing)
**What:** Fetch blog posts directly in Server Component, no client-side loading
**When to use:** Blog listing pages, matches existing member directory pattern
**Example:**
```typescript
// Source: Existing pattern from app/(public)/members/page.tsx
// app/(public)/blog/page.tsx
import { client } from '@/lib/sanity/client';
import BlogCard from '@/components/BlogCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | Checkmate & Connect',
  description: 'Read about our chess and entrepreneurship meetups, key takeaways, and community highlights.',
  openGraph: {
    title: 'Blog | Checkmate & Connect',
    description: 'Read about our chess and entrepreneurship meetups, key takeaways, and community highlights.',
    type: 'website',
  },
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
  // Fetch published blog posts from Sanity - reverse chronological
  const query = `*[_type == "blogPost" && defined(publishedAt)] | order(publishedAt desc) {
    _id,
    title,
    slug,
    coverImage,
    excerpt,
    publishedAt,
    author
  }`;

  const posts: BlogPost[] = await client.fetch(query);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
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
```

### Pattern 2: Dynamic Route with generateStaticParams (Blog Post Detail)
**What:** Use dynamic routes with ISR for individual blog posts
**When to use:** Detail pages that need SEO and dynamic metadata
**Example:**
```typescript
// Source: Next.js 16 official docs + existing Sanity integration
// app/(public)/blog/[slug]/page.tsx
import { client } from '@/lib/sanity/client';
import BlogPostContent from '@/components/BlogPostContent';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ slug: string }>;
};

// Generate static params for all blog posts at build time
export async function generateStaticParams() {
  const slugs = await client.fetch<Array<{ slug: string }>>(
    `*[_type == "blogPost" && defined(slug.current)] { "slug": slug.current }`
  );

  return slugs.map((post) => ({
    slug: post.slug,
  }));
}

// Generate metadata for SEO and Open Graph
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await client.fetch(
    `*[_type == "blogPost" && slug.current == $slug][0] {
      title,
      excerpt,
      coverImage,
      author,
      publishedAt
    }`,
    { slug }
  );

  if (!post) return { title: 'Post Not Found' };

  const ogImage = post.coverImage
    ? urlFor(post.coverImage).width(1200).height(630).url()
    : undefined;

  return {
    title: `${post.title} | Checkmate & Connect`,
    description: post.excerpt || 'Read our latest blog post',
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const post = await client.fetch(
    `*[_type == "blogPost" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      coverImage,
      excerpt,
      body,
      publishedAt,
      author
    }`,
    { slug }
  );

  if (!post) notFound();

  return (
    <main className="min-h-screen bg-black text-white">
      <article className="max-w-3xl mx-auto px-4 py-16">
        <BlogPostContent post={post} />
      </article>
    </main>
  );
}
```

### Pattern 3: Portable Text Rendering with Custom Components
**What:** Render Sanity Portable Text with custom components for images, links, etc.
**When to use:** Blog post body content rendering
**Example:**
```typescript
// Source: @portabletext/react official docs + Sanity image optimization
// lib/sanity/portableTextComponents.tsx
import { PortableTextComponents } from '@portabletext/react';
import { urlFor } from '@/lib/sanity/imageUrl';
import Image from 'next/image';

export const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;

      const imageUrl = urlFor(value)
        .width(800)
        .auto('format')
        .url();

      return (
        <figure className="my-8">
          <img
            src={imageUrl}
            alt={value.alt || 'Blog post image'}
            className="w-full rounded-lg"
          />
          {value.caption && (
            <figcaption className="text-center text-gray-400 text-sm mt-2">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  marks: {
    link: ({ children, value }) => {
      const rel = value.href.startsWith('/') ? undefined : 'noopener noreferrer';
      const target = value.href.startsWith('/') ? undefined : '_blank';

      return (
        <a
          href={value.href}
          rel={rel}
          target={target}
          className="text-blue-400 hover:underline"
        >
          {children}
        </a>
      );
    },
  },
  block: {
    h2: ({ children }) => (
      <h2 className="text-3xl font-bold mt-8 mb-4">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-bold mt-6 mb-3">{children}</h3>
    ),
    normal: ({ children }) => (
      <p className="text-gray-300 leading-relaxed mb-4">{children}</p>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 mb-4 text-gray-300">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-300">
        {children}
      </ol>
    ),
  },
};

// components/BlogPostContent.tsx
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
    body: any[];
  };
};

export default function BlogPostContent({ post }: BlogPostContentProps) {
  const coverImageUrl = post.coverImage
    ? urlFor(post.coverImage)
        .width(1200)
        .height(600)
        .fit('crop')
        .auto('format')
        .url()
    : null;

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

      {/* Post Header */}
      <header className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-gray-400 text-sm">
          <span>{post.author}</span>
          <span>•</span>
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </div>
      </header>

      {/* Post Body */}
      <div className="prose prose-invert prose-lg max-w-none">
        <PortableText value={post.body} components={portableTextComponents} />
      </div>
    </>
  );
}
```

### Pattern 4: JSON-LD Structured Data for SEO
**What:** Add Article schema structured data for rich search results
**When to use:** Blog post detail pages to improve SEO
**Example:**
```typescript
// Source: Next.js 16 JSON-LD guide
// Add to app/(public)/blog/[slug]/page.tsx
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await client.fetch(/* query */);

  if (!post) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
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
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        {/* Blog post content */}
      </main>
    </>
  );
}
```

### Pattern 5: On-Demand Revalidation with Sanity Webhook
**What:** Webhook endpoint that triggers revalidation when blog posts are published in Sanity
**When to use:** Production deployment to ensure content updates appear immediately
**Example:**
```typescript
// Source: Sanity webhook docs + Netlify ISR support
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';

export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody(
      req,
      process.env.SANITY_WEBHOOK_SECRET
    );

    // Verify webhook signature
    if (!isValidSignature) {
      return NextResponse.json(
        { message: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Revalidate blog pages when blogPost is published/updated/deleted
    if (body._type === 'blogPost') {
      await revalidatePath('/blog');

      // If specific post, revalidate its detail page
      if (body.slug?.current) {
        await revalidatePath(`/blog/${body.slug.current}`);
      }

      return NextResponse.json({
        revalidated: true,
        now: Date.now(),
      });
    }

    return NextResponse.json({
      message: 'No revalidation needed',
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json(
      { message: 'Error processing webhook' },
      { status: 500 }
    );
  }
}
```

### Pattern 6: Dynamic Sitemap Update
**What:** Update existing sitemap.ts to include blog posts
**When to use:** Already exists at `app/sitemap.ts`, needs update to fix `_type` from "post" to "blogPost"
**Example:**
```typescript
// Source: Existing app/sitemap.ts (needs fix)
// CURRENT BUG: Line 40 queries `*[_type == "post"...]` but schema uses "blogPost"
// FIX: Change to `*[_type == "blogPost"...]`

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ... existing code ...

  try {
    const { client } = await import('@/lib/sanity/client');

    // FIX: Change "post" to "blogPost" to match schema
    const blogPosts = await client.fetch<Array<{ slug: string; _updatedAt: string }>>(
      `*[_type == "blogPost" && defined(slug.current)] | order(_updatedAt desc) {
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
    console.warn('Failed to fetch blog posts for sitemap:', error);
    return staticPages;
  }
}
```

### Anti-Patterns to Avoid
- **Client-side data fetching for blog listing:** Use Server Components instead (better SEO, no loading states)
- **Not using ISR/revalidation:** Blog posts become stale without cache invalidation
- **Manual HTML rendering of Portable Text:** Use `@portabletext/react` to avoid XSS and rendering bugs
- **Forgetting Open Graph images:** Social shares will look unprofessional without og:image
- **Not filtering by publishedAt:** Draft posts (no publishedAt) will appear on live site

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Portable Text rendering | Custom block renderer | `@portabletext/react` | Handles all edge cases (nested blocks, marks, custom types), prevents XSS |
| Image optimization | Manual URL construction | `urlFor()` from `@sanity/image-url` | Sanity CDN handles format negotiation (WebP/AVIF), focal points, compression |
| Open Graph tags | Manual meta tags | Next.js Metadata API | Type-safe, handles merging, prevents duplicates |
| Webhook signature verification | Custom HMAC validation | `parseBody` from `next-sanity/webhook` | Secure, tested, handles edge cases |
| Social sharing | Custom share buttons | Native Web Share API or `react-share` | Browser-native sharing is better UX on mobile |

**Key insight:** Sanity and Next.js provide battle-tested solutions for CMS content rendering. Custom implementations introduce security risks (XSS), performance issues (image optimization), and maintenance burden (keeping up with spec changes).

## Common Pitfalls

### Pitfall 1: Portable Text XSS Vulnerability
**What goes wrong:** Rendering untrusted Portable Text with `dangerouslySetInnerHTML` or custom HTML string rendering creates XSS attack vectors.
**Why it happens:** Developers try to render Portable Text as HTML strings without proper sanitization.
**How to avoid:** Always use `@portabletext/react` which escapes all content by default. React's built-in XSS protection applies when rendering Portable Text components.
**Warning signs:** Using `dangerouslySetInnerHTML` anywhere in blog post rendering code.

### Pitfall 2: Missing `publishedAt` Filter
**What goes wrong:** Draft blog posts (no `publishedAt` date) appear on public blog listing.
**Why it happens:** GROQ query filters by `_type == "blogPost"` without checking `defined(publishedAt)`.
**How to avoid:** Always include `&& defined(publishedAt)` in public-facing queries. Draft posts should only be visible in Sanity Studio.
**Warning signs:** Unpublished posts appearing on live site, QA finding draft content.

### Pitfall 3: Sitemap Type Mismatch
**What goes wrong:** Blog posts don't appear in sitemap.xml because query uses wrong `_type`.
**Why it happens:** Existing `app/sitemap.ts` queries `_type == "post"` but schema is `blogPost`.
**How to avoid:** Use exact schema type names in GROQ queries. Verify sitemap output with `/sitemap.xml`.
**Warning signs:** Blog posts exist but don't appear in sitemap, Google Search Console warnings.

### Pitfall 4: Image Optimization Forgotten
**What goes wrong:** Blog post images load slowly, don't support modern formats (WebP/AVIF).
**Why it happens:** Using raw Sanity image URLs without `urlFor()` helper or forgetting `.auto('format')`.
**How to avoid:** Always use `urlFor(image).width(X).auto('format').url()` pattern. Follow existing `MemberCard.tsx` example.
**Warning signs:** Large image file sizes, no format negotiation, poor Lighthouse scores.

### Pitfall 5: No Revalidation Strategy
**What goes wrong:** Blog posts published in Sanity Studio don't appear on live site for hours/days.
**Why it happens:** ISR cache isn't invalidated when content changes.
**How to avoid:** Implement webhook endpoint with `revalidatePath('/blog')`. Configure Sanity webhook in project settings.
**Warning signs:** Admins complaining "I published a post but it's not showing up."

### Pitfall 6: Open Graph Image Missing
**What goes wrong:** Blog post links shared on social media show no preview image or wrong image.
**Why it happens:** Not setting `openGraph.images` in `generateMetadata()` or using wrong image dimensions.
**How to avoid:** Always generate Open Graph image with 1200x630 dimensions using `urlFor().width(1200).height(630).url()`.
**Warning signs:** Twitter/Facebook previews missing images, social shares look unprofessional.

### Pitfall 7: Duplicate JSON-LD During Hydration
**What goes wrong:** JSON-LD script tags appear twice in HTML, confusing Google's structured data parser.
**Why it happens:** Adding JSON-LD in Server Component causes duplication during hydration.
**How to avoid:** Add JSON-LD script in Server Component (not Client Component). Next.js 16 handles this correctly in Server Components.
**Warning signs:** Google Rich Results Test showing duplicate structured data.

### Pitfall 8: Pagination Without Canonicals
**What goes wrong:** Paginated blog listing creates duplicate content issues for SEO.
**Why it happens:** Not implementing this phase, but important if Phase 8+ adds pagination.
**How to avoid:** If pagination added later, canonicalize paginated pages to page 1 or use self-referencing canonicals with rel="next/prev".
**Warning signs:** Google Search Console showing duplicate content warnings on blog listing pages.

## Code Examples

Verified patterns from official sources:

### Portable Text Rendering
```typescript
// Source: @portabletext/react npm package
import { PortableText } from '@portabletext/react';

// Basic usage
<PortableText value={post.body} />

// With custom components (RECOMMENDED)
<PortableText
  value={post.body}
  components={portableTextComponents}
/>

// IMPORTANT: components object should be stable (not recreated on every render)
// Define portableTextComponents outside component or use useMemo
```

### Sanity Image Optimization
```typescript
// Source: Existing codebase (MemberCard.tsx)
import { urlFor } from '@/lib/sanity/imageUrl';

// Blog post cover image (16:9 aspect ratio)
const coverImageUrl = urlFor(post.coverImage)
  .width(1200)
  .height(675)
  .fit('crop')
  .auto('format')  // Serves WebP/AVIF to supporting browsers
  .url();

// Open Graph image (1.91:1 aspect ratio per OG spec)
const ogImageUrl = urlFor(post.coverImage)
  .width(1200)
  .height(630)
  .fit('crop')
  .auto('format')
  .url();
```

### GROQ Query Performance
```typescript
// Source: Sanity GROQ performance docs
// GOOD: Projection limits fetched fields
const query = `*[_type == "blogPost" && defined(publishedAt)] | order(publishedAt desc) {
  _id,
  title,
  slug,
  coverImage,
  excerpt,
  publishedAt,
  author
}`;

// BAD: Fetching entire document (slow, transfers unnecessary data)
const badQuery = `*[_type == "blogPost" && defined(publishedAt)] | order(publishedAt desc)`;
```

### Metadata API
```typescript
// Source: Next.js 16 generateMetadata docs
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await fetchPost(params.slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      images: [{ url: ogImageUrl }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [ogImageUrl],
    },
  };
}
```

### Revalidation Pattern
```typescript
// Source: Existing codebase (app/actions/members.ts)
import { revalidatePath } from 'next/cache';

// After blog post mutation
revalidatePath('/blog');              // Blog listing page
revalidatePath(`/blog/${slug}`);      // Individual post page
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@sanity/block-content-to-react` | `@portabletext/react` | 2022 | Official package, better React 18+ support |
| `getStaticProps` + `getStaticPaths` | `generateStaticParams` | Next.js 13+ | Simpler API, better TypeScript support |
| `next-seo` package | Next.js Metadata API | Next.js 13+ | Native support, no extra dependency |
| `revalidate: 60` (time-based) | `revalidatePath` (on-demand) | Next.js 13+ | Immediate updates instead of waiting |
| Separate API routes for data | Server Components | Next.js 13+ | Fewer round trips, better DX |

**Deprecated/outdated:**
- `@sanity/block-content-to-react`: Use `@portabletext/react` instead
- `getStaticProps`/`getStaticPaths` in App Router: Use `generateStaticParams` and Server Components
- `next-seo` package: Use Next.js Metadata API
- Client-side Sanity queries with `useSWR`: Use Server Components with `client.fetch()`

## Open Questions

1. **Should we add pagination to blog listing?**
   - What we know: Requirements say "reverse chronological order" but don't mention pagination
   - What's unclear: Will blog grow to 50+ posts where pagination is needed?
   - Recommendation: Start without pagination (simpler). Add in Phase 8+ if needed. If added, use URL params like `/blog?page=2` and canonicalize to page 1 to avoid SEO duplicate content issues.

2. **Should we implement social sharing buttons?**
   - What we know: Requirements say "social sharing buttons with Open Graph tags" (BLOG-05)
   - What's unclear: Custom UI buttons vs native browser share API?
   - Recommendation: Use native Web Share API on mobile (better UX), fallback to basic copy-link button on desktop. This avoids dependency on `react-share` package and provides better mobile experience.

3. **Should blog post authors be references to members or just strings?**
   - What we know: Current schema has `author` as string field
   - What's unclear: Should authors link to member profiles?
   - Recommendation: Keep as string for Phase 7 (simpler). Consider member reference in future if blog authors should appear in member directory.

4. **Do we need categories/tags for blog posts?**
   - What we know: Requirements don't mention categories or tags
   - What's unclear: Will blog need filtering/organization beyond chronological?
   - Recommendation: Skip categories/tags in Phase 7. Add in future phase if content organization becomes important. Don't over-engineer for hypothetical needs.

## Sources

### Primary (HIGH confidence)
- Next.js 16.1.6 Official Documentation (last updated 2026-02-11)
  - [Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
  - [Dynamic Routes](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes)
  - [ISR Guide](https://nextjs.org/docs/app/guides/incremental-static-regeneration)
  - [JSON-LD Guide](https://nextjs.org/docs/app/guides/json-ld)
  - [revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)
- Sanity Official Documentation
  - [Portable Text Presentation](https://www.sanity.io/docs/developer-guides/presenting-block-text)
  - [High Performance GROQ](https://www.sanity.io/docs/developer-guides/high-performance-groq)
  - [Webhooks](https://www.sanity.io/docs/webhooks)
  - [Portable Text React](https://www.sanity.io/docs/portable-text-to-react)
- `@portabletext/react` v6.0.2 (npm package documentation)
- Existing codebase patterns:
  - `/Users/mac/Documents/Code/C&C/app/(public)/members/page.tsx` - Server Component data fetching
  - `/Users/mac/Documents/Code/C&C/components/MemberCard.tsx` - Sanity image optimization with `urlFor()`
  - `/Users/mac/Documents/Code/C&C/app/actions/members.ts` - `revalidatePath` pattern
  - `/Users/mac/Documents/Code/C&C/app/sitemap.ts` - Dynamic sitemap (needs fix for blogPost type)

### Secondary (MEDIUM confidence)
- [Sanity Webhooks and On-demand Revalidation in Next.js](https://victoreke.com/blog/sanity-webhooks-and-on-demand-revalidation-in-nextjs) - Implementation guide
- [How to Create Secure Sanity CMS Webhooks with Next.js App Router](https://www.buildwithmatija.com/blog/secure-sanity-webhooks-nextjs-app-router) - Security patterns
- [Image Optimization with Next.js and Sanity.io](https://medium.com/@drazen.bebic/image-optimization-with-next-js-and-sanity-io-6956b9ceae4f) - Best practices (Jan 2026)
- [Netlify Next.js ISR Support](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/) - On-demand revalidation confirmed

### Tertiary (LOW confidence)
- WebSearch results for pagination SEO - various blog articles, needs validation with Google Search Central docs
- WebSearch results for social sharing - `react-share` alternatives, prefer native Web Share API

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All packages already installed and documented in official sources
- Architecture: HIGH - Patterns verified in existing codebase (Phase 5 member directory)
- Pitfalls: HIGH - Based on official documentation warnings and existing codebase patterns
- Open questions: MEDIUM - Recommendations based on requirements interpretation, user decisions may differ

**Research date:** 2026-02-17
**Valid until:** 2026-03-17 (30 days - stack is stable, Next.js 16 and Sanity patterns unlikely to change)

**Key findings:**
1. No new packages needed - all dependencies already installed in Phase 1
2. Blog schema already exists in Sanity Studio - Phase 7 focuses on public-facing pages
3. Existing member directory patterns (Phase 5) apply directly to blog implementation
4. Sitemap.ts has a bug: queries `_type == "post"` but schema is `blogPost` (needs fix)
5. Webhook revalidation is optional for Phase 7 but recommended for production
