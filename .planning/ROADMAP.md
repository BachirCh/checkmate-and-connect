# Roadmap: Checkmate & Connect Website

## Overview

The roadmap delivers a community website in 6 phases, starting with technical foundation (Next.js, Sanity CMS, Supabase, Netlify), then building public-facing pages (landing, member submission form), adding admin authentication and member directory management, and concluding with pre-launch quality assurance. Every phase delivers a coherent, verifiable capability that enables the next.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Infrastructure** - Technical stack and development environment
- [ ] **Phase 2: Landing & Information** - Public-facing landing page with community details
- [ ] **Phase 3: Member Submission System** - Form for visitors to apply for directory inclusion
- [ ] **Phase 4: Admin Authentication & Dashboard** - Secure access to management interfaces
- [ ] **Phase 5: Member Directory & Management** - Public directory and admin approval workflow
- [ ] **Phase 6: Launch Preparation** - Pre-launch validation and quality assurance

## Phase Details

### Phase 1: Foundation & Infrastructure
**Goal**: Development environment ready with all services configured and privacy-first architecture in place
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, FOUND-07, FOUND-08, FOUND-09, FOUND-10
**Success Criteria** (what must be TRUE):
  1. Developer can run Next.js app locally with TypeScript and Tailwind CSS v4
  2. Sanity CMS Studio is accessible with member and blog post schemas configured
  3. Supabase database connects successfully with authentication configured
  4. Git repository deploys automatically to Netlify staging environment
  5. Images uploaded to CMS are automatically compressed and optimized
**Plans:** 4 plans

Plans:
- [x] 01-01-PLAN.md — Next.js 16 project init with TypeScript, Tailwind v4, and project structure
- [x] 01-02-PLAN.md — Sanity CMS setup with member/blog schemas and image optimization
- [x] 01-03-PLAN.md — Supabase database with RLS policies and privacy-first architecture
- [x] 01-04-PLAN.md — Netlify deployment, SEO configuration, and spam protection utilities

### Phase 2: Landing & Information
**Goal**: Visitor can understand what Checkmate & Connect is and find basic community information
**Depends on**: Phase 1
**Requirements**: LAND-01, LAND-02, LAND-03, LAND-04, LAND-05, LAND-06, LAND-07, LAND-08
**Success Criteria** (what must be TRUE):
  1. Visitor can see what C&C is (chess + entrepreneurship community meeting description)
  2. Visitor can see when meetups happen (every Wednesday at 6pm displayed prominently)
  3. Visitor can see where meetups happen (Commons, Casablanca, Morocco with location details)
  4. Visitor can view embedded Meetup widget showing next event
  5. Landing page loads fast on mobile 3G connection (Core Web Vitals green)
**Plans:** 2 plans

Plans:
- [x] 02-01-PLAN.md — Landing page layout, hero, event details, community stats, footer, SEO metadata, and JSON-LD structured data
- [x] 02-02-PLAN.md — Meetup widget embed and visual verification of complete landing page

### Phase 3: Member Submission System
**Goal**: Visitors can apply to join the member directory through a spam-protected form
**Depends on**: Phase 2
**Requirements**: SUBMIT-01, SUBMIT-02, SUBMIT-03, SUBMIT-04, SUBMIT-05, SUBMIT-06
**Success Criteria** (what must be TRUE):
  1. Visitor can submit profile via form with name, photo, job title, company, and LinkedIn
  2. Form validates required fields before submission (name, photo, job title)
  3. Form submission creates pending member entry in Sanity CMS
  4. Visitor receives confirmation message after successful submission
  5. Form includes spam protection (reCAPTCHA v3 + honeypot + rate limiting)
**Plans**: TBD

Plans:
- [ ] 03-01: TBD during plan-phase

### Phase 4: Admin Authentication & Dashboard
**Goal**: Admins can securely log in and access management interfaces
**Depends on**: Phase 3
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-08, ADMIN-09
**Success Criteria** (what must be TRUE):
  1. Admin can log in securely via Supabase Auth with email and password
  2. Only authenticated admins can access admin dashboard routes
  3. Unauthenticated users are redirected to login when accessing admin URLs
  4. System supports 2-3 admin user accounts
**Plans**: TBD

Plans:
- [ ] 04-01: TBD during plan-phase

### Phase 5: Member Directory & Management
**Goal**: Visitors can browse approved members in public directory; admins can manage member submissions through approval workflow
**Depends on**: Phase 4
**Requirements**: DIR-01, DIR-02, DIR-03, DIR-04, DIR-05, ADMIN-03, ADMIN-04, ADMIN-05, ADMIN-06, ADMIN-07
**Success Criteria** (what must be TRUE):
  1. Visitor can browse member directory showing all approved members with photos and professional info
  2. Member profiles display name, photo, job title, company (optional), and LinkedIn link
  3. Admin can view list of pending member submissions in dashboard
  4. Admin can approve member submissions (moves member to public directory)
  5. Admin can reject member submissions with reason
  6. Admin can edit existing member profiles
  7. Admin can remove members from directory
  8. Directory page is mobile-responsive and includes member count
**Plans**: TBD

Plans:
- [ ] 05-01: TBD during plan-phase

### Phase 6: Launch Preparation
**Goal**: Site is production-ready, verified on real devices, and validated against pre-launch checklist
**Depends on**: Phase 5
**Requirements**: LAUNCH-01, LAUNCH-02, LAUNCH-03, LAUNCH-04, LAUNCH-05, LAUNCH-06, LAUNCH-07
**Success Criteria** (what must be TRUE):
  1. All pages tested on 3+ physical mobile devices (iOS and Android)
  2. SEO settings verified (noindex disabled, sitemap submitted to Google Search Console)
  3. SSL certificate configured and HTTPS working correctly
  4. Backup system configured and tested with sample restore
  5. Contact form spam protection tested with simulated attacks
  6. Performance validated (Core Web Vitals green, mobile 3G load time under 3 seconds)
  7. Google Search Console configured and initial indexing confirmed
**Plans**: TBD

Plans:
- [ ] 06-01: TBD during plan-phase

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Infrastructure | 4/4 | ✅ Complete | 2026-02-14 |
| 2. Landing & Information | 2/2 | ✅ Complete | 2026-02-14 |
| 3. Member Submission System | 0/? | Not started | - |
| 4. Admin Authentication & Dashboard | 0/? | Not started | - |
| 5. Member Directory & Management | 0/? | Not started | - |
| 6. Launch Preparation | 0/? | Not started | - |

---
*Roadmap created: 2026-02-14*
*Last updated: 2026-02-14*
