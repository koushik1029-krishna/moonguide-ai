import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const knowledgePath = join(__dirname, "..", "data", "knowledge.json");

export function loadKnowledge() {
  try {
    const raw = readFileSync(knowledgePath, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error("Knowledge file is not a list.");
    }
    return parsed;
  } catch {
    throw new Error("Unable to load approved store information.");
  }
}
