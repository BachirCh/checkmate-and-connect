# Phase 2: Landing & Information - Research

**Researched:** 2026-02-14
**Domain:** Next.js 16 App Router landing pages with Sanity CMS, Core Web Vitals optimization
**Confidence:** HIGH

## Summary

Phase 2 focuses on building a high-performance, mobile-first landing page using Next.js 16 App Router with static site generation (SSG). The primary challenge is achieving Core Web Vitals green scores on 3G mobile connections while embedding third-party content (Meetup widget) and delivering rich SEO metadata for a local community event.

The research confirms that Next.js 16's App Router with Server Components provides an excellent foundation for SSG landing pages. The key technical decisions involve: (1) using static metadata exports for SEO, (2) implementing iframe lazy-loading for the Meetup widget, (3) leveraging next/image for AVIF/WebP optimization, and (4) structuring content as Server Components to minimize client-side JavaScript.

**Primary recommendation:** Build the landing page as a static-first, Server Component architecture with minimal client-side JavaScript. Use Next.js metadata API for SEO, implement native iframe lazy-loading for embeds, and rely on Sanity CMS for content flexibility without sacrificing performance.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.x | Framework with App Router | Industry standard for React SSG/SSR, built-in optimizations for Core Web Vitals |
| React | 19.x | UI library with Server Components | Latest stable, Server Components reduce client JS bundle |
| Tailwind CSS | 4.x | Styling with CSS-first config | Mobile-first by default, excellent for responsive design |
| next/image | Built-in | Image optimization | Automatic AVIF/WebP, lazy-loading, size optimization |
| next/font | Built-in | Font optimization | Self-hosted fonts, zero layout shift, automatic subsetting |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @sanity/client | 6.x | CMS data fetching | Fetch landing page content at build time |
| next-sanity | Latest | Sanity-Next.js integration | Provides optimized hooks and helpers |
| Sharp | Auto-installed | Image processing | Automatically used by next/image for optimization |
| React 19 `use cache` | Built-in | Metadata caching | Cache Sanity queries in generateMetadata |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Static metadata object | generateMetadata function | Use function only if fetching metadata from Sanity; static is simpler |
| Native iframe lazy-loading | lite-youtube-embed | Native is sufficient; use library only if custom UI needed |
| next/font | Manual Google Fonts | next/font eliminates layout shift and improves performance |

**Installation:**
```bash
npm install @sanity/client next-sanity
# next/image, next/font are built-in to Next.js
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── layout.tsx              # Root layout with base metadata
├── page.tsx                # Landing page (Server Component)
├── components/
│   ├── Hero.tsx            # Hero section (Server Component)
│   ├── EventDetails.tsx    # When/where info (Server Component)
│   ├── MeetupWidget.tsx    # Lazy-loaded iframe (Client Component)
│   └── CommunityStats.tsx  # Member count display (Server Component)
└── lib/
    ├── sanity.ts           # Sanity client config
    └── queries.ts          # GROQ queries for landing page data
```

### Pattern 1: Static Landing Page with SSG
**What:** Pre-render the entire landing page at build time as static HTML
**When to use:** Content changes infrequently (landing page copy, event details)
**Example:**
```typescript
// app/page.tsx
import { client } from '@/lib/sanity'
import { landingPageQuery } from '@/lib/queries'

export default async function LandingPage() {
  // Fetches at build time, produces static HTML
  const data = await client.fetch(landingPageQuery)

  return (
    <main>
      <Hero {...data.hero} />
      <EventDetails {...data.eventInfo} />
      <MeetupWidget />
    </main>
  )
}
```

### Pattern 2: Metadata with Static Export
**What:** Define SEO metadata as static object in page/layout
**When to use:** Metadata doesn't depend on dynamic data sources
**Example:**
```typescript
// app/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkmate & Connect | Chess + Entrepreneurship Community',
  description: 'Join 200+ members every Wednesday at 6pm in Casablanca for chess and entrepreneurship meetups.',
  keywords: ['chess', 'entrepreneurship', 'Casablanca', 'community', 'networking'],
  openGraph: {
    title: 'Checkmate & Connect',
    description: 'Chess + Entrepreneurship Community in Casablanca',
    type: 'website',
    images: ['/og-image.png'],
  },
}
```

### Pattern 3: Dynamic Metadata from Sanity
**What:** Fetch metadata from CMS using generateMetadata
**When to use:** Content editors should control page titles, descriptions, OG images
**Example:**
```typescript
// app/page.tsx
import type { Metadata } from 'next'
import { client } from '@/lib/sanity'

export async function generateMetadata(): Promise<Metadata> {
  'use cache' // Cache metadata query (React 19)

  const { title, description, ogImage } = await client.fetch(
    `*[_type == "landingPage"][0]{ title, description, ogImage }`
  )

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage.asset.url }],
    },
  }
}
```

### Pattern 4: Lazy-Loaded Third-Party Embeds
**What:** Use native iframe lazy-loading for Meetup widget
**When to use:** Always, for any third-party iframe embed
**Example:**
```typescript
// app/components/MeetupWidget.tsx
'use client' // Minimal client component

export function MeetupWidget() {
  return (
    <div className="relative h-[400px] w-full">
      <iframe
        src="https://www.meetup.com/your-group/embed"
        loading="lazy"
        width="100%"
        height="400"
        className="border-0"
        title="Upcoming Meetup Events"
      />
    </div>
  )
}
```

### Pattern 5: Server-First Component Composition
**What:** Keep Server Components at the root, pass Client Components as children
**When to use:** When mixing static content with interactive elements
**Example:**
```typescript
// app/page.tsx (Server Component)
import { MeetupWidget } from './components/MeetupWidget'

export default function Page() {
  return (
    <>
      {/* Static content renders on server */}
      <article className="space-y-12">
        <Hero />
        <EventDetails />
      </article>

      {/* Only this component becomes client-side */}
      <MeetupWidget />
    </>
  )
}
```

### Pattern 6: Mobile-First Responsive Layout
**What:** Design for mobile viewport first, enhance for larger screens
**When to use:** Always, per project requirements (Core Web Vitals on 3G)
**Example:**
```typescript
// app/components/Hero.tsx
export function Hero() {
  return (
    <section className="
      px-4 py-8           /* Mobile: tight spacing */
      md:px-8 md:py-16    /* Tablet: more breathing room */
      lg:px-16 lg:py-24   /* Desktop: generous spacing */
    ">
      <h1 className="
        text-3xl           /* Mobile: readable on small screens */
        md:text-5xl        /* Tablet: larger impact */
        lg:text-6xl        /* Desktop: hero-sized */
      ">
        Checkmate & Connect
      </h1>
    </section>
  )
}
```

### Pattern 7: Structured Data for Local Events
**What:** Add JSON-LD structured data for recurring local events
**When to use:** Landing pages featuring regular meetups or events
**Example:**
```typescript
// app/page.tsx
export default function Page() {
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Checkmate & Connect Weekly Meetup",
    "startDate": "2026-02-19T18:00:00+01:00",
    "endDate": "2026-02-19T21:00:00+01:00",
    "location": {
      "@type": "Place",
      "name": "Commons",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Casablanca",
        "addressCountry": "Morocco"
      }
    },
    "description": "Chess and entrepreneurship community meetup",
    "organizer": {
      "@type": "Organization",
      "name": "Checkmate & Connect"
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      {/* Page content */}
    </>
  )
}
```

### Anti-Patterns to Avoid
- **Overusing 'use client':** Don't mark components as client-side unless they need interactivity, state, or browser APIs. This increases JavaScript bundle size and degrades performance.
- **Fetching static data with useEffect:** Don't use client-side data fetching for content that never changes. Fetch at build time in Server Components instead.
- **Unoptimized images:** Don't use <img> tags directly. Always use next/image for automatic optimization, lazy-loading, and format conversion.
- **Eager-loading all iframes:** Don't load third-party embeds immediately. Use loading="lazy" to defer until user scrolls near them.
- **Ignoring mobile viewport:** Don't design desktop-first and "make it responsive later." Start with mobile constraints to ensure 3G performance.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image optimization | Custom image resizing/format conversion | next/image | Handles AVIF/WebP, responsive sizes, lazy-loading, CDN serving automatically |
| Font loading | Manual Google Fonts link tags | next/font | Eliminates layout shift, self-hosts fonts, subsets automatically |
| SEO metadata | Manual <head> tag manipulation | Next.js Metadata API | Type-safe, merges across layouts, handles Open Graph/Twitter cards |
| Iframe lazy-loading | Custom Intersection Observer logic | Native loading="lazy" | Supported in all modern browsers, zero JavaScript overhead |
| Responsive breakpoints | Custom CSS media queries | Tailwind CSS breakpoints | Mobile-first by default, consistent across team |
| Structured data validation | Manual JSON-LD writing | Schema.org validator + TypeScript types | Prevents invalid markup, ensures search engine compatibility |
| Mobile performance testing | Chrome DevTools throttling only | Real device testing (BrowserStack, Physical device) | Emulation doesn't match real 3G network behavior |

**Key insight:** Next.js has optimized solutions for all common landing page problems. Custom implementations introduce bugs, miss edge cases, and often perform worse. For this phase, leverage built-in Next.js features rather than building from scratch.

## Common Pitfalls

### Pitfall 1: Over-Reliance on Client Components
**What goes wrong:** Developers mark every component with 'use client' because they're familiar with traditional React, resulting in heavy JavaScript bundles and slow Time to Interactive.
**Why it happens:** Misconception that Server Components are "limited." In reality, Server Components are the default and should be preferred.
**How to avoid:** Default to Server Components. Only use 'use client' when component needs: (1) useState/useEffect hooks, (2) browser APIs (window, document), or (3) event handlers (onClick, onChange).
**Warning signs:** Large bundle sizes (>200KB JS for landing page), slow TTI on mobile, excessive hydration time.

### Pitfall 2: Blocking Render with Heavy Embeds
**What goes wrong:** Meetup widget or other third-party embeds load immediately, consuming bandwidth and delaying First Contentful Paint / Largest Contentful Paint.
**Why it happens:** Default iframe behavior is eager loading. Developers don't realize the performance cost.
**How to avoid:** Always use loading="lazy" on iframes. Place embeds below the fold so they don't block LCP.
**Warning signs:** LCP >2.5s on 3G, Core Web Vitals warnings about blocking resources, high bandwidth usage on initial load.

### Pitfall 3: Incorrect Metadata Caching
**What goes wrong:** Using generateMetadata without 'use cache' causes Sanity queries on every request, or Next.js raises error about deferred rendering.
**Why it happens:** React 19 + Next.js 16 introduced explicit caching requirements for metadata that accesses external data.
**How to avoid:** If generateMetadata fetches from Sanity, add 'use cache' directive at function start. If metadata is static, use metadata object export instead.
**Warning signs:** Build errors about "intentional deferred rendering," slow metadata resolution, unnecessary CMS queries.

### Pitfall 4: Unoptimized Images Breaking Mobile Performance
**What goes wrong:** Using <img> tags or improperly configured next/image results in large image downloads (1-2MB) on mobile, killing LCP and data budgets.
**Why it happens:** Forgetting to use next/image, not specifying sizes attribute, uploading uncompressed originals.
**How to avoid:** Always use next/image with width/height. Enable AVIF format in next.config.js. Use Sanity CDN's image optimization for CMS images.
**Warning signs:** LCP >3s, large image downloads in Network tab, Core Web Vitals "LCP element" warnings.

### Pitfall 5: Missing Mobile-First CSS
**What goes wrong:** Designing for desktop first, then adding mobile breakpoints results in oversized touch targets, poor spacing, and illegible text on mobile.
**Why it happens:** Developers often work on desktop browsers and test mobile as an afterthought.
**How to avoid:** Use Tailwind's mobile-first approach. Base styles apply to mobile, then use md:, lg: prefixes for larger screens. Test on real mobile device or throttled connection.
**Warning signs:** Buttons too small to tap, horizontal scrolling on mobile, text requiring pinch-zoom.

### Pitfall 6: Ignoring Structured Data for SEO
**What goes wrong:** Search engines and LLMs can't understand event details without structured data, leading to poor rich snippet display and lower visibility.
**Why it happens:** Structured data feels like "extra work" and benefits aren't immediately visible.
**How to avoid:** Add JSON-LD Event schema to landing page with name, startDate, location, and organizer. Test with Google's Rich Results Test.
**Warning signs:** Event doesn't appear in Google Events search, no rich snippets in search results, LLMs can't extract event details.

### Pitfall 7: Not Testing on Real 3G Connection
**What goes wrong:** Relying only on Chrome DevTools throttling gives false confidence. Real 3G networks have packet loss, latency spikes, and variable bandwidth.
**Why it happens:** Real device testing is slower and less convenient than DevTools.
**How to avoid:** Test on physical device with real 3G connection or use BrowserStack/Sauce Labs. Aim for LCP <2.5s, FID <100ms, CLS <0.1 on 3G.
**Warning signs:** DevTools shows green Core Web Vitals but user reports say site is slow on mobile.

## Code Examples

Verified patterns from official sources:

### Next.js Metadata API (Static)
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
// app/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkmate & Connect | Chess + Entrepreneurship',
  description: 'Join 200+ members every Wednesday at 6pm in Casablanca.',
  metadataBase: new URL('https://checkmateconnect.com'),
  openGraph: {
    title: 'Checkmate & Connect',
    description: 'Chess + Entrepreneurship Community in Casablanca',
    url: 'https://checkmateconnect.com',
    siteName: 'Checkmate & Connect',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Checkmate & Connect Community',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Checkmate & Connect',
    description: 'Chess + Entrepreneurship Community',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}
```

### Next.js Dynamic Metadata from CMS
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
// app/page.tsx
import type { Metadata } from 'next'
import { client } from '@/lib/sanity'

export async function generateMetadata(): Promise<Metadata> {
  'use cache' // React 19 caching directive

  const page = await client.fetch(
    `*[_type == "landingPage"][0]{
      title,
      description,
      "ogImage": ogImage.asset->url
    }`
  )

  return {
    title: page.title,
    description: page.description,
    openGraph: {
      title: page.title,
      description: page.description,
      images: [{ url: page.ogImage }],
    },
  }
}
```

### Next.js Image Component with AVIF
```typescript
// Source: https://nextjs.org/docs/app/api-reference/components/image
// app/components/Hero.tsx
import Image from 'next/image'

export function Hero() {
  return (
    <section>
      <Image
        src="/hero-image.jpg"
        alt="Checkmate & Connect community playing chess"
        width={1200}
        height={600}
        priority // LCP element, load immediately
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover"
      />
    </section>
  )
}
```

### Lazy-Loaded Iframe Pattern
```typescript
// Source: https://web.dev/articles/iframe-lazy-loading
// app/components/MeetupWidget.tsx
'use client'

export function MeetupWidget() {
  return (
    <section className="my-12">
      <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
      <div className="aspect-video relative">
        <iframe
          src="https://www.meetup.com/checkmate-connect/embed"
          loading="lazy"
          width="100%"
          height="100%"
          className="border-0 rounded-lg"
          title="Upcoming Meetup Events"
          allow="payment"
        />
      </div>
    </section>
  )
}
```

### Tailwind CSS Mobile-First Responsive
```typescript
// Source: Tailwind CSS v4 documentation (devtoolbox.dedyn.io/blog/tailwind-css-cheatsheet-guide)
// app/components/EventDetails.tsx
export function EventDetails() {
  return (
    <section className="
      px-4 py-8           /* Mobile base */
      sm:px-6 sm:py-10    /* sm: 640px+ */
      md:px-8 md:py-12    /* md: 768px+ */
      lg:px-12 lg:py-16   /* lg: 1024px+ */
    ">
      <div className="
        grid gap-6              /* Mobile: single column */
        md:grid-cols-2          /* md: two columns */
        lg:grid-cols-3          /* lg: three columns */
      ">
        <InfoCard icon="📅" title="When" description="Every Wednesday, 6pm" />
        <InfoCard icon="📍" title="Where" description="Commons, Casablanca" />
        <InfoCard icon="👥" title="Who" description="200+ members" />
      </div>
    </section>
  )
}
```

### Next.js Font Optimization
```typescript
// Source: https://nextjs.org/docs/app/getting-started/fonts
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevents invisible text during font load
  variable: '--font-inter',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

### JSON-LD Structured Data for Events
```typescript
// Source: https://developers.google.com/search/docs/appearance/structured-data/event
// app/page.tsx
export default function LandingPage() {
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Checkmate & Connect Weekly Meetup",
    "startDate": "2026-02-19T18:00:00+01:00",
    "endDate": "2026-02-19T21:00:00+01:00",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "eventStatus": "https://schema.org/EventScheduled",
    "location": {
      "@type": "Place",
      "name": "Commons",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Commons Address",
        "addressLocality": "Casablanca",
        "addressCountry": "MA"
      }
    },
    "description": "Join 200+ members for chess and entrepreneurship networking",
    "organizer": {
      "@type": "Organization",
      "name": "Checkmate & Connect",
      "url": "https://checkmateconnect.com"
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <main>{/* Page content */}</main>
    </>
  )
}
```

### Sanity Client Configuration
```typescript
// Source: https://github.com/sanity-io/next-sanity
// lib/sanity.ts
import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01', // Use current date
  useCdn: true, // Enable for production, false for draft mode
})

// lib/queries.ts
export const landingPageQuery = `*[_type == "landingPage"][0]{
  title,
  description,
  hero {
    heading,
    subheading,
    "image": image.asset->url
  },
  eventInfo {
    when,
    where,
    memberCount
  }
}`
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| getStaticProps | Async Server Components | Next.js 13+ (2023) | Simpler data fetching, collocated with components |
| Custom image optimization | next/image with AVIF | Next.js 13+ (2023) | 20-40% smaller images, automatic format selection |
| Manual font loading | next/font with self-hosting | Next.js 13+ (2023) | Eliminates layout shift, improves privacy |
| Client-side only React | Server Components by default | React 19 (2024) | Reduced JS bundles, faster initial page loads |
| Manual metadata tags | Metadata API | Next.js 13+ (2023) | Type-safe, automatic merging across layouts |
| JavaScript lazy-loading libs | Native loading="lazy" | Widely supported (2021+) | Zero JS overhead, better browser optimization |
| CSS-in-JS (styled-components) | Tailwind CSS v4 CSS-first | Tailwind v4 (2024) | Faster builds, better DX, native CSS cascade |
| EventSeries schema for recurring | Individual Event per occurrence | Google requirement | Better rich results display per event instance |

**Deprecated/outdated:**
- **getStaticProps/getServerSideProps:** Replaced by async Server Components in App Router. Old Pages Router pattern.
- **next/legacy/image:** Old Image component. Use next/image from v13+.
- **Tailwind config in JS file (tailwind.config.js):** Tailwind v4 uses CSS-first configuration with @theme directive.
- **viewport/themeColor in metadata object:** Deprecated in Next.js 14+. Use generateViewport function instead.
- **Intersection Observer for iframe lazy-loading:** Native loading="lazy" is now standard, no JS library needed.

## Open Questions

1. **Meetup Widget Customization**
   - What we know: Meetup provides embeddable widgets via iframe. Native lazy-loading is sufficient for performance.
   - What's unclear: Whether Meetup's official widget supports customization (colors, layout) to match C&C brand.
   - Recommendation: Test with default Meetup widget first. If branding is critical, consider SociableKIT or Elfsight (third-party widget providers) or build custom Meetup API integration.

2. **Structured Data for Recurring Events**
   - What we know: Google's Event schema prefers individual Event markup per occurrence, not EventSeries for recurring events.
   - What's unclear: Whether to generate all future event occurrences at build time or only next 4-8 weeks.
   - Recommendation: Generate structured data for next 4 events (1 month). Rebuild site weekly to keep events current. Use Netlify build hooks + scheduled functions.

3. **Sanity Content Modeling for Landing Page**
   - What we know: Sanity supports flexible content modeling with reusable blocks.
   - What's unclear: Optimal schema structure for landing page content (single document vs. modular blocks).
   - Recommendation: Start simple with single landingPage document type. Add modular blocks (hero, eventInfo, communityStats) only if content team needs flexibility. Avoid over-engineering.

4. **Mobile Testing Strategy**
   - What we know: Chrome DevTools throttling doesn't fully replicate real 3G conditions (packet loss, latency spikes).
   - What's unclear: Whether to use BrowserStack (paid), physical device (manual), or Lighthouse CI (automated but limited).
   - Recommendation: Use Lighthouse CI in staging for automated checks. Supplement with manual testing on physical device with real 3G connection before launch.

## Sources

### Primary (HIGH confidence)
- [Next.js 16.1.6 generateMetadata API Reference](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) - Official Next.js docs, updated 2026-02-11
- [Next.js App Router Overview](https://nextjs.org/docs/app) - Official framework documentation
- [Web.dev iframe lazy-loading guide](https://web.dev/articles/iframe-lazy-loading) - Official Chrome/web.dev guidance
- [Google Event Structured Data](https://developers.google.com/search/docs/appearance/structured-data/event) - Official Google Search documentation
- [Next.js Image Component API](https://nextjs.org/docs/app/api-reference/components/image) - Official Next.js docs
- [Next.js Font Optimization](https://nextjs.org/docs/app/getting-started/fonts) - Official Next.js docs

### Secondary (MEDIUM confidence)
- [Core Web Vitals 2026: Technical SEO Guide](https://almcorp.com/blog/core-web-vitals-2026-technical-seo-guide/) - Recent best practices article
- [Netlify Next.js Framework Guide](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/) - Official Netlify documentation
- [Sanity CMS Guide 2026](https://www.webstacks.com/blog/sanity-cms-developer-first-platform-b2b-websites) - Comprehensive platform overview
- [React Server Components Practical Guide 2026](https://inhaq.com/blog/react-server-components-practical-guide-2026.html) - Community best practices
- [Next.js 16 App Router Pitfalls](https://imidef.com/en/2026-02-11-app-router-pitfalls) - Recent pitfalls article (Feb 2026)

### Tertiary (LOW confidence)
- [Tailwind CSS v4 Cheat Sheet 2026](https://devtoolbox.dedyn.io/blog/tailwind-css-cheatsheet-guide) - Community resource, needs official docs verification
- Various WebSearch results about Meetup widget embedding - No official Meetup API documentation fetched; recommend verifying embed options

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** - All recommendations from official Next.js, React, and Tailwind docs
- Architecture: **HIGH** - Patterns verified with official documentation and source links
- Pitfalls: **MEDIUM-HIGH** - Based on multiple 2026 community sources + official docs, but some pitfalls are experiential
- Meetup widget integration: **MEDIUM** - Community sources only, no official Meetup API docs verified
- Structured data approach: **HIGH** - Official Google documentation, but recurring event handling has some ambiguity

**Research date:** 2026-02-14
**Valid until:** 2026-03-14 (30 days - Next.js and React 19 are stable, no major releases expected)
