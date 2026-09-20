# MoonGuide AI

Educational prototype for **Moon's Food Store**. MoonGuide AI helps guests and employees find approved sample store information and requires a trained employee for restricted-sale decisions.

This is a local full-stack demonstration. It does **not** include Amazon Bedrock, OpenSearch, Cognito, or other enterprise AWS services.

## Store information used by the prototype

- Business: Moon's Food Store
- Address: 14000 Detroit Avenue, Cleveland, Ohio
- Phone: 216-860-2588
- Hours: Monday through Sunday, 8:00 a.m. to 12:30 a.m.
- Services: ATM, Ohio Lottery, Delivery, and ASG
- Product categories: groceries, snacks, beverages, frozen foods, beer, wine, tobacco, and vape products

## Features

- Guest question assistant with suggested questions
- Answers grounded only in `server/data/knowledge.json`
- Source category and last-updated date on applicable answers
- Safe fallback when no approved answer exists
- Mandatory employee escalation for alcohol, tobacco, vape, lottery, age, and identification questions
- Helpful / Not Helpful feedback
- Guest, Staff, and Manager roles
- Manager dashboard with question, feedback, category, and review totals
- Demo manager PIN `1234` (educational use only)
- Chat history and feedback saved in `localStorage`
- Clear chat, form validation, loading states, and readable errors
- Responsive blue, white, and gold layout

## Technology

- React 18 + Vite frontend
- Express / Node.js backend
- Local JSON knowledge base (no paid AI key)

## Project structure

```text
MoonGuide-AI-Local/
  client/                 React + Vite app
    src/components/       UI and layout components
    src/components/ui/    Reusable Button, Card, lists, stats
    src/data/             Suggested questions and constants
    src/hooks/            Persistence helpers
    src/pages/            Guest, staff, and manager views
    src/services/         API, validation, and localStorage helpers
    src/styles/           Theme and layout CSS
    src/utils/            Dashboard analytics helpers
  server/                 Express API
    data/knowledge.json   Approved sample store information
    lib/                  Matching and restricted-topic rules
    middleware/           JSON and error handlers
    routes/               /api/ask, /api/health, /api/store
  shared/                 Validation used by client and server
  Dockerfile              Optional future App Runner container
  README.md
```

## Local setup

Requirements: Node.js 18 or newer.

```bash
cd MoonGuide-AI-Local
npm install
npm run install:all
```

## Run in development

From the project root:

```bash
npm run dev
```

Or start the two apps separately:

```bash
npm run dev:server
npm run dev:client
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Health check: http://localhost:8080/api/health

The Vite dev server proxies `/api` requests to the Express backend on port 8080. Guest, Staff, and Manager views use `/guest`, `/staff`, and `/manager`.

Optional environment placeholders are listed in `.env.example` (`PORT`, `HOST`, `CORS_ORIGIN`, `NODE_ENV`). Copy that file to `.env` only if you need to override defaults. Do not put real secrets in source control. `.env` is gitignored.

Express listens on `0.0.0.0` and `process.env.PORT || 8080`. In development, CORS allows the local Vite origins. In production, CORS is same-origin unless `CORS_ORIGIN` is set.

## Production

Install dependencies, build the Vite app, then start the combined Node service:

```bash
npm run build
npm start
```

The production app listens on `http://0.0.0.0:8080` (or `PORT` if set). Express serves `client/dist` and keeps `/api` routes. Direct loads of `/guest`, `/staff`, and `/manager` fall back to the SPA.

## Demo manager PIN

Use **1234**. This PIN is for classroom demonstration only. It is **not** production authentication: it is a known demo value, checked in the browser, and can be bypassed by setting `moonguide.managerUnlocked` in `localStorage`. The UI strips non-digits and briefly delays or locks after repeated failed attempts; those controls do not make the PIN a real login system.

See `SECURITY_AUDIT.md` for the current defensive controls and remaining prototype limits.

## Responsible AI limitations

- Assistant responses may be incomplete or incorrect and are not guaranteed facts.
- The assistant does not give final approval for alcohol, tobacco, vape, or lottery sales.
- Age, identification, eligibility, and legal questions must go to a trained employee. The assistant cannot replace a legally required ID check.
- The app does not invent prices, policies, stock status, or legal advice.
- Unsupported questions receive a fallback that asks the guest to speak with an employee.
- Guests are asked not to enter names, payment details, or other personal information. Questions and the demo PIN are not written to server logs.
- Future AWS services are described below as possibilities only. They are not implemented here.

See `RESPONSIBLE_AI_ACCESSIBILITY.md` for the accessibility and responsible-AI review.

## Future AWS App Runner deployment (not implemented)

This prototype is structured so it could later be containerized and hosted on AWS App Runner:

1. Build the Docker image from the included `Dockerfile`.
2. Push the image to Amazon ECR.
3. Create an App Runner service that listens on `PORT` (default `8080`).
4. Use `/api/health` as a health check.

Possible later architecture (not part of this prototype):

- Amazon Bedrock for generative answers with grounding
- Knowledge Bases / OpenSearch for retrieval
- Bedrock Guardrails for restricted topics
- Amazon S3 for static assets
- PostgreSQL for durable analytics
- Amazon Cognito for real staff authentication

None of those services are connected in this educational project.

## Testing checklist

1. Ask about hours, location, products, services, and EBT/SNAP.
2. Confirm source category and last-updated date appear.
3. Ask an unsupported question and confirm the fallback message.
4. Ask about beer, tobacco, vape, lottery, age, or ID and confirm employee escalation.
5. Mark answers Helpful or Not Helpful.
6. Refresh the browser and confirm chat and feedback remain.
7. Open Staff and Manager views.
8. Unlock the manager dashboard with PIN 1234.
9. Resize the window to check mobile layout.
10. With the browser Offline, or with Express stopped, confirm Guest stays usable and shows a connect error (see `TESTING_SECURITY_REPORT.md` section 11).
