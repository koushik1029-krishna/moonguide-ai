const DEFAULT_DEV_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:8080",
  "http://127.0.0.1:8080"
];

function parseOriginList(raw) {
  return String(raw)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Development defaults to local Vite/Express origins.
 * Production is same-origin unless CORS_ORIGIN is set.
 * An explicit CORS_ORIGIN=* opts into reflecting the request origin.
 */
export function resolveCorsOrigin(env = process.env) {
  const raw = typeof env.CORS_ORIGIN === "string" ? env.CORS_ORIGIN.trim() : "";

  if (raw === "*") {
    return true;
  }

  if (raw) {
    const origins = parseOriginList(raw);
    if (origins.length === 0) {
      return env.NODE_ENV === "production" ? false : DEFAULT_DEV_ORIGINS;
    }
    return origins.length === 1 ? origins[0] : origins;
  }

  if (env.NODE_ENV === "production") {
    return false;
  }

  return DEFAULT_DEV_ORIGINS;
}
