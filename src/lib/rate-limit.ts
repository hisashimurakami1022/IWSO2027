// In-memory sliding-window rate limiter. Only correct for a single process
// (this app runs as one PM2 fork instance, per DEPLOY.md) — state is not
// shared across instances and resets on restart.
const buckets = new Map<string, number[]>();

export function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= max) {
    buckets.set(key, recent);
    return false;
  }

  recent.push(now);
  buckets.set(key, recent);
  return true;
}
