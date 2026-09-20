const API_BASE = import.meta.env.VITE_API_BASE || "";
const REQUEST_TIMEOUT_MS = 12000;
export const CONNECT_ERROR_MESSAGE =
  "MoonGuide AI cannot connect to the service right now. Please check your connection and try again.";
const TIMEOUT_MESSAGE =
  "The request took too long. Please try again, or ask a Moon's Food Store employee if you need help right away.";
const UNEXPECTED_RESPONSE_MESSAGE =
  "The assistant returned an unexpected response. Please try again.";
const INCOMPLETE_ANSWER_MESSAGE =
  "MoonGuide AI could not find a complete answer. Please try again or ask a store employee.";
const GENERIC_REQUEST_MESSAGE =
  "The assistant could not complete that request. Please try again.";
const TEMPORARY_PROBLEM_MESSAGE =
  "The assistant had a temporary problem. Please try again or speak with a store employee.";
const INCOMPLETE_STORE_MESSAGE = "Store details were incomplete. Please try again.";

const TECHNICAL_ERROR_PATTERN =
  /econnrefused|enotfound|etimedout|econnreset|eai_again|eacces|enoent|epipe|errno|syscall|node:internal|aggregateerror|typeerror:|syntaxerror:|referenceerror:|networkerror|failed to fetch|socket hang|cors policy|proxy error|stack trace|err_network|err_connection|\bat\s+\S+\s+\(/i;
const CONNECT_LIKE_PATTERN =
  /econnrefused|enotfound|etimedout|econnreset|eai_again|failed to fetch|networkerror|err_network|err_connection|offline|socket hang|proxy error/i;
const TIMEOUT_LIKE_PATTERN = /aborted|timeout|timed out|took too long/i;

function looksTechnical(message) {
  if (typeof message !== "string") return true;
  const trimmed = message.trim();
  if (!trimmed || trimmed.length > 280) return true;
  if (TECHNICAL_ERROR_PATTERN.test(trimmed)) return true;
  if (/[/\\].+\.(js|jsx|ts|json|mjs|cjs)\b/i.test(trimmed)) return true;
  return false;
}

function isConnectLike(message) {
  return typeof message === "string" && CONNECT_LIKE_PATTERN.test(message);
}

function isTimeoutLike(message) {
  return typeof message === "string" && TIMEOUT_LIKE_PATTERN.test(message);
}

export function toUserFacingError(error, fallback = GENERIC_REQUEST_MESSAGE) {
  const raw = typeof error === "string" ? error : error?.message;
  if (typeof raw !== "string" || !raw.trim()) return fallback;
  const trimmed = raw.trim();
  if (trimmed === CONNECT_ERROR_MESSAGE || trimmed === TIMEOUT_MESSAGE) return trimmed;
  if (isConnectLike(trimmed)) return CONNECT_ERROR_MESSAGE;
  if (isTimeoutLike(trimmed) && looksTechnical(trimmed)) return TIMEOUT_MESSAGE;
  if (looksTechnical(trimmed)) return fallback;
  return trimmed;
}

function safeApiMessage(message) {
  if (typeof message !== "string" || !message.trim() || looksTechnical(message)) {
    return "";
  }
  return message.trim();
}

function friendlyHttpMessage(status, fallback) {
  const safeFallback = safeApiMessage(fallback);
  if (status === 400) {
    return safeFallback || "Please check your question and try again.";
  }
  if (status === 404) {
    return "MoonGuide AI could not find that information. Please ask a store employee for help.";
  }
  if (status === 413) {
    return "That request was too large. Please shorten your question and try again.";
  }
  if (status === 429) {
    return "Too many questions were sent at once. Please wait a moment and try again.";
  }
  if (status === 502 || status === 503 || status === 504) {
    return CONNECT_ERROR_MESSAGE;
  }
  if (status >= 500) {
    return safeFallback || TEMPORARY_PROBLEM_MESSAGE;
  }
  return safeFallback || GENERIC_REQUEST_MESSAGE;
}

function isJsonObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeAskResult(data) {
  if (!isJsonObject(data)) {
    throw new Error(UNEXPECTED_RESPONSE_MESSAGE);
  }
  if (typeof data.answer !== "string" || !data.answer.trim()) {
    throw new Error(INCOMPLETE_ANSWER_MESSAGE);
  }
  return {
    question: typeof data.question === "string" ? data.question : "",
    answer: data.answer,
    extraNote: typeof data.extraNote === "string" ? data.extraNote : undefined,
    sourceCategory: typeof data.sourceCategory === "string" ? data.sourceCategory : undefined,
    lastUpdated: typeof data.lastUpdated === "string" ? data.lastUpdated : null,
    needsReview: Boolean(data.needsReview),
    restricted: Boolean(data.restricted),
    supported: Boolean(data.supported),
    generatedAt: typeof data.generatedAt === "string" ? data.generatedAt : new Date().toISOString()
  };
}

function normalizeStoreInfo(data) {
  if (!isJsonObject(data) || typeof data.name !== "string" || !data.name.trim()) {
    throw new Error(INCOMPLETE_STORE_MESSAGE);
  }
  return {
    name: data.name.trim(),
    address: typeof data.address === "string" ? data.address : "",
    phone: typeof data.phone === "string" ? data.phone : "",
    hours: typeof data.hours === "string" ? data.hours : "",
    services: Array.isArray(data.services) ? data.services.filter((item) => typeof item === "string") : [],
    productCategories: Array.isArray(data.productCategories)
      ? data.productCategories.filter((item) => typeof item === "string")
      : []
  };
}

async function request(path, options = {}) {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    throw new Error(CONNECT_ERROR_MESSAGE);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options,
      signal: controller.signal
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(TIMEOUT_MESSAGE);
    }
    throw new Error(CONNECT_ERROR_MESSAGE);
  } finally {
    clearTimeout(timeoutId);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const unreachableProxy =
      response.status >= 500 && (!data || typeof data.message !== "string" || !data.message.trim());
    if (unreachableProxy) {
      throw new Error(CONNECT_ERROR_MESSAGE);
    }
    throw new Error(friendlyHttpMessage(response.status, data?.message));
  }

  if (!isJsonObject(data)) {
    throw new Error(UNEXPECTED_RESPONSE_MESSAGE);
  }

  return data;
}

export async function askQuestion(question) {
  try {
    const data = await request("/api/ask", {
      method: "POST",
      body: JSON.stringify({ question })
    });
    return normalizeAskResult(data);
  } catch (error) {
    throw new Error(toUserFacingError(error, GENERIC_REQUEST_MESSAGE));
  }
}

export async function getStoreInfo() {
  try {
    const data = await request("/api/store");
    return normalizeStoreInfo(data);
  } catch (error) {
    throw new Error(toUserFacingError(error, "Store details could not be loaded. Please refresh the page or ask an employee."));
  }
}

export async function getHealth() {
  try {
    return await request("/api/health");
  } catch (error) {
    throw new Error(toUserFacingError(error, CONNECT_ERROR_MESSAGE));
  }
}
