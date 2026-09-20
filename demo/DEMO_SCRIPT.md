# MoonGuide AI — 3–5 minute demo script

**Krishna Koushik Naik Mude**  
Record in Windows with **Win+G** (Xbox Game Bar) or a phone pointed at the screen.  
App: `http://localhost:5173/` · API: `http://localhost:3001` · Demo PIN: **1234**  
Start with `npm run dev` from the project root if the app is down.

**No .mp4 was produced in the automated run.** ffmpeg and Python were not installed, and this machine did not expose an OS screen recorder to the agent. Use the numbered PNGs in `demo/` as a storyboard while you speak.

Do **not** claim Amazon Bedrock, OpenSearch, or Cognito. The footer and limitations card say they are not implemented.

Total speaking time: about **4 minutes**. Pause 1–2 seconds on each control.

---

## 0:00–0:25 · Open the guest app

Show `01-guest-landing.png` / live Guest view.

> “This is MoonGuide AI, a classroom customer-assistance prototype for Moon’s Food Store. It is not a cloud Bedrock system. Guest, Staff, and Manager are in the header. Suggested questions are here. The chat looks up approved sample store information only.”

Tab once if you can. The skip link is `Skip to main content` and goes to `#main`. In the IDE browser it sits off-screen until keyboard focus; activating it moved focus to main. On Windows, Tab from the address bar, then Enter.

## 0:25–0:45 · Store card and phone

Scroll the side column. Show `03-store-card-phone.png`.

> “The store card loads from the local API: Moon’s Food Store, 14000 Detroit Avenue, Cleveland, Ohio. The phone is a real `tel:` link: 216-860-2588. Hours are Monday through Sunday, 8:00 a.m. to 12:30 a.m. Services include ATM, Ohio Lottery, Delivery, and ASG. Products include groceries and age-restricted beer, wine, tobacco, and vape. The limitations card says Bedrock is not implemented.”

## 0:45–1:05 · Keyboard role nav

Focus **Guest**. Press **Arrow Right**. Show `04-staff-lists-keyboard.png`.

> “Arrow keys move between Guest, Staff, and Manager. Home and End jump to the ends. Staff shows customer questions, items that need an employee, and restricted escalations. After earlier questions we had nine questions, six reviews, and two restricted beer and wine items.”

Arrow Right again to Manager if it is already unlocked, or stay on the PIN screen.

## 1:05–1:40 · Manager: wrong PIN, 1234, dashboard, lock

Show `06-manager-pin-locked.png`, then type **0000** and Unlock. Show `07-manager-wrong-pin.png`.

> “The dashboard uses a classroom PIN only. It is not production authentication. A wrong PIN shows: That PIN is not correct. Use the educational demo PIN 1234. The button shows Checking PIN while it waits.”

Type **1234**. Unlock. Show `08-manager-unlocked-1234.png` / `05-manager-dashboard.png`.

> “Correct PIN opens totals, helpful and not-helpful counts, answer categories, and feedback records. This dashboard does not approve sales or replace ID checks.”

Click **Lock dashboard**.

## 1:40–2:10 · Invalid forms and Enter to send

Go back to **Guest**. Click the question box. Press **Enter** on an empty field.

> “Empty send is blocked. The field turns invalid and the alert says: Please enter a question before sending. You can also choose a suggested question. The Send button stays disabled while the box is empty.”

Type `???` and click **Send**. Show `09-invalid-punctuation.png`.

> “Punctuation only is rejected: Please include letters or numbers in your question.”

Replace with `a` and Send. Show `10-invalid-too-short.png`.

> “A single letter is too short: Please enter at least 2 characters so MoonGuide AI can look up an answer.”

Type `Does the store accept EBT?` and press **Enter**. Show `11-sending-state.png`.

> “Enter sends. The button reads Sending…, the field disables, and the log says Looking up approved store information.”

## 2:10–2:50 · Valid answers, chips, feedback

Show `12-ebt-helpful.png` and `13-suggested-hours-answer.png`. Click remaining chips if time allows: hours, location, ATM, EBT, frozen food, delivery, services, products.

Live answers from this run:

- **Hours:** open Monday through Sunday, 8:00 a.m. to 12:30 a.m.
- **Location:** 14000 Detroit Avenue, Cleveland, Ohio; phone 216-860-2588.
- **ATM:** yes, ATM available for customers.
- **EBT:** EBT/SNAP at checkout for eligible groceries; alcohol, tobacco, vape, and lottery are not eligible. The assistant cannot approve payment or eligibility.
- **Frozen food:** yes; an employee must confirm a specific item.
- **Delivery:** yes; an employee must confirm coverage. The assistant cannot place an order.
- **Services:** ATM, Ohio Lottery, Delivery, ASG. Lottery needs a trained employee.
- **Products:** groceries, snacks, beverages, frozen foods, plus age-restricted beer, wine, tobacco, and vape.

Click **Helpful** on EBT and **Not Helpful** on another answer.

> “Helpful and Not Helpful stay on the answer and appear on Staff and Manager.”

## 2:50–3:15 · Restricted beer and unsupported wifi

Type `Can I buy beer without an ID?` and Send. Show `14-restricted-id-warning.png`.

> “MoonGuide AI will not approve a beer sale or replace an ID check. A trained employee must verify identification in person. The yellow status says it cannot approve a restricted sale.”

Type `What is the wifi password?` and Send. Show `15-unsupported-wifi.png`.

> “Wifi is not in the approved store information. The fallback is: I could not find a verified answer. Please ask a store employee. Source category: Unsupported.”

## 3:15–3:35 · Clear chat

Click **Clear chat**. Windows shows a native confirm: “Clear the saved conversation? Feedback records will remain for the manager dashboard.”

> “Confirm it. Chat resets to the welcome message. Feedback stays.”

Show `16-cleared-welcome.png`. If you record in the IDE browser, native `window.confirm` may not be clickable; use Chrome or Edge for this beat.

Open **Staff**. Show `17-staff-feedback-after-clear.png`.

> “After clear, question lists are empty, but the feedback snapshot still has Helpful EBT and Not Helpful wifi.”

## 3:35–4:00 · Backend down, then restore

Stop only the API (keep Vite): in a terminal, stop the process on port 3001, or stop `npm run dev --prefix server`. Ask ATM again.

> “When Express is down, the guest sees: MoonGuide AI cannot connect to the service right now. Please check your connection and try again. There is a Try that question again button.”

Show `18-backend-down.png` and restart `npm run dev --prefix server`. Click **Try that question again**. Show `19-api-restored-atm.png`.

> “After the API is back, the same ATM question returns: Yes. Moon’s Food Store has an ATM available for customers. That is the local prototype working end to end. Bedrock is not part of this demo.”

---

## What the live click-through actually proved

| Item | Result |
| --- | --- |
| Skip link | Present; activating it focused `#main` and set the hash. Hard to click while off-screen. |
| Guest / Staff / Manager | All three views clicked. Arrow Right moved Guest → Staff → Manager. |
| All 8 suggested questions | Hours, location, ATM, EBT, frozen, delivery, services, products — all answered from the API. |
| Valid send / Enter | EBT sent with Enter. |
| Empty / `???` / too short | All three validation messages shown. |
| Helpful / Not Helpful | Both pressed; Staff kept the ratings after clear. |
| Restricted beer / ID | No sale approval; employee-must-verify warning. |
| Unsupported wifi | Verified-answer fallback, category Unsupported. |
| Clear chat | Button clicked. Native confirm cannot be used in the Cursor IDE browser; confirm was completed in script so reset could be shown. Record this beat in Edge or Chrome. |
| Store phone / store card | `tel:216-860-2588` and full store details present. |
| Staff lists | Populated lists captured before clear (9 / 6 / 2). After clear, lists empty and feedback remained. |
| Manager PIN | Wrong PIN 0000 rejected; 1234 unlocked; Lock dashboard worked. |
| Keyboard | Arrow keys on role nav worked. Tab from Guest stayed on Guest because other role buttons use `tabIndex=-1`. A visible `:focus-visible` ring was **not** confirmed in the IDE browser (computed outline was `none`). |
| Backend down | Express stopped on 3001; connect copy and retry shown; API restarted; ATM succeeded. |
| Sending… | Button `Sending…` / `Sending question` and “Looking up approved store information…” captured. |

## Gaps (be honest on camera)

- **No video file.** This folder is a screenshot storyboard plus this script.
- **Native Clear chat dialog** should be recorded in a normal browser, not the IDE embedded browser.
- **Focus ring** was not visually confirmed here. Try Tab in Chrome or Edge if you need that shot.
- **Skip link** is visually hidden until real keyboard focus; do that shot yourself with Tab.
- **Bedrock / Cognito / OpenSearch are not implemented.** Do not say they are.
- Screenshot captures sometimes look like letters are doubled. That is a capture/font artifact. The live page and the accessibility tree use normal English.

## Files

- Storyboard: `demo/01-guest-landing.png` through `demo/19-api-restored-atm.png`
- Copies: `test-screenshots/`
- This script: `demo/DEMO_SCRIPT.md`
