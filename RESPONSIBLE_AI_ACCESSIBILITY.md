# MoonGuide AI — Responsible AI and Accessibility Review

**Date:** 2026-09-19  
**App:** Local educational prototype at `C:\Users\koush\Music\MoonGuide-AI-Local`  
**URLs checked:** Guest UI `http://localhost:5173/`, API `http://127.0.0.1:3001`  
**Not implemented:** Amazon Bedrock, OpenSearch, Cognito, Guardrails, App Runner, or other enterprise AWS services.

This review preserves Workshop 1 behavior: guest / staff / manager roles, demo PIN `1234`, suggested questions, knowledge-grounded answers, restricted-sale escalation, Helpful / Not Helpful feedback, `localStorage` persistence, and the blue / white / gold theme. Security headers, CORS, rate limiting, and the React error boundary were left in place. The connect message remains *“MoonGuide AI cannot connect to the service right now. Please check your connection and try again.”*

---

## What changed

### Accessibility

| Area | Change |
| --- | --- |
| Semantic HTML | Conversation turns are an ordered list of articles inside `role="log"`. Landmarks remain `header`, `nav`, `main`, `footer`. |
| Labels and instructions | Question and PIN fields keep associated labels. Helper text now says how to send, not to enter personal data, and that answers may be wrong. Suggested-question chips note that they do not collect a name. |
| Keyboard | Role nav uses roving `tabIndex` (current role only). Arrow, Home, and End move between Guest, Staff, and Manager and move focus with the selection. |
| Focus indicators | Gold-only outline on white is about 2.4:1 (fails WCAG 1.4.11). CSS now uses a 3px navy outline plus a gold halo. Role buttons keep a white outline on the navy header. |
| Accessible names | Clear chat is named “Clear conversation history”. Send stays “Send question” / “Sending question”. Phone link is “Call Moon's Food Store at 216-860-2588”. Brand mark stays `aria-hidden`. |
| ARIA | Form errors stay in the DOM (`reserve`) so `aria-describedby` always points at a real id. Errors use `role="alert"` only when text is present. Restricted replies keep `role="status"`. |
| Contrast | `--muted` `#3e4a61` and `--alert` `#8a1f2b` already meet WCAG AA on white, so they were not darkened further. Header kicker gold-soft is scoped to the navy header; the error-boundary kicker uses blue on white. |
| Validation | Empty-question copy mentions suggested questions. One-character input still explains the 2-character minimum. Invalid textarea sets `aria-invalid="true"`. |
| Status messages | Loading remains `role="status"`. Chat log stays `aria-live="polite"`. Validation errors are alerts. |
| Touch targets | Buttons keep a 44px minimum height and now also a 44px minimum width. |
| Reduced motion | `prefers-reduced-motion: reduce` now disables animations and transitions globally, not only the spinner. |
| Skip link | Hidden with `translateY` instead of `left: -999px` so it does not create sideways overflow. |

### Responsible AI

| Area | Change |
| --- | --- |
| May be incorrect | Welcome text, chat disclaimer, each assistant bubble, limitations list, footer, page `meta` description, and README state that responses may be incomplete or incorrect and are not guaranteed facts. Saved welcome bubbles are refreshed from the current welcome copy on load. |
| Safe fallback | Unsupported copy is unchanged: ask a store employee when no approved answer exists. |
| Privacy | No new name, email, or payment fields. Question textarea uses `autocomplete="off"`. Guests are told not to enter personal data. PIN help says the PIN stays in the browser and is not sent to the API. |
| No extra logging | `POST /api/ask` still does not log the question. Express startup logs do not print questions or the PIN. Error summaries still redact `pin` / secret labels. |
| Hidden internals | Ask responses no longer include matcher `sourceId`. Public fields only: answer, extraNote, category, dates, and flags. |
| Human review | Guest limitations card tells people to speak with an employee and that staff/managers can review questions. Staff and manager copy say the dashboard does not approve sales. |
| ID verification | Restricted API warning, knowledge safety entry, on-screen warning, staff copy, and footer say the assistant cannot replace a legally required identification check. Employees must verify ID in person. |

---

## How each improvement was verified

Checks used the Cursor IDE browser on `http://localhost:5173/` plus `GET /api/health` and `POST /api/ask` against `http://127.0.0.1:3001`. Computed contrast used live `getComputedStyle` colors. Do **not** treat unchecked items as passing.

| Check | Result | How verified |
| --- | --- | --- |
| Contrast (muted / helper / citation / disclaimer on white or cream) | **8.75–8.91:1**, WCAG AA | CDP contrast of computed `rgb(62, 74, 97)` |
| Contrast (alert `#8a1f2b` on white) | **9.08:1**, AA | Token calculation from computed CSS variables |
| Contrast (footer gold-soft on navy) | **10.78:1**, AA | Computed footer color vs background |
| Contrast (navy / blue / white / gold pairs used for text) | **5.50:1 to 15.33:1**, AA | Token calculation; navy-on-gold 5.50:1 |
| Gold-only outline on white | **~2.42:1**, would fail 1.4.11 | Replaced in CSS with navy outline (navy-on-white **13.31:1**) |
| Visible focus ring in this embedded browser | **Not confirmed visually** | CSS rule is loaded. After clicking the textarea, CDP reported `matches(':focus') === false` because the IDE window had OS focus. A screenshot of the composer did not show the navy/gold ring. Confirm in a normal Chrome/Edge window with Tab. |
| Tab order | **Logical** | DOM order: Skip → current role (Guest) → suggested chips → Clear chat → feedback → textarea → phone. Staff/Manager correctly `tabIndex="-1"` when Guest is current. Disabled Send is omitted. |
| Keyboard role switching | **Partial** | Clicking Guest / Staff / Manager updates `aria-current` and the view. Arrow-key cycling was not confirmed because a synthetic Tab/Arrow event did not move focus in this browser. |
| Labels / names | **Pass** | Snapshot: “Ask a question” textbox, “Send question”, “Clear conversation history”, phone name includes the store and number, `html lang="en"` |
| Validation status | **Pass** | Sent `?`. Textarea became `aria-invalid="true"`. Alert: “Please enter at least 2 characters so MoonGuide AI can look up an answer.” `#question-error` stayed in the DOM. |
| Restricted / ID copy | **Pass** | UI question “Can I buy wine without an ID?” and API `POST /api/ask` for beer/ID both say the assistant cannot replace a legally required ID check. Staff listed the wine turn as Restricted-sale escalation. |
| Unsupported fallback | **Pass** | Existing wifi-password turn still shows the verified-answer-not-found employee fallback. |
| Connect copy | **Unchanged** | Older System bubbles still show the required connect sentence. Copy in `client/src/services/api.js` was not edited. |
| API internals | **Pass** | Beer/ID JSON keys: `question`, `answer`, `extraNote`, `sourceCategory`, `lastUpdated`, `needsReview`, `restricted`, `supported`, `generatedAt`. No `sourceId`. |
| Server logging | **Pass for this session** | Express terminal showed listen/restart lines only. No question text or PIN in that log. |
| Touch size | **Pass in CSS/layout** | Measured Guest, Staff, Manager, and chip heights **44px**. Real-phone tap testing was not done. |
| Reduced motion | **CSS present** | Loaded stylesheet includes the `prefers-reduced-motion: reduce` rule. This machine’s media query was `false`, so animation-off behavior was not observed live. |
| Screen reader (NVDA/JAWS/VoiceOver) | **Not run** | Accessibility tree was inspected; a full AT pass was not. |
| AWS services | **Not present** | Footer and limitations still say Bedrock, OpenSearch, and Cognito are not implemented. |

---

## Remaining limits

- Chat and feedback still live in `localStorage`. That is appropriate for a classroom demo, not for real personal data.
- Manager PIN `1234` remains a public demonstration value, checked in the browser.
- Ask / store / health APIs remain unauthenticated by design.
- Visible keyboard focus should be re-checked in a regular desktop browser, because this embedded browser did not apply `:focus` while the IDE had OS focus.

Classroom follow-up cases are in `TESTING_SECURITY_REPORT.md` section 14.
