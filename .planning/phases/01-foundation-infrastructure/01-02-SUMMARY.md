---
phase: 01-foundation-infrastructure
plan: 02
subsystem: infra, cms
tags: [sanity, next-sanity, cms, groq, portable-text, image-optimization]

# Dependency graph
requires:
  - phase: 01-01
    provides: Next.js app structure, Sanity CDN image patterns in next.config.ts
provides:
  - Sanity CMS v3 client with CDN support
  - Image URL builder for optimized Sanity CDN delivery (AVIF/WebP)
  - GROQ queries for members and blog posts
  - Sanity Studio embedded at /studio route
  - Member schema with privacy opt-in workflow (pending/approved/rejected status)
  - Blog post schema with Portable Text rich content
affects: [02-public-pages, 03-admin, member-directory, blog]

# Tech tracking
tech-stack:
  added: [next-sanity, @sanity/client, @sanity/image-url, @sanity/vision, @portabletext/react, sanity, sanity-plugin-media]
  patterns: [Privacy-first approval workflow with status field defaulting to pending, Sanity CDN image optimization with hotspot, GROQ queries for content fetching]

key-files:
  created:
    - sanity.config.ts
    - lib/sanity/schemas/member.ts
    - lib/sanity/schemas/blogPost.ts
    - app/studio/[[...index]]/page.tsx
  modified:
    - lib/sanity/client.ts
    - lib/sanity/imageUrl.ts
    - lib/sanity/queries.ts
    - lib/sanity/schemas/index.ts
    - package.json

key-decisions:
  - "Sanity v3 with embedded Studio at /studio (not separate deployment)"
  - "Member status field architecture: pending/approved/rejected with pending default enforces privacy opt-in before public display"
  - "Image hotspot enabled on all image fields for Sanity CDN focal point optimization"
  - "GROQ queries filter members by status=='approved' for privacy compliance"
  - "Portable Text array with block + image types for rich blog content"

patterns-established:
  - "Privacy-first pattern: All member schemas default to pending status, require explicit approval before public visibility"
  - "Image optimization pattern: All images use Sanity CDN with hotspot, accessed via urlFor() builder"
  - "Content queries pattern: GROQ queries defined centrally in lib/sanity/queries.ts for reuse"

# Metrics
duration: 6min
completed: 2026-02-14
---

# Phase 01 Plan 02: Sanity CMS Configuration Summary

**Sanity CMS v3 with embedded Studio, member/blog schemas enforcing privacy-first approval workflow, and Sanity CDN image optimization pipeline**

## Performance

- **Duration:** 6 min 16 sec
- **Started:** 2026-02-14T17:49:01Z
- **Completed:** 2026-02-14T17:55:17Z
- **Tasks:** 2
- **Files modified:** 8 (4 created, 4 modified)

## Accomplishments
- Sanity CMS client configured with CDN support and API v2024-01-01
- Image URL builder enabling AVIF/WebP optimization via Sanity CDN (satisfies FOUND-06)
- Member schema with privacy-first status field (pending/approved/rejected, default pending) for FOUND-07 opt-in workflow
- Blog post schema with Portable Text rich content support
- Sanity Studio embedded at /studio with structure and vision plugins
- GROQ queries filtering approved members and fetching blog posts

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Sanity dependencies and configure client + Studio** - `3b21425` (feat)
2. **Task 2: Create member and blog post content schemas** - `2f00190` (feat)

## Files Created/Modified

**Created:**
- `sanity.config.ts` - Sanity Studio configuration with structure and vision tools
- `lib/sanity/schemas/member.ts` - Member schema with status field for approval workflow
- `lib/sanity/schemas/blogPost.ts` - Blog post schema with Portable Text body
- `app/studio/[[...index]]/page.tsx` - Embedded Studio route using NextStudio

**Modified:**
- `lib/sanity/client.ts` - Configured client with project ID, dataset, API version, CDN enabled
- `lib/sanity/imageUrl.ts` - Image URL builder wrapping Sanity client
- `lib/sanity/queries.ts` - GROQ queries for members (filtered by approved status), blog posts, single post by slug
- `lib/sanity/schemas/index.ts` - Export array of member and blog post schemas
- `package.json` - Added 7 Sanity packages (993 total packages installed)

## Decisions Made

1. **Sanity v3 with embedded Studio** - Studio lives at /studio within the Next.js app rather than separate deployment. Simplifies architecture and deployment.

2. **Privacy-first status field** - Member schema defaults status to 'pending'. Only members with status='approved' appear in public queries. Enforces explicit opt-in before profile visibility (FOUND-07).

3. **Sanity CDN for all images** - All image fields enable hotspot for focal point cropping. urlFor() builder generates optimized CDN URLs with AVIF/WebP format and quality controls (FOUND-06).

4. **Portable Text for blog content** - Blog post body uses array of block + image types, enabling rich text editing in Studio with inline images.

5. **GROQ queries centralized** - All content queries defined in lib/sanity/queries.ts for reuse across components, including status filtering for members.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed without blockers. TypeScript compilation clean. Studio route accessible at /studio (returns 200).

## User Setup Required

**External services require manual configuration.** Sanity CMS needs project credentials:

### Environment Variables

Add to `.env.local`:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID="your-project-id"
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_API_VERSION="2024-01-01"
```

### How to Get Credentials

1. **Create Sanity project:**
   ```bash
   npx sanity init
   ```
   OR visit https://manage.sanity.io → Create Project

2. **Get Project ID:** manage.sanity.io → Project Settings → Project ID

3. **Get Dataset:** Usually "production" (default) or "development"

### Verification

Once env vars are set:

```bash
npm run dev
```

Visit http://localhost:3000/studio - Sanity Studio should load with Member and Blog Post document types visible in sidebar.

## Next Phase Readiness

**Ready for Phase 2 (Public Pages):**
- CMS configured and schemas defined
- Member schema enforces privacy with approval workflow
- Image optimization pipeline ready via Sanity CDN
- GROQ queries defined for content fetching

**Blockers:**
- Phase 1 blocker (user setup validation): Before proceeding to Phase 2, must validate Sanity Studio usability with non-technical team member to confirm CMS isn't too complex. This addresses FOUND-05 pitfall (CMS complexity mismatch).

**Pending user setup:**
- Sanity project creation and env var configuration required before Studio is functional
- Once configured, can create test member and blog post content for Phase 2 development

---
*Phase: 01-foundation-infrastructure*
*Completed: 2026-02-14*

## Self-Check: PASSED

All files verified to exist:
- ✓ sanity.config.ts
- ✓ lib/sanity/schemas/member.ts
- ✓ lib/sanity/schemas/blogPost.ts
- ✓ app/studio/[[...index]]/page.tsx

All commits verified:
- ✓ 3b21425 (Task 1: Sanity client and Studio)
- ✓ 2f00190 (Task 2: Content schemas)
