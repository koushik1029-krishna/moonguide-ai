# MoonGuide AI — Defensive Security Audit

**Date:** 2026-09-19  
**Scope:** Local educational prototype at `C:\Users\koush\Music\MoonGuide-AI-Local` (frontend, backend, config, env, API routes, forms, localStorage, dependencies, error messages).  
**Not in scope as live systems:** Amazon Bedrock, OpenSearch, Cognito, App Runner, or other enterprise AWS services. They are not implemented.

This document lists each finding, its risk, the mitigation that is **in the code**, and how it was verified. Controls that remain incomplete are labeled as prototype limits.

---

## Method

- Read source under `client/src`, `server`, `shared`, plus `README.md`, `.gitignore`, `package.json` files, and `TESTING_SECURITY_REPORT.md`.
- Searched for secrets, `dangerouslySetInnerHTML`, `eval`, CORS, logging, PIN handling, and environment files.
- Did **not** print, copy, or commit any real secret values. No `.env` file with secrets was present.
- Ran `npm audit` at the repo root, `server/`, and `client/` where practical.
- Ran a production client build after code changes.

Workshop 1 features (guest chat, knowledge-grounded answers, restricted-sale escalation, staff/manager views, demo PIN `1234`, localStorage persistence) were preserved. The React error boundary, shared validation, and the connect message *“MoonGuide AI cannot connect to the service right now. Please check your connection and try again.”* were left in place.

---

## Findings and mitigations

### 1. No live API keys, tokens, or cloud credentials in source

| | |
| --- | --- |
| **Risk** | Committed secrets would let anyone reuse paid AI or cloud accounts. |
| **Status** | No AWS keys, Bearer tokens, or paid AI keys were found in application source. The assistant uses `server/data/knowledge.json` only. |
| **Mitigation** | `.env` / `.env.local` / `.env.*.local` stay in `.gitignore`. `.env.example` lists placeholders only: `PORT`, `HOST`, `CORS_ORIGIN`, `NODE_ENV`. |
| **Verified** | Workspace search for common secret patterns in project source (excluding `node_modules`) returned no application secrets. Glob for `.env*` found only `.env.example`. |

### 2. Overly permissive CORS (`CORS_ORIGIN \|\| true`)

| | |
| --- | --- |
| **Risk** | Reflecting any origin would let a malicious site call the API from a browser if the server is reachable on a network. |
| **Mitigation in code** | `server/lib/corsOrigin.js` + `server/app.js`. Development default is local Vite/Express origins (`http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:3001`, `http://127.0.0.1:3001`). Production default is same-origin (`origin: false`) unless `CORS_ORIGIN` is set. Comma-separated origins are supported. `CORS_ORIGIN=*` is an explicit opt-in, not the default. |
| **Verified** | Source review of `resolveCorsOrigin()`. Manual check: `GET /api/health` from the local origin still works; a disallowed origin should not receive `Access-Control-Allow-Origin` reflecting that origin. |

### 3. Missing security headers

| | |
| --- | --- |
| **Risk** | Without headers, browsers may MIME-sniff, embed the app in a frame, or allow unexpected script/connect targets. |
| **Mitigation in code** | `server/middleware/security.js` sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Permissions-Policy` (camera/microphone/geolocation disabled), and a restrictive `Content-Security-Policy` (`default-src 'self'`, `script-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`). `app.disable("x-powered-by")` is set in `server/app.js`. |
| **Verified** | Header inspection on `GET /api/health` after the change (see verification notes below). CSP applies to responses from Express, including the production static app. The Vite **dev** server does not send these headers; that is a remaining local-dev limit. |

### 4. Request size limit (already present; confirmed)

| | |
| --- | --- |
| **Risk** | Large JSON bodies can exhaust memory. |
| **Mitigation in code** | `express.json({ limit: "32kb" })` remains in `server/app.js`. Oversized bodies still return HTTP 413 with a user-facing message and no stack. |
| **Verified** | Code review of `server/app.js` and `handleJsonErrors` in `server/middleware/errors.js`. |

### 5. Missing rate limiting on `POST /api/ask`

| | |
| --- | --- |
| **Risk** | An unauthenticated ask endpoint can be flooded. |
| **Mitigation in code** | In-memory limiter in `server/middleware/rateLimit.js`, applied only to `/api/ask`: **25 requests / 60 seconds** per socket address. HTTP 429 plus `Retry-After`. Uses `req.socket.remoteAddress` (no `trust proxy`, so `X-Forwarded-For` cannot spoof the key). |
| **Prototype limit** | Counters live in one Node process and reset on restart. This is not a distributed WAF. |
| **Verified** | Code review; manual burst of `POST /api/ask` should return 429 after 25 successes in one minute. |

### 6. Weak manager PIN / demonstration authentication

| | |
| --- | --- |
| **Risk** | PIN `1234` is a classroom requirement and is public. Anyone can also set `moonguide.managerUnlocked` in localStorage. This is **not** production auth. |
| **Mitigation in code** | Demo PIN kept. Input and `validateManagerPin()` strip non-digits. The PIN is not logged. Failed attempts add a short delay; **5 failures** lock the form for about **20 seconds**. UI states that this is demonstration-only, not production authentication. |
| **Prototype limit** | Check is client-side only. Refresh clears lockout. localStorage spoof still unlocks the dashboard. Do not treat this as Cognito or any real identity system. |
| **Verified** | Code review of `client/src/pages/ManagerPage.jsx` and `shared/validation.js`. Manual: letters are stripped; five wrong PINs lock the form; `1234` still unlocks afterward. |

### 7. Accidental logging of error objects

| | |
| --- | --- |
| **Risk** | `console.error(err)` can dump stacks, paths, and any message text that happens to include a PIN or token. |
| **Mitigation in code** | `serverErrorHandler` logs only a short name + sanitized message (`summarizeError` in `server/middleware/errors.js`). Labels such as `pin`, `password`, `token`, `secret`, `authorization`, and `cookie` are redacted. Stacks and request bodies are not logged. Clients still receive the generic 500 JSON message with no stack. |
| **Verified** | Code review. Client 500 body remains `{ error: true, message: "Something went wrong. Please try again or speak with a store employee." }`. |

### 8. XSS / unsafe HTML rendering

| | |
| --- | --- |
| **Risk** | If questions were rendered as HTML, a guest could run script in staff/manager views. |
| **Mitigation in code** | Application source does not use `dangerouslySetInnerHTML` or `innerHTML`. Chat, feedback table, and staff lists render React text nodes. Store `tel:` links are built from digit/`+` characters only. CSP `script-src 'self'` is defense in depth on Express. |
| **Verified** | Search of `client/src` and `server` for unsafe HTML APIs. Sending `<script>alert(1)</script>` should appear as text. |

### 9. Injection (SQL / command / template)

| | |
| --- | --- |
| **Risk** | Untrusted questions could reach a database or shell. |
| **Status** | No SQL, shell, or template engine is used. Matching is in-process string scoring against `knowledge.json`. Questions are validated (trim, 2–500 characters, must include a letter or number) on both client and server (`shared/validation.js`). |
| **Verified** | Code review of `server/lib/matcher.js`, `server/routes/ask.js`, and `shared/validation.js`. |

### 10. Insecure API request handling

| | |
| --- | --- |
| **Risk** | Missing validation or leaking internals on failure. |
| **Mitigation in code** | `POST /api/ask` requires a JSON object, runs `validateQuestion`, and returns only grounded fields. Client `fetch` uses a 12s timeout, JSON Content-Type, and maps technical/network errors to user-facing text, including the preserved connect message. Knowledge catalog at `GET /api/store/knowledge` returns id/category/title/lastUpdated/restricted — not full answers. |
| **Prototype limit** | `/api/ask`, `/api/store`, and `/api/health` remain **unauthenticated by design**. Treat them as public sample APIs. |
| **Verified** | Code review of `server/routes/ask.js`, `server/routes/store.js`, and `client/src/services/api.js`. |

### 11. Sensitive data in localStorage (prototype limit; documented, not “fixed”)

| Key | Contents |
| --- | --- |
| `moonguide.chat` | Conversation questions and answers |
| `moonguide.feedback` | Helpful / Not Helpful records (includes question/answer text) |
| `moonguide.role` | `guest` / `staff` / `manager` |
| `moonguide.managerUnlocked` | `"true"` / `"false"` |

| | |
| --- | --- |
| **Risk** | Any script on this origin, or a shared browser, can read chat text and flip manager unlock. This is not a vault and is not appropriate for real PII, payments, or staff credentials. |
| **Mitigation in code** | Storage helpers validate/sanitize records and clip long strings. Role values are allow-listed. The UI shows a persistence warning if `localStorage` is blocked. **No claim** that this is encrypted or server-side session storage. |
| **Verified** | Code review of `client/src/services/storage.js`. This remains an accepted classroom limit. |

### 12. Overly detailed errors to clients

| | |
| --- | --- |
| **Risk** | Stack traces or `ECONNREFUSED` confuse users and leak internals. |
| **Mitigation in code** | API JSON errors are short and user-facing. Client `toUserFacingError()` strips technical patterns. React `ErrorBoundary` shows a reload message and does not render stacks (`componentDidCatch` is empty on purpose). |
| **Verified** | Code review of `client/src/services/api.js`, `client/src/components/ErrorBoundary.jsx`, and server error handlers. Connect copy was not changed. |

### 13. Server bind address

| | |
| --- | --- |
| **Risk** | Listening on `0.0.0.0` exposes the prototype on the LAN. |
| **Mitigation in code** | `server/index.js` defaults `HOST` to `127.0.0.1`. Override with `HOST` in `.env`. The Dockerfile still sets `HOST=0.0.0.0` for containers. |
| **Verified** | Code review of `server/index.js` and `Dockerfile`. |

### 14. Vite filesystem allow-list

| | |
| --- | --- |
| **Risk** | `server.fs.allow: [".."]` let the Vite dev server read the parent tree. |
| **Mitigation in code** | `client/vite.config.js` allows only the client app directory and `../shared`. |
| **Verified** | Code review. Dev proxy to `http://127.0.0.1:3001` is unchanged. |

### 15. Vulnerable dependencies

| | |
| --- | --- |
| **Risk** | Known CVEs in npm packages. |
| **Mitigation** | `npm audit` was run at the repo root, `server/`, and `client/`. Non-breaking `npm audit fix` was attempted. No production-dependency CVEs were found. |
| **Verified** | Root: 0 vulnerabilities. Server: 0 vulnerabilities. Client: remaining **esbuild <=0.24.2** advisory used by Vite 5 (`GHSA-67mh-4wv8-2f99`). `npm audit fix` does not patch it without `npm audit fix --force`, which would install Vite 8 (breaking). That force upgrade was **not** applied. This advisory affects the **Vite development server**, not the Express production static build. |

---

## Remaining prototype limits (do not claim these are solved)

- Demo PIN `1234` is public and is **not** production authentication.
- Manager unlock is a localStorage flag and can be spoofed in DevTools.
- Chat and feedback live in localStorage (not for real PII or payments).
- Ask/store/health APIs have no user login.
- In-memory rate limit is per process only.
- No TLS/HTTPS in this local prototype.
- Security headers apply to Express, not the Vite dev server.
- Amazon Bedrock, Cognito, OpenSearch, Guardrails, and App Runner are **not** implemented.

---

## Files changed in this audit

- `.env.example` (new)
- `.gitignore`
- `README.md`
- `SECURITY_AUDIT.md` (this file)
- `TESTING_SECURITY_REPORT.md`
- `client/src/pages/ManagerPage.jsx`
- `client/vite.config.js`
- `server/app.js`
- `server/index.js`
- `server/lib/corsOrigin.js` (new)
- `server/middleware/errors.js`
- `server/middleware/rateLimit.js` (new)
- `server/middleware/security.js` (new)
- `server/scripts/verify-security.mjs` (new; local header/CORS/size/rate-limit checks)

---

## Verification performed in this audit

- `node server/scripts/verify-security.mjs`: PASS health, security headers, local CORS allow, foreign CORS blocked, ask 200 without stack, 32kb 413, ask rate limit 429.
- `npm audit` (root and server): 0 vulnerabilities.
- `npm audit` (client): esbuild/Vite dev-server advisory remaining; no safe non-breaking fix.
- `npm run build`: production client build succeeded (Vite 5.4.x).

Amazon Bedrock, Cognito, OpenSearch, Guardrails, and App Runner remain unimplemented.

## How to test the mitigations manually

1. **CORS (dev):** Start `npm run dev`. From the browser on `http://localhost:5173`, Guest chat and store info should load. In DevTools, `/api/health` should show an allowed local origin, not a reflected random origin.
2. **CORS (production default):** `npm start`, then call `/api/health` from the same origin (the Express static app). A browser request from a different origin should not get a reflecting `Access-Control-Allow-Origin`.
3. **Headers:** `GET http://127.0.0.1:3001/api/health` and confirm `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, CSP `default-src 'self'`, and no `X-Powered-By`.
4. **Size limit:** POST a JSON body larger than 32kb to `/api/ask` → 413, no stack in the JSON.
5. **Rate limit:** POST a valid question to `/api/ask` more than 25 times in 60 seconds → 429 and `Retry-After`. The Guest UI should show the wait-and-try-again copy.
6. **PIN:** Type `12ab` — letters disappear. Enter five wrong PINs — form locks ~20 seconds. Then enter `1234` — dashboard still unlocks. Confirm the server log never prints the PIN.
7. **XSS:** Ask `<img src=x onerror=alert(1)>` and rate the answer. Chat and manager table show the characters as text.
8. **Errors:** Stop Express and send a question — Guest shows the connect message above, not `ECONNREFUSED` or a stack.
9. **localStorage:** Application → Local Storage: chat/feedback/role/unlock flags only. No payment data. Setting `moonguide.managerUnlocked` to `true` still bypasses the PIN (accepted limit).
10. **Secrets:** Confirm `.env` is gitignored and `.env.example` has placeholders only.

Classroom test cases for these checks are in `TESTING_SECURITY_REPORT.md` section 13 (including 13.21–13.24).
