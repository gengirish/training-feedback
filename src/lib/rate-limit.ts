const hits = new Map<string, { count: number; resetAt: number }>();

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of hits) {
    if (now > entry.resetAt) hits.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number,
): RateLimitResult {
  cleanup();
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  const entry = hits.get(key);
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetInSeconds: windowSeconds };
  }

  entry.count++;
  const resetInSeconds = Math.ceil((entry.resetAt - now) / 1000);

  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0, resetInSeconds };
  }

  return { allowed: true, remaining: maxRequests - entry.count, resetInSeconds };
}
