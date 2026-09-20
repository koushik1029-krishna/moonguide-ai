# MoonGuide AI — Manual Testing and Security Report

Educational prototype for **Moon’s Food Store**. Use this document for classroom and instructor manual testing.

**Do not invent results.** Complete **Actual result**, **Pass/Fail**, and **Bug or observation** only after you run each test.

| Field | How to complete |
| --- | --- |
| Actual result | What you saw or measured |
| Pass/Fail | `Pass`, `Fail`, or `N/A` if the feature does not apply on your device |
| Bug or observation | Defect, screenshot note, or leave blank if none |

## Test environment (fill in)

| Item | Value |
| --- | --- |
| Tester name | Cursor agent / Krishna (local prototype) |
| Date | 2026-09-19 |
| Browser and version | Cursor IDE browser (Chrome DevTools Protocol) |
| Device / OS | |
| Frontend URL | `http://localhost:5173/` |
| Backend URL | `http://localhost:3001` |
| Notes | Section 11 (offline and API failure) executed on this date. Other sections were not completed in this pass. Vite uses the next free port if 5173 is already in use. |

## Application inventory (from source)

This checklist is based on the current codebase. Features that do **not** exist (for example a typed search box, login accounts, or AWS Bedrock) are not listed as if they were implemented.

### Pages and views

- **Guest** — suggested questions, customer assistant chat, store information card, responsible AI limitations
- **Staff** — workspace copy, counts, escalated questions, recent questions, feedback snapshot (first 8 records)
- **Manager (locked)** — demonstration PIN form
- **Manager (unlocked)** — totals, answer categories, feedback table, conversation snapshot, lock control

### Navigation and controls

- Skip to main content
- Role buttons: Guest, Staff, Manager (arrow keys cycle roles when the nav has keyboard focus)
- Suggested-question chips (8 questions)
- Clear chat
- Send
- Try that question again (after a failed ask)
- Helpful / Not Helpful
- Store phone `tel:` link
- Try loading store details again
- Unlock dashboard / Lock dashboard

### Forms

- Ask a question (textarea + Send; Enter sends, Shift+Enter new line)
- Manager PIN (password, digits only, max 4)

### API routes

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Service health |
| POST | `/api/ask` | Grounded question answering |
| GET | `/api/store` | Approved store profile for the info card |
| GET | `/api/store/knowledge` | Knowledge catalog (id, category, title, lastUpdated, restricted) — used by API, not a guest UI |
| GET | `*` (production static) | Serves `client/dist` when that folder exists |
| Any unmatched `/api/*` | 404 JSON | Friendly not-found message |

### localStorage keys

| Key | Contents |
| --- | --- |
| `moonguide.chat` | Conversation messages |
| `moonguide.feedback` | Helpful / Not Helpful records |
| `moonguide.role` | `guest`, `staff`, or `manager` |
| `moonguide.managerUnlocked` | `"true"` / `"false"` |

### Loading, validation, and errors (summary)

- Chat: “Looking up approved store information…”, Send becomes “Sending…”, chips and composer disable while busy
- Store card: “Loading store details…”
- Manager PIN: “Checking the demonstration PIN…”
- Question: required, trim, min 2 characters, max 500, must include a letter or number
- PIN: required, digits only, exactly 4 characters, demo value `1234`
- Errors: empty question, too short, no alphanumeric, wait-for-current-answer, backend down, timeout (12s), 400/404/413/429/500 mapping, incomplete store payload, storage write failure banner, confirm before clear chat
- Error handling was strengthened: React error boundary, friendlier API/network messages (no stack traces or `ECONNREFUSED`), safer malformed-response and localStorage fallbacks, duplicate-submit guards. Do not overwrite completed Actual result / Pass/Fail cells.

---

## 1. Navigation and page testing

| ID | Feature tested | Test action | Expected result | Actual result | Pass/Fail | Bug or observation |
| --- | --- | --- | --- | --- | --- | --- |
| 1.1 | Document title | Open the app | Browser title is `MoonGuide AI \| Moon's Food Store` | | | |
| 1.2 | Brand header | View header | Shows Moon's Food Store kicker and MoonGuide AI heading | | | |
| 1.3 | Guest default | Load with empty or guest role storage | Guest view is shown (suggested questions + chat) | | | |
| 1.4 | Guest button | Click **Guest** | Guest page remains or returns; Guest is current | | | |
| 1.5 | Staff button | Click **Staff** | Staff workspace, stats, and lists appear | | | |
| 1.6 | Manager button | Click **Manager** | PIN gate appears if locked, or dashboard if previously unlocked | | | |
| 1.7 | Role persistence | Switch to Staff, refresh | Staff view is still selected | | | |
| 1.8 | Skip link | Tab from the address bar / first focus | “Skip to main content” is visible and focused | | | |
| 1.9 | Skip link target | Activate skip link | Focus moves to main content (`#main`) | | | |
| 1.10 | Footer | Scroll to footer | Educational / no Bedrock-OpenSearch disclaimer is shown | | | |
| 1.11 | Welcome message | Open Guest | Welcome assistant message explains limits and no restricted-sale approval | | | |
| 1.12 | Limitations card | View Guest side column | Lead paragraph about asking an employee / staff-manager review, plus six responsible-AI limitation bullets | Lead paragraph and six bullets were present on Guest (incorrect-answers, approved info, ID checks, no invented prices, local privacy, no Bedrock/OpenSearch/Cognito). | Pass | Copy updated in this accessibility / responsible-AI pass. |
| 1.13 | Store information | View Guest side column after load | Name, address, phone, hours, services, products match approved store data | | | |
| 1.14 | Phone link | Click `216-860-2588` | Opens a `tel:` action for 2168602588 | | | |
| 1.15 | No extra routes | Stay in the SPA | There is no separate URL router; views change by role, not by path | | | |

---

## 2. Dashboard testing

Staff and manager summaries are derived from the same in-browser chat and feedback. There is no separate analytics server.

| ID | Feature tested | Test action | Expected result | Actual result | Pass/Fail | Bug or observation |
| --- | --- | --- | --- | --- | --- | --- |
| 2.1 | Staff empty state | Open Staff with only the welcome message | Questions / review / restricted counts are 0; empty-state copy appears | | | |
| 2.2 | Staff question count | Ask two guest questions, open Staff | Customer questions = 2 | | | |
| 2.3 | Staff review count | Ask an unsupported question, open Staff | Need employee review includes that assistant reply | | | |
| 2.4 | Staff restricted count | Ask about beer or ID, open Staff | Restricted escalations increments; list shows restricted-sale escalation | | | |
| 2.5 | Staff recent questions | View Recent customer questions | Lists the guest questions in conversation order | | | |
| 2.6 | Staff feedback snapshot | Mark Helpful, open Staff | Snapshot shows Helpful: [question]; max 8 items | | | |
| 2.7 | Manager totals | Unlock dashboard after asking questions | Total questions matches user messages | | | |
| 2.8 | Helpful / Not helpful cards | Submit both ratings | Cards match feedback records | | | |
| 2.9 | Needs review card | Include unsupported or restricted answers | Responses needing review counts those assistant replies | | | |
| 2.10 | Answer categories | Ask hours then EBT | Category list includes Store Hours and EBT/SNAP with counts | | | |
| 2.11 | Categories empty | Unlock with no Q&A | “No categorized answers yet.” | | | |
| 2.12 | Conversation snapshot | View unlocked dashboard | Assistant reply count excludes the welcome message | | | |
| 2.13 | Shared data | Change ratings on Guest, reopen Manager | Dashboard numbers update without a server database | | | |

---

## 3. Form testing

| ID | Feature tested | Test action | Expected result | Actual result | Pass/Fail | Bug or observation |
| --- | --- | --- | --- | --- | --- | --- |
| 3.1 | Question label | Inspect chat form | Label “Ask a question” is associated with the textarea | | | |
| 3.2 | Placeholder | View empty textarea | Placeholder mentions hours, location, products, services, EBT/SNAP | | | |
| 3.3 | Character counter | Type text | Helper shows remaining characters (max 500) | | | |
| 3.4 | Send enabled | Type a non-empty question | Send is enabled | | | |
| 3.5 | Send disabled empty | Clear the field | Send is disabled | | | |
| 3.6 | Submit via Send | Click **Send** with a valid question | User bubble appears; loading then assistant reply | | | |
| 3.7 | Submit via Enter | Press Enter in textarea | Question submits (no extra newline-only send) | | | |
| 3.8 | Shift+Enter | Press Shift+Enter | New line in the textarea; does not submit | | | |
| 3.9 | `noValidate` | Submit empty via enabled tricks or suggested empty | Client validation message still appears; native tooltip is not the only defense | | | |
| 3.10 | Suggested chips | Click “What time does the store close?” | Same question is sent through the assistant | | | |
| 3.11 | Suggested while loading | Click a chip during “Sending…” | Chips are disabled; no second overlapping send | | | |
| 3.12 | PIN label | Open locked Manager | Label “Manager PIN” is associated with the input | | | |
| 3.13 | PIN helper | View PIN form | Helper says enter the 4-digit classroom PIN | | | |
| 3.14 | Unlock disabled | Leave PIN empty | Unlock dashboard is disabled | | | |
| 3.15 | Unlock enabled | Type `1234` | Unlock dashboard is enabled | | | |
| 3.16 | Clear chat confirm | Click **Clear chat**, then Cancel | Conversation is unchanged | | | |
| 3.17 | Clear chat confirm | Click **Clear chat**, then OK | Chat resets to welcome; feedback records remain | | | |
| 3.18 | Clear chat while loading | Start a send, try Clear chat | Control is disabled until the request finishes | | | |

---

## 4. Manager or administrative features

There is no knowledge-base editor, user-account admin, or real authentication. Manager access is a **demonstration PIN only**.

| ID | Feature tested | Test action | Expected result | Actual result | Pass/Fail | Bug or observation |
| --- | --- | --- | --- | --- | --- | --- |
| 4.1 | Demo disclaimer | Open locked Manager | Copy states PIN is educational and not for production | | | |
| 4.2 | Correct PIN | Enter `1234`, unlock | Dashboard appears after a short “Checking PIN…” state | | | |
| 4.3 | Wrong PIN | Enter `0000`, unlock | Error: PIN is not correct; use demo PIN 1234 | | | |
| 4.4 | Short PIN | Enter `12` (if submit is forced) | Validation: enter the 4-digit demonstration PIN | | | |
| 4.5 | Letters stripped | Type `12ab` | Non-digits are not kept; field stays numeric | | | |
| 4.6 | Max length | Paste a long number | Input is limited to 4 digits | | | |
| 4.7 | Lock dashboard | Click **Lock dashboard** | Returns to PIN form; PIN field is cleared | | | |
| 4.8 | Unlock persistence | Unlock, refresh, stay on Manager | Dashboard remains unlocked (`moonguide.managerUnlocked` = true) | | | |
| 4.9 | Lock persistence | Lock, refresh, open Manager | PIN gate is shown again | | | |
| 4.10 | Feedback table | After ratings exist | Table columns: Rating, Question, Category, Needs review | | | |
| 4.11 | Feedback empty | No ratings | “No feedback has been saved yet.” | | | |
| 4.12 | Screen-reader caption | Inspect table | Caption “Saved customer feedback” is present (may be visually hidden) | | | |
| 4.13 | No CRUD admin | Look for add/edit knowledge UI | None; knowledge is `server/data/knowledge.json` only | | | |
| 4.14 | PIN not sent to API | Unlock while watching Network | No PIN is posted to Express; check is client-side | | | |

---

## 5. Search, filtering, and data display

The guest UI does **not** include a search box or filter tabs. Matching happens on `POST /api/ask`. Display tests below cover grounded answers, citations, lists, and the unused-by-UI knowledge catalog.

| ID | Feature tested | Test action | Expected result | Actual result | Pass/Fail | Bug or observation |
| --- | --- | --- | --- | --- | --- | --- |
| 5.1 | Hours question | Ask “What time does the store close?” | Open Monday–Sunday 8:00 a.m. to 12:30 a.m.; category Store Hours; last updated shown | | | |
| 5.2 | Location question | Ask “Where is Moon's Food Store located?” | 14000 Detroit Avenue, Cleveland, Ohio; phone; Location category | | | |
| 5.3 | ATM | Click “Does the store have an ATM?” | Confirms ATM; Store Services | | | |
| 5.4 | EBT/SNAP | Click “Does the store accept EBT?” | EBT/SNAP guidance; employee must confirm eligibility; no payment approval | | | |
| 5.5 | Frozen food | Click “Does the store sell frozen food?” | Yes, category listed; employee must confirm a specific item | | | |
| 5.6 | Delivery | Click “Does the store provide delivery?” | Yes; assistant cannot place an order | | | |
| 5.7 | Services list | Click “What services are available?” | ATM, Ohio Lottery, Delivery, ASG | | | |
| 5.8 | Products list | Click “What products does the store sell?” | Groceries, snacks, beverages, frozen foods, beer, wine, tobacco, vape | | | |
| 5.9 | Source citation | Any supported answer | “Source category: …” and “Last updated: …” when a date exists | | | |
| 5.10 | Welcome has no citation | View welcome bubble | No Store Hours-style citation on Welcome | | | |
| 5.11 | Unsupported fallback | Ask “What is the wifi password?” | Verified-answer-not-found message; ask an employee; category Unsupported | | | |
| 5.12 | Restricted beer | Ask “Can I buy beer without an ID?” | Restricted warning; employee must verify ID; no sale approval | | | |
| 5.13 | Restricted tobacco / vape / lottery / age | Ask one question for each topic | Same escalation pattern; Restricted Product Safety (or equivalent) citation | | | |
| 5.14 | Generic “can I buy” groceries | Ask “Can I buy snacks?” | Does **not** treat as age-restricted solely because of “can I buy” | | | |
| 5.15 | Price / stock note | Ask “How much is milk?” or “Do you have ice cream in stock?” | If matched, includes that prices/inventory may change and an employee must confirm | | | |
| 5.16 | Store card fields | Compare UI to approved data | Name, address, phone, hours, services, products match | | | |
| 5.17 | Knowledge API | GET `/api/store/knowledge` | JSON list of titles/categories without full answer bodies | | | |
| 5.18 | Staff list labels | Restricted vs other review | Restricted items say Restricted-sale escalation; others Needs review | | | |
| 5.19 | Chat log label | Inspect conversation region | Accessible name “Conversation with MoonGuide AI”; `aria-busy` while loading | | | |

---

## 6. LocalStorage or persistence testing

| ID | Feature tested | Test action | Expected result | Actual result | Pass/Fail | Bug or observation |
| --- | --- | --- | --- | --- | --- | --- |
| 6.1 | Chat persist | Ask a question, refresh | User and assistant messages remain | | | |
| 6.2 | Welcome after clear | Clear chat, refresh | Only welcome (or equivalent reset) remains | | | |
| 6.3 | Feedback persist | Mark Helpful, refresh | Button stays pressed; manager table still has the row | | | |
| 6.4 | Replace rating | Mark Helpful then Not Helpful, refresh | One record per message; latest rating kept | | | |
| 6.5 | Role persist | Set Manager, refresh | Role is still Manager | | | |
| 6.6 | Invalid role | In DevTools set `moonguide.role` to `admin`, refresh | Falls back to Guest | | | |
| 6.7 | Corrupt chat JSON | Set `moonguide.chat` to `{not json`, refresh | App still loads; welcome (or safe fallback) shown | | | |
| 6.8 | Corrupt feedback | Set `moonguide.feedback` to `"x"`, refresh | Empty or ignored invalid records; no crash | | | |
| 6.9 | Feedback remains after clear chat | Clear chat after a rating | Manager/Staff still show the feedback record | | | |
| 6.10 | Unlock flag | Unlock, inspect storage | `moonguide.managerUnlocked` is `"true"` | | | |
| 6.11 | Storage banner | Block localStorage (privacy mode / quota mock) if possible | User-facing message that chat/feedback may not persist | | | |
| 6.12 | First load | New browser profile | Does not wipe data incorrectly on first paint | | | |

---

## 7. API and backend testing

Use the browser Network panel or a REST client. Base URL: backend port (default 3001) or the Vite `/api` proxy.

| ID | Feature tested | Test action | Expected result | Actual result | Pass/Fail | Bug or observation |
| --- | --- | --- | --- | --- | --- | --- |
| 7.1 | Health | GET `/api/health` | 200 `{ status: "ok", service: "moonguide-ai", time: ... }` | | | |
| 7.2 | Store profile | GET `/api/store` | 200 with Moon's Food Store approved fields | | | |
| 7.3 | Ask success | POST `/api/ask` `{ "question": "What time does the store close?" }` | 200 with `answer`, `sourceCategory`, `lastUpdated`, `supported` | | | |
| 7.4 | Ask empty | POST `{ "question": "   " }` | 400 with enter-a-question message | | | |
| 7.5 | Ask too short | POST `{ "question": "A" }` | 400 min-length message | | | |
| 7.6 | Ask punctuation only | POST `{ "question": "???" }` | 400 include letters or numbers | | | |
| 7.7 | Ask missing field | POST `{}` | 400 user-facing validation message (not a stack trace) | | | |
| 7.8 | Ask non-string | POST `{ "question": 123 }` | 400 type a question using letters or numbers | | | |
| 7.9 | Ask too long | POST 501+ character string | 400 keep under 500 characters | | | |
| 7.10 | Invalid JSON body | POST raw `{question:` | 400 could not be read | | | |
| 7.11 | Oversized JSON | POST body larger than 32kb | 413 too large | | | |
| 7.12 | Unknown API | GET `/api/does-not-exist` | 404 friendly not-found JSON | | | |
| 7.13 | Knowledge catalog | GET `/api/store/knowledge` | 200 `{ knowledge: [ { id, category, title, lastUpdated, restricted } ] }` | | | |
| 7.14 | Restricted API | POST beer/ID question | `restricted: true`, `needsReview: true`, no approval language | | | |
| 7.15 | Unsupported API | POST wifi-password question | `supported: false`, fallback answer text | | | |
| 7.16 | CORS | From the Vite origin, call `/api/health` | Request succeeds with configured CORS (`CORS_ORIGIN` or permissive default) | | | |
| 7.17 | Production static | `npm start` (build + Express) | UI is served from the API host (port 3001) when `client/dist` exists | | | |

---

## 8. Valid-input testing

| ID | Feature tested | Test action | Expected result | Actual result | Pass/Fail | Bug or observation |
| --- | --- | --- | --- | --- | --- | --- |
| 8.1 | Normal English question | “Does the store have an ATM?” | Grounded yes + citation | | | |
| 8.2 | Extra spaces | `  What time does the store close?  ` | Trimmed; still matches hours | | | |
| 8.3 | Mixed case | “WHERE IS THE STORE LOCATED?” | Location answer | | | |
| 8.4 | Two-character token | Ask `AS` only if it is a real query; better: `EBT` | Valid length; EBT guidance if matched | | | |
| 8.5 | Exactly 500 characters | Paste 500 alphanumeric characters that include a known keyword like `hours` | Accepted by validation; matcher may still be unsupported | | | |
| 8.6 | Demo PIN | `1234` | Unlocks manager dashboard | | | |
| 8.7 | Helpful | Click Helpful on a normal answer | `aria-pressed` true on Helpful | | | |
| 8.8 | Not Helpful | Click Not Helpful | `aria-pressed` true on Not Helpful | | | |
| 8.9 | Retry after success | Send a second valid question | Both Q&A pairs appear in order | | | |

---

## 9. Invalid and unusual-input testing

| ID | Feature tested | Test action | Expected result | Actual result | Pass/Fail | Bug or observation |
| --- | --- | --- | --- | --- | --- | --- |
| 9.1 | Empty send | Attempt send with blank field | Send disabled and/or “Please enter a question before sending.” | | | |
| 9.2 | Whitespace only | Spaces/tabs only | Empty-question message | | | |
| 9.3 | One character | `?` or `x` if one letter | Min length or alphanumeric rule message | | | |
| 9.4 | Emoji / symbols only | `!!! 😊` | Include letters or numbers | | | |
| 9.5 | 501st character | Type past 500 | Textarea `maxLength` blocks extra characters | | | |
| 9.6 | Double submit | Rapid Enter twice | Second send blocked or “wait for the current answer” | | | |
| 9.7 | HTML in question | `<script>alert(1)</script> hours` | Rendered as text, not executed; answer still safe | | | |
| 9.8 | Very long token | One 500-char word | No crash; validation or unsupported fallback | | | |
| 9.9 | Wrong PIN `9999` | Submit | Incorrect PIN message | | | |
| 9.10 | PIN with letters | Type `12ab` | Letters stripped; cannot submit `12ab` | | | |
| 9.11 | Empty PIN submit | If Unlock becomes clickable | “Enter the demonstration manager PIN.” | | | |
| 9.12 | SQL-like string | `'; DROP TABLE--` | Treated as unsupported or unmatched text; no database | | | |
| 9.13 | Null-like text | Type `null` or `undefined` | Ordinary question handling, not a crash | | | |
| 9.14 | Incomplete store payload | Mock `/api/store` without `name` | Incomplete details error + retry button | | | |

---

## 10. Responsive testing

Preserve the blue, white, and gold theme while checking layout.

| ID | Feature tested | Test action | Expected result | Actual result | Pass/Fail | Bug or observation |
| --- | --- | --- | --- | --- | --- | --- |
| 10.1 | Desktop ≥ 860px | Wide viewport | Two-column guest layout (chat + store/limitations) | | | |
| 10.2 | Tablet / mobile &lt; 860px | Narrow viewport | Single column; composer stacks Send under textarea | | | |
| 10.3 | Header wrap | Narrow width | Brand and role buttons wrap without overflow | | | |
| 10.4 | Chat bubbles | Mobile | User/assistant bubbles use full width (no large side margins) | | | |
| 10.5 | Suggested chips | Mobile | Chips wrap; remain tappable | | | |
| 10.6 | Manager table | Narrow width | Horizontal scroll on table wrap, not page blowout | | | |
| 10.7 | Tap targets | Touch device | Buttons remain usable (about 44px min height in CSS) | | | |
| 10.8 | Viewport meta | View source | `width=device-width, initial-scale=1` | | | |
| 10.9 | Theme | All sizes | Navy/blue, white, gold still used; text remains readable | | | |
| 10.10 | Zoom 200% | Browser zoom | Content remains usable; no clipped primary actions | | | |

---

## 11. Offline and network-error testing

| ID | Feature tested | Test action | Expected result | Actual result | Pass/Fail | Bug or observation |
| --- | --- | --- | --- | --- | --- | --- |
| 11.1 | Backend stopped | Stop Express, send a question | Cannot-reach-server message; error bubble; **Try that question again** | Express on 3001 was stopped; Vite stayed on 5173. The first ATM question received an empty Vite-proxy HTTP 500 and initially showed the temporary-problem 5xx sentence. After empty 5xx responses were mapped to the connect copy, retry showed “MoonGuide AI cannot connect to the service right now. Please check your connection and try again.” Error bubble and **Try that question again** appeared. No crash. Express was restarted; `GET /api/health` returned 200. | Pass | Connect copy is in `client/src/services/api.js` (fetch/offline, HTTP 502/503/504, and empty 5xx from the Vite proxy). First empty 500: `test-screenshots/backend-down-first-500.png`. After mapping: `test-screenshots/backend-down-connect.png`. |
| 11.2 | Retry after restore | Start backend, click retry | Question succeeds | | | |
| 11.3 | Store card failure | Stop backend, reload Guest | Store error + **Try loading store details again** | Remounting Guest while offline showed the connect message plus **Try loading store details again**. Retry while still offline stayed on that error. After Express was stopped and empty 5xx mapping was in place, the store card showed the same connect message. No crash. | Pass | Store-card retry was not retested after the backend was restored (see 11.4). Offline store card: `test-screenshots/offline-guest-error.png`. |
| 11.4 | Store retry | Restore backend, click retry | Store details appear | | | |
| 11.5 | Browser offline | DevTools Offline, send question | Network error message, not a blank screen | CDP `Network.emulateNetworkConditions` offline. Sent “Does the store accept EBT?” Loading appeared, then the connect message in chat (System) and as an alert. No crash. **Try that question again** was shown. Staff still opened and listed that failed turn under review. | Pass | Screenshot: `test-screenshots/offline-guest-error.png`. |
| 11.6 | Request timeout | Delay `/api/ask` beyond 12 seconds | Took-too-long message | | | |
| 11.7 | HTTP 500 | Mock 500 on `/api/ask` | Temporary-problem / try again or employee message | | | |
| 11.8 | HTTP 404 | Mock 404 | Could not find that information message | | | |
| 11.9 | HTTP 413 | Mock 413 | Too large / shorten question | | | |
| 11.10 | Non-JSON 200 | Mock HTML body | Unexpected response message | | | |
| 11.11 | Loading UI | Throttle network | Spinner + “Looking up approved store information…”; textarea disabled | | | |
| 11.12 | Unexpected empty answer | Mock `{ }` 200 | Could not find a complete answer | | | |

### Execution record — Step 5 (offline and API failure)

Completed 2026-09-19 on Krishna’s local prototype (Cursor agent). Frontend `http://localhost:5173/`. Backend `http://localhost:3001`.

**Client copy** (`client/src/services/api.js`)

- Previous fetch/offline wording: “MoonGuide AI cannot reach the server right now. Please confirm the backend is running, then try again.”
- Current connect wording (used for fetch/offline failures, HTTP 502/503/504, and empty 5xx from the Vite proxy): “MoonGuide AI cannot connect to the service right now. Please check your connection and try again.”
- JSON 500 from a running API still uses: “The assistant had a temporary problem. Please try again or speak with a store employee.”
- Timeouts still use the longer timeout sentence.

**Offline** (CDP `Network.emulateNetworkConditions` offline)

- Guest ask “Does the store accept EBT?” showed loading, then the connect message in chat (System) and as an alert. No crash. **Try that question again** was shown.
- Staff still opened and listed that failed turn under review.
- Remounting Guest while offline: the store card showed the same connect message plus **Try loading store details again**. Retry stayed on that error. No crash.
- Result: **Pass** (11.5, and store-card failure while unreachable in 11.3).

**Online restored, Express on 3001 stopped, Vite stayed up**

- First ATM question: Vite proxy HTTP 500 with an empty body. Initially showed the temporary-problem 5xx message. No crash.
- After empty 5xx responses were mapped to the connect copy, retry showed the connect message. Store card used the same connect message. No crash.
- Express was restarted; `GET /api/health` returned 200.
- Result: **Pass** (11.1). Question retry after restore (11.2) and store-card retry after restore (11.4) were not executed.

**Screenshots** (project-relative)

- `test-screenshots/offline-guest-error.png`
- `test-screenshots/backend-down-first-500.png`
- `test-screenshots/backend-down-connect.png`

Rows 11.6–11.12 were not executed in this pass. A mocked JSON 500 from a running API was not sent; the temporary-problem sentence above is the current client mapping, not a completed 11.7 result.

---

## 12. Keyboard and accessibility testing

| ID | Feature tested | Test action | Expected result | Actual result | Pass/Fail | Bug or observation |
| --- | --- | --- | --- | --- | --- | --- |
| 12.1 | Tab order | Tab through Guest | Skip link → roles → chips → Clear chat → textarea → Send → phone link | | | |
| 12.2 | Focus visible | Tab to each control | Gold (or equivalent) focus outline is visible | | | |
| 12.3 | Role arrows | Focus role nav, press Arrow Right/Left | Role cycles Guest → Staff → Manager | | | |
| 12.4 | `aria-current` | Select Staff | Staff control indicates current page | | | |
| 12.5 | Chip disable | During send | `disabled` / `aria-disabled` on suggested questions | | | |
| 12.6 | Send aria-label | Inspect Send | “Send question” or “Sending question” | | | |
| 12.7 | Question errors | Trigger validation | `aria-invalid` true; error linked via `aria-describedby` | | | |
| 12.8 | PIN errors | Wrong PIN | `aria-invalid` and `pin-error` described | | | |
| 12.9 | Live region | Send a question | Chat log `aria-live="polite"`; loading `role="status"` | | | |
| 12.10 | Restricted warning | Restricted answer | Warning `role="status"` that an employee must complete the request | | | |
| 12.11 | Feedback group | Inspect buttons | Group name “Was this answer helpful?”; `aria-pressed` | | | |
| 12.12 | Welcome no feedback | Inspect welcome | Helpful buttons are not shown | | | |
| 12.13 | Headings | Screen reader heading list | Logical h1 then section h2s | | | |
| 12.14 | `lang` | Inspect `<html>` | `lang="en"` | | | |
| 12.15 | Contrast | Check body text on white/navy | Text remains readable against blue/white/gold | | | |
| 12.16 | Reduced motion | Enable OS reduced motion | Spinner animation is reduced or stopped (`prefers-reduced-motion`) | | | |
| 12.17 | Images | Scan UI | No unlabeled informational images (brand mark is `aria-hidden`) | | | |
| 12.18 | Keyboard PIN | Tab to PIN and Unlock, Enter | Form submits | | | |
| 12.19 | Dialog | Clear chat | Native `confirm` is keyboard operable | | | |
| 12.20 | Main landmark | Inspect | Single `main`; header `banner`; footer `contentinfo`; roles `navigation` | | | |

---

## 13. Security testing

This is an **educational prototype**. Several “failures” against production security may be **accepted limitations** if they match the README (demo PIN, open APIs, browser-only storage). Record that in **Bug or observation**.

The defensive controls that are actually in the code, and the remaining prototype limits, are documented in `SECURITY_AUDIT.md`. Do not treat AWS Bedrock, Cognito, or similar services as implemented.

| ID | Feature tested | Test action | Expected result | Actual result | Pass/Fail | Bug or observation |
| --- | --- | --- | --- | --- | --- | --- |
| 13.1 | Restricted sale | Ask to buy beer/wine/tobacco/vape/lottery | No final approval; employee must verify ID | | | |
| 13.2 | ID validity | Ask “Is this ID valid?” | Escalation; assistant does not decide ID validity | | | |
| 13.3 | Legal age | Ask “Am I old enough to buy wine?” | Escalation; no eligibility decision | | | |
| 13.4 | XSS in chat | Send HTML/script in a question | Displayed as text; no script execution | | | |
| 13.5 | XSS in feedback table | Rate an answer whose question contains HTML | Table cells show text, not HTML | | | |
| 13.6 | Open API ask | POST `/api/ask` with no app cookie | Request still works (no auth by design); note as prototype limit | | | |
| 13.7 | Open store/knowledge | GET `/api/store` and `/api/store/knowledge` unauthenticated | Public sample data only; no secrets | | | |
| 13.8 | Demo PIN spoof | In DevTools set `moonguide.managerUnlocked` to `true` | Dashboard unlocks without PIN — expected prototype weakness; must not be used in production | | | |
| 13.9 | PIN not in source as live secret | Confirm README/UI say demo `1234` | PIN is documented demo only, not a production credential | | | |
| 13.10 | No secrets in repo | Search `.env` / API keys | No paid AI keys or AWS credentials required | | | |
| 13.11 | localStorage sensitivity | Inspect stored chat | Contains questions/answers, not payment card data; still not for real PII in class demos | | | |
| 13.12 | JSON bomb | Oversized POST | 413 or rejection; server stays up | | | |
| 13.13 | Prototype claims | Read footer and limitations | Does **not** claim Bedrock, OpenSearch, Cognito, or App Runner are live | | | |
| 13.14 | CORS default | From a non-local origin, or inspect `Access-Control-Allow-Origin` | Development allows local Vite/Express origins only. Production is same-origin unless `CORS_ORIGIN` is set. `CORS_ORIGIN=*` is an explicit opt-in, not the default. | | | |
| 13.15 | Error leakage | Force 500 | JSON message is user-facing; no stack trace in the browser | | | |
| 13.16 | Static path | If production mode, request `/api/ask` vs unknown page | API not overwritten by `index.html` for `/api/*` | | | |
| 13.17 | Autocomplete PIN | Inspect PIN input | `autocomplete="off"` | | | |
| 13.18 | Password type | Inspect PIN | `type="password"` so shoulder-surfing is slightly reduced (still a demo PIN) | | | |
| 13.19 | No payment / order | Ask to place an order or pay | Does not process payment or place an autonomous order | | | |
| 13.20 | Invented policy | Ask for a return policy not in knowledge | Fallback or only approved text; no invented legal advice | | | |
| 13.21 | Ask rate limit | POST `/api/ask` more than 25 times in 60 seconds from one client | HTTP 429 with a wait-and-try-again message; `Retry-After` header present | | | |
| 13.22 | Security headers | GET `/api/health` | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, CSP `default-src 'self'`, no `X-Powered-By` | | | |
| 13.23 | PIN lockout | Enter 5 wrong PINs | Form delays, then locks about 20 seconds with a demonstration-only message; demo PIN `1234` still works after lockout | | | |
| 13.24 | JSON size limit | POST `/api/ask` with a body larger than 32kb | 413; server stays up | | | |

---

## 14. Accessibility and responsible-AI follow-up (2026-09-19)

Completed on Krishna’s local prototype in the Cursor IDE browser and with `POST /api/ask` against `http://127.0.0.1:3001`. Frontend `http://localhost:5173/`. Details and contrast numbers are in `RESPONSIBLE_AI_ACCESSIBILITY.md`. Do not treat unchecked rows as passing.

| ID | Feature tested | Test action | Expected result | Actual result | Pass/Fail | Bug or observation |
| --- | --- | --- | --- | --- | --- | --- |
| 14.1 | Contrast tokens | Measure muted, alert, footer, navy/blue/gold text | WCAG AA (4.5:1 text, 3:1 UI) | Muted/helper 8.91:1; citation/disclaimer 8.75:1; alert 9.08:1; footer gold-soft on navy 10.78:1; navy on gold 5.50:1 | Pass | Gold-only outline on white is ~2.42:1; CSS now uses navy outline + gold halo. |
| 14.2 | Focus ring | Tab to textarea, chips, Send, skip link | Navy/gold ring visible | CSS rule is loaded. After clicking the textarea, this embedded browser reported `:focus` false and a screenshot did not show the ring. | N/A | Re-check in a normal Chrome/Edge window. OS focus was on the IDE. |
| 14.3 | Tab order | Inspect tabbable controls on Guest | Skip → current role → chips → Clear chat → composer → phone | DOM order matched that path. Only Guest was `tabIndex=0`. Staff/Manager were `-1`. | Pass | Synthetic Tab did not move focus here. |
| 14.4 | Validation alert | Send `?` | Helpful message; `aria-invalid`; error id present | Alert: enter at least 2 characters. `aria-invalid="true"`. `#question-error` role=alert. | Pass | |
| 14.5 | Restricted ID copy | Ask to buy wine/beer without ID | No sale approval; legally required ID check must be in person | UI wine question and API beer/ID answer both deny sale approval and say the assistant cannot replace a legally required ID check. | Pass | Staff listed the wine turn as Restricted-sale escalation. |
| 14.6 | Incorrect-answer disclosure | Read welcome, chat card, bubbles, footer, limitations | States answers may be incorrect / not guaranteed facts | All of those surfaces showed the disclosure. | Pass | `loadChat()` now replaces the stored welcome bubble with the current welcome copy. |
| 14.7 | Privacy / no extra PII | Inspect forms and API | No name/email fields; PIN/questions not logged | Guest form is question-only. Express log showed listen/restarts only, no question or PIN text. Ask JSON had no `sourceId`. | Pass | Chat still saved in localStorage (accepted demo limit). |
| 14.8 | Reduced motion CSS | Inspect stylesheet | `prefers-reduced-motion` disables animation | Rule present in loaded CSS. `matchMedia` was false on this machine. | N/A | Live spinner-off behavior not observed. |
| 14.9 | Touch target size | Measure primary buttons | About 44px min height | Guest/Staff/Manager/chips measured 44px tall. | Pass | No physical touch device. |
| 14.10 | AWS disclaimer | Read footer and limitations | Does not claim Bedrock, OpenSearch, or Cognito are live | Footer and last limitation bullet state those services are not implemented. | Pass | |

---

## Suggested manual test sequence

1. Guest happy path: suggested hours question, citation, Helpful, refresh.
2. Unsupported and restricted questions; confirm Staff lists.
3. Manager PIN fail then `1234`; confirm dashboard counts; lock/unlock; refresh.
4. Validation and network failures.
5. Keyboard-only pass and a narrow viewport pass.
6. Security spots 13.1–13.5 and 13.13.

## Sign-off (after testing)

| Item | Tester | Date | Overall result |
| --- | --- | --- | --- |
| Functional / UX | | | |
| Persistence | | | |
| Accessibility | | | |
| Security / responsible AI | | | |
