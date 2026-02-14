# Phase 1: Foundation & Infrastructure - Research

**Researched:** 2026-02-14
**Domain:** Full-stack Next.js application foundation with CMS, database, hosting, and privacy architecture
**Confidence:** HIGH

## Summary

Phase 1 establishes the complete technical foundation for a modern, privacy-first web application using Next.js 16, Sanity CMS v3, Supabase, Netlify, and Tailwind CSS v4. This research covers the current state of these technologies as of February 2026, with emphasis on recent breaking changes in Next.js 16 (async params, middleware → proxy.ts, cache components) and Tailwind v4's CSS-first configuration approach.

The stack represents industry-standard choices for 2026, with Next.js 16 bringing Turbopack stability (2-5x faster builds), React 19.2, and a fundamental shift to opt-in caching via Cache Components. Tailwind v4 simplifies setup dramatically with CSS-first configuration. Sanity v3 provides embedded Studio capabilities with real-time collaboration. Supabase offers PostgreSQL with Row Level Security for privacy-first architecture. Netlify supports Next.js 16 with zero-configuration deployment via OpenNext adapter.

Critical pitfalls identified: Next.js App Router server components confusion (components are Server Components by default), fetch caching surprises (all fetch requests cache by default), async params breaking changes (must await params/searchParams), Sanity image optimization misconceptions (upload high-res originals, let CDN optimize), and privacy architecture implementation gaps (opt-in defaults require deliberate configuration, not just compliance theater).

**Primary recommendation:** Use Next.js 16 with Turbopack (now default), embrace opt-in caching via "use cache" directive, configure Tailwind v4 with CSS-first approach, embed Sanity Studio in Next.js app for unified deployment, implement Row Level Security policies from day one, and configure comprehensive staging environment with branch-based deployments on Netlify.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16+ | Full-stack React framework with App Router | Industry standard for React SSR/SSG; Turbopack now stable and default; Cache Components provide explicit opt-in caching |
| React | 19.2+ | UI library | Required by Next.js 16; includes View Transitions, useEffectEvent, Activity component |
| TypeScript | 5.1+ | Type safety | Next.js 16 minimum requirement; built-in support with zero config |
| Tailwind CSS | v4 | Styling framework | CSS-first config simplifies setup; AVIF support; auto-scans project (no config file needed) |
| Sanity CMS | v3+ | Headless CMS | Real-time collaboration, embedded Studio, image CDN with on-the-fly optimization, Portable Text |
| Supabase | Latest | PostgreSQL database + auth | Row Level Security for privacy-first architecture; @supabase/ssr for Server Components |
| Netlify | N/A (platform) | Hosting + CI/CD | Zero-config Next.js 16 support via OpenNext adapter; automatic deploys from Git |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next-sanity | Latest | Sanity + Next.js integration | Essential for Sanity CMS integration; provides client, Studio embedding, webhooks |
| @sanity/image-url | Latest | Image URL generation | Constructing optimized Sanity image URLs with transforms |
| @portabletext/react | Latest | Portable Text rendering | Rendering Sanity's structured rich text content |
| @supabase/ssr | Latest | Supabase Server-Side Rendering | Replaces deprecated @supabase/auth-helpers-nextjs; universal SSR support |
| @tailwindcss/postcss | Latest | Tailwind v4 PostCSS plugin | Required for Tailwind v4; replaces multiple v3 plugins |
| sharp | Auto-installed | Image optimization | Next.js automatically installs and uses for image processing |
| @next/eslint-plugin-next | Latest | Linting | Recommended for Next.js best practices; now defaults to Flat Config format |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Sanity CMS | Contentful, Strapi, Payload CMS | Sanity offers better DX with embedded Studio, real-time collab, and superior image CDN |
| Supabase | Firebase, PlanetScale, Neon | Supabase provides PostgreSQL + RLS for privacy; Firebase lacks RLS; PlanetScale lacks auth |
| Netlify | Vercel, Railway, Fly.io | Vercel is primary Next.js platform but costlier; Netlify offers comparable features with better free tier |
| Tailwind CSS | CSS Modules, Styled Components | Tailwind v4 simplifies setup dramatically; utility-first is ecosystem standard for 2026 |

**Installation:**

```bash
# Create Next.js 16 project with defaults (App Router, TypeScript, Tailwind, ESLint, Turbopack)
npx create-next-app@latest

# Core dependencies
npm install next-sanity @sanity/client @sanity/image-url @portabletext/react
npm install @supabase/supabase-js @supabase/ssr

# Tailwind v4 (if not using create-next-app defaults)
npm install tailwindcss @tailwindcss/postcss postcss

# Dev dependencies
npm install -D @types/node @types/react @types/react-dom
```

## Architecture Patterns

### Recommended Project Structure

```
app/
├── (public)/              # Public route group (no auth required)
│   ├── page.tsx          # Homepage
│   ├── blog/             # Blog listing & posts
│   └── members/          # Member directory (public view)
├── (admin)/              # Admin route group (auth required)
│   ├── layout.tsx        # Auth wrapper
│   └── dashboard/        # Admin dashboard
├── api/                  # API routes
│   ├── sanity/           # Sanity webhooks
│   └── contact/          # Contact form handler
├── studio/               # Embedded Sanity Studio
│   └── [[...index]]/
│       └── page.tsx      # Studio route
├── layout.tsx            # Root layout
└── globals.css           # Tailwind imports

lib/
├── sanity/
│   ├── client.ts         # Sanity client config
│   ├── queries.ts        # GROQ queries
│   └── schemas/          # Content schemas
│       ├── member.ts
│       └── blogPost.ts
└── supabase/
    ├── client.ts         # Browser client
    ├── server.ts         # Server client
    └── middleware.ts     # Auth middleware

sanity.config.ts          # Sanity Studio config
next.config.ts            # Next.js config
postcss.config.mjs        # PostCSS/Tailwind config
.env.local                # Environment variables (gitignored)
```

### Pattern 1: Server Components by Default

**What:** In Next.js 16 App Router, all components are Server Components by default unless marked with `"use client"`.

**When to use:** Use Server Components for data fetching, database queries, and static content. Only add `"use client"` for interactive elements (onClick, useState, useEffect, browser APIs).

**Example:**

```typescript
// app/blog/page.tsx - Server Component (no directive needed)
import { client } from '@/lib/sanity/client';

export default async function BlogPage() {
  // Direct async data fetching in component
  const posts = await client.fetch(`*[_type == "blogPost"]`);

  return (
    <div>
      {posts.map(post => (
        <BlogCard key={post._id} post={post} />
      ))}
    </div>
  );
}

// components/BlogCard.tsx - Client Component for interactivity
'use client';

export function BlogCard({ post }) {
  return (
    <div onClick={() => console.log('clicked')}>
      {post.title}
    </div>
  );
}
```

### Pattern 2: Async Params (Next.js 16 Breaking Change)

**What:** Next.js 16 requires awaiting `params` and `searchParams` in all page components and route handlers.

**When to use:** All dynamic routes, all pages with searchParams, metadata generation functions.

**Example:**

```typescript
// app/blog/[slug]/page.tsx
export default async function BlogPost({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  // MUST await params and searchParams
  const { slug } = await params;
  const { preview } = await searchParams;

  const post = await client.fetch(`*[slug.current == $slug][0]`, { slug });

  return <article>{post.title}</article>;
}

// Metadata generation also requires async params
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await client.fetch(`*[slug.current == $slug][0]`, { slug });

  return {
    title: post.title,
    description: post.excerpt,
  };
}
```

### Pattern 3: Opt-In Caching with "use cache"

**What:** Next.js 16 introduces Cache Components with explicit opt-in caching using `"use cache"` directive. All dynamic code runs at request time by default.

**When to use:** Cache static pages, expensive computations, stable data fetches. Combine with Partial Pre-Rendering for dynamic sections.

**Example:**

```typescript
// next.config.ts - Enable Cache Components
const nextConfig = {
  cacheComponents: true,
};

export default nextConfig;

// app/blog/page.tsx - Opt into caching
'use cache';

export default async function BlogPage() {
  const posts = await client.fetch(`*[_type == "blogPost"]`);
  return <div>{/* render posts */}</div>;
}

// Or cache specific functions
async function getCachedPosts() {
  'use cache';
  return await client.fetch(`*[_type == "blogPost"]`);
}
```

### Pattern 4: Sanity Image Optimization

**What:** Upload high-resolution originals to Sanity; use URL parameters for on-the-fly optimization. Never pre-optimize images before upload.

**When to use:** All images uploaded to Sanity CMS.

**Example:**

```typescript
// lib/sanity/imageUrl.ts
import imageUrlBuilder from '@sanity/image-url';
import { client } from './client';

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}

// components/OptimizedImage.tsx
import Image from 'next/image';
import { urlFor } from '@/lib/sanity/imageUrl';

export function OptimizedImage({ image, alt }) {
  return (
    <Image
      src={urlFor(image).width(800).quality(75).format('avif').url()}
      alt={alt}
      width={800}
      height={600}
      sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 30vw"
    />
  );
}

// next.config.ts - Add Sanity remote patterns
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 14400, // 4 hours (Next.js 16 default)
  },
};
```

### Pattern 5: Supabase Server Components

**What:** Use `@supabase/ssr` with separate client/server utilities for proper cookie handling.

**When to use:** All Supabase authentication and database operations.

**Example:**

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}

// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// app/(admin)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <div>Welcome {user.email}</div>;
}
```

### Pattern 6: Row Level Security Policies

**What:** Define PostgreSQL RLS policies in Supabase to enforce privacy at database level.

**When to use:** Always. Enable RLS on all tables and define explicit policies for access control.

**Example:**

```sql
-- Enable RLS on members table
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all published member profiles
CREATE POLICY "Public members are viewable by everyone"
  ON members FOR SELECT
  USING (status = 'published');

-- Policy: Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON members FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Only admins can insert new members
CREATE POLICY "Admins can insert members"
  ON members FOR INSERT
  WITH CHECK (
    auth.jwt()->>'role' = 'admin'
  );

-- Always index columns used in RLS policies (critical for performance)
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_user_id ON members(user_id);
```

### Pattern 7: Environment Variables

**What:** Use `.env.local` for secrets; `NEXT_PUBLIC_` prefix for client-exposed variables.

**When to use:** All configuration. Never commit `.env.local`. Use Netlify environment variables for production.

**Example:**

```bash
# .env.local (gitignored)

# Sanity (client-exposed - needed for browser client)
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01

# Sanity (server-only - for webhooks)
SANITY_REVALIDATE_SECRET=your_webhook_secret

# Supabase (client-exposed - uses anon key which is safe)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Supabase (server-only - NEVER expose service_role key)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# reCAPTCHA (client-exposed - site key is public)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key

# reCAPTCHA (server-only - secret key for verification)
RECAPTCHA_SECRET_KEY=your_secret_key
```

### Pattern 8: Netlify Branch Deploys

**What:** Configure branch-based deployments for staging and production environments.

**When to use:** Set up from day one for proper CI/CD workflow.

**Example:**

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"
  NEXT_USE_NETLIFY_EDGE = "true"

# Production context (main branch)
[context.production.environment]
  NEXT_PUBLIC_SANITY_DATASET = "production"
  NODE_ENV = "production"

# Staging context (staging branch)
[context.staging.environment]
  NEXT_PUBLIC_SANITY_DATASET = "staging"
  NODE_ENV = "production"

# Preview context (pull requests)
[context.deploy-preview.environment]
  NEXT_PUBLIC_SANITY_DATASET = "development"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### Anti-Patterns to Avoid

- **Using `"use client"` everywhere**: Defeats performance benefits of Server Components; only use for interactivity
- **Assuming fetch doesn't cache**: Next.js 16 caches fetch by default; use `cache: "no-store"` for dynamic data
- **Not awaiting params/searchParams**: Next.js 16 breaking change; will cause runtime errors
- **Pre-optimizing images before Sanity upload**: Upload high-res originals; let Sanity CDN optimize on-the-fly
- **Exposing service_role key**: Only use in server-side code; never expose to client
- **Using user_metadata in RLS policies**: user_metadata can be modified by users; use auth.uid() or auth.jwt() claims only
- **Forgetting to index RLS policy columns**: Missing indexes are the top RLS performance killer
- **Hardcoding configuration**: Use environment variables for all API keys and configuration
- **Skipping staging environment**: Set up staging branch and Netlify context from day one

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image optimization | Custom image processing pipeline | Next.js Image + Sanity CDN | 40-70% compression via Sharp, format conversion (AVIF/WebP), responsive srcsets, CDN caching, on-the-fly transforms |
| Authentication | Custom JWT system | Supabase Auth | Session management, OAuth providers, email verification, password reset, magic links, RLS integration |
| Database access control | Application-layer permission checks | Supabase Row Level Security | Database-enforced security, works with any client, prevents bypass via direct DB access |
| Form spam protection | Custom bot detection | reCAPTCHA v3 + honeypot + rate limiting | ML-based risk scoring, invisible to users, honeypot catches simple bots, rate limiting handles volume attacks |
| Environment configuration | Manual env file management | Next.js built-in + Netlify contexts | Type-safe access, build-time inlining for NEXT_PUBLIC_, branch-based configs, automatic Netlify injection |
| Static site generation | Custom build scripts | Next.js generateStaticParams | Automatic parallel builds, incremental generation, type-safe params, integrates with ISR |
| Content versioning | Custom draft system | Sanity drafts + perspectives | Built-in draft/published workflows, real-time preview, content scheduling, revision history |
| CI/CD pipeline | Jenkins, CircleCI | Netlify Git-connected deploys | Zero config, automatic builds on push, preview deploys for PRs, branch contexts, instant rollbacks |

**Key insight:** Modern web development in 2026 is about composing best-in-class services rather than building infrastructure. Every item above represents months of edge-case handling, security patches, and performance optimization. Use proven solutions; focus effort on business logic.

## Common Pitfalls

### Pitfall 1: Server Components Confusion

**What goes wrong:** Runtime errors like "You're importing a component that needs useState. It only works in a Client Component but none of its parents are marked with 'use client'."

**Why it happens:** Next.js 16 App Router makes all components Server Components by default. Developers coming from Pages Router or classic React expect client-side rendering by default.

**How to avoid:**
- Only add `"use client"` when you need interactivity (useState, useEffect, onClick, browser APIs)
- Keep client boundaries minimal—wrap interactive components, not entire pages
- Remember: Server Components can import Client Components, but not vice versa
- Server Components can async/await; Client Components cannot

**Warning signs:**
- Seeing "use client" at the top of every file
- Errors about hooks not working
- Window/document undefined errors

### Pitfall 2: Fetch Caching Surprises

**What goes wrong:** Data appears stale even after database updates. Forms don't show submitted data. Admin dashboards show cached content.

**Why it happens:** Next.js 16 defaults to caching all fetch requests. This is great for static content but confusing for dynamic data.

**How to avoid:**
- Use `cache: "no-store"` for admin/dashboard pages: `fetch(url, { cache: "no-store" })`
- Use `next: { revalidate: 60 }` for content that updates periodically: `fetch(url, { next: { revalidate: 60 } })`
- Use `revalidateTag()` with Cache Components for targeted invalidation
- Use `updateTag()` in Server Actions for immediate read-your-writes behavior

**Warning signs:**
- Users report seeing old data after updates
- Admin changes don't appear immediately
- Confused reports about "caching not working" or "caching working too well"

### Pitfall 3: Async Params Migration Failure

**What goes wrong:** Build failures or runtime errors when accessing params/searchParams without await in Next.js 16.

**Why it happens:** Breaking change from Next.js 15 to 16. Previously synchronous props are now async Promises.

**How to avoid:**
- Run `npx @next/codemod@canary upgrade latest` for automatic migration
- Audit all page.tsx files and route handlers for params/searchParams usage
- Remember metadata functions also need async params
- Update TypeScript types: `params: Promise<{ slug: string }>`

**Warning signs:**
- Build errors about params/searchParams
- TypeScript errors about Promise types
- Runtime errors accessing params properties

### Pitfall 4: Image Optimization Misconceptions

**What goes wrong:** Uploading pre-compressed images to Sanity defeats optimization pipeline. Using wrong image formats (PNG instead of AVIF/WebP). Not using srcset for responsive images.

**Why it happens:** Developers assume they need to optimize before upload. Don't understand Sanity CDN capabilities or Next.js Image component benefits.

**How to avoid:**
- Upload high-resolution originals (1920px+ width) to Sanity
- Use Sanity image URL builder for transforms: `.width(800).quality(75).format('avif')`
- Configure Next.js Image component with proper `sizes` attribute
- Enable AVIF + WebP in next.config.ts: `formats: ['image/avif', 'image/webp']`
- Add Sanity CDN to remotePatterns in next.config.ts

**Warning signs:**
- Images appear blurry on high-DPI displays
- Large image file sizes (>200KB for typical web images)
- Seeing PNG format in network tab instead of AVIF/WebP
- Missing responsive srcset in HTML

### Pitfall 5: Privacy Architecture Theater

**What goes wrong:** Implementing "privacy features" that look good but don't actually protect user data. RLS enabled but no policies defined. Cookie consent banners without actual privacy controls.

**Why it happens:** Treating privacy as compliance checkbox rather than architectural foundation. Implementing UI without backing enforcement.

**How to avoid:**
- Enable RLS on ALL tables from day one
- Define explicit policies—default deny is your friend
- Index columns used in RLS policies (critical for performance)
- Never trust client-side checks—enforce at database level
- Implement actual opt-in defaults, not pre-checked consent boxes
- Test with different user roles to verify access control

**Warning signs:**
- RLS enabled but `SELECT * FROM table` works without policies
- Permission checks only in application code, not database
- Cookie consent banner but no actual data collection controls
- "Privacy-first" in marketing but no RLS policies in codebase

### Pitfall 6: Environment Variable Exposure

**What goes wrong:** Exposing sensitive keys to client bundle. Using NEXT_PUBLIC_ prefix for secrets. Hardcoding API keys in code.

**Why it happens:** Misunderstanding NEXT_PUBLIC_ behavior. NEXT_PUBLIC_ variables are inlined at build time into client bundle—anyone can read them.

**How to avoid:**
- NEVER use NEXT_PUBLIC_ for secrets (service role keys, webhook secrets, API secrets)
- Only use NEXT_PUBLIC_ for truly public values (Supabase anon key, Sanity project ID)
- Use server-side only environment variables for secrets
- Audit next.config.ts to ensure no accidental exposure
- Use Netlify environment variables UI for production secrets

**Warning signs:**
- Service role key in client bundle (search built .next directory)
- Seeing secret keys in browser DevTools Network tab
- Using same key for client and server (should be separate)

### Pitfall 7: Middleware → Proxy.ts Migration Oversight

**What goes wrong:** Continuing to use middleware.ts without knowing it's deprecated. Missing proxy.ts benefits (Node.js runtime, clearer semantics).

**Why it happens:** Breaking change in Next.js 16 that's easy to miss. Codebase still works but is using deprecated pattern.

**How to avoid:**
- Rename middleware.ts → proxy.ts
- Rename exported function to `proxy`
- Update imports and types
- Note: middleware.ts still works but is deprecated and will be removed

**Warning signs:**
- Still using middleware.ts in Next.js 16 project
- Deprecation warnings in terminal during build
- Missing new proxy.ts features

### Pitfall 8: Parallel Route Default Files

**What goes wrong:** Build failures with parallel routes (like @modal, @sidebar) when default.js files are missing.

**Why it happens:** Next.js 16 now requires explicit default.js files for all parallel route slots. Previously optional, now mandatory.

**How to avoid:**
- Create default.js for every parallel route slot
- Common pattern: `export default function Default() { return null; }`
- Or: `export default function Default() { notFound(); }`

**Warning signs:**
- Build error: "Parallel route [...] is missing default.js"
- Parallel routes worked in Next.js 15 but fail in 16

## Code Examples

Verified patterns from official sources and 2026 best practices:

### Next.js 16 Project Initialization

```bash
# Create new Next.js 16 project with all defaults
npx create-next-app@latest my-app

# Prompts (recommend these answers):
# TypeScript? Yes
# ESLint? Yes
# Tailwind CSS? Yes
# App Router? Yes
# Turbopack? Yes
# Import alias? @/* (default)

cd my-app
npm run dev
```

**Source:** [Next.js Installation Docs](https://nextjs.org/docs/app/getting-started/installation)

### Tailwind CSS v4 Configuration

```javascript
// postcss.config.mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

```css
/* app/globals.css */
@import "tailwindcss";

/* Optional: Custom CSS */
@layer base {
  h1 {
    @apply text-4xl font-bold;
  }
}
```

**Source:** [Tailwind CSS Next.js Guide](https://tailwindcss.com/docs/guides/nextjs)

### Embedded Sanity Studio

```typescript
// app/studio/[[...index]]/page.tsx
'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '@/sanity.config';

export function Studio() {
  return <NextStudio config={config} />;
}
```

```typescript
// sanity.config.ts
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemas } from './lib/sanity/schemas';

export default defineConfig({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  basePath: '/studio',
  plugins: [structureTool(), visionTool()],
  schema: { types: schemas },
});
```

**Source:** [next-sanity Package](https://www.sanity.io/plugins/next-sanity)

### Supabase Server Client

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component - ignore cookie errors
          }
        },
      },
    }
  );
}
```

**Source:** [Supabase Next.js Docs](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

### reCAPTCHA v3 Integration

```typescript
// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { token, ...formData } = await request.json();

  // Verify reCAPTCHA token
  const recaptchaResponse = await fetch(
    'https://www.google.com/recaptcha/api/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    }
  );

  const recaptchaData = await recaptchaResponse.json();

  if (!recaptchaData.success || recaptchaData.score < 0.5) {
    return NextResponse.json(
      { error: 'Failed reCAPTCHA verification' },
      { status: 400 }
    );
  }

  // Process form submission...
  return NextResponse.json({ success: true });
}
```

```typescript
// components/ContactForm.tsx
'use client';

import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export function ContactForm() {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!executeRecaptcha) {
      console.log('reCAPTCHA not loaded');
      return;
    }

    const token = await executeRecaptcha('contact_form');

    const response = await fetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify({ token, /* form data */ }),
    });

    // Handle response...
  };

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}
```

**Source:** [reCAPTCHA v3 Next.js Guide](https://www.buildwithmatija.com/blog/recaptcha-v3-nextjs-guide)

### Metadata & SEO

```typescript
// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'C&C Community',
    template: '%s | C&C Community',
  },
  description: 'A vibrant community for members to connect and share.',
  openGraph: {
    title: 'C&C Community',
    description: 'A vibrant community for members to connect and share.',
    url: 'https://cc-community.netlify.app',
    siteName: 'C&C Community',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// app/blog/[slug]/page.tsx - Dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await client.fetch(`*[_type == "blogPost" && slug.current == $slug][0]`, { slug });

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
  };
}
```

```typescript
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio/', '/api/'],
    },
    sitemap: 'https://cc-community.netlify.app/sitemap.xml',
  };
}
```

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';
import { client } from '@/lib/sanity/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await client.fetch(`*[_type == "blogPost"]{ slug, _updatedAt }`);

  const blogPosts = posts.map((post) => ({
    url: `https://cc-community.netlify.app/blog/${post.slug.current}`,
    lastModified: post._updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: 'https://cc-community.netlify.app',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://cc-community.netlify.app/blog',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...blogPosts,
  ];
}
```

**Source:** [Next.js Metadata Docs](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| middleware.ts | proxy.ts | Next.js 16 (Oct 2025) | Clearer semantics, Node.js runtime, deprecated middleware.ts |
| Sync params/searchParams | Async params/searchParams | Next.js 16 (Oct 2025) | Must await params; breaking change requiring code migration |
| Implicit fetch caching | Opt-in caching with "use cache" | Next.js 16 (Oct 2025) | Everything dynamic by default; explicit cache declarations |
| Tailwind config.js | CSS-first configuration | Tailwind v4 (Jan 2025) | Single @import, no config file needed for basic setup |
| @supabase/auth-helpers-nextjs | @supabase/ssr | 2024 | Universal SSR package, not framework-specific |
| Webpack | Turbopack | Next.js 16 (Oct 2025) | 2-5x faster builds, 10x faster Fast Refresh, now default |
| WebP priority | AVIF priority | 2025-2026 | AVIF 20% smaller than WebP, 50% longer encode, broad support in 2026 |
| Image quality 100 | Image quality 75 | Next.js 16 (Oct 2025) | Changed default; better balance of size/quality |
| ESLint legacy config | ESLint Flat Config | @next/eslint-plugin-next 2025 | v10 drops legacy format; flat config is standard |

**Deprecated/outdated:**

- **middleware.ts**: Replaced by proxy.ts in Next.js 16; still works but deprecated
- **next/legacy/image**: Use next/image instead; legacy component removed soon
- **images.domains**: Use images.remotePatterns for better security
- **revalidateTag(tag)**: Now requires second argument: revalidateTag(tag, profile)
- **@supabase/auth-helpers-nextjs**: Replaced by @supabase/ssr
- **tailwind.config.js**: Optional in v4; CSS-first configuration preferred
- **Pages Router for new projects**: App Router is standard for 2026; Pages Router in maintenance mode

## Open Questions

1. **Cache Components Maturity**
   - What we know: Introduced in Next.js 16 as opt-in feature; replaces experimental.ppr
   - What's unclear: Production readiness timeline; best practices still emerging
   - Recommendation: Enable and test in staging; monitor Next.js Conf 2025 announcements for guidance

2. **Turbopack Edge Cases**
   - What we know: Stable and default in Next.js 16; handles most webpack configs
   - What's unclear: Custom webpack plugins compatibility; specific loader edge cases
   - Recommendation: Use Turbopack by default; fall back to webpack if specific incompatibilities found

3. **Sanity Image Optimization with AVIF**
   - What we know: Sanity CDN supports AVIF; Next.js Image prefers AVIF
   - What's unclear: Optimal quality settings for AVIF with Sanity; performance implications
   - Recommendation: Test AVIF at quality 75 (Next.js default); monitor Lighthouse scores

4. **Rate Limiting Implementation**
   - What we know: Needed for spam protection; should combine with reCAPTCHA + honeypot
   - What's unclear: Best approach—Upstash Redis, Vercel KV, or application-level
   - Recommendation: Start with simple in-memory rate limiting for MVP; migrate to Redis if needed

5. **Privacy Compliance Automation**
   - What we know: GDPR/privacy laws require opt-in defaults; RLS provides database enforcement
   - What's unclear: Cookie consent management—build custom or use service (CookieYes, Cookiebot)
   - Recommendation: Build simple cookie banner for MVP; evaluate consent management platforms for v2

## Sources

### Primary (HIGH confidence)

- [Next.js 16 Blog Post](https://nextjs.org/blog/next-16) - Official release notes, breaking changes, new features
- [Next.js App Router Docs](https://nextjs.org/docs/app) - Official documentation for App Router
- [Next.js Metadata Docs](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) - SEO and metadata patterns
- [Tailwind CSS Next.js Guide](https://tailwindcss.com/docs/guides/nextjs) - Official v4 setup instructions
- [Supabase Next.js Auth Docs](https://supabase.com/docs/guides/auth/auth-helpers/nextjs) - @supabase/ssr setup
- [Sanity next-sanity Plugin](https://www.sanity.io/plugins/next-sanity) - Official integration toolkit
- [Netlify Next.js Docs](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/) - Official deployment guide

### Secondary (MEDIUM confidence)

- [App Router Pitfalls (imidef.com)](https://imidef.com/en/2026-02-11-app-router-pitfalls) - Verified Feb 2026
- [Next.js Image Optimization (Strapi)](https://strapi.io/blog/nextjs-image-optimization-developers-guide) - Verified technical guide
- [Supabase RLS Guide (DesignRevision)](https://designrevision.com/blog/supabase-row-level-security) - Verified 2026 guide
- [Privacy by Design GDPR (SecurePrivacy)](https://secureprivacy.ai/blog/privacy-by-design-gdpr-2025) - Compliance patterns
- [reCAPTCHA v3 Next.js (Build with Matija)](https://www.buildwithmatija.com/blog/recaptcha-v3-nextjs-guide) - Implementation guide
- [Sanity Schema Best Practices (Halo Lab)](https://www.halo-lab.com/blog/creating-schema-in-sanity) - Verified Jun 2025

### Tertiary (LOW confidence)

- Various Medium.com articles on Next.js patterns - useful but verify against official docs
- Community discussions on GitHub and Reddit - directional insights only
- Blog posts from early 2025 - some may predate Next.js 16 changes

## Metadata

**Confidence breakdown:**

- **Standard stack:** HIGH - All libraries verified from official sources; version requirements confirmed
- **Architecture patterns:** HIGH - Patterns extracted from official Next.js 16 docs and Supabase/Sanity documentation
- **Pitfalls:** MEDIUM-HIGH - Compiled from official docs, recent blog posts (Feb 2026), and verified technical guides
- **Privacy architecture:** MEDIUM - GDPR patterns well-established; RLS implementation clear; specific cookie consent solution needs project decision
- **Spam protection:** MEDIUM - reCAPTCHA v3 + honeypot pattern is standard; rate limiting implementation needs project decision

**Research date:** 2026-02-14
**Valid until:** ~2026-03-14 (30 days for stable ecosystem; Next.js 16 just released Oct 2025, expect minor updates but stable API)

**Research notes:**

This phase research covered 9 distinct technology domains (Next.js, Tailwind, Sanity, Supabase, Netlify, image optimization, privacy architecture, spam protection, SEO). High confidence in Next.js 16 recommendations due to recent release with comprehensive documentation. Tailwind v4 is very recent (Jan 2025) but setup is simplified. Supabase RLS patterns are well-established. Primary uncertainty is around Cache Components (new in Next.js 16) and optimal rate limiting approach—both have clear fallback strategies.

Critical finding: Next.js 16 breaking changes (async params, proxy.ts, cache components) require deliberate migration effort. Plan accordingly.
