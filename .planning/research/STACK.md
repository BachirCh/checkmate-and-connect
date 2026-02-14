# Technology Stack

**Project:** Checkmate & Connect - Community Website
**Researched:** 2026-02-14
**Overall Confidence:** HIGH

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Next.js** | 16.1+ | Full-stack React framework | Built-in optimization, zero-config deployment on Vercel, perfect for community sites with mix of static/dynamic content. App Router (stable) with Server Components delivers fast initial loads and excellent SEO. **CONFIDENCE: HIGH** |
| **React** | 19.2+ | UI library | Required by Next.js 16+, provides declarative component model. Latest version adds Actions and enhanced Suspense for better form handling. **CONFIDENCE: HIGH** |
| **TypeScript** | 5.5+ | Type safety | Built-in Next.js support, catch errors at compile time, essential for maintainability. Next.js 16+ includes TypeScript plugin for autocomplete and type-safe routing. **CONFIDENCE: HIGH** |
| **Tailwind CSS** | 4.1+ | Styling framework | Zero-config setup in v4, 5x faster builds with Rust-based Oxide engine, CSS-native theming with @theme directives, responsive design out-of-box. Perfect for non-developers to understand utility classes. **CONFIDENCE: HIGH** |

### Content Management

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Sanity** | latest | Headless CMS | **Best choice for your constraints**: Free tier includes 20 user seats, 100GB storage, 10K documents, unlimited content types. Real-time collaborative editing. Non-technical admins can manage content via Sanity Studio (visual interface). Excellent Next.js integration. **CONFIDENCE: HIGH** |

**Why Sanity over alternatives:**
- **vs Contentful**: Sanity's free tier is more generous (20 seats vs limited in Contentful), and more affordable scaling (Contentful has steep jumps)
- **vs Strapi**: Sanity is fully hosted (zero maintenance), while Strapi requires self-hosting or paid cloud
- **vs Wordpress**: Modern headless architecture, better performance, no security maintenance burden

### Database & Authentication

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Supabase** | latest | Database + Auth | Free tier: 500MB database, 1GB storage, 50K MAU authentication, 5GB bandwidth. Postgres-based with Row-Level Security. Admin dashboard for non-technical users. Real-time subscriptions if needed later. **CONFIDENCE: HIGH** |
| **Clerk** (alternative) | latest | Authentication only | If you need more sophisticated auth: 10K MAU free tier, pre-built UI components, webhooks for syncing to database. Better UX than Supabase Auth but less integrated. **CONFIDENCE: MEDIUM** |

**Recommendation**: Start with **Supabase** for both database and auth. It's simpler (one service), has generous free tier, and the admin dashboard lets non-technical admins manage users directly.

### Media Management

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Cloudinary** | latest | Image hosting & optimization | Free tier sufficient for community site. Automatic optimization, responsive images, transformation API. `next-cloudinary` package provides drop-in upload widget and Next.js Image integration. Handles member photos, blog images. **CONFIDENCE: HIGH** |

**Alternative**: Use Sanity's built-in asset management (100GB included in free tier). Simpler stack, but less optimization features. **Recommendation**: Start with Sanity assets, migrate to Cloudinary only if you need advanced transformations.

### UI Components

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **shadcn/ui** | latest | Component library | Copies components into your codebase (full ownership), built on Radix UI primitives, Tailwind-first styling, TypeScript support. Install only components you need (minimal bundle). Includes forms, modals, tables perfect for admin interface. **CONFIDENCE: HIGH** |
| **Lucide React** | latest | Icons | Modern icon set, tree-shakeable, TypeScript support. Works seamlessly with shadcn/ui. **CONFIDENCE: HIGH** |
| **next-themes** | latest | Dark mode | Recommended by shadcn/ui, handles theme persistence, zero-flash on load. Optional but easy to add. **CONFIDENCE: MEDIUM** |

### Form Handling & Validation

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **React Hook Form** | 7.71+ | Form state management | Performant (minimal re-renders), intuitive API, works with React 19 and Next.js 15+. Essential for member submission forms and admin content forms. **CONFIDENCE: HIGH** |
| **Zod** | 4.x | Schema validation | TypeScript-first validation, share schemas between client/server, zero dependencies, tiny bundle (2kb). Industry standard for Next.js forms. Works perfectly with React Hook Form via `@hookform/resolvers`. **CONFIDENCE: HIGH** |

### Hosting & Deployment

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Netlify** | - | Static hosting | **Best for your needs**: Free tier allows commercial use (Vercel doesn't), includes forms feature for member submissions, built-in Split Testing, Agent Runners let non-technical users deploy changes. Automatic deployments from Git. **CONFIDENCE: HIGH** |

**Why Netlify over Vercel:**
- Vercel's free tier prohibits commercial/monetization (even if you're not monetizing now, limits future options)
- Netlify's built-in Forms feature (perfect for member submissions)
- Netlify Agent Runners = non-technical team can make changes without code
- Both have excellent Next.js support, but Netlify's free tier is more permissive

**Note**: If you heavily monetize later or need edge functions at scale, Vercel becomes competitive. For a community site, Netlify's advantages outweigh.

## Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **@hookform/resolvers** | latest | Zod + React Hook Form integration | Required for form validation (install with React Hook Form) |
| **next-sanity** | latest | Sanity + Next.js integration | Required for fetching CMS content in Next.js |
| **@sanity/image-url** | latest | Sanity image URLs | Generate optimized image URLs from Sanity assets |
| **@supabase/supabase-js** | latest | Supabase client | Interact with Supabase database/auth from Next.js |
| **next-cloudinary** (optional) | latest | Cloudinary + Next.js integration | Only if using Cloudinary instead of Sanity assets |

## Installation

```bash
# Create Next.js app with TypeScript and Tailwind
npx create-next-app@latest checkmate-connect --typescript --tailwind --app --no-src-dir

# Navigate to project
cd checkmate-connect

# Install shadcn/ui (initializes config)
npx shadcn@latest init

# Install form handling
npm install react-hook-form zod @hookform/resolvers

# Install Sanity
npm install next-sanity @sanity/image-url @portabletext/react

# Install Supabase
npm install @supabase/supabase-js

# Install icons
npm install lucide-react

# Optional: Dark mode
npm install next-themes

# Optional: Cloudinary (if not using Sanity assets)
npm install next-cloudinary
```

## Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **ESLint** | Linting | Included with Next.js, enforces code standards |
| **Prettier** | Code formatting | Add for consistent formatting across team |
| **Git** | Version control | Essential for Netlify auto-deployment |
| **Sanity Studio** | CMS admin interface | Hosted by Sanity, no local setup needed |
| **Supabase Dashboard** | Database admin | Web-based, non-technical friendly |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not Alternative |
|----------|-------------|-------------|---------------------|
| **Framework** | Next.js 16 | Remix, Astro | Next.js has best CMS integrations, most mature ecosystem, easiest for non-technical handoff. Remix is great but smaller ecosystem. Astro is content-focused but less suitable for interactive features (admin interface, forms). |
| **CMS** | Sanity | Contentful, Strapi, Payload CMS | Contentful pricing escalates quickly. Strapi requires self-hosting. Payload CMS is newer with smaller community. Sanity hits sweet spot of free tier + hosted + mature. |
| **Database** | Supabase | Vercel Postgres (Neon), PlanetScale, Firebase | Neon via Vercel has tight integration but Supabase auth is better. PlanetScale removed free tier in 2024. Firebase is Google lock-in with less SQL familiarity. |
| **Auth** | Supabase Auth | Clerk, Auth0, NextAuth.js | Clerk is excellent but adds complexity (separate service). Auth0 has enterprise features you don't need and reduced free tier (7.5K MAU). NextAuth.js v5 is self-hosted with setup complexity. Supabase Auth is simplest for your scale. |
| **Hosting** | Netlify | Vercel, Cloudflare Pages | Vercel prohibits commercial use on free tier. Cloudflare Pages is great but less beginner-friendly dashboard. Netlify balances features + ease-of-use. |
| **Styling** | Tailwind CSS v4 | Vanilla CSS, CSS Modules, Styled Components | Tailwind is most maintainable for non-developers (utility classes are self-documenting). Vanilla CSS lacks consistency. CSS-in-JS adds bundle size and complexity. |
| **UI Components** | shadcn/ui | Material-UI, Chakra UI, Ant Design | shadcn gives you ownership (components in codebase). Others are npm dependencies you can't customize easily. shadcn's Tailwind-first approach matches your stack. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Create React App** | Deprecated, no built-in SSR/SSG, manual routing setup | Next.js (recommended starter) |
| **Wordpress + PHP** | Security maintenance burden, slower performance, hosting complexity | Next.js + Sanity (modern stack) |
| **NextAuth.js v5** | Complex setup, requires database schema management, self-hosted | Supabase Auth (managed, simpler) |
| **Vercel Blob Storage** | Costs can escalate, limited free tier (1GB) | Cloudinary or Sanity assets (more generous) |
| **Firebase** | Google vendor lock-in, NoSQL requires different thinking, pricing unpredictability | Supabase (Postgres is standard SQL) |
| **Vanilla Node.js + Express** | Too much manual setup, no built-in optimization, not beginner-friendly | Next.js (batteries-included) |
| **MongoDB + Mongoose** | NoSQL adds complexity for relational data (members, blog posts), less familiar for non-devs | Postgres via Supabase (SQL is standard) |
| **Styled Components / Emotion** | Runtime CSS-in-JS hurts performance in React 19, adds bundle size | Tailwind CSS v4 (zero runtime) |

## Stack Patterns by Use Case

### If you prioritize absolutely zero cost:
- Use **Sanity assets** instead of Cloudinary (100GB included)
- Use **Supabase Auth** instead of Clerk (50K MAU vs 10K MAU)
- Deploy to **Netlify** (commercial-friendly free tier)
- Skip dark mode initially (saves next-themes dependency)

### If you need member authentication:
- Use **Supabase Auth** with Row-Level Security
- Members can only edit their own profiles (enforce in database)
- Admins get elevated permissions (manage via Supabase dashboard)

### If your blog becomes content-heavy (100+ posts):
- Keep using **Sanity** (10K documents in free tier)
- Add search with Sanity's GROQ queries (included)
- Consider Sanity paid tier at scale ($15/month for 10M API requests)

### If non-technical team struggles with Git:
- Use **Netlify Agent Runners** (content editors can deploy without code)
- OR give admins Sanity Studio only (content changes don't require deployment)
- Keep code deployments to when you add features (rare after launch)

## Version Compatibility Matrix

| Package | Version | Compatible With | Notes |
|---------|---------|-----------------|-------|
| Next.js | 16.1+ | React 19.2+, Node.js 18.18+ | Requires React 19 for App Router features |
| React | 19.2+ | Next.js 16+ | React 19 RC included in Next.js 15, stable in 16 |
| Tailwind CSS | 4.1+ | Next.js any version | v4 is drop-in replacement, automatic detection |
| React Hook Form | 7.71+ | React 19+ | Fully compatible, works with Server Actions |
| Zod | 4.x | TypeScript 5.5+ | Major version upgrade, check migration guide |
| Sanity | v3+ | Next.js any version | Use `next-sanity` for integration |
| Supabase | latest | Next.js any version | Client-side and server-side compatible |
| shadcn/ui | latest | React 19+, Tailwind v4 | Components updated for React 19 (no forwardRef needed) |

## Meetup Widget Integration

**Recommendation**: Use **third-party embed service** rather than custom build.

### Option 1: Elfsight Meetup Widget (Recommended)
- Free tier available
- No-code embed (paste HTML snippet)
- Works with any platform including Next.js
- Displays upcoming events automatically
- URL: https://elfsight.com/meetup-widget/

### Option 2: SociableKIT
- Embed Meetup Group Events in 2 minutes
- No coding required
- Free tier with basic features
- URL: https://www.sociablekit.com/

### Implementation in Next.js:
```tsx
// In your Next.js component
export default function MeetupWidget() {
  return (
    <div className="meetup-widget">
      {/* Paste embed code from Elfsight/SociableKIT here */}
      <script src="https://apps.elfsight.com/p/platform.js" defer></script>
      <div className="elfsight-app-[your-widget-id]"></div>
    </div>
  );
}
```

**Why not custom Meetup API integration:**
- Meetup API requires OAuth authentication (complexity)
- Rate limits and API key management
- Need to handle data fetching, caching, UI rendering
- Widget services handle this for free with better UX

## Architecture Recommendations

### Project Structure (Next.js 16 App Router)
```
checkmate-connect/
├── app/
│   ├── (public)/          # Public routes (landing, blog)
│   │   ├── page.tsx       # Landing page
│   │   ├── members/       # Member directory
│   │   ├── blog/          # Blog listing & posts
│   │   └── layout.tsx     # Public layout
│   ├── (admin)/           # Admin routes (protected)
│   │   ├── dashboard/     # Admin dashboard
│   │   ├── members/       # Manage members
│   │   └── blog/          # Manage blog posts
│   ├── api/               # API routes (forms, webhooks)
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Tailwind imports
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── members/           # Member-related components
│   ├── blog/              # Blog-related components
│   └── admin/             # Admin-specific components
├── lib/
│   ├── supabase.ts        # Supabase client
│   ├── sanity.ts          # Sanity client
│   └── utils.ts           # Shared utilities
├── sanity/                # Sanity Studio config
├── public/                # Static assets
└── types/                 # TypeScript types
```

### Data Flow
1. **Static content (landing page)**: Next.js Server Components → fast initial load
2. **Blog posts**: Sanity CMS → Next.js → ISR (Incremental Static Regeneration) → fast page loads
3. **Member directory**: Supabase → Next.js Server Components → real-time data
4. **Admin forms**: Client form (React Hook Form + Zod) → Server Action → Supabase/Sanity → revalidation
5. **Member submissions**: Netlify Form → email notification → admin approves in dashboard

## Key Constraints Addressed

| Constraint | Solution |
|------------|----------|
| **Low/free hosting** | Netlify (free tier, commercial-friendly), Sanity (20 users free), Supabase (50K MAU free), Cloudinary optional (use Sanity assets) |
| **Easy for non-technical team** | Sanity Studio (visual CMS), Supabase Dashboard (manage users), Netlify (one-click deploy), shadcn/ui (copy-paste components) |
| **Fast to ship** | Next.js (batteries-included), shadcn/ui (pre-built components), Sanity templates, Supabase quick setup. MVP in 2-3 weeks. |
| **No developers on team** | Managed services (Netlify, Sanity, Supabase), visual interfaces, Git-based deployments, minimal custom code needed post-launch |

## Migration Path (If You Outgrow Free Tiers)

### When you hit Sanity limits (10K documents, 100GB):
- Upgrade to Sanity Growth Plan: $15/month for 500K documents, 500GB
- Or migrate blog to Supabase (but lose Sanity Studio UX)

### When you hit Supabase limits (500MB database, 50K MAU):
- Upgrade to Supabase Pro: $25/month for 8GB database, no MAU limit
- Database can scale to paid Postgres providers (Neon, Railway)

### When you need to monetize (Netlify free tier commercial use):
- Netlify allows commercial use on free tier, so no issue
- If you need advanced features: Netlify Pro $19/month

### When you hit traffic limits:
- Netlify free tier: 100GB bandwidth
- If exceeded: Netlify Pro $19/month (1TB bandwidth)
- Or Vercel Pro $20/month (1TB bandwidth) if you prefer

**Total cost to run at scale (1000+ active members, 500+ blog posts):**
- Sanity Growth: $15/month
- Supabase Pro: $25/month
- Netlify Pro: $19/month (or stay on free tier)
- **Total: ~$40-60/month** (affordable for a growing community)

## Sources

### Next.js & React
- [Next.js by Vercel - The React Framework](https://nextjs.org/blog) - Next.js 16.1 release
- [Best Practices of Next Js Development in 2026](https://www.serviots.com/blog/nextjs-development-best-practices)
- [Next.js: The Complete Guide for 2026](https://devtoolbox.dedyn.io/blog/nextjs-complete-guide)
- [Guides: Production | Next.js](https://nextjs.org/docs/app/guides/production-checklist)

### Headless CMS
- [Headless CMS Comparison 2026: Cosmic vs Contentful vs Strapi vs Sanity vs Prismic vs Hygraph](https://www.cosmicjs.com/blog/headless-cms-comparison-2026-cosmic-contentful-strapi-sanity-prismic-hygraph) - HIGH confidence
- [Best Headless CMS for Developers in 2026 | Top 5 Compared](https://prismic.io/blog/best-headless-cms-for-developers)
- [Sanity Pricing](https://www.sanity.io/pricing) - Official source

### Hosting
- [Vercel vs Netlify in 2026: Features, Pricing & Use Cases](https://www.clarifai.com/blog/vercel-vs-netlify) - MEDIUM confidence
- [Netlify vs Vercel vs Kuberns: Best Deployment Platform in 2026](https://kuberns.com/blogs/post/netlify-vs-vercel-vs-kuberns/)

### Authentication & Database
- [The Complete Guide to Authentication Tools for Next.js Applications (2025)](https://clerk.com/articles/authentication-tools-for-nextjs) - HIGH confidence
- [Next.js Authentication Showdown: NextAuth + Free Databases vs Clerk vs Auth0 in 2025](https://medium.com/@sagarsangwan/next-js-authentication-showdown-nextauth-free-databases-vs-clerk-vs-auth0-in-2025-e40b3e8b0c45)
- [Vercel (Neon) vs Supabase, Free-Tier Database Comparison](https://hrekov.com/blog/vercel-vs-supabase-database-comparison)
- [Top PostgreSQL Database Free Tiers in 2026](https://www.koyeb.com/blog/top-postgresql-database-free-tiers-in-2026)

### Images & Media
- [Why Cloudinary is Your Best Choice for Image Hosting: A Complete Guide with Next.js](https://medium.com/@reactjsbd/why-cloudinary-is-your-best-choice-for-image-hosting-a-complete-guide-with-next-js-8e80e935603d)
- [Next Cloudinary](https://next.cloudinary.dev/) - Official docs

### Forms & Validation
- [Type-Safe Form Validation in Next.js 15: Zod, RHF, & Server Actions](https://www.abstractapi.com/guides/email-validation/type-safe-form-validation-in-next-js-15-with-zod-and-react-hook-form) - HIGH confidence
- [Mastering Form Handling in Next.js 15 with Server Actions, React Hook Form, React Query, and ShadCN](https://medium.com/@sankalpa115/mastering-form-handling-in-next-js-15-with-server-actions-react-hook-form-react-query-and-shadcn-108f6863200f)
- [Zod Official Docs](https://zod.dev/) - Zod 4 release

### UI & Styling
- [Shadcn UI + Tailwind CSS 4 in Next.js 15: A Beginner's Complete Guide (2025 Edition)](https://medium.com/@sureshdotariya/shadcn-ui-tailwind-css-4-in-next-js-15-a-beginners-complete-guide-2025-edition-6e96f667b5a5)
- [Best Practices for Using shadcn/ui in Next.js](https://insight.akarinti.tech/best-practices-for-using-shadcn-ui-in-next-js-2134108553ae)
- [Tailwind CSS v4: The Complete Guide for 2026](https://devtoolbox.dedyn.io/blog/tailwind-css-v4-complete-guide) - HIGH confidence
- [Tailwind CSS v4.0 Official](https://tailwindcss.com/blog/tailwindcss-v4)

### Meetup Integration
- [Meetup Widget - Embed Meetup Features on Your Website for Free (2025)](https://elfsight.com/meetup-widget/)
- [How to embed Meetup Group Events on your HTML website for FREE?](https://www.sociablekit.com/tutorials/embed-meetup-group-events-html/)

### Package Versions
- [react-hook-form npm](https://www.npmjs.com/package/react-hook-form) - v7.71.1
- [Tailwind CSS Releases](https://github.com/tailwindlabs/tailwindcss/releases) - v4.1+

---

**Stack researched for:** Checkmate & Connect Community Website
**Research date:** 2026-02-14
**Next steps:** Use this stack to create roadmap with phased implementation
