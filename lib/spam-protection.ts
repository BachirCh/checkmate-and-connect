/**
 * Spam Protection Utilities
 *
 * Two-layer protection for forms:
 * 1. Honeypot - Hidden field to catch bots
 * 2. Rate limiting - Prevent abuse
 *
 * There was a third, reCAPTCHA v3, but it was never actually verifying — the
 * call sites shipped commented out with a placeholder token — so all it did
 * was load Google's script and print a site-key error on localhost. Removed
 * rather than fixed: the two layers below are what was doing the work.
 */

// In-memory rate limiter
// Note: In-memory rate limiting resets on server restart.
// Sufficient for MVP; migrate to Redis (Upstash) for production scale if needed.
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Check honeypot field to detect bots
 * @param formData - Form data object
 * @returns true if spam detected, false otherwise
 */
export function checkHoneypot(formData: Record<string, any>): boolean {
  // Check for honeypot field (should be empty for legitimate users)
  const honeypotField = formData._honey || formData.honeypot || formData._url;

  // If honeypot field has any value, it's a bot
  if (honeypotField && honeypotField.trim() !== '') {
    console.warn('Honeypot field filled - likely bot');
    return true;
  }

  return false;
}

/**
 * Rate limit requests by identifier
 * @param identifier - Unique identifier (e.g., IP address or user ID)
 * @param maxAttempts - Maximum attempts allowed in window
 * @param windowMs - Time window in milliseconds
 * @returns Object with allowed status and remaining attempts
 */
export function rateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // No previous record or window expired
  if (!record || now > record.resetAt) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  // Increment count
  record.count++;

  // Check if limit exceeded
  if (record.count > maxAttempts) {
    return { allowed: false, remaining: 0 };
  }

  return {
    allowed: true,
    remaining: maxAttempts - record.count,
  };
}
