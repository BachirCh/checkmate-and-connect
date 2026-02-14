# Pitfalls Research

**Domain:** Community Website (Member Directory + Blog)
**Researched:** 2026-02-14
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: CMS Complexity Mismatch

**What goes wrong:**
Choosing a CMS based on feature checklists rather than team capabilities. The buyer is usually technical, but the main user is generally not, creating a significant disconnect. Non-technical maintainers abandon content updates because the admin interface is too complex, leading to stale content and eventual site neglect.

**Why it happens:**
Technical evaluators prioritize extensibility and advanced features over day-to-day content editing usability. WordPress plugins offer unlimited flexibility, but dozens of block types, unlimited color choices, and fine-grained layout controls overwhelm non-technical editors who just want to publish an event recap.

**How to avoid:**
- Test the CMS with actual non-technical team members during evaluation
- Prioritize visual editing and preview capabilities over configuration flexibility
- Choose platforms explicitly designed for non-developer content management (WordPress with simplified admin, Webflow CMS, or similar)
- Limit available block types and design options to essential ones only
- Create pre-built templates for common content types (event recap, member spotlight)

**Warning signs:**
- Team members asking "How do I...?" repeatedly for basic tasks
- Content updates taking longer than planned
- Team requesting developer help for routine content changes
- Drafts piling up because publishing feels too hard
- Maintainers avoiding certain content types due to complexity

**Phase to address:**
Foundation Phase (CMS Selection) - This decision is nearly impossible to reverse later without a complete rebuild.

---

### Pitfall 2: Member Privacy Data Mishandling

**What goes wrong:**
Publishing member directories on public web pages exposes personal information to search engines, scrapers, and spam bots. Even "member-only" directories can leak data through insufficient access controls, missing opt-out options, or pre-checked consent boxes that violate GDPR requirements.

**Why it happens:**
Teams focus on showcasing members professionally without considering privacy implications. Default directory settings often expose all member data publicly. GDPR compliance drift happens when new plugins or forms are added that collect data without privacy teams noticing.

**How to avoid:**
- Design directory as opt-in by default, not opt-out
- Collect explicit consent for each field displayed publicly (email, phone, social links)
- Implement privacy fields allowing members to control visibility per-field
- Add robots.txt rules to prevent search engine indexing of member pages
- Require authentication to view full member profiles
- Avoid pre-checked consent boxes (explicitly violates EU regulations)
- Apply data minimization principles: only collect data actually needed
- Provide clear, accessible privacy policies (not just legal fine print)
- Regular privacy audits when adding new forms or plugins

**Warning signs:**
- Member emails showing up in Google search results
- Members receiving unsolicited messages from directory viewers
- Lack of granular visibility controls per member
- Any form with pre-checked consent boxes
- Cannot clearly answer "who can see this member's email?"
- No documented privacy policy or consent workflow

**Phase to address:**
Foundation Phase (Data Architecture) - Privacy must be built in from the start, not bolted on later.

---

### Pitfall 3: Image Optimization Neglect

**What goes wrong:**
Team uploads full-resolution photos (5MB+ each) directly from phones or cameras without optimization. In 2026, a 5MB image on your homepage is a crime against user experience - more than 53% of users leave if page load time exceeds three seconds. Member directory with 50 unoptimized headshots becomes unusable on mobile.

**Why it happens:**
Fast office internet masks the problem during development. Non-technical team members don't understand file size vs. display size. "It looks fine" during testing on desktop doesn't reveal mobile performance issues.

**How to avoid:**
- Implement automatic image optimization on upload (plugins like Imagify for WordPress)
- Set maximum upload file sizes (500KB warning, 2MB hard limit)
- Use modern formats: WebP instead of JPG (30% smaller), with fallbacks
- Implement lazy loading for images below the fold
- Serve responsive images: different sizes for mobile vs. desktop (srcset)
- Compress images before upload: 1200px width maximum for member photos
- Avoid converting raster images to SVG (creates larger files)
- Test Core Web Vitals, especially Largest Contentful Paint (LCP)

**Warning signs:**
- Homepage takes 5+ seconds to load on mobile
- Image files over 1MB appearing in media library
- No image optimization plugin configured
- Team uploading images directly from phones without resizing
- Poor Core Web Vitals scores in Google Search Console
- Mobile users complaining about slow load times

**Phase to address:**
Foundation Phase (Technical Setup) - Configure optimization before team starts adding content.

---

### Pitfall 4: "Noindex Checkbox" Catastrophe

**What goes wrong:**
WordPress ships with a single checkbox in Settings → Reading: "Discourage search engines from indexing this site." This adds noindex directives to the entire site, making it invisible to Google. Commonly enabled during development and forgotten when launching, resulting in zero organic traffic despite good content.

**Why it happens:**
Set correctly during development to prevent indexing of draft content, then never unchecked before launch. No clear handoff checklist between development and launch. Non-technical teams don't know this setting exists or what it does.

**How to avoid:**
- Create pre-launch checklist specifically for SEO settings
- Set up automated alerts if noindex is detected on production site
- Use SEO plugin (Rank Math, Yoast) that warns about noindex status
- Document this exact checkbox in launch procedures
- Verify Google Search Console after launch to confirm indexing
- Check robots.txt and meta robots tags before going live

**Warning signs:**
- Site launched but zero traffic from Google after 2+ weeks
- Pages not appearing in Google search even for brand name
- Google Search Console showing "Excluded by noindex tag"
- Sitemap submitted but pages not indexed
- No crawl activity in server logs from Googlebot

**Phase to address:**
Launch Phase - Add to launch checklist as mandatory verification step.

---

### Pitfall 5: Form Spam Overload

**What goes wrong:**
Contact forms and member submission forms get hammered with spam. In 2026, bots are powered by AI, headless browsers, and human-like behavior, making old-school CAPTCHAs useless. Team spends hours sorting through fake submissions or misses legitimate member inquiries buried in spam.

**Why it happens:**
Forms launched with no spam protection or only basic CAPTCHA. Single-layer defense (CAPTCHA only) is insufficient in 2026. Honeypot fields alone don't stop modern bots that render JavaScript and detect hidden fields.

**How to avoid:**
- Implement multi-layer defense: CAPTCHA + honeypot + device fingerprinting
- Use invisible reCAPTCHA v3 (scores requests, no user interaction needed)
- Add honeypot fields (hidden fields that bots fill, humans don't)
- Implement rate limiting per IP address
- Use device fingerprinting to distinguish real users from bots
- Require email verification for member profile submissions
- Monitor form submission patterns and block obvious bot IPs
- For WordPress: WPForms with built-in spam protection

**Warning signs:**
- Receiving 50+ form submissions per day, all spam
- Submissions with gibberish names or obvious bot patterns
- Contact form responses in Asian characters for English site
- Multiple submissions from same IP in seconds
- Team stops checking form notifications due to spam volume
- Legitimate inquiries missed because lost in spam

**Phase to address:**
Foundation Phase (Form Setup) - Implement before forms go live to avoid overwhelming team.

---

### Pitfall 6: Mobile Responsiveness Theater

**What goes wrong:**
Site "shrinks" on mobile but doesn't truly adapt. Desktop-heavy content (wide tables, multi-column layouts) becomes unusable on phones. Navigation dropdowns don't work on touchscreens. Form fields too small to tap accurately. A website that "shrinks" on a smartphone isn't necessarily responsive - responsive means truly adapting to screen, context, and user.

**Why it happens:**
Testing only in browser DevTools or emulators that can't replicate actual touch gestures, network speeds, and device conditions. Desktop-first design approach where mobile is an afterthought. Assuming "it works in Chrome mobile view" means it works on real devices.

**How to avoid:**
- Test on actual physical devices, not just emulators
- Design mobile-first, then enhance for desktop
- Use hamburger menu and make buttons 48px minimum for touch
- Keep navigation minimal and tap-friendly
- Design forms with large fields and appropriate keyboards (numeric for phone)
- Avoid tightly packed elements requiring precise taps
- Test with slow 3G connection to reveal performance issues
- Check touch gestures (swipe, pinch) work correctly
- Prioritize vector graphics (SVGs) for crisp display on high-DPI screens

**Warning signs:**
- Users zooming to tap small buttons or read text
- Horizontal scrolling required on mobile
- Dropdown menus not responding to touch
- Form fields requiring multiple taps to activate
- Text overlapping or breaking layout on smaller screens
- Navigation "jumping" or repositioning when tapped
- High bounce rate specifically on mobile traffic

**Phase to address:**
Design Phase (Responsive Implementation) - Build mobile-responsive from start, not retrofitted.

---

### Pitfall 7: Plugin/Extension Bloat

**What goes wrong:**
Site starts with 10 plugins, grows to 40+ within a year. Each added "to solve one small problem." Site slows to a crawl. Plugins conflict with each other. Updates break functionality. Security vulnerabilities multiply. Team afraid to update anything because "last time it broke the site."

**Why it happens:**
Adding plugins is easier than coding solutions. Each team member adds their preferred tools. No plugin governance or review process. Not understanding that plugins add maintenance burden, not reduce it.

**How to avoid:**
- Establish plugin approval process: justify need before installing
- Audit plugins quarterly: remove unused or redundant ones
- Choose multi-purpose plugins over many single-purpose ones
- Prefer native CMS features over plugins when possible
- Document what each plugin does and why it's needed
- Test plugin updates on staging site before production
- Limit team members who can install plugins
- Monitor plugin count (red flag if exceeds 20 for simple community site)

**Warning signs:**
- Page load time increasing over time
- Conflicts appearing when plugins update
- Multiple plugins doing similar things (3 SEO plugins, 2 form builders)
- Plugins not updated in 6+ months due to fear of breaking site
- Admin dashboard slow to load due to plugin overhead
- Team doesn't know what half the plugins do
- Deactivating a plugin breaks unexpected functionality

**Phase to address:**
Foundation Phase (Technical Governance) - Set rules before problem emerges. Maintenance Phase - Regular audits.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skipping staging environment | Faster to just edit production | Every change risks breaking live site, can't test safely | Never - staging is essential |
| Using admin account for all users | Avoids setting up proper roles | Security risk, can't track who changed what, all-or-nothing access | Never - creates security and accountability issues |
| Hardcoding member info instead of database | Quick to get first members listed | Requires developer to update, doesn't scale, no member self-service | Only for MVP proof-of-concept |
| Skipping image optimization at upload | Faster content publishing workflow | Accumulating performance debt, mobile users suffer, LCP scores degrade | Never - automation makes this zero-effort |
| Single admin knowing all passwords | Easy coordination | Bus factor of 1, crisis if person leaves, poor security | Never - use password manager from day 1 |
| Copying/pasting content into editor | Faster than creating templates | Inconsistent formatting, no structured data, hard to redesign later | Only for one-off content exceptions |
| Using free/nulled premium plugins | Saves license costs | Security vulnerabilities, no updates, legal issues, support unavailable | Never - security risk is existential |
| Skipping regular backups | Saves time and hosting cost | Single incident (hack, mistake, server failure) loses all data | Never - automated backups are cheap insurance |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Social media embeds | Embedding full feeds that slow page load | Use static thumbnails linking to social profiles, or lazy-load embeds |
| Email newsletter signup | No double opt-in, allowing invalid emails | Require email verification, use provider's native validation |
| Google Analytics | Adding multiple tracking codes by accident | Use Tag Manager, document all tracking IDs, audit quarterly |
| Contact form email | Using default PHP mail() that ends up in spam | Configure SMTP with proper authentication, use transactional email service |
| Member photos | Storing on web server filesystem | Use CDN or object storage (reduces bandwidth, improves load times) |
| Calendar integration | Manually copying event details | Use iCal feed or API integration to sync automatically |
| Payment processing (if membership fees) | Storing payment details locally | Use provider's hosted checkout (Stripe, PayPal) - never store card numbers |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Unoptimized database queries | Admin pages load slowly with 100+ members | Add database indexes, use caching plugin, optimize queries | 100-200 members |
| Loading all member photos at once | Directory page takes 10+ seconds to load | Implement pagination (20 per page) + lazy loading | 50+ members with photos |
| No caching strategy | Every page load hits database unnecessarily | Install caching plugin (WP Super Cache), enable object cache | 100+ concurrent visitors |
| Storing event photos in posts | Image library becomes unmanageable | Separate media organization strategy, use categories/folders | 20+ events |
| Inline CSS/JS in every post | Page size balloons, hard to update styles | Use theme stylesheet, enqueue scripts properly | 50+ posts |
| No CDN for media files | Server bandwidth costs increase, slow for distant users | Use CDN for images/static assets (Cloudflare, BunnyCDN) | High traffic or international audience |
| Single shared hosting account | Site goes down during traffic spikes | Upgrade to VPS or managed hosting with auto-scaling | 500+ daily visitors |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing member email addresses in page source | Spam bots harvest emails, members get unsolicited contact | Use contact forms instead of displaying emails, obfuscate with JavaScript if must display |
| Weak password requirements for member accounts | Accounts easily compromised, spam content posted | Enforce strong passwords (12+ chars, complexity), enable 2FA for admins |
| Public access to member upload directory | Malicious file uploads, malware distribution | Restrict direct URL access, serve through PHP with authentication checks |
| No role-based access control | Regular members can access admin functions | Use proper user roles (Subscriber, Contributor, Author), never give Editor role casually |
| Outdated WordPress core/plugins | Known vulnerabilities exploited by bots | Enable automatic updates for minor versions, test major updates on staging weekly |
| Using "admin" as username | Primary target for brute force attacks | Use unique username, disable "admin" account, limit login attempts |
| No SSL certificate | Login credentials sent in plaintext, no Google ranking | Use Let's Encrypt (free) or hosting provider's SSL, enforce HTTPS everywhere |
| Allowing file uploads without validation | Malicious PHP files uploaded and executed | Validate file types, scan uploads, store outside web root if possible |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Requiring account to view member directory | High friction, most visitors bounce | Public directory (with privacy controls), optional accounts for extra features |
| No search/filter in member directory | Can't find specific members, directory unusable with 50+ people | Add search by name/skills, filter by categories, alphabetical navigation |
| Blog posts with no author attribution | Impersonal, doesn't showcase community voices | Show author name + photo + bio link, encourage member contributions |
| No clear call-to-action for new visitors | Visitors don't know how to join or learn more | Prominent "Join Us" or "Learn More" CTA above fold, clear value proposition |
| Event recaps without photos | Boring, doesn't convey community energy | Include 3-5 photos minimum, use photo galleries for larger events |
| Complex multi-step forms for member profiles | Abandoned signups, incomplete profiles | Single-page form with optional fields, allow profile editing after signup |
| No "About" page explaining community | New visitors confused about what this is | Clear explanation of who/what/why, founding story, meeting schedule, how to participate |
| Broken "Share" buttons on blog posts | Can't spread content, missed promotion opportunities | Test social sharing, use simple native buttons, ensure Open Graph tags work |
| No mobile-friendly contact information | Can't easily tap phone number to call | Use clickable phone numbers (tel: links), display address as map link |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Contact Form:** Often missing spam protection — verify honeypot + reCAPTCHA enabled and test with known bot patterns
- [ ] **Member Directory:** Often missing privacy controls — verify opt-in system, per-field visibility controls, and members can edit own profiles
- [ ] **Image Uploads:** Often missing optimization — verify automatic compression enabled and max file size enforced
- [ ] **Blog Posts:** Often missing SEO basics — verify title tags, meta descriptions, Open Graph tags, and XML sitemap includes posts
- [ ] **Search Functionality:** Often missing or poor — verify search includes member profiles, returns relevant results, handles typos
- [ ] **Mobile Navigation:** Often missing accessibility — verify menu works on touch, buttons are 48px+, no horizontal scrolling required
- [ ] **Form Validation:** Often missing helpful errors — verify error messages are specific, appear inline, and guide user to fix issues
- [ ] **404 Page:** Often default ugly error — verify custom 404 with navigation back to site, search, or popular pages
- [ ] **Email Notifications:** Often end up in spam — verify proper SPF/DKIM/DMARC records, test deliverability, use transactional email service
- [ ] **Backup System:** Often not tested — verify backups run automatically, test restoration process, store off-site
- [ ] **Analytics:** Often tracking nothing useful — verify goals/events configured (not just pageviews), conversion tracking works, team knows how to access
- [ ] **Accessibility:** Often forgotten entirely — verify keyboard navigation works, color contrast sufficient, alt text on images, proper heading hierarchy

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Wrong CMS chosen | HIGH | 1) Export all content to portable format 2) Set up new CMS on subdomain 3) Migrate content with URL preservation 4) Test thoroughly 5) Redirect old URLs 6) Switch DNS. Plan 40-80 hours. |
| Member privacy breach | MEDIUM | 1) Immediate: remove exposed data 2) Notify affected members 3) Document incident 4) Implement proper controls 5) Consider GDPR reporting if EU members affected. Legal consultation recommended. |
| Image optimization neglected | LOW | 1) Install optimization plugin (Imagify, ShortPixel) 2) Run bulk optimization on existing images 3) Configure automatic optimization for new uploads 4) Test load times before/after. 2-4 hours. |
| Noindex checkbox left on | LOW | 1) Uncheck setting immediately 2) Submit sitemap to Google Search Console 3) Request re-indexing for key pages 4) Monitor index coverage over 2-4 weeks. Recovery takes 2-6 weeks for traffic. |
| Form spam overwhelming | LOW | 1) Install spam protection plugin immediately 2) Delete spam submissions in bulk 3) Configure honeypot + reCAPTCHA 4) Add rate limiting 5) Monitor for 1 week. 1-2 hours setup. |
| Mobile responsiveness issues | MEDIUM | 1) Audit all page types on real devices 2) Fix theme/layout issues 3) Test forms and navigation 4) Verify performance on 3G 5) Re-test on multiple devices. 10-20 hours depending on extent. |
| Plugin bloat | MEDIUM | 1) Audit all plugins, document purpose 2) Identify redundant/unused plugins 3) Test removing on staging 4) Remove from production one at a time 5) Monitor for broken functionality. 4-8 hours. |
| Technical debt accumulation | HIGH | 1) Assess severity: performance metrics, security scan, code audit 2) Prioritize critical issues 3) Budget for gradual cleanup or rebuild 4) May require partial or complete rebuild. Varies widely: 20-200+ hours. |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| CMS Complexity Mismatch | Foundation (CMS Selection) | Non-technical team member publishes test content successfully without help |
| Member Privacy Data Mishandling | Foundation (Data Architecture) | Privacy audit checklist passed, opt-in system tested, member can control visibility |
| Image Optimization Neglect | Foundation (Technical Setup) | Upload 5MB test image, verify auto-optimization to <500KB, check page load time <3s |
| "Noindex Checkbox" Catastrophe | Launch Preparation | Pre-launch checklist completed, Google Search Console verified indexing after launch |
| Form Spam Overload | Foundation (Form Setup) | Submit test spam, verify blocked, zero spam submissions in first week of production |
| Mobile Responsiveness Theater | Design & Build | Test on 3+ physical devices, verify all interactions work, no horizontal scroll, forms usable |
| Plugin/Extension Bloat | Foundation (Governance) + Maintenance | Plugin count documented, audit quarterly, staging environment used for testing updates |
| Permalink structure wrong | Foundation (SEO Setup) | Verify /%postname%/ structure before first content published |
| Missing sitemap | Foundation (SEO Setup) | XML sitemap exists at /sitemap.xml, submitted to Google Search Console |
| No backup system | Foundation (Infrastructure) | Automated daily backups configured, test restoration successful |
| Inadequate user roles | Foundation (Access Control) | Role permissions documented, test with non-admin account |
| Missing SSL certificate | Foundation (Security) | HTTPS enforced, verify padlock in browser, test with SSL checker |
| Poor navigation structure | Design Phase | New user can find member directory and recent events within 2 clicks from homepage |
| Forms with poor UX | Design Phase | Test with 3 users, measure completion rate, verify error messages helpful |
| Missing About page | Content Phase | About page exists, answers "who/what/why/when/how to join" |
| Slow database queries | Performance Phase | Test with 200 simulated members, admin pages load <2s |
| No CDN for media | Scale Phase | CDN configured for images, verify load times improved for distant users |

## Sources

### Community Website Research
- [10 Critical Mistakes to Avoid in Online Community Building | Bettermode Guide](https://bettermode.com/blog/10-common-mistakes-to-avoid-when-building-online-communities)
- [8 Common Website Design Mistakes to Avoid in 2026 | Zach Sean Web Design](https://www.zachsean.com/post/8-common-website-design-mistakes-to-avoid-in-2026-for-better-conversions-and-user-experience)

### CMS and Membership Sites
- [23 Best Membership Site Software Reviewed In 2026](https://thecmo.com/tools/best-membership-site-software/)
- [Usability: The Key BattleGround for Next Gen CMS | Medium](https://alangleeson.medium.com/usability-the-key-battleground-for-next-gen-cms-efc625f7ff1b)
- [Content Editor UX: Why CMS Usability Is Tough](https://evolvingweb.com/blog/content-editor-ux-why-cms-usability-tough)

### Privacy and GDPR
- [Managing Your Membership Data Privacy & Security - MembershipWorks](https://membershipworks.com/data-privacy-security/)
- [GDPR: The Essential Guide for Membership Site Owners](https://www.membershipgeeks.com/gdpr/)
- [How to comply with GDPR website requirements (2026 guide) - cside Blog](https://cside.com/blog/how-to-comply-with-gdpr-website-requirements-2026)

### Image Optimization
- [How to Optimize Website Images: The Complete 2026 Guide - Request Metrics](https://requestmetrics.com/web-performance/high-performance-images/)
- [Why Large Images Kill Your Website in 2026](https://siadesign.ee/en/blog/image-optimization-2026/)
- [How to Optimize Images in 2026: A Comprehensive Guide](https://elementor.com/blog/how-to-optimize-images/)

### Spam Prevention
- [How to Stop Contact Form Spam in 2026: 7 Proven Methods](https://webdezign.co.uk/how-to-stop-contact-form-spam-in-2026-7-proven-methods/)
- [8 Expert Tactics for Contact Form Spam Prevention | Nutshell](https://www.nutshell.com/blog/8-ways-to-combat-form-spam)
- [Preventing contact spam form submissions](https://stytch.com/blog/prevent-contact-form-spam/)

### Mobile Responsiveness
- [Mobile-First Design: What It Is & Why It Matters in 2026](https://seizemarketingagency.com/mobile-first-design/)
- [5 responsive mobile design mistakes even smart developers make](https://www.wordtracker.com/blog/marketing/5-responsive-mobile-design-mistakes-even-smart-developers-make)
- [9 Common Responsive Web Design Mistakes and How to Avoid Them](https://parachutedesign.ca/blog/responsive-web-design-mistakes/)

### WordPress SEO
- [30 SEO Mistakes to Avoid in 2026 (+ How to Fix Them)](https://wp-rocket.me/blog/seo-mistakes/)
- [10 Common WordPress SEO Mistakes That Hurt Your WP Optimization](https://belovdigital.agency/blog/10-common-wordpress-mistakes-that-hurt-your-seo/)
- [SEO Mistakes: 10+ Common SEO Issues & Quick Fixes » Rank Math](https://rankmath.com/blog/seo-mistakes/)

### Content Management and Maintenance
- [What Content Teams Need to Fix in 2026 (And Ignore)](https://easycontent.io/resources/what-content-teams-need-to-fix-in-2026-and-ignore/)
- [Technical debt: a strategic guide for 2026](https://monday.com/blog/rnd/technical-debt/)
- [Website Maintenance Guide 2026 | upGrowth](https://upgrowth.in/website-maintenance-guide-2026/)

### Form Validation
- [Form Validation — Importance, Ways & Best Practices](https://clearout.io/blog/form-validation/)
- [10 Design Guidelines for Reporting Errors in Forms - NN/G](https://www.nngroup.com/articles/errors-forms-design-guidelines/)

---
*Pitfalls research for: Community Website with Member Directory and Blog*
*Researched: 2026-02-14*
*Context: Established community (200+ members), non-technical maintainers, simple needs*
