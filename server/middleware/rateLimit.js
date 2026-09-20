function clientKey(req) {
  return req.socket?.remoteAddress || "unknown";
}

/**
 * In-memory limiter for this educational prototype.
 * Resets on process restart and is not shared across instances.
 */
export function createRateLimiter({ windowMs = 60_000, max = 25 } = {}) {
  const hits = new Map();

  function prune(now) {
    for (const [key, bucket] of hits) {
      if (now - bucket.start >= windowMs) {
        hits.delete(key);
      }
    }
  }

  return function rateLimit(req, res, next) {
    const now = Date.now();
    if (hits.size > 2000) {
      prune(now);
    }

    const key = clientKey(req);
    let bucket = hits.get(key);
    if (!bucket || now - bucket.start >= windowMs) {
      bucket = { start: now, count: 0 };
      hits.set(key, bucket);
    }

    bucket.count += 1;
    if (bucket.count > max) {
      const retryAfter = Math.max(1, Math.ceil((windowMs - (now - bucket.start)) / 1000));
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({
        error: true,
        message: "Too many questions were sent at once. Please wait a moment and try again."
      });
    }

    return next();
  };
}
