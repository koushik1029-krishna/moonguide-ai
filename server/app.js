import express from "express";
import cors from "cors";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import askRouter from "./routes/ask.js";
import healthRouter from "./routes/health.js";
import storeRouter from "./routes/store.js";
import { resolveCorsOrigin } from "./lib/corsOrigin.js";
import { handleJsonErrors, notFoundHandler, serverErrorHandler } from "./middleware/errors.js";
import { createRateLimiter } from "./middleware/rateLimit.js";
import { securityHeaders } from "./middleware/security.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const clientDist = join(__dirname, "..", "client", "dist");
const indexHtml = join(clientDist, "index.html");
const askRateLimit = createRateLimiter({ windowMs: 60_000, max: 25 });

function sendSpaIndex(req, res, next) {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  if (req.path.startsWith("/api/")) return next();
  if (!existsSync(indexHtml)) return next();
  res.sendFile(indexHtml, (err) => {
    if (err) next(err);
  });
}

export function createApp() {
  const app = express();
  app.disable("x-powered-by");

  app.use(securityHeaders);
  app.use(cors({ origin: resolveCorsOrigin() }));
  app.use(express.json({ limit: "32kb" }));
  app.use(handleJsonErrors);

  app.use("/api/health", healthRouter);
  app.use("/api/ask", askRateLimit, askRouter);
  app.use("/api/store", storeRouter);

  if (existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.use(sendSpaIndex);
  }

  app.use(notFoundHandler);
  app.use(serverErrorHandler);

  return app;
}
