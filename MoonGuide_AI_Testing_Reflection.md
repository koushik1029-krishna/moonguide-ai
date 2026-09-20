# MoonGuide AI Testing Reflection

Krishna Koushik Naik Mude  
Student  
September 19, 2026

Testing MoonGuide AI as a local classroom prototype meant checking Guest, Staff, and Manager views against a real Express API, not a cloud story. I used the Cursor IDE browser at http://localhost:5173, the API on port 3001, and saved health, ask, and audit logs. Several checklist rows stay blank on purpose; I recorded only what was actually run.

The most critical bug appeared when Express was stopped and Vite stayed up. An ATM question received an empty Vite-proxy HTTP 500 and first showed a generic temporary-problem sentence, hiding that the service was down. Mapping empty 5xx responses in api.js to the connect copy fixed it: guests now see that MoonGuide AI cannot connect and should try again, with a retry control. Health returned 200 after Express restarted.

The most important security issue was overly permissive CORS, which could allow any origin if CORS_ORIGIN was unset. Development now allows only local Vite and Express origins; production defaults to same-origin unless CORS_ORIGIN is set. A security script passed local-allow and foreign-origin block checks. The public demo PIN 1234 remains a client-side classroom value, not production authentication.

A Cursor agent helped build, test, and document the work: it exercised offline and backend-down paths, measured contrast, ran the production build, and wrote the security audit without inventing Bedrock or Cognito. I still rejected a sample claim that the PIN moved to a server environment, because the frontend still checks 1234. Those agent runs were useful only when I compared them to the source.

The hardest part was staying honest about leftover limits while still documenting real fixes. localStorage can still spoof manager unlock, ask and store routes stay unauthenticated, NVDA was not run, and the focus ring was not confirmed in the IDE browser. That taught me a classroom demo can add useful defenses without claiming production-grade identity or Cognito.

*Word count: 306 (body paragraphs only; heading, name, and this note excluded).*
