import { headers } from 'next/headers';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis only if ENV variables are present
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;
if (redisUrl && redisToken) {
  redis = new Redis({
    url: redisUrl,
    token: redisToken,
  });
}

/**
 * Normalizes IP address from headers
 */
export async function getNormalizedIp(): Promise<string> {
  // next/headers requires await in Next.js 15+
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  
  if (forwardedFor) {
    // x-forwarded-for can be a comma-separated list of IPs.
    // The first IP is the original client IP.
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIp = headersList.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  
  return 'unknown-ip';
}

/**
 * Checks rate limit for a specific action
 * @param actionName Name of the action (e.g., 'saveRating')
 * @param userId User ID if authenticated, or 'anonymous'
 * @param limit Max requests per window
 * @param window Time window (e.g., '1 m', '10 s')
 */
export async function checkRateLimit(
  actionName: string,
  userId: string,
  limit: number,
  window: `${number} s` | `${number} m` | `${number} h` | `${number} d` = '1 m'
): Promise<{ success: boolean; error?: string }> {
  const ip = await getNormalizedIp();
  const identifier = `${actionName}_${userId}_${ip}`;

  // FAIL-OPEN: If Redis is not configured, allow the request but log a warning.
  if (!redis) {
    console.warn(`[RATE_LIMIT_WARNING] Redis ENV missing. Rate limit bypassed for action: ${actionName}, identifier: ${identifier}`);
    return { success: true };
  }

  try {
    const ratelimit = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(limit, window),
      analytics: false, // disable analytics to save Redis storage
    });

    const { success } = await ratelimit.limit(identifier);

    if (!success) {
      console.warn(`[RATE_LIMIT_EXCEEDED] action: ${actionName}, identifier: ${identifier}`);
      return { success: false, error: 'Çok fazla işlem yaptınız. Lütfen biraz bekleyip tekrar deneyin.' };
    }

    return { success: true };
  } catch (error: any) {
    // FAIL-OPEN on runtime Redis error
    console.warn(`[RATE_LIMIT_ERROR] Failed to check rate limit for action: ${actionName}. Bypassing. Error: ${error.message}`);
    return { success: true };
  }
}

export type RateLimitTier = {
  limit: number;
  window: `${number} s` | `${number} m` | `${number} h` | `${number} d`;
};

/**
 * Checks multiple rate limit tiers sequentially for an action
 * E.g. [{ limit: 20, window: '1 m' }, { limit: 100, window: '10 m' }]
 */
export async function checkMultiRateLimit(
  actionName: string,
  tiers: RateLimitTier[]
): Promise<{ success: boolean; error?: string }> {
  const ip = await getNormalizedIp();
  const identifier = `${actionName}_${ip}`;

  if (!redis) {
    console.warn(`[MULTI_RATE_LIMIT_WARNING] Redis ENV missing. Rate limit bypassed for action: ${actionName}, identifier: ${identifier}`);
    return { success: true };
  }

  try {
    for (const tier of tiers) {
      const ratelimit = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(tier.limit, tier.window),
        analytics: false,
      });

      const { success } = await ratelimit.limit(identifier);

      if (!success) {
        console.warn(`[MULTI_RATE_LIMIT_EXCEEDED] action: ${actionName}, tier: ${tier.limit}/${tier.window}, identifier: ${identifier}`);
        return { success: false, error: 'rate_limited' };
      }
    }

    return { success: true };
  } catch (error: any) {
    console.warn(`[MULTI_RATE_LIMIT_ERROR] Failed to check rate limit for action: ${actionName}. Bypassing. Error: ${error.message}`);
    return { success: true };
  }
}
