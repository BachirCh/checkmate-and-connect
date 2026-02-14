/**
 * Spam Protection Utilities
 *
 * Three-layer protection for forms:
 * 1. reCAPTCHA v3 - Google's bot detection
 * 2. Honeypot - Hidden field to catch bots
 * 3. Rate limiting - Prevent abuse
 */

// In-memory rate limiter
// Note: In-memory rate limiting resets on server restart.
// Sufficient for MVP; migrate to Redis (Upstash) for production scale if needed.
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Verify reCAPTCHA v3 token with Google
 * @param token - reCAPTCHA token from client
 * @param action - Action name (e.g., 'contact_form')
 * @returns Success status and score (0.0-1.0)
 */
export async function verifyRecaptcha(
  token: string,
  action: string
): Promise<{ success: boolean; score: number }> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.error('RECAPTCHA_SECRET_KEY not configured');
    return { success: false, score: 0 };
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const data = await response.json();

    // Verify action matches and score is above threshold
    if (data.action !== action) {
      console.warn(`reCAPTCHA action mismatch: expected ${action}, got ${data.action}`);
      return { success: false, score: 0 };
    }

    // Score threshold: 0.5 (higher = more likely human)
    const threshold = 0.5;
    const success = data.success && data.score >= threshold;

    return {
      success,
      score: data.score || 0,
    };
  } catch (error) {
    console.error('reCAPTCHA verification failed:', error);
    return { success: false, score: 0 };
  }
}

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
