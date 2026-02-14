# Architecture Research

**Domain:** Community Website with Member Directory and CMS
**Researched:** 2026-02-14
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│                      (Next.js App)                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Public  │  │  Member  │  │   Blog   │  │  Admin   │    │
│  │  Pages   │  │Directory │  │  Pages   │  │Dashboard │    │
│  │  (SSG)   │  │  (SSG)   │  │  (SSG)   │  │  (SSR)   │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │             │             │             │           │
├───────┴─────────────┴─────────────┴─────────────┴───────────┤
│                      DATA LAYER                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │          Headless CMS (Sanity/Payload/Strapi)       │    │
│  │   • Member submissions (pending/approved status)    │    │
│  │   • Blog posts                                      │    │
│  │   • Static content                                  │    │
│  │   • Image assets                                    │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                    AUTHENTICATION                            │
│  ┌──────────┐                                                │
│  │  Better  │  or  NextAuth.js (Admin access only)          │
│  │  Auth    │                                                │
│  └──────────┘                                                │
├─────────────────────────────────────────────────────────────┤
│                  HOSTING & DEPLOYMENT                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │  Vercel  │  │   CDN    │  │  Image   │                   │
│  │/Netlify  │  │  Edge    │  │ Optimize │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Public Pages** | Landing, about, static content - served to all visitors | Next.js SSG pages, rebuilt on content updates via webhook |
| **Member Directory** | Display approved members with search/filter | Next.js SSG, rebuilt when members approved, client-side filtering |
| **Blog** | Display published blog posts | Next.js SSG/ISR, rebuilt on new posts or periodic revalidation |
| **Admin Dashboard** | Manage submissions, approve members, edit blog posts | Next.js SSR pages with authentication, server actions for mutations |
| **Headless CMS** | Content storage, admin UI, approval workflow state | Self-hosted (Payload/Strapi) or cloud (Sanity) with generous free tier |
| **Authentication** | Admin-only access control | Better-Auth or NextAuth.js with simple credential/OAuth provider |
| **Submission Form** | Public form for member applications | Next.js page with Server Actions posting to CMS |
| **External Embeds** | Meetup widget integration | Client component with iframe/script tag |
| **Image Handling** | Store, optimize, and serve member/blog images | CMS asset storage + Next.js Image component + Vercel optimization |

## Recommended Project Structure

```
checkmate-connect/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/          # Public pages group
│   │   │   ├── page.tsx       # Landing page (SSG)
│   │   │   ├── members/       # Member directory
│   │   │   │   └── page.tsx   # Directory listing (SSG)
│   │   │   ├── blog/          # Blog section
│   │   │   │   ├── page.tsx   # Blog index (SSG)
│   │   │   │   └── [slug]/    # Individual posts (SSG)
│   │   │   └── apply/         # Member submission form
│   │   │       └── page.tsx   # Public form
│   │   ├── (admin)/           # Admin pages group
│   │   │   ├── layout.tsx     # Auth wrapper
│   │   │   ├── dashboard/     # Admin home
│   │   │   ├── members/       # Manage members
│   │   │   │   └── page.tsx   # List pending/approved
│   │   │   └── blog/          # Manage blog posts
│   │   │       └── page.tsx   # Create/edit posts
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Auth endpoints
│   │   │   └── webhooks/      # CMS webhooks for rebuilds
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/                # Reusable UI components
│   │   ├── forms/             # Form components
│   │   ├── member-card.tsx    # Member display
│   │   ├── blog-post.tsx      # Blog post display
│   │   └── meetup-widget.tsx  # External embed wrapper
│   ├── lib/                   # Core utilities
│   │   ├── cms/               # CMS client/queries
│   │   │   ├── client.ts      # CMS SDK initialization
│   │   │   ├── members.ts     # Member queries
│   │   │   └── blog.ts        # Blog queries
│   │   ├── auth.ts            # Auth configuration
│   │   └── validations.ts     # Zod schemas
│   └── actions/               # Server Actions
│       ├── members.ts         # Member submission/approval
│       └── blog.ts            # Blog CRUD operations
├── cms/                       # If self-hosting (Payload/Strapi)
│   └── [CMS-specific files]
├── public/                    # Static assets
└── .env.local                 # Environment variables
```

### Structure Rationale

- **Route groups `(public)` and `(admin)`**: Organize pages by access level without affecting URLs, makes auth boundaries explicit
- **Co-located components**: Member/blog components near their routes for easier maintenance
- **CMS abstraction in `lib/cms/`**: Isolates CMS-specific code, makes switching CMS providers easier
- **Server Actions in `actions/`**: Centralized mutations following 2026 Next.js best practices, avoids unnecessary API routes
- **Separate CMS directory**: If self-hosting, keeps CMS configuration separate from frontend code

## Architectural Patterns

### Pattern 1: Hybrid Rendering Strategy

**What:** Different rendering modes for different page types based on update frequency and data sensitivity

**When to use:** Always for community websites - optimizes performance and reduces server load

**Trade-offs:**
- Pros: Fast public pages (SSG), real-time admin (SSR), minimal server cost
- Cons: Slightly more complex mental model, requires understanding of when pages rebuild

**Example:**
```typescript
// Public member directory - Static Site Generation
// app/(public)/members/page.tsx
export default async function MembersPage() {
  const members = await getApprovedMembers(); // Fetched at build time
  return <MemberGrid members={members} />;
}

// Rebuild on CMS webhook
export const revalidate = false; // On-demand only via webhook

// Admin dashboard - Server-Side Rendering
// app/(admin)/dashboard/page.tsx
export const dynamic = 'force-dynamic'; // Always fresh data

export default async function AdminDashboard() {
  const session = await getSession(); // Check auth on every request
  const pending = await getPendingMembers(); // Real-time data
  return <PendingList members={pending} />;
}
```

### Pattern 2: Approval Workflow State Machine

**What:** Status-based content management with explicit state transitions for member submissions

**When to use:** Any content requiring admin approval before publication

**Trade-offs:**
- Pros: Clear data model, easy to query by status, audit trail friendly
- Cons: Requires CMS to support status field, need rebuild trigger on approval

**Example:**
```typescript
// CMS Schema (Sanity example)
export const memberSchema = {
  name: 'member',
  type: 'document',
  fields: [
    { name: 'name', type: 'string', validation: Rule => Rule.required() },
    { name: 'email', type: 'string', validation: Rule => Rule.required().email() },
    { name: 'bio', type: 'text' },
    { name: 'status', type: 'string', options: {
      list: [
        { title: 'Pending', value: 'pending' },
        { title: 'Approved', value: 'approved' },
        { title: 'Rejected', value: 'rejected' }
      ]
    }, initialValue: 'pending' },
    { name: 'submittedAt', type: 'datetime', initialValue: () => new Date().toISOString() },
    { name: 'approvedAt', type: 'datetime' },
    { name: 'approvedBy', type: 'string' }
  ]
};

// Server Action for approval
// actions/members.ts
'use server'
export async function approveMember(memberId: string) {
  const session = await getSession();
  if (!session?.user?.isAdmin) throw new Error('Unauthorized');

  await cms.patch(memberId).set({
    status: 'approved',
    approvedAt: new Date().toISOString(),
    approvedBy: session.user.email
  }).commit();

  // Trigger rebuild of member directory
  await fetch(`${process.env.NEXT_PUBLIC_URL}/api/revalidate?secret=${process.env.REVALIDATE_TOKEN}`, {
    method: 'POST',
    body: JSON.stringify({ path: '/members' })
  });
}
```

### Pattern 3: CMS Webhook-Driven Builds

**What:** CMS sends webhook on content changes to trigger selective page rebuilds

**When to use:** With SSG/ISR to keep content fresh without manual deployments

**Trade-offs:**
- Pros: Content updates appear quickly, no manual deployment needed
- Cons: Requires webhook endpoint setup, small delay between save and publish

**Example:**
```typescript
// app/api/webhooks/cms/route.ts
export async function POST(request: Request) {
  const signature = request.headers.get('x-sanity-signature');
  const body = await request.text();

  // Verify webhook signature
  if (!verifySignature(body, signature)) {
    return new Response('Invalid signature', { status: 401 });
  }

  const payload = JSON.parse(body);

  // Revalidate affected paths
  if (payload.type === 'member.approved') {
    await revalidatePath('/members');
  } else if (payload.type === 'blogPost.published') {
    await revalidatePath('/blog');
    await revalidatePath(`/blog/${payload.slug}`);
  }

  return new Response('OK', { status: 200 });
}
```

### Pattern 4: Form Submission with Server Actions

**What:** Client-side forms that POST directly to server actions, no API route needed

**When to use:** Modern Next.js (2026) for all form submissions - simpler than API routes

**Trade-offs:**
- Pros: Less boilerplate, automatic CSRF protection, progressive enhancement
- Cons: Requires App Router (not available in Pages Router)

**Example:**
```typescript
// app/(public)/apply/page.tsx
import { submitMemberApplication } from '@/actions/members';

export default function ApplyPage() {
  return (
    <form action={submitMemberApplication}>
      <input name="name" required />
      <input name="email" type="email" required />
      <textarea name="bio" required />
      <button type="submit">Submit Application</button>
    </form>
  );
}

// actions/members.ts
'use server'
import { z } from 'zod';
import { redirect } from 'next/navigation';

const memberSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  bio: z.string().min(50).max(500)
});

export async function submitMemberApplication(formData: FormData) {
  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    bio: formData.get('bio')
  };

  const validated = memberSchema.parse(data);

  await cms.create({
    _type: 'member',
    ...validated,
    status: 'pending'
  });

  redirect('/apply/success');
}
```

## Data Flow

### Member Submission Flow

```
[Public User]
    ↓
[Fill Application Form] → [Client-side validation]
    ↓
[Submit via Server Action] → [Server-side validation (Zod)]
    ↓
[Create in CMS] → [Status: pending]
    ↓
[Success page] ← [Redirect]

[Admin logs in]
    ↓
[Admin Dashboard] → [Fetch pending members] → [CMS API query]
    ↓
[Review submission]
    ↓
[Approve/Reject] → [Update status via Server Action] → [CMS API mutation]
    ↓
[Trigger webhook] → [Rebuild /members page]
    ↓
[Member appears on public directory]
```

### Blog Post Flow

```
[Admin logs in]
    ↓
[Admin Blog Manager] → [Draft new post in CMS Studio]
    ↓
[Write content] → [Upload images] → [CMS asset storage]
    ↓
[Publish] → [CMS webhook fires]
    ↓
[Next.js webhook handler] → [Revalidate /blog and /blog/[slug]]
    ↓
[SSG rebuild] → [New static pages generated]
    ↓
[Blog post live on site]
```

### Authentication Flow

```
[Admin navigates to /admin]
    ↓
[Middleware checks session] → [No session found]
    ↓
[Redirect to /login]
    ↓
[Enter credentials] → [Server Action validates]
    ↓
[Create session cookie] → [Better-Auth/NextAuth]
    ↓
[Redirect to /admin/dashboard]
    ↓
[All /admin/* pages check auth in layout]
```

### Build Order Dependencies

**Phase 1: Foundation** (no dependencies)
- Next.js app initialization
- Basic project structure
- Environment variables setup

**Phase 2: CMS Integration** (depends on Phase 1)
- Choose and configure CMS (Sanity/Payload/Strapi)
- Define content schemas (Member, BlogPost)
- Set up CMS client in `lib/cms/`

**Phase 3: Public Pages** (depends on Phase 2)
- Landing page (static content)
- Member directory (SSG, reads from CMS)
- Blog pages (SSG/ISR, reads from CMS)
- Member application form (Server Action writes to CMS)

**Phase 4: Authentication** (depends on Phase 1)
- Install Better-Auth or NextAuth
- Create login page
- Implement middleware for protected routes

**Phase 5: Admin Dashboard** (depends on Phase 2, 4)
- Admin layout with auth check
- Pending members list (SSR, reads from CMS)
- Member approval actions (Server Actions, writes to CMS)
- Blog post manager (can use CMS Studio directly)

**Phase 6: Webhooks & Revalidation** (depends on Phase 3, 5)
- Webhook endpoint in Next.js
- Configure CMS to send webhooks
- Implement selective revalidation logic

**Phase 7: Polish & Production** (depends on all above)
- Image optimization setup
- External embeds (Meetup widget)
- SEO meta tags
- Error handling
- Deploy to Vercel/Netlify

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **0-100 members** | Monolith Next.js app, all SSG, rebuild entire site on changes (~30s builds). Free CMS tier sufficient. Single admin user. |
| **100-1k members** | Move to ISR for member directory (revalidate every hour), on-demand revalidation via webhooks for approved members only. Consider CMS paid tier for better asset storage. Multiple admin users. |
| **1k-10k members** | Implement client-side search/filter on pre-built directory (ship all data to client, filter in browser). Consider pagination if directory gets slow. CDN becomes more important. Image optimization critical. |
| **10k+ members** | Switch to SSR or API-based directory with server-side search, database behind CMS becomes bottleneck, consider Postgres/MySQL. May need to separate CMS from frontend hosting. Unlikely for most community sites. |

### Scaling Priorities

1. **First bottleneck:** Build times get slow (>2 min) when member count grows
   - **Fix:** Switch from full SSG rebuild to ISR with on-demand revalidation
   - **When:** Around 500-1000 members or 100+ blog posts

2. **Second bottleneck:** CMS free tier limits (API requests, bandwidth, asset storage)
   - **Fix:** Upgrade to paid tier ($10-30/mo gets you far) or self-host
   - **When:** Hitting rate limits or storage caps (varies by CMS)

3. **Third bottleneck:** Admin dashboard gets slow loading all pending members
   - **Fix:** Add pagination to admin lists, implement server-side filtering
   - **When:** 50+ pending submissions regularly

## Anti-Patterns

### Anti-Pattern 1: Using API Routes for Simple Mutations

**What people do:** Create `/api/members` endpoint just to proxy to CMS

**Why it's wrong:** Extra boilerplate, no progressive enhancement, doesn't leverage Next.js caching

**Do this instead:** Use Server Actions directly from forms/buttons - simpler, faster, better UX

### Anti-Pattern 2: Making Everything SSR Because "Real-Time Data"

**What people do:** Set `export const dynamic = 'force-dynamic'` on all pages

**Why it's wrong:** Public pages don't need real-time data, wastes server resources, slower for users

**Do this instead:** SSG/ISR for public content, SSR only for authenticated admin pages

### Anti-Pattern 3: Client-Side Rendering for SEO-Critical Content

**What people do:** Fetch member directory data in `useEffect`, render loading spinner

**Why it's wrong:** Search engines don't see content, slower perceived performance, bad UX

**Do this instead:** Fetch data in server components, ship rendered HTML, hydrate for interactivity

### Anti-Pattern 4: Storing Secrets in Git

**What people do:** Commit `.env` file with CMS tokens and auth secrets

**Why it's wrong:** Security breach waiting to happen, tokens get leaked on GitHub

**Do this instead:** Use `.env.local` (gitignored), store production secrets in Vercel/Netlify dashboard

### Anti-Pattern 5: Building Custom Admin UI When CMS Has One

**What people do:** Create Next.js admin pages for every content type

**Why it's wrong:** Duplicate effort, worse UX than CMS Studio, harder to maintain

**Do this instead:** Use CMS Studio for content editing (members, blog posts), build custom admin pages only for approval workflows CMS can't handle

### Anti-Pattern 6: Not Optimizing Images

**What people do:** Let admins upload 5MB JPEGs, serve them directly

**Why it's wrong:** Slow page loads, wasted bandwidth, poor Core Web Vitals

**Do this instead:** Use Next.js `<Image>` component everywhere, CMS asset optimization, modern formats (WebP/AVIF)

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Headless CMS** | SDK in `lib/cms/client.ts`, queries in feature files | Sanity: use `@sanity/client`, Payload: use REST API, Strapi: use REST/GraphQL |
| **Meetup Widget** | Client Component with `<Script>` or iframe | Keep in separate component, lazy load below fold |
| **Image CDN** | Next.js Image with CMS asset URLs | Vercel handles optimization automatically, self-hosted needs `sharp` |
| **Email (future)** | Resend/SendGrid via Server Action | For member approval notifications, newsletter (defer to later phase) |
| **Analytics (future)** | Vercel Analytics or Plausible | Defer until traffic justifies it |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Public Pages ↔ CMS** | Read-only queries at build time | SSG fetches data, caches in static HTML |
| **Admin Pages ↔ CMS** | Read/write via SDK at request time | SSR fetches fresh data, Server Actions mutate |
| **Form ↔ Server Action** | `action={functionName}` prop | Progressive enhancement, works without JS |
| **CMS ↔ Next.js** | Webhooks for cache invalidation | CMS posts to `/api/webhooks/cms` on content changes |
| **Auth ↔ Admin Pages** | Middleware checks session | Redirects to login if unauthenticated |

## CMS Recommendation for This Project

Based on constraints (non-technical admins, no developers for maintenance, free hosting):

**Recommended: Sanity**

**Why:**
- Generous free tier (3 users, 10GB bandwidth, 500k API requests/mo)
- Best-in-class admin UI (Sanity Studio) - easy for non-technical users
- Excellent Next.js integration with official SDK
- Hosted (no server maintenance)
- Can embed Studio in Next.js app or use separate studio.sanity.io
- Strong TypeScript support for developer handoff

**Second choice: Payload**

**Why:**
- Open source, no vendor lock-in
- Modern, clean admin UI
- Built with TypeScript from the ground up
- Can self-host for free
- Requires Node.js hosting (free on Railway/Render up to certain usage)
- Better if you want complete control and self-hosting

**Avoid: Strapi for this project**

**Why:**
- Admin UI more complex, steeper learning curve
- Requires more server resources (not ideal for free tier)
- Better for larger teams with technical capacity

## Image Handling Strategy

**Approach:** CMS stores originals, Next.js optimizes on-demand

**Implementation:**
1. Admin uploads images to CMS (Sanity Asset CDN or Payload uploads)
2. CMS returns image URL
3. Frontend uses `<Image src={cmsImageUrl} />` component
4. Vercel/Netlify optimizes on first request, caches forever
5. Automatically serves WebP/AVIF to supporting browsers

**Configuration:**
```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['cdn.sanity.io'], // Allow CMS image domain
    formats: ['image/avif', 'image/webp'], // Modern formats
    deviceSizes: [640, 750, 828, 1080, 1200], // Responsive breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Smaller sizes
  }
};
```

**Best practices:**
- Always use `<Image>` component, never `<img>` tag
- Specify width/height for layout stability (prevents CLS)
- Use `priority` prop for above-fold images
- Use `placeholder="blur"` with blurDataURL for better UX
- Compress source images before upload (CMS plugin or manual)

## Sources

**Next.js & Headless CMS:**
- [Best headless CMS for Next.js in 2026 | Naturaily](https://naturaily.com/blog/next-js-cms)
- [10 best CMSs for Next.js in 2026 | Hygraph](https://hygraph.com/blog/nextjs-cms)
- [Payload: The Next.js Headless CMS](https://payloadcms.com/)
- [Next.JS CMS - Sanity](https://www.sanity.io/nextjs-cms)
- [The best open-source headless CMS for Next.js - Strapi](https://strapi.io/integrations/nextjs-cms)

**Architecture Patterns:**
- [SSR vs. SSG in Next.js: Latest Trends & Best Practices for 2026](https://colorwhistle.com/ssr-ssg-trends-nextjs/)
- [When to Use SSR, SSG, or ISR in Next.js | 2026](https://bitskingdom.com/blog/nextjs-when-to-use-ssr-vs-ssg-vs-isr/)
- [SSR vs. SSG in Next.js - Strapi](https://strapi.io/blog/ssr-vs-ssg-in-nextjs-differences-advantages-and-use-cases)
- [SSG vs SSR in Next.js - AWS Blog](https://aws.amazon.com/blogs/mobile/ssg-vs-ssr-in-next-js-web-applications-choosing-the-right-rendering-approach/)

**Authentication:**
- [Guides: Authentication | Next.js](https://nextjs.org/docs/app/guides/authentication)
- [Better-Auth with Next.js — A Complete Guide](https://medium.com/@amitupadhyay878/better-auth-with-next-js-a-complete-guide-for-modern-authentication-06eec09d6a64)
- [20 Best Free Next.js Admin Dashboard Templates 2026](https://adminlte.io/blog/nextjs-admin-dashboard-templates/)

**Forms & Server Actions:**
- [Getting Started: Updating Data | Next.js](https://nextjs.org/docs/app/getting-started/updating-data)
- [Next.js Forms with Server Actions](https://www.robinwieruch.de/next-forms/)
- [The Only Guide You Need for Next.js Forms: Server Actions, Zod & Validation (2025)](https://www.deepintodev.com/blog/form-handling-in-nextjs)

**Image Optimization:**
- [Image Optimization with Vercel](https://vercel.com/docs/image-optimization)
- [Optimizing Image Performance in Next.js: Best Practices](https://geekyants.com/blog/optimizing-image-performance-in-nextjs-best-practices-for-fast-visual-web-apps)
- [Getting Started: Image Optimization | Next.js](https://nextjs.org/docs/app/getting-started/images)

**Project Structure:**
- [Getting Started: Project Structure | Next.js](https://nextjs.org/docs/app/getting-started/project-structure)
- [The Battle-Tested NextJS Project Structure I Use in 2025](https://medium.com/@burpdeepak96/the-battle-tested-nextjs-project-structure-i-use-in-2025-f84c4eb5f426)
- [The Ultimate Guide to Organizing Your Next.js 15 Project Structure](https://www.wisp.blog/blog/the-ultimate-guide-to-organizing-your-nextjs-15-project-structure)

**CMS Comparison:**
- [Headless CMS Showdown: Contentful vs Strapi vs Sanity in 2026](https://syntaxhut.tech/blog/contentful-vs-strapi-vs-sanity-comparison)
- [2025 Headless CMS Guide: Payload vs Strapi vs Sanity](https://pooya.blog/blog/headless-cms-consultancy/)
- [Choosing a Headless CMS in 2026: A Straight-Talk Guide](https://focusreactive.com/choosing-a-headless-cms/)

**Approval Workflows:**
- [The 2026 Guide to Agentic Workflow Architectures](https://www.stack-ai.com/blog/the-2026-guide-to-agentic-workflow-architectures)
- [Building Intelligent Bank Approval Workflows with Symfony 7.4 and AI Integration](https://www.techedubyte.com/building-bank-approval-workflows-symfony-ai-integration/)
- [Approval Process: Ultimate Guide to Automated Approval Processes 2026](https://kissflow.com/workflow/approval-process/)

**Maintenance & Non-Technical Users:**
- [Should You Use Next.js in 2026? Pros, Cons & Use Cases](https://pagepro.co/blog/pros-and-cons-of-nextjs/)
- [Next.js Best Practices in 2025: Performance & Architecture](https://www.raftlabs.com/blog/building-with-next-js-best-practices-and-benefits-for-performance-first-teams/)

---
*Architecture research for: Checkmate & Connect Community Website*
*Researched: 2026-02-14*
*Confidence: HIGH - All recommendations verified against official Next.js 2026 documentation and current CMS provider capabilities*
