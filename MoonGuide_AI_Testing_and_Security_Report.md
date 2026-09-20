# MoonGuide AI Testing and Security Report

Krishna Koushik Naik Mude  
Student  
September 19, 2026

Printable APA 7 version: `MoonGuide_AI_Testing_and_Security_Report.html` (Times New Roman, double-spaced title block, 1-inch margins, page numbers). Tables are single-spaced so the file prints on two letter pages. Measured content height: page 1 = 8.58 in and page 2 = 8.94 in of a 9 in print area.

## Application Description

MoonGuide AI is a local educational prototype for Moon’s Food Store. Guests ask about approved sample hours, location, products, services, and EBT/SNAP. Answers come only from `server/data/knowledge.json`. Unsupported questions fall back to a store employee. Alcohol, tobacco, vape, lottery, age, and identification questions escalate; the assistant does not approve a sale or replace a legally required ID check (MoonGuide AI, 2026). Guest, Staff, and Manager views share in-browser chat and feedback. The manager gate is a classroom demo PIN `1234` checked in the frontend, not a server secret and not Amazon Cognito (MoonGuide AI, 2026; see also SECURITY_AUDIT.md).

## Testing Environment

| Item | Value |
| --- | --- |
| Tester | Krishna Koushik Naik Mude (local prototype; Cursor agent assisted) |
| Date | September 19, 2026 |
| OS | Windows 10 |
| Runtime | Node.js 18+ (`engines.node` ≥ 18) |
| Frontend | `http://localhost:5173/` (Vite; Cursor IDE embedded Chrome / CDP) |
| API | `http://localhost:3001` and `http://127.0.0.1:3001` |
| Browser | Cursor IDE browser (Chrome DevTools Protocol). Visible focus should be rechecked in desktop Chrome or Edge. |
| Config | `.env.example` placeholders only: `PORT`, `HOST`, `CORS_ORIGIN`, `NODE_ENV`. No `.env` secrets file was present. |

## Feature-Testing Checklist

Results below use only completed cells, API logs, and the accessibility review. Blank checklist rows are not marked Pass.

| Feature | Result | Evidence (this pass) |
| --- | --- | --- |
| Guest | Pass (executed paths) | Limitations card (1.12). Hours and beer visible on Guest UI. Wine/ID copy. Validation `?`. Offline and backend-down connect copy. |
| Staff | Partial | Wine turn listed as Restricted-sale escalation (14.5). Failed offline EBT turn listed under review (11.5). Full Staff dashboard rows 2.1–2.6 not filled. |
| Manager | Code / audit only | Demo PIN `1234` remains `DEMO_MANAGER_PIN` in the client. Lockout/delay exist in `ManagerPage.jsx`. Checklist 4.x Actual result cells were not filled. |
| Chat | Pass (executed) | Hours, ATM, EBT, beer/ID, wine. Error bubble and **Try that question again** after connect failure. |
| Restricted | Pass | UI wine and `POST /api/ask` beer/ID: no sale approval; employee must verify ID. |
| Fallback | Pass (copy) | Existing wifi-password turn still showed the verified-answer-not-found employee fallback. |
| Feedback | Not executed | Helpful / Not Helpful checklist rows were not completed this pass. |
| Persistence | Code only | `storage.js` ignores bad JSON and allow-lists roles. Rows 6.1–6.12 not filled. Unlock spoof remains. |
| Health | Pass | `GET /api/health` HTTP 200: `status: "ok"`, `service: "moonguide-ai"` (`verification-output/health.json.txt`). |

## Screen Sizes and Input Types

Formal responsive rows 10.1–10.10 were **not** completed. The sizes below were the planned classroom set; they are not claimed as executed viewport passes.

| Planned size | Role | Result this pass |
| --- | --- | --- |
| 375 × 667 | Phone | Not executed (section 10 blank). CSS stacks below 860px; chips/buttons measured 44px tall (14.9). |
| 768 × 1024 | Tablet | Not executed. |
| 1440 × 900 | Desktop | Not executed as a named viewport. Guest was used in the IDE embedded browser at its default capture size. |

**Inputs used:** mouse clicks on Guest/Staff/Manager and suggested chips; typed form (`?` and store questions); chip questions (ATM, EBT). Keyboard: DOM tab order inspected (14.3); synthetic Tab/Arrow did not move focus. No physical touch device. No NVDA/JAWS/VoiceOver.

**Screenshots documented** in `test-screenshots/`: `offline-guest-error.png`, `backend-down-first-500.png`, `backend-down-connect.png`, `api-health.png`, `guest-ui-hours.png`, `guest-ui-beer.png` (TESTING_SECURITY_REPORT.md; verification-output/SUMMARY.txt).

## Bugs Found and Fixed

| Issue | Evidence / impact | Resolution | Verification |
| --- | --- | --- | --- |
| Empty Vite-proxy HTTP 500 when Express stopped | ATM ask while Vite stayed on 5173 first showed the generic 5xx “temporary problem” sentence, hiding that the API was down (11.1). | Empty 5xx bodies map to connect copy in `client/src/services/api.js`. | Retry showed “MoonGuide AI cannot connect to the service right now. Please check your connection and try again.” `backend-down-first-500.png`, `backend-down-connect.png`. Health 200 after restart. 11.2/11.4 not rerun. |
| Empty, short, or punctuation-only questions | `?` is not a look-up; matcher should not treat it as a store question. | Shared `validateQuestion`: trim, min 2 characters, must include a letter or number. | Sent `?`: “at least 2 characters”; `aria-invalid="true"`; `#question-error` (14.4). |
| Duplicate submit while busy | Second overlapping `/api/ask` could confuse chat state. | `sendingRef` + “wait for the current answer” in `ChatPanel.jsx`. | Guard is in source. Rapid-Enter row 9.6 was not executed. |
| Malformed `localStorage` | Corrupt `moonguide.chat` / feedback / role could crash load. | JSON parse fallback, message/feedback sanitize, role allow-list. | Code review of `storage.js`. Rows 6.6–6.8 not executed. |
| Gold-only focus outline | ~2.42:1 on white fails WCAG 2.2 Success Criterion 1.4.11 (World Wide Web Consortium [W3C], 2023). | Navy 3px outline + gold halo. | Contrast tokens Pass (14.1). Visible ring **not** confirmed in the IDE browser (14.2 N/A). |

## Security Vulnerabilities Identified and Resolved

The demo PIN was **not** moved to a server environment. `DEMO_MANAGER_PIN` is still `"1234"` in `client/src/data/constants.js`.

| Issue | Evidence / impact | Resolution | Verification |
| --- | --- | --- | --- |
| CORS allow-all (`CORS_ORIGIN \|\| true`) | Any site could call a reachable API (OWASP Foundation, 2021). | Local Vite/Express origins in development; production same-origin unless `CORS_ORIGIN` is set; `*` is opt-in. | `verify-security.mjs`: local allow, `https://evil.example` not reflected. |
| Missing security headers | MIME sniffing, framing, open script targets. | `nosniff`, `X-Frame-Options: DENY`, CSP `default-src 'self'`, no `X-Powered-By`. Vite **dev** server still lacks these headers. | Header checks on `GET /api/health` in the security script. |
| Unbounded `POST /api/ask` | Unauthenticated flood risk. | 25 requests / 60 s per socket; HTTP 429 + `Retry-After`. In-memory only. | Script: `ask-rate-limit` PASS. |
| Weak demo PIN (kept in client) | Public classroom PIN; not production auth. | Digits only; delay; 5 failures ≈ 20 s lockout; PIN not logged. Check stays in the browser. | Code + audit manual notes. Refresh clears lockout. |
| Verbose error logs | Stacks or PIN/token text in logs. | `summarizeError` redacts `pin`, `password`, `token`, and related labels. | Code review; Express log showed listen/restarts only (14.7). |
| `.env` in git | Accidental secrets. | `.env` gitignored. `.env.example` has placeholders only. | Secrets search: no AWS/paid AI keys; no `.env` file. |
| Large JSON bodies | Memory pressure. | `express.json({ limit: "32kb" })` → HTTP 413. | Script + `verification-output/api-413-curl.txt`. |
| Vite `server.fs.allow: [".."]` | Dev server could read the parent tree. | Allow client dir + `../shared` only. | Code review of `client/vite.config.js`. |

## Accessibility Features Added

Semantic `header` / `nav` / `main` / `footer`; conversation as an ordered list in `role="log"`. Associated question and PIN labels; skip link; roving `tabIndex` on roles. Accessible names for Send, Clear conversation history, and the store phone. Errors stay in the DOM for `aria-describedby` and use `role="alert"` when text is present. Contrast tokens met WCAG 2.2 AA text ratios (muted 8.91:1; alert 9.08:1; navy-on-gold 5.50:1; W3C, 2023). Touch targets 44×44 px. `prefers-reduced-motion` disables animations in CSS (live off-state not observed).

## Responsible AI Safeguards

Welcome, chat, bubbles, limitations, footer, and README state answers may be incorrect. Unsupported questions ask an employee. Restricted copy forbids sale approval and says the assistant cannot replace an in-person ID check. No name, email, or payment fields; guests are told not to enter personal data. Questions and the PIN are not written to server logs. Ask JSON no longer includes matcher `sourceId`. Staff/manager copy says the dashboard does not approve sales. Bedrock, OpenSearch, and Cognito are disclosed as unimplemented.

## Final Verification Results

Only commands and reviews that were actually run:

| Check | Result |
| --- | --- |
| `npm run build --prefix client` | Exit 0. Vite 5.4.21; 58 modules (`verification-output/client-build.txt`). |
| `GET /api/health` | HTTP 200 (`verification-output/health.json.txt`). |
| `POST /api/ask` hours / beer / ID | HTTP 200; beer/ID `restricted: true`. |
| Unknown API / oversized JSON | HTTP 404; HTTP 413. |
| `npm audit` (root, server) | 0 vulnerabilities. |
| `npm audit --prefix client` | Remaining esbuild ≤ 0.24.2 via Vite 5 (`GHSA-67mh-4wv8-2f99`). `npm audit fix --force` (Vite 8) was **not** applied. Affects the Vite **dev** server, not the Express production static build. |
| `node server/scripts/verify-security.mjs` | Documented PASS: health, headers, CORS, ask, 32 kb, 429. Not an npm `test` script. |
| Unit / lint scripts | **None** in root, client, or server `package.json`. Not invented. |

## Remaining Limitations

- `moonguide.managerUnlocked` in `localStorage` still unlocks the dashboard without the PIN.
- `/api/ask`, `/api/store`, and `/api/health` are unauthenticated by design.
- Demo PIN `1234` remains a public client-side classroom value.
- No NVDA, JAWS, or VoiceOver pass.
- Focus ring was not confirmed in the IDE browser (OS focus stayed on the IDE).
- Amazon Bedrock, OpenSearch, Cognito, Guardrails, and App Runner are not implemented.
- Chat/feedback live in `localStorage` (not for real PII). No TLS on this local prototype. In-memory rate limit resets on process restart.

## References

MoonGuide AI. (2026). *README.md* [Computer software documentation]. Local educational prototype.

OWASP Foundation. (2021). *OWASP top 10:2021*. https://owasp.org/Top10/

World Wide Web Consortium. (2023). *Web content accessibility guidelines (WCAG) 2.2*. https://www.w3.org/TR/WCAG22/
