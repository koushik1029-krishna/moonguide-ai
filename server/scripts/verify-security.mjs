import http from "node:http";
import { createApp } from "../app.js";

function request(port, { method = "GET", path, headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: "127.0.0.1", port, method, path, headers },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          let json = null;
          try {
            json = JSON.parse(raw);
          } catch {
            json = null;
          }
          resolve({ status: res.statusCode, headers: res.headers, raw, json });
        });
      }
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

const previousNodeEnv = process.env.NODE_ENV;
process.env.NODE_ENV = "development";

const app = createApp();
const server = app.listen(0, "127.0.0.1");

await new Promise((resolve) => server.once("listening", resolve));
const { port } = server.address();
const findings = [];

try {
  const health = await request(port, { path: "/api/health" });
  const headerChecks = {
    nosniff: health.headers["x-content-type-options"] === "nosniff",
    frame: health.headers["x-frame-options"] === "DENY",
    csp: String(health.headers["content-security-policy"] || "").includes("default-src 'self'"),
    poweredBy: health.headers["x-powered-by"] == null
  };
  findings.push(["health-ok", health.status === 200 && health.json?.status === "ok"]);
  findings.push(["headers", Object.values(headerChecks).every(Boolean)]);

  const allowed = await request(port, {
    path: "/api/health",
    headers: { Origin: "http://localhost:5173" }
  });
  findings.push([
    "cors-local-allowed",
    allowed.headers["access-control-allow-origin"] === "http://localhost:5173"
  ]);

  const blocked = await request(port, {
    path: "/api/health",
    headers: { Origin: "https://evil.example" }
  });
  findings.push([
    "cors-foreign-blocked",
    blocked.headers["access-control-allow-origin"] !== "https://evil.example"
  ]);

  const askBody = JSON.stringify({ question: "What time does the store close?" });
  const askHeaders = { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(askBody) };
  const firstAsk = await request(port, { method: "POST", path: "/api/ask", headers: askHeaders, body: askBody });
  findings.push(["ask-ok", firstAsk.status === 200 && typeof firstAsk.json?.answer === "string"]);
  findings.push(["ask-no-stack", !String(firstAsk.raw).toLowerCase().includes("stack")]);

  const oversized = "a".repeat(40 * 1024);
  const huge = JSON.stringify({ question: oversized });
  const hugeRes = await request(port, {
    method: "POST",
    path: "/api/ask",
    headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(huge) },
    body: huge
  });
  findings.push([
    "json-32kb-limit",
    hugeRes.status === 413 &&
      hugeRes.json?.error === true &&
      !/stack|at\s+\S+\s+\(|node:internal/i.test(hugeRes.raw)
  ]);

  let limited = false;
  for (let i = 0; i < 30; i += 1) {
    const res = await request(port, { method: "POST", path: "/api/ask", headers: askHeaders, body: askBody });
    if (res.status === 429) {
      limited = Boolean(res.headers["retry-after"]) && typeof res.json?.message === "string";
      break;
    }
  }
  findings.push(["ask-rate-limit", limited]);
} finally {
  await new Promise((resolve) => server.close(resolve));
  if (previousNodeEnv === undefined) {
    delete process.env.NODE_ENV;
  } else {
    process.env.NODE_ENV = previousNodeEnv;
  }
}

const failed = findings.filter(([, ok]) => !ok).map(([name]) => name);
for (const [name, ok] of findings) {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
}
if (failed.length) {
  process.exitCode = 1;
}
