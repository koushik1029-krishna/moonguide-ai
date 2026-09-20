import {
  isRestrictedQuestion,
  isPriceOrStockQuestion,
  RESTRICTED_WARNING,
  PRICE_STOCK_NOTE,
  UNSUPPORTED_ANSWER
} from "./restricted.js";

const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "of",
  "to",
  "in",
  "is",
  "are",
  "do",
  "does",
  "you",
  "your",
  "what",
  "when",
  "where",
  "how",
  "can",
  "i",
  "we",
  "store",
  "please"
]);

function tokenize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

function scoreEntry(normalizedQuestion, questionTokens, entry) {
  const haystack = new Set(
    tokenize(`${entry.title} ${entry.answer} ${(entry.keywords || []).join(" ")}`)
  );
  let score = 0;
  for (const token of questionTokens) {
    if (haystack.has(token)) score += 2;
  }
  for (const keyword of entry.keywords || []) {
    const term = String(keyword).toLowerCase();
    if (normalizedQuestion.includes(term)) score += 4;
  }
  return score;
}

export function answerQuestion(rawQuestion, knowledge) {
  const normalizedQuestion = String(rawQuestion || "")
    .trim()
    .toLowerCase();
  const restricted = isRestrictedQuestion(normalizedQuestion);
  const list = Array.isArray(knowledge) ? knowledge : [];
  const active = list.filter((entry) => entry && typeof entry === "object" && entry.active !== false);
  const tokens = tokenize(normalizedQuestion);

  let best = null;
  let bestScore = 0;
  for (const entry of active) {
    const score = scoreEntry(normalizedQuestion, tokens, entry);
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  const matched = Boolean(best && bestScore >= 6);

  if (restricted) {
    const safety = active.find((entry) => entry.id === "safety-restricted") || best;
    const source = safety || {
      category: "Restricted Product Safety",
      lastUpdated: new Date().toISOString().slice(0, 10),
      id: "safety-restricted"
    };
    return {
      supported: true,
      restricted: true,
      needsReview: true,
      answer: RESTRICTED_WARNING,
      extraNote:
        matched && best && !best.restricted
          ? best.answer
          : source.answer || RESTRICTED_WARNING,
      sourceCategory: source.category,
      lastUpdated: source.lastUpdated,
      sourceId: source.id
    };
  }

  if (!matched) {
    return {
      supported: false,
      restricted: false,
      needsReview: true,
      answer: UNSUPPORTED_ANSWER,
      extraNote: null,
      sourceCategory: "Unsupported",
      lastUpdated: null,
      sourceId: null
    };
  }

  let answer = best.answer;
  if (isPriceOrStockQuestion(normalizedQuestion) && !/prices and inventory/i.test(answer)) {
    answer = `${answer} ${PRICE_STOCK_NOTE}`;
  }

  return {
    supported: true,
    restricted: Boolean(best.restricted),
    needsReview: Boolean(best.restricted),
    answer,
    extraNote: null,
    sourceCategory: best.category,
    lastUpdated: best.lastUpdated,
    sourceId: best.id
  };
}
