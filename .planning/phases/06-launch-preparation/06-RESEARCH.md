# Phase 6: Launch Preparation - Research

**Researched:** 2026-02-17
**Domain:** Production deployment, performance testing, security, SEO verification, backup systems
**Confidence:** HIGH

## Summary

Phase 6 focuses on pre-launch validation across seven critical areas: physical mobile device testing, SEO configuration verification, SSL/HTTPS validation, backup system implementation, spam protection testing, performance benchmarking (Core Web Vitals), and Google Search Console setup. The research reveals that most infrastructure is already in place from Phase 1 (Netlify SSL, robots.txt, sitemap, spam protection), requiring primarily verification and testing rather than new implementation.

The critical insight is that launch preparation is fundamentally about **validation and documentation** rather than building new features. The existing tech stack (Next.js 16, Netlify, Supabase, Sanity) provides built-in solutions for most requirements, but requires systematic testing to ensure production readiness.

**Primary recommendation:** Adopt a layered testing strategy combining automated tools (Lighthouse CI, k6) for continuous validation with manual physical device testing for real-world verification. Implement backup verification procedures for both Supabase and Sanity data stores, and establish Google Search Console monitoring before launch.

## Standard Stack

### Core Testing Tools

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Lighthouse | 12+ | Core Web Vitals, performance, accessibility, SEO auditing | Official Google tool, industry standard for web performance metrics |
| Lighthouse CI | 0.14+ | Automated Lighthouse testing in CI/CD | Official GitHub Action, prevents performance regressions |
| k6 | Latest | Load testing, rate limit testing, API stress testing | Grafana-backed, JavaScript-based, developer-friendly |
| Chrome DevTools | Latest | Initial mobile testing, network throttling | Built into browser, zero setup |
| WebPageTest | N/A (SaaS) | Real-world performance testing with actual 3G networks | Industry standard for realistic performance measurement |

### Supporting Services

| Service | Purpose | When to Use |
|---------|---------|-------------|
| Google Search Console | Index verification, sitemap submission, search analytics | Required for all production sites |
| BrowserStack | Physical device testing (iOS/Android) | Budget allows ($29/month minimum) |
| LambdaTest | Budget-friendly device testing alternative | Cost-sensitive projects ($15/month) |
| Firebase Test Lab | Android testing with free tier | Android-only or Google ecosystem |
| Supabase CLI | Database backup/restore | All Supabase projects (already in stack) |
| Sanity CLI | Dataset export/import | All Sanity projects (already in stack) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| BrowserStack | LambdaTest | 20-30% cost savings, slightly less mature platform |
| Lighthouse CI | Manual Lighthouse runs | No automation, no regression tracking |
| k6 | Apache JMeter | More GUI-focused but heavier, less developer-friendly |
| Physical devices | Chrome DevTools only | Misses real hardware differences, GPU rendering issues |
| Paid device farms | Local physical devices | One-time cost but limited device variety |

**Installation:**

```bash
# Performance testing
npm install --save-dev @lhci/cli

# Load testing (install globally or use npx)
brew install k6  # macOS
# or
curl https://github.com/grafana/k6/releases/download/v0.49.0/k6-v0.49.0-linux-amd64.tar.gz -L | tar xvz

# Supabase CLI (for backups)
npm install --global supabase

# Sanity CLI (already installed in project)
npm install --global @sanity/cli
```

## Architecture Patterns

### Recommended Testing Structure

```
.github/
├── workflows/
│   ├── lighthouse-ci.yml      # Automated performance testing
│   ├── backup-verification.yml # Weekly backup restore tests
│   └── pre-launch-checklist.yml # Manual trigger for launch validation

scripts/
├── test-performance.sh        # Local Lighthouse testing
├── test-rate-limits.js        # k6 load tests for spam protection
├── backup-supabase.sh         # Automated Supabase backup
├── backup-sanity.sh           # Automated Sanity export
└── verify-seo.sh              # Check robots.txt, sitemap, noindex

docs/
└── launch-checklist.md        # Human-readable pre-launch verification
```

### Pattern 1: Lighthouse CI with Performance Budgets

**What:** Automated performance testing on every commit/PR with configurable thresholds
**When to use:** All production projects to prevent performance regressions

**Example:**

```yaml
# .github/workflows/lighthouse-ci.yml
name: Lighthouse CI
on: [pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v11
        with:
          urls: |
            https://staging.example.com
            https://staging.example.com/members
          uploadArtifacts: true
          temporaryPublicStorage: true
          budgetPath: ./lighthouse-budget.json
```

```json
// lighthouse-budget.json
{
  "budgets": [
    {
      "path": "/*",
      "timings": [
        {
          "metric": "interactive",
          "budget": 3000
        },
        {
          "metric": "first-contentful-paint",
          "budget": 1500
        }
      ],
      "resourceSizes": [
        {
          "resourceType": "script",
          "budget": 300
        },
        {
          "resourceType": "total",
          "budget": 1000
        }
      ]
    }
  ]
}
```

**Source:** [Lighthouse CI Action - GitHub Marketplace](https://github.com/marketplace/actions/lighthouse-ci-action)

### Pattern 2: k6 Rate Limit Testing

**What:** Load testing to verify spam protection holds under attack simulation
**When to use:** Before launch and after any rate limiting changes

**Example:**

```javascript
// scripts/test-rate-limits.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 },  // Sustain 20 users
    { duration: '10s', target: 0 },  // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'], // 95% of requests under 500ms
    'http_req_failed{status:429}': ['rate>0.8'], // Expect >80% to hit rate limit
  },
};

export default function () {
  const url = 'https://staging.example.com/api/contact';
  const payload = JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    message: 'Testing rate limits',
    _honey: '', // Honeypot field
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'status is 200 or 429': (r) => [200, 429].includes(r.status),
    'rate limited after threshold': (r) => r.status === 429,
  });

  sleep(0.1); // 10 requests per second per user
}
```

**Source:** [k6 API Load Testing - Grafana Documentation](https://grafana.com/docs/k6/latest/testing-guides/api-load-testing/)

### Pattern 3: Supabase Backup Verification

**What:** Automated backup download and restore verification to a test project
**When to use:** Weekly scheduled tests to ensure backups are restorable

**Example:**

```bash
#!/bin/bash
# scripts/backup-supabase.sh

set -e

PROJECT_REF="your-project-ref"
BACKUP_DIR="./backups/supabase"
DATE=$(date +%Y-%m-%d)

echo "Downloading Supabase backup for $DATE..."

# For Pro plan: Daily backups available
supabase db dump --project-ref "$PROJECT_REF" > "$BACKUP_DIR/backup-$DATE.sql"

# Verify backup is not empty
if [ ! -s "$BACKUP_DIR/backup-$DATE.sql" ]; then
  echo "ERROR: Backup file is empty"
  exit 1
fi

echo "Backup downloaded successfully: $(wc -l < "$BACKUP_DIR/backup-$DATE.sql") lines"

# Optional: Test restore to local development environment
echo "Testing restore to local..."
supabase start
supabase db reset --db-url postgresql://postgres:postgres@localhost:54322/postgres
psql postgresql://postgres:postgres@localhost:54322/postgres < "$BACKUP_DIR/backup-$DATE.sql"

echo "Backup verification complete!"
```

**Source:** [Supabase Database Backups - Official Documentation](https://supabase.com/docs/guides/platform/backups)

### Pattern 4: Sanity Dataset Export

**What:** Automated export of Sanity CMS data to versioned backups
**When to use:** Daily/weekly scheduled exports, before major content updates

**Example:**

```bash
#!/bin/bash
# scripts/backup-sanity.sh

set -e

DATASET="production"
BACKUP_DIR="./backups/sanity"
DATE=$(date +%Y-%m-%d-%H%M%S)
FILENAME="$BACKUP_DIR/$DATASET-backup-$DATE.tar.gz"

echo "Exporting Sanity dataset: $DATASET..."

# Export dataset (requires Sanity CLI)
sanity dataset export "$DATASET" "$FILENAME"

# Verify backup exists and has content
if [ ! -f "$FILENAME" ]; then
  echo "ERROR: Backup file not created"
  exit 1
fi

SIZE=$(du -h "$FILENAME" | cut -f1)
echo "Backup created successfully: $FILENAME ($SIZE)"

# Keep only last 30 days of backups
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete
echo "Old backups cleaned up (kept last 30 days)"
```

**Source:** [Sanity CLI Dataset Export - Official Documentation](https://www.sanity.io/docs/cli#dataset-export)

### Pattern 5: Physical Device Testing Protocol

**What:** Systematic testing across representative iOS and Android devices
**When to use:** Before launch, after major UI changes

**Example:**

```markdown
# Physical Device Testing Checklist

## Test Devices (Minimum 3)
- [ ] iPhone (latest iOS) - Safari
- [ ] Android (latest version) - Chrome
- [ ] Android or iPhone (2-3 years old) - Default browser

## Test Cases Per Device

### Homepage
- [ ] Page loads within 3 seconds on 3G
- [ ] Images load and display correctly
- [ ] Navigation menu works (open/close)
- [ ] Call-to-action buttons are tappable (min 44x44px)
- [ ] No horizontal scrolling
- [ ] Text is readable without zooming

### Member Directory
- [ ] List loads and scrolls smoothly
- [ ] Search/filter works
- [ ] Profile images load
- [ ] Links to profiles work

### Forms (Contact/Join)
- [ ] Form inputs are accessible
- [ ] Keyboard doesn't obscure input fields
- [ ] reCAPTCHA badge appears
- [ ] Form submission works
- [ ] Success/error messages display clearly
- [ ] Rate limiting triggers after 5 submissions

### Performance
- [ ] Lighthouse score >90 on mobile
- [ ] No layout shift during load (CLS < 0.1)
- [ ] Interactive within 2.5 seconds (LCP)
- [ ] Smooth scrolling (no jank)

## Tools
- Chrome DevTools Remote Debugging (Android)
- Safari Web Inspector (iOS)
- Network throttling: Fast 3G
```

### Anti-Patterns to Avoid

- **Testing only in desktop Chrome DevTools mobile mode:** Real devices have different GPUs, touch behaviors, and performance characteristics. Chrome DevTools cannot simulate actual hardware constraints.

- **Skipping backup restore testing:** Having backups is useless if you've never tested restoration. Always verify you can actually restore from backups.

- **Configuring HSTS too early:** HSTS with preload is nearly irreversible. Only enable after confirming HTTPS works perfectly across all subdomains.

- **Trusting lab data only:** Lighthouse scores in CI are simulated. Real users experience different conditions. Use Google Search Console's Core Web Vitals report for field data.

- **Testing rate limits manually:** Manual testing can't simulate coordinated bot attacks. Use k6 or similar tools to generate realistic load.

- **Submitting sitemap before content is ready:** Google will index whatever is in your sitemap. Ensure all pages are production-ready before submission.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Performance monitoring | Custom timing code | Lighthouse CI + `useReportWebVitals` hook | Google's Core Web Vitals are the actual ranking factors. Custom metrics won't align with what Google sees. |
| Load testing framework | Custom HTTP request loops | k6, Artillery, or Apache JMeter | Proper load testing requires connection pooling, realistic traffic patterns, distributed load generation, and result aggregation that take years to get right. |
| Backup scheduling | Cron jobs + custom scripts | Supabase built-in backups (Pro plan) + GitHub Actions | Supabase provides automatic daily backups with PITR. GitHub Actions provides free scheduling. Rolling your own misses edge cases like network failures, partial backups, and corruption detection. |
| Mobile device emulation | Custom viewport testing | BrowserStack, LambdaTest, or Firebase Test Lab | Real devices have different GPUs, touch latency, font rendering, and browser engines that can't be emulated. CSS that works in DevTools may break on actual devices. |
| SEO verification | Manual page checks | Google Search Console + automated noindex checkers | Search Console shows what Google actually sees (vs. what you think you're serving). Manual checks miss robots.txt conflicts, JavaScript-rendered noindex, and X-Robots-Tag headers. |
| SSL certificate management | Manual cert renewal | Netlify automatic SSL (Let's Encrypt) | Let's Encrypt certs expire every 90 days. Manual renewal will fail eventually. Netlify handles issuance, renewal, and wildcard certs automatically. |

**Key insight:** Launch preparation involves complex validation across multiple systems (DNS, SSL, search engines, databases, CDN). Each system has edge cases that take years to discover. Use managed services and established tools that have already encountered and solved these problems.

## Common Pitfalls

### Pitfall 1: Assuming Chrome DevTools Mobile Emulation Equals Real Device Testing

**What goes wrong:** Site looks perfect in Chrome DevTools mobile mode but breaks on actual iPhones or Android devices. Common issues include font rendering differences, touch target sizing problems, GPU-specific rendering bugs, and performance characteristics that don't match desktop CPUs.

**Why it happens:** Chrome DevTools simulates screen size and user agent but cannot replicate mobile GPU architectures, touch latency, actual network conditions, or mobile browser quirks (especially Safari iOS).

**How to avoid:** Use Chrome DevTools for rapid iteration during development, but always test on at least 3 physical devices (1 iPhone, 2 Android) before launch. Use Remote Debugging to inspect real devices while testing.

**Warning signs:**
- Tap targets feel too small on real devices
- Animations that are smooth in DevTools are janky on mobile
- Layout shifts occur on real devices but not in emulation
- Font weights render differently than expected

**Source:** [Chrome DevTools Device Mode Limitations - BrowserStack](https://www.browserstack.com/guide/mobile-emulator-vs-real-devices)

### Pitfall 2: Never Testing Backup Restoration Until Emergency

**What goes wrong:** Backups exist but are corrupted, incomplete, or incompatible with current schema. During an actual outage, restoration fails or creates data inconsistencies.

**Why it happens:** Backup systems are "set and forget." Teams assume backups work but never verify until crisis hits. Database schema changes can break old backups. Backup formats change between versions.

**How to avoid:** Schedule monthly backup verification tests. Download a recent backup and restore to a test environment. Verify data integrity and application functionality. Document the restoration process.

**Warning signs:**
- No one has ever restored from a backup
- Restoration documentation doesn't exist or is outdated
- Backup files are checked for existence but not content
- No monitoring for backup failures

**Source:** [Supabase Backup Best Practices - Official Documentation](https://supabase.com/docs/guides/platform/backups)

### Pitfall 3: Enabling HSTS Preload Before SSL is Fully Verified

**What goes wrong:** HSTS with `preload` directive is added to production. SSL certificate expires or misconfiguration occurs. Site becomes completely inaccessible for months because browsers enforce HTTPS-only, and removal from preload list takes 6-12 weeks.

**Why it happens:** HSTS preload looks like a simple header but is nearly irreversible. Once a domain is in browser preload lists, only HTTPS access is allowed, even if certificates break.

**How to avoid:** Start with HSTS without preload (`max-age=31536000; includeSubDomains`). Run for at least 1 month in production with monitoring. Only add `preload` directive after confirming zero SSL issues. Verify all subdomains support HTTPS before enabling.

**Warning signs:**
- Adding HSTS immediately at launch
- No SSL certificate monitoring/alerting
- Subdomains exist that don't have HTTPS
- Certificate is manually managed (not auto-renewed)

**Source:** [Netlify HSTS Configuration Best Practices](https://travislord.xyz/articles/how-to-secure-your-netlify-site-with-hsts-configuration)

### Pitfall 4: Submitting Sitemap to Google Search Console Before Content is Ready

**What goes wrong:** Sitemap submitted with placeholder content, "Coming Soon" pages, or broken links. Google indexes these low-quality pages, harming domain authority. De-indexing later doesn't fully remove the negative signal.

**Why it happens:** Teams rush to "launch" by submitting to Google before actual content is complete. Sitemap generation is automated but includes pages that shouldn't be indexed yet.

**How to avoid:** Use `noindex` meta tag on staging/preview deployments. Only submit sitemap after all pages have real content, proper titles/descriptions, and have been manually reviewed. Use Search Console's URL Inspection tool to preview how Google sees pages before submitting sitemap.

**Warning signs:**
- Staging URLs appearing in Google search results
- Sitemap includes `/test` or `/draft` pages
- Pages return 404 but are in sitemap
- Content is mostly Lorem Ipsum

**Source:** [Google Search Console Setup Guide 2026 - SEO HQ](https://seohq.github.io/google-search-console-guide)

### Pitfall 5: Assuming reCAPTCHA v3 Alone Prevents All Spam

**What goes wrong:** Sophisticated bots bypass reCAPTCHA v3 by mimicking human behavior patterns. Spam submissions increase despite reCAPTCHA showing "success" responses.

**Why it happens:** reCAPTCHA v3 is score-based (0.0-1.0) and provides no visual challenge. Advanced bots can achieve scores above 0.5 by simulating realistic mouse movements, timing patterns, and browsing history.

**How to avoid:** Implement layered spam protection: reCAPTCHA v3 + honeypot fields + rate limiting + submission time checks. Monitor score distributions and adjust thresholds. Have manual review queue for borderline submissions (scores 0.4-0.6).

**Warning signs:**
- All submissions pass reCAPTCHA but many are spam
- reCAPTCHA scores cluster suspiciously (all exactly 0.7)
- Submissions arrive in perfect time intervals
- No variance in browser fingerprints

**Source:** [reCAPTCHA v3 Limitations in 2026 - FriendlyCaptcha](https://friendlycaptcha.com/insights/recaptcha-v2-vs-v3/)

### Pitfall 6: Testing Only "Green Path" Performance, Not Realistic Conditions

**What goes wrong:** Lighthouse scores are perfect in CI (100/100/100/100) but real users report slow load times. The disconnect happens because CI tests from fast servers with no rate limiting, ad blockers enabled, and empty cache.

**Why it happens:** CI environments don't match real-world conditions. Tests run on GitHub's servers (fast CPUs, low latency to CDN). Real users have slow 3G connections, crowded WiFi, dozens of browser extensions, and full caches.

**How to avoid:** Use WebPageTest with real mobile devices and 3G throttling. Enable realistic test conditions: clear cache, disable ad blockers, test from multiple geographic regions. Track field data via Google Search Console's Core Web Vitals report.

**Warning signs:**
- Lighthouse CI passes but users complain about speed
- No performance data from actual users
- All tests run from same geographic location
- Tests never simulate slow networks

**Source:** [Core Web Vitals: Lab Data vs Field Data - Core Web Vitals Blog](https://www.corewebvitals.io/pagespeed/best-chrome-devtools-network-settings-for-core-web-vitals)

### Pitfall 7: Forgetting to Remove `noindex` from Production Environment

**What goes wrong:** Site launches but remains invisible to search engines because `noindex` meta tag persists from staging. Weeks pass before anyone notices zero organic traffic.

**Why it happens:** `noindex` is correctly set on staging to prevent indexing. During deployment, environment variables don't switch properly, or metadata logic doesn't check production flag.

**How to avoid:** Add automated checks in production deployment that verify `noindex` is NOT present. Use SEO verification tools to check production URLs before announcing launch. Set up Google Search Console alerts for index coverage issues.

**Warning signs:**
- Production site not appearing in Google after 1 week
- Search Console shows "Indexed, though blocked by robots.txt" or "Excluded by 'noindex' tag"
- View source shows `<meta name="robots" content="noindex">`

**Source:** [Next.js Production Checklist - Metadata Verification](https://nextjs.org/docs/app/guides/production-checklist)

## Code Examples

Verified patterns from official sources:

### Next.js Metadata with Environment-Based Robots

```typescript
// app/layout.tsx
import { Metadata } from 'next';

const isProduction = process.env.NODE_ENV === 'production' &&
                     process.env.NEXT_PUBLIC_SITE_URL?.includes('yourdomain.com');

export const metadata: Metadata = {
  title: 'Your Site Title',
  description: 'Your site description',
  robots: isProduction
    ? { index: true, follow: true }
    : { index: false, follow: false }, // noindex on staging
};
```

**Source:** [Next.js generateMetadata - Official Documentation](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

### Next.js Core Web Vitals Reporting

```typescript
// app/layout.tsx
'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to your analytics service
    console.log(metric);

    // Example: Send to Google Analytics
    if (window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true,
      });
    }
  });

  return null;
}
```

**Source:** [Next.js useReportWebVitals Hook - Official Documentation](https://nextjs.org/docs/app/api-reference/functions/use-report-web-vitals)

### Netlify Security Headers for Production

```toml
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    # Already configured in Phase 1:
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

    # Add for Phase 6 (launch):
    Strict-Transport-Security = "max-age=63072000; includeSubDomains; preload"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://*.sanity.io; frame-src https://www.google.com;"
```

**Source:** [Netlify HTTPS SSL Documentation](https://docs.netlify.com/manage/domains/secure-domains-with-https/https-ssl/)

### Chrome DevTools 3G Network Throttling (Local Testing)

```javascript
// Use Chrome DevTools Protocol for automated testing
// Or manually: DevTools → Network tab → Throttling dropdown → "Fast 3G"

// For Lighthouse CLI with 3G simulation:
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });

  const options = {
    port: chrome.port,
    onlyCategories: ['performance', 'accessibility', 'seo'],
    throttling: {
      rttMs: 150,        // Round trip time
      throughputKbps: 1638, // 1.6 Mbps (Fast 3G)
      requestLatencyMs: 150,
      downloadThroughputKbps: 1638,
      uploadThroughputKbps: 750,
      cpuSlowdownMultiplier: 4, // Mobile CPU slowdown
    },
  };

  const runnerResult = await lighthouse(url, options);

  await chrome.kill();
  return runnerResult.lhr;
}
```

**Source:** [Lighthouse Configuration - Chrome Developers](https://developer.chrome.com/docs/lighthouse/overview/)

### Supabase Database Backup Download (Pro Plan)

```bash
# List available backups
supabase db dump --project-ref your-project-ref --list

# Download latest backup
supabase db dump --project-ref your-project-ref --output backup-$(date +%Y-%m-%d).sql

# Restore to local development
supabase start
psql postgresql://postgres:postgres@localhost:54322/postgres < backup-2026-02-17.sql

# Verify restoration
psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT COUNT(*) FROM profiles;"
```

**Source:** [Supabase Backup CLI Commands - Official Documentation](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)

### Sanity Dataset Export and Verification

```bash
# Export production dataset
sanity dataset export production backups/sanity-$(date +%Y-%m-%d).tar.gz

# Verify export contents (without extracting)
tar -tzf backups/sanity-2026-02-17.tar.gz

# Expected structure:
# data.ndjson       # All documents
# files/            # File assets
# images/           # Image assets

# Import to test dataset for verification
sanity dataset create backup-test
sanity dataset import backups/sanity-2026-02-17.tar.gz backup-test --replace

# Verify document count matches
sanity dataset list
```

**Source:** [Sanity Backup Commands - Official Documentation](https://www.sanity.io/docs/content-lake/backups)

### Honeypot Testing Helper

```typescript
// lib/spam-protection.test.ts
import { checkHoneypot } from './spam-protection';

describe('Honeypot spam protection', () => {
  it('should block submission when honeypot field is filled', () => {
    const formData = {
      name: 'John Doe',
      email: 'john@example.com',
      _honey: 'bot-filled-this', // Honeypot trap
    };

    expect(checkHoneypot(formData)).toBe(true);
  });

  it('should allow submission when honeypot field is empty', () => {
    const formData = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      _honey: '', // Empty honeypot (human)
    };

    expect(checkHoneypot(formData)).toBe(false);
  });

  it('should work with different honeypot field names', () => {
    const formData = {
      name: 'Test User',
      email: 'test@example.com',
      honeypot: 'filled',
    };

    expect(checkHoneypot(formData)).toBe(true);
  });
});

// Manual test in browser: Remove display:none, fill honeypot, submit
// Expected: Form should reject submission
```

**Source:** [Honeypot Anti-Spam Best Practices - DataDome](https://datadome.co/guides/captcha/honeypot/)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| First Input Delay (FID) | Interaction to Next Paint (INP) | 2024-2026 | INP measures full interaction latency, not just first input. More comprehensive responsiveness metric. |
| Manual Lighthouse runs | Lighthouse CI in GitHub Actions | 2020+ | Automated regression detection, performance budgets enforced in PR reviews. |
| Wildcard SSL certificates | Automatic Let's Encrypt (Netlify/Vercel) | 2018+ | Zero configuration, automatic renewal, no manual certificate management. |
| BrowserStack emulators | Real device cloud testing | 2022+ | BrowserStack now provides actual physical devices, not just emulators, for more realistic testing. |
| reCAPTCHA v2 (checkbox) | reCAPTCHA v3 (invisible scoring) | 2018+ | Frictionless for users but requires score threshold tuning and additional layers (honeypot, rate limiting). |
| Manual database dumps | Supabase PITR (Point-in-Time Recovery) | 2023+ | 2-minute RPO, restore to any second within retention period, no scheduled backup gaps. |
| Next.js middleware headers | Netlify edge headers | 2021+ | Headers applied at CDN edge (faster) instead of Next.js runtime. |

**Deprecated/outdated:**

- **Google PageSpeed Insights v4:** Replaced by PageSpeed Insights v5 with Lighthouse integration and field data from Chrome UX Report (CrUX).
- **AWS Device Farm physical devices for web testing:** Primarily focuses on native apps now; web testing better served by BrowserStack/LambdaTest with broader browser coverage.
- **Manual sitemap.xml updates:** Next.js 13+ provides `sitemap.ts` with dynamic generation and automatic format validation.
- **robots.txt only:** Modern recommendation is robots.txt + X-Robots-Tag header + meta robots tag for defense-in-depth SEO control.

## Open Questions

### 1. Should we use paid device farm or local physical devices?

**What we know:**
- BrowserStack Live starts at $29/month (30 minutes free trial)
- LambdaTest starts at $15/month (30 minutes free trial)
- Firebase Test Lab has free tier (5 physical devices/day)
- Local devices are one-time cost but limited variety

**What's unclear:**
- Budget constraints for this project
- How frequently device testing is needed post-launch
- Whether iOS testing is critical (requires macOS or paid service)

**Recommendation:** Start with free tiers (Firebase Test Lab for Android + Chrome DevTools) for launch validation. If budget allows, add BrowserStack for 1 month to test iOS devices, then reassess based on issue frequency. Document device testing protocol so it can be executed with local devices if needed.

### 2. Should we enable HSTS preload at launch or wait?

**What we know:**
- HSTS with preload is nearly irreversible (6-12 weeks to remove from browsers)
- Netlify provides automatic SSL with Let's Encrypt
- Recommended max-age is 2 years (63072000 seconds)

**What's unclear:**
- Whether all subdomains will support HTTPS (especially wildcard subdomains)
- Current SSL monitoring/alerting setup

**Recommendation:** Launch with HSTS without preload (`max-age=31536000; includeSubDomains`). Monitor for 30 days. If zero SSL issues occur, add `preload` directive and submit to [hstspreload.org](https://hstspreload.org). This provides protection while maintaining reversibility.

### 3. How to handle Sanity backups on free/growth plan?

**What we know:**
- Enterprise Sanity plans have managed daily backups (365 days retention)
- Free/Growth plans require manual CLI exports
- Export creates .tar.gz with documents + assets

**What's unclear:**
- Current Sanity plan tier
- Whether GitHub Actions can handle large exports (asset size)

**Recommendation:** Implement GitHub Actions workflow for weekly Sanity exports, stored as artifacts (free for public repos, 500MB limit for private). If exports exceed 500MB, use manual monthly backups to AWS S3 or Google Drive. Document export/import process in runbook.

### 4. What's the realistic Core Web Vitals target for launch?

**What we know:**
- Google's "Good" thresholds: LCP < 2.5s, INP < 200ms, CLS < 0.1
- Next.js 16 with Turbopack provides better performance than webpack
- Current stack: Next.js 16, Netlify CDN, Supabase (separate origin), Sanity (separate origin)

**What's unclear:**
- Baseline performance without optimization
- Image sizes and optimization needs
- Third-party script impact (reCAPTCHA, Analytics)

**Recommendation:** Run initial Lighthouse audit to establish baseline. Target "Good" thresholds (90+ score) for homepage. Accept "Needs Improvement" (80+) for complex pages (member directory with many images) at launch, with optimization plan in Phase 7. Use `@next/bundle-analyzer` to identify largest bundles.

### 5. Should we implement automated backup restoration testing?

**What we know:**
- Best practice is monthly backup restore verification
- Supabase Pro plan provides daily backups + PITR
- Sanity exports are manual (free plan) or automatic (enterprise)

**What's unclear:**
- Effort vs. risk tradeoff for this project size
- Whether automated testing justifies setup cost

**Recommendation:** For MVP launch, manually test backup restoration once before launch. Document the restoration process in a runbook. Schedule quarterly manual verification (Q1, Q2, Q3, Q4). Consider automation if the project scales to multiple databases or critical business data.

## Sources

### Primary (HIGH confidence)

- [Next.js Production Checklist - Official Documentation](https://nextjs.org/docs/app/guides/production-checklist)
- [Next.js robots.txt Configuration - Official Documentation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)
- [Netlify HTTPS SSL Configuration - Official Documentation](https://docs.netlify.com/manage/domains/secure-domains-with-https/https-ssl/)
- [Lighthouse Overview - Chrome Developers](https://developer.chrome.com/docs/lighthouse/overview/)
- [Supabase Database Backups - Official Documentation](https://supabase.com/docs/guides/platform/backups)
- [Sanity Backups - Official Documentation](https://www.sanity.io/docs/content-lake/backups)
- [k6 API Load Testing - Grafana Documentation](https://grafana.com/docs/k6/latest/testing-guides/api-load-testing/)

### Secondary (MEDIUM confidence)

- [Google Search Console Guide 2026 - SEO HQ](https://seohq.github.io/google-search-console-guide)
- [reCAPTCHA v3 Limitations 2026 - FriendlyCaptcha](https://friendlycaptcha.com/insights/recaptcha-v2-vs-v3/)
- [Device Farms Comparison 2026 - TestGrid](https://testgrid.io/blog/best-device-farms/)
- [Core Web Vitals Testing Tools 2026 - WP Rocket](https://wp-rocket.me/blog/core-web-vitals-testing-performance-monitoring-tools/)
- [BrowserStack Pricing 2026 - Bug0](https://bug0.com/knowledge-base/browserstack-pricing)
- [Lighthouse CI GitHub Action - Official](https://github.com/marketplace/actions/lighthouse-ci-action)
- [Chrome DevTools Device Mode - Chrome Developers](https://developer.chrome.com/docs/devtools/device-mode)
- [Mobile Emulator vs Real Devices - BrowserStack](https://www.browserstack.com/guide/mobile-emulator-vs-real-devices)
- [HSTS Configuration Best Practices - Travis Lord](https://travislord.xyz/articles/how-to-secure-your-netlify-site-with-hsts-configuration)
- [Honeypot Anti-Spam Techniques - DataDome](https://datadome.co/guides/captcha/honeypot/)
- [Load Testing Tools 2026 - PFLB](https://pflb.us/blog/best-load-testing-tools/)
- [Next.js Production Build Checklist 2026 - WebDevUltra](https://www.webdevultra.com/articles/nextjs-production-checklist)

### Tertiary (LOW confidence)

- [Noindex Checker Tools - SEO.ai](https://seo.ai/tools/noindex-checker) - Multiple tools exist but implementation quality varies

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official documentation and established tools (Lighthouse, k6, Supabase/Sanity CLI)
- Architecture: HIGH - Patterns verified with official docs and real-world implementations
- Pitfalls: MEDIUM-HIGH - Based on documented issues and community experiences, but some are project-specific

**Research date:** 2026-02-17
**Valid until:** 2026-04-17 (60 days - stable domain with slow-moving standards)

**Key finding:** Most infrastructure for Phase 6 already exists from Phase 1 (Netlify, SSL, robots.txt, sitemap, spam protection). Launch preparation is primarily **validation and testing** rather than new implementation. Focus should be on systematic verification (Lighthouse CI, device testing, backup restoration) and establishing monitoring (Google Search Console, Core Web Vitals).
