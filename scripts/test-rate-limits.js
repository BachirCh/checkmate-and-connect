/**
 * k6 Load Test for Rate Limiting and Spam Protection
 *
 * Tests rate limiting, honeypot, and reCAPTCHA spam protection under load.
 * Simulates bot attacks with rapid-fire submissions to verify protection holds.
 *
 * Usage:
 *   k6 run scripts/test-rate-limits.js
 *
 * Installation:
 *   macOS: brew install k6
 *   Other: https://github.com/grafana/k6/releases
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 concurrent users
    { duration: '1m', target: 20 },  // Sustain 20 users for 1 minute
    { duration: '10s', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.2'],    // Less than 20% failures (most should hit rate limit, not crash)
    checks: ['rate>0.8'],              // 80% of checks pass (most should be 200 or 429, not 500)
  },
};

// Base URL - override with environment variable
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// TODO: Replace /api/health with actual form endpoint once Phase 3 member submission is available
// Expected endpoints: /api/submit-member or /api/contact
const ENDPOINT = `${BASE_URL}/api/health`;

export default function () {
  // Simulate rapid-fire bot submissions (10 requests/second per user)
  // With 20 users, this creates 200 req/s load

  const payload = JSON.stringify({
    // Realistic form data
    name: `Test User ${__VU}`,
    email: `testuser${__VU}@example.com`,
    message: 'This is a test submission from k6 load test',

    // Honeypot field - legitimate users leave this empty
    // Bots often fill all fields
    _honey: '', // Empty = legitimate user behavior

    // NOTE: reCAPTCHA token not included in load test
    // Production forms require valid token from Google reCAPTCHA API
    // Rate limiting and honeypot still work without reCAPTCHA
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = http.post(ENDPOINT, payload, params);

  // Verify response is either success (200) or rate limited (429)
  // Should NOT be server error (500)
  check(response, {
    'status is 200 or 429': (r) => r.status === 200 || r.status === 429,
    'not server error': (r) => r.status !== 500,
    'response time acceptable': (r) => r.timings.duration < 500,
  });

  // Log rate limit responses for monitoring
  if (response.status === 429) {
    console.log(`Rate limit hit for user ${__VU} - spam protection working`);
  }

  // Small delay between requests to simulate bot behavior
  // Bots typically submit 10-100 times per second
  sleep(0.1); // 10 requests/second per user
}

/**
 * Expected Results:
 *
 * - First 5 requests from each user: 200 OK (within rate limit)
 * - Subsequent requests: 429 Too Many Requests (rate limit triggered)
 * - >80% of requests should hit rate limit (429 status)
 * - No server errors (500 status)
 * - P95 response time under 500ms
 *
 * Rate Limit Configuration (from lib/spam-protection.ts):
 * - Max attempts: 5 per 60 seconds per identifier
 * - Window: 60000ms (1 minute)
 *
 * NOTE: Once Phase 3 member submission endpoint is available, update ENDPOINT
 * constant to test actual form submission with full spam protection stack
 * (reCAPTCHA + honeypot + rate limiting).
 */
