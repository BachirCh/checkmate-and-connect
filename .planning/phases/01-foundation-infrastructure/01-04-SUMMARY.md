---
phase: 01-foundation-infrastructure
plan: 04
subsystem: infrastructure
tags: [netlify, deployment, seo, spam-protection, recaptcha, rate-limiting]
dependency_graph:
  requires: [01-01, 01-02, 01-03]
  provides: [netlify-config, robots-txt, sitemap, spam-protection-utilities, health-check]
  affects: [deployment, forms, seo]
tech_stack:
  added: ["react-google-recaptcha-v3"]
  patterns: [dynamic-routes, in-memory-rate-limiting, honeypot, recaptcha-v3]
key_files:
  created:
    - netlify.toml
    - app/robots.ts
    - app/sitemap.ts
    - app/api/health/route.ts
    - lib/spam-protection.ts
    - components/RecaptchaProvider.tsx
  modified:
    - package.json
decisions:
  - "Netlify deployment with staging/production branch contexts"
  - "Dynamic robots.txt blocks /studio/ and /api/ from crawlers"
  - "Dynamic sitemap.xml gracefully handles missing Sanity configuration"
  - "Three-layer spam protection: reCAPTCHA v3 + honeypot + rate limiting"
  - "In-memory rate limiting sufficient for MVP (Redis/Upstash for production scale)"
  - "RecaptchaProvider wraps form pages, not entire app"
metrics:
  duration: 3min
  tasks_completed: 2
  files_created: 6
  files_modified: 1
  commits: 3
  completed_at: "2026-02-14T18:01:00Z"
---

# Phase 01 Plan 04: Netlify Deployment and Infrastructure Summary

**One-liner:** Netlify CI/CD configuration with security headers, SEO fundamentals (robots.txt, sitemap.xml), and three-layer spam protection (reCAPTCHA v3, honeypot, rate limiting) ready for form integration.

## Tasks Completed

| Task | Name                                    | Commit  | Files                                                                      |
| ---- | --------------------------------------- | ------- | -------------------------------------------------------------------------- |
| 1    | Configure Netlify deployment and SEO    | fdc4886 | netlify.toml, robots.ts, sitemap.ts, api/health/route.ts                  |
| 2    | Create spam protection utilities        | 8e09789 | spam-protection.ts, RecaptchaProvider.tsx, package.json                    |
| -    | Fix missing Supabase dependencies       | e183d53 | package.json, package-lock.json                                            |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Dynamic sitemap import to handle missing env vars**
- **Found during:** Task 1 verification
- **Issue:** Build failed when Sanity env vars missing (NEXT_PUBLIC_SANITY_PROJECT_ID). The top-level `import { client }` statement was executed during build, causing Sanity client instantiation to fail.
- **Fix:** Changed sitemap.ts to check for env var before attempting Sanity client import. Used dynamic import (`await import('@/lib/sanity/client')`) instead of top-level import. Added early return if NEXT_PUBLIC_SANITY_PROJECT_ID is missing.
- **Files modified:** app/sitemap.ts
- **Commit:** fdc4886 (included in Task 1)
- **Impact:** Build succeeds even without Sanity configuration. Sitemap returns static pages only until Sanity is configured.

**2. [Rule 3 - Blocking] Missing Supabase dependencies from Plan 01-03**
- **Found during:** Final verification
- **Issue:** Build failed with "Cannot find module '@supabase/ssr'" error. Plan 01-03 SUMMARY documented installing these packages, but they were not present in package.json.
- **Fix:** Installed @supabase/ssr and @supabase/supabase-js packages.
- **Files modified:** package.json, package-lock.json
- **Commit:** e183d53
- **Impact:** Build now succeeds. Previous plan's incomplete dependency installation corrected.

## What Was Built

### Netlify Deployment Configuration

**netlify.toml:**
- Build command: `npm run build`
- Publish directory: `.next`
- Node version: 20
- Branch contexts: production and staging with identical environment variables
- Security headers: X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy (strict-origin-when-cross-origin)

**Addresses:** FOUND-05 (Hosting with CI/CD), FOUND-09 (Development environment with staging)

### SEO Fundamentals

**app/robots.ts** - Dynamic robots.txt generation:
- Allow all crawlers on root path
- Disallow `/studio/` (Sanity CMS admin)
- Disallow `/api/` (API endpoints)
- References sitemap URL from `NEXT_PUBLIC_SITE_URL` env var

**app/sitemap.ts** - Dynamic sitemap.xml generation:
- Static entries: homepage, /members, /blog
- Dynamic entries: Fetches blog post slugs from Sanity client
- Gracefully handles missing Sanity configuration (returns static entries only)
- Uses `MetadataRoute.Sitemap` return type for Next.js compatibility

**app/api/health/route.ts** - Health check endpoint:
- Returns JSON: `{ status: 'ok', timestamp: ISO8601 }`
- Used to verify deployment is working

**Addresses:** FOUND-10 (SEO configuration)

### Spam Protection Utilities

**lib/spam-protection.ts** - Three-layer protection:

1. **verifyRecaptcha(token, action)** - Google reCAPTCHA v3 server-side verification:
   - POSTs to Google siteverify endpoint with RECAPTCHA_SECRET_KEY
   - Verifies action matches and score >= 0.5 (human threshold)
   - Returns `{ success: boolean, score: number }`

2. **checkHoneypot(formData)** - Hidden field bot detection:
   - Checks for `_honey`, `honeypot`, or `_url` field
   - Returns true if field has value (bot detected)
   - Simple, effective against unsophisticated bots

3. **rateLimit(identifier, maxAttempts, windowMs)** - In-memory rate limiter:
   - Tracks attempts by identifier (e.g., IP address)
   - Default: 5 attempts per 60 seconds
   - Returns `{ allowed: boolean, remaining: number }`
   - Note: Resets on server restart. Sufficient for MVP; migrate to Redis (Upstash) for production scale if needed.

**components/RecaptchaProvider.tsx** - Client component:
- Wraps `GoogleReCaptchaProvider` from react-google-recaptcha-v3
- Uses `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` from environment
- Gracefully handles missing site key (logs warning, renders children directly)
- Will wrap form pages in Phase 3 (not entire app)

**Addresses:** FOUND-08 (Spam protection with three layers)

## Technical Decisions

### 1. Dynamic Sitemap with Graceful Degradation

**Decision:** Sitemap checks for Sanity configuration before attempting to fetch blog posts.

**Context:** Build-time sitemap generation fails if Sanity env vars are missing. User setup section indicates these will be configured later.

**Implementation:** Check `NEXT_PUBLIC_SANITY_PROJECT_ID` exists before dynamic import of Sanity client. Return static pages if missing.

**Impact:** Build succeeds immediately. Sitemap upgrades to include blog posts once Sanity is configured. No code changes needed.

### 2. In-Memory Rate Limiting for MVP

**Decision:** Use in-memory Map-based rate limiter instead of Redis/Upstash.

**Context:** Requirements specify MVP scope. Redis adds infrastructure complexity.

**Trade-offs:**
- Pro: Zero external dependencies, simple implementation, sufficient for moderate traffic
- Con: Resets on server restart, doesn't work across multiple server instances

**Migration path:** Comment in code documents Redis (Upstash) as production scale option if needed.

**Impact:** MVP can launch without Redis. Upgrade path clear if traffic warrants it.

### 3. RecaptchaProvider Wraps Forms, Not App

**Decision:** RecaptchaProvider is a standalone component for form pages, not a layout wrapper.

**Context:** reCAPTCHA only needed on pages with forms (contact, member submissions). Loading script globally adds unnecessary overhead.

**Implementation:** Component will be used in Phase 3 when forms are built. Pages with forms will wrap their content with RecaptchaProvider.

**Impact:** Faster page loads on non-form pages. Smaller bundle for users who never submit forms.

### 4. Security Headers in Netlify Config

**Decision:** Configure security headers in netlify.toml instead of Next.js middleware.

**Context:** Netlify can apply headers at CDN edge, before Next.js processes request.

**Headers applied:**
- X-Frame-Options: DENY (prevent clickjacking)
- X-Content-Type-Options: nosniff (prevent MIME sniffing)
- Referrer-Policy: strict-origin-when-cross-origin (privacy)

**Impact:** Security headers applied at edge, better performance than middleware.

## Dependencies

**Requires:**
- 01-01: Next.js project with TypeScript configuration
- 01-02: Sanity client for dynamic sitemap blog posts
- 01-03: Supabase dependencies (fixed in this plan)

**Provides:**
- Netlify deployment configuration
- SEO fundamentals (robots.txt, sitemap.xml)
- Spam protection utilities ready for form integration
- Health check endpoint for deployment verification

**Affects:**
- Phase 3: Forms will integrate spam protection utilities
- Phase 5: Netlify deployment will use this configuration
- Phase 5: SEO sitemap will automatically include all blog posts

## Verification Results

- npm run build: PASSED (builds successfully)
- Health check endpoint: PASSED (returns 200 with JSON payload)
- robots.txt: PASSED (blocks /studio/ and /api/)
- sitemap.xml: PASSED (returns valid XML with static pages)
- netlify.toml: PASSED (contains build command and security headers)
- Spam protection exports: PASSED (verifyRecaptcha, checkHoneypot, rateLimit all exported)
- RecaptchaProvider: PASSED (client component with proper 'use client' directive)

## User Setup Required

After plan completion, user must configure:

### 1. Netlify Deployment

**Service:** Netlify
**Why:** Hosting with CI/CD for automatic deployments

**Dashboard configuration:**
1. Connect git repository to Netlify
   - Location: Netlify Dashboard → Add new site → Import existing project → Select repo
2. Set environment variables in Netlify
   - Location: Netlify Dashboard → Site settings → Environment variables
   - Required: All variables from .env.local.example (Sanity, Supabase, reCAPTCHA)
3. Enable branch deploys for staging
   - Location: Netlify Dashboard → Site settings → Build & deploy → Branches
   - Add 'staging' branch for preview deployments

**No environment variables to manually set** (all set in Netlify dashboard)

### 2. Google reCAPTCHA

**Service:** Google reCAPTCHA v3
**Why:** Spam protection for forms

**Environment variables needed:**
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` - From Google reCAPTCHA Admin Console → Register new site → reCAPTCHA v3 → Copy site key
- `RECAPTCHA_SECRET_KEY` - From Google reCAPTCHA Admin Console → Settings → Copy secret key

**Steps:**
1. Visit https://www.google.com/recaptcha/admin
2. Register new site with reCAPTCHA v3
3. Add domain (or use localhost for testing)
4. Copy site key to `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
5. Copy secret key to `RECAPTCHA_SECRET_KEY`
6. Add both to Netlify environment variables

## Self-Check: PASSED

### Files Created
- FOUND: netlify.toml
- FOUND: app/robots.ts
- FOUND: app/sitemap.ts
- FOUND: app/api/health/route.ts
- FOUND: lib/spam-protection.ts
- FOUND: components/RecaptchaProvider.tsx

### Files Modified
- FOUND: package.json

### Commits
- FOUND: fdc4886 (Task 1: Netlify deployment and SEO)
- FOUND: 8e09789 (Task 2: Spam protection utilities)
- FOUND: e183d53 (Fix: Missing Supabase dependencies)

## Next Steps

Plan 01-04 completes Phase 1 (Foundation & Infrastructure). All foundational pieces are in place:
- ✅ Next.js project with TypeScript (01-01)
- ✅ Sanity CMS with privacy-first schema (01-02)
- ✅ Supabase database with RLS policies (01-03)
- ✅ Netlify deployment, SEO, and spam protection (01-04)

**Next:** Proceed to Phase 2 (Public Pages) to build homepage, member directory, and blog functionality.

**Blockers:** User must configure external services (Netlify, Sanity, Supabase, reCAPTCHA) before deployment. Development can continue locally without these.
