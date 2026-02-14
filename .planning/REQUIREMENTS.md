# Requirements: Checkmate & Connect Website

**Defined:** 2026-02-14
**Core Value:** Easy to share and explain - when someone asks "what's C&C?", send them a link that clearly shows what the community is, when and where they meet, and who's part of it.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation & Infrastructure

- [ ] **FOUND-01**: Next.js 16+ project initialized with TypeScript and App Router
- [ ] **FOUND-02**: Tailwind CSS v4 configured for styling
- [ ] **FOUND-03**: Sanity CMS v3+ configured with hosted Studio
- [ ] **FOUND-04**: Supabase database and authentication configured
- [ ] **FOUND-05**: Netlify hosting with CI/CD from git repository
- [ ] **FOUND-06**: Image optimization pipeline configured (auto-compress uploads)
- [ ] **FOUND-07**: Privacy-first architecture with opt-in defaults
- [ ] **FOUND-08**: Spam protection configured (reCAPTCHA v3 + honeypot + rate limiting)
- [ ] **FOUND-09**: Development environment with staging branch
- [ ] **FOUND-10**: Basic SEO configuration (meta tags, sitemap, robots.txt)

### Landing & Information

- [ ] **LAND-01**: Visitor can see what Checkmate & Connect is (chess + entrepreneurship community)
- [ ] **LAND-02**: Visitor can see when meetups happen (every Wednesday at 6pm)
- [ ] **LAND-03**: Visitor can see where meetups happen (Commons, Casablanca, Morocco)
- [ ] **LAND-04**: Visitor can see community size (200+ members)
- [ ] **LAND-05**: Visitor can view embedded Meetup widget showing next event
- [ ] **LAND-06**: Visitor can find contact information
- [ ] **LAND-07**: Landing page is mobile-responsive
- [ ] **LAND-08**: Landing page loads fast (Core Web Vitals green)

### Member Directory

- [ ] **DIR-01**: Visitor can browse member directory showing all approved members
- [ ] **DIR-02**: Member profiles display: name, photo, job title, company (optional), LinkedIn link
- [ ] **DIR-03**: Member directory is mobile-responsive
- [ ] **DIR-04**: Member profiles respect privacy controls (only approved fields shown publicly)
- [ ] **DIR-05**: Directory page includes member count

### Member Submission

- [ ] **SUBMIT-01**: Visitor can submit member profile via form (name, photo, job, company, LinkedIn)
- [ ] **SUBMIT-02**: Member submission form includes spam protection
- [ ] **SUBMIT-03**: Member submission form validates required fields
- [ ] **SUBMIT-04**: Submitted profiles enter "pending" state in CMS
- [ ] **SUBMIT-05**: Member receives confirmation after submission
- [ ] **SUBMIT-06**: Form is mobile-responsive with touch-friendly inputs

### Admin Interface

- [ ] **ADMIN-01**: Admin can log in securely via Supabase Auth
- [ ] **ADMIN-02**: Only authenticated admins can access admin dashboard
- [ ] **ADMIN-03**: Admin can view list of pending member submissions
- [ ] **ADMIN-04**: Admin can approve member submissions (moves to public directory)
- [ ] **ADMIN-05**: Admin can reject member submissions with reason
- [ ] **ADMIN-06**: Admin can edit existing member profiles
- [ ] **ADMIN-07**: Admin can remove members from directory
- [ ] **ADMIN-08**: Admin dashboard is mobile-responsive
- [ ] **ADMIN-09**: System supports 2-3 admin users

### Pre-Launch Quality

- [ ] **LAUNCH-01**: All pages tested on physical mobile devices (3+ devices)
- [ ] **LAUNCH-02**: SEO settings verified (noindex checkbox unchecked, sitemap submitted)
- [ ] **LAUNCH-03**: SSL certificate configured and verified
- [ ] **LAUNCH-04**: Backup system configured and tested
- [ ] **LAUNCH-05**: Contact form spam protection tested
- [ ] **LAUNCH-06**: Performance tested (Core Web Vitals, mobile 3G)
- [ ] **LAUNCH-07**: Google Search Console configured

## v2 Requirements

Deferred to post-launch releases. Tracked but not in current roadmap.

### Blog & Content (v1.1)

- **BLOG-01**: Admin can create blog posts via Sanity Studio
- **BLOG-02**: Blog posts include: title, photos, description with key takeaways
- **BLOG-03**: Visitor can view blog post listing (reverse chronological)
- **BLOG-04**: Visitor can read individual blog posts
- **BLOG-05**: Blog posts have social sharing buttons with Open Graph tags
- **BLOG-06**: Blog post schema triggers webhook to rebuild on publish

### Enhanced Directory (v1.2)

- **ENH-01**: Visitor can search member directory by name
- **ENH-02**: Visitor can filter members by industry/interest
- **ENH-03**: Visitor can navigate directory alphabetically
- **ENH-04**: Landing page includes social proof elements (photos from events)

### Member Engagement (v1.3)

- **ENG-01**: Admin can create member spotlight blog posts
- **ENG-02**: Featured member section on homepage
- **ENG-03**: Newsletter signup integration

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Member-to-member messaging | Members can use email/LinkedIn directly; adds complexity without value |
| Discussion forums or chat | Focus on in-person meetups; if needed, use existing tools (Slack/Discord) |
| Custom event registration/RSVP | Already solved by Meetup.com; avoid duplicate functionality |
| Member login/self-service profile editing | Simplifies maintenance; members contact admins for changes |
| Job board or marketplace | Scope creep; not core to community value |
| Real-time features (live chat, notifications) | Over-engineering for simple community site |
| Mobile app | Web-first approach; mobile-responsive site sufficient |
| Video posts or galleries | Image galleries sufficient; video adds storage/bandwidth costs |
| Advanced analytics dashboard | Google Analytics sufficient for launch |
| Multi-language support | English/French sufficient for Casablanca audience initially |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

**Coverage:**
- v1 requirements: 48 total
- Mapped to phases: [pending roadmap creation]
- Unmapped: [pending roadmap creation]

---
*Requirements defined: 2026-02-14*
*Last updated: 2026-02-14 after initial definition*
