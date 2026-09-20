import { createApp } from "./app.js";

if (process.env.npm_lifecycle_event === "start" && !process.env.NODE_ENV) {
  process.env.NODE_ENV = "production";
}

const port = Number(process.env.PORT) || 8080;
const host = process.env.HOST || "0.0.0.0";
const app = createApp();

app.listen(port, host, () => {
  console.log(`MoonGuide AI listening on http://0.0.0.0:${port}`);
});
