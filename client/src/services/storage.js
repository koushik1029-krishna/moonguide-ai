import { STORAGE_KEYS, WELCOME_MESSAGE } from "../data/constants.js";
import { isAllowedRole } from "./validation.js";

function canUseStorage() {
  try {
    const probe = "__moonguide.probe";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

const STORAGE_UNAVAILABLE = {
  ok: false,
  message:
    "MoonGuide AI could not save information in this browser. Chat and feedback may not persist after refresh."
};

function readRaw(key) {
  if (!canUseStorage()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function readJson(key, fallback) {
  const raw = readRaw(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (!canUseStorage()) return STORAGE_UNAVAILABLE;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch {
    return STORAGE_UNAVAILABLE;
  }
}

function writeText(key, value, failureMessage) {
  if (!canUseStorage()) {
    return { ok: false, message: failureMessage || STORAGE_UNAVAILABLE.message };
  }
  try {
    window.localStorage.setItem(key, value);
    return { ok: true };
  } catch {
    return {
      ok: false,
      message: failureMessage || STORAGE_UNAVAILABLE.message
    };
  }
}

function clipText(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

function isValidMessage(item) {
  if (!item || typeof item !== "object" || Array.isArray(item)) return false;
  if (item.role !== "user" && item.role !== "assistant") return false;
  if (typeof item.id !== "string" && typeof item.id !== "number") return false;
  if (item.role === "user" && typeof item.question !== "string") return false;
  if (item.role === "assistant" && typeof item.answer !== "string") return false;
  return Boolean(item.id);
}

function isValidFeedback(item) {
  return Boolean(
    item &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      item.id &&
      item.messageId &&
      (item.rating === "helpful" || item.rating === "not-helpful")
  );
}

function sanitizeMessage(item) {
  const safe = { ...item, id: String(item.id) };
  if (typeof safe.question === "string") safe.question = clipText(safe.question, 2000);
  if (typeof safe.answer === "string") safe.answer = clipText(safe.answer, 8000);
  if (typeof safe.extraNote === "string") safe.extraNote = clipText(safe.extraNote, 4000);
  if (safe.feedback !== "helpful" && safe.feedback !== "not-helpful") {
    delete safe.feedback;
  }
  return safe;
}

function sanitizeFeedback(item) {
  return {
    ...item,
    id: String(item.id),
    messageId: String(item.messageId),
    question: clipText(typeof item.question === "string" ? item.question : "", 2000),
    answer: clipText(typeof item.answer === "string" ? item.answer : "", 8000),
    category: typeof item.category === "string" ? clipText(item.category, 120) : "Unknown",
    needsReview: Boolean(item.needsReview),
    rating: item.rating
  };
}

function extractMessages(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.messages)) return raw.messages;
  return null;
}

export function loadChat() {
  try {
    const parsed = readJson(STORAGE_KEYS.chat, null);
    const messages = extractMessages(parsed);
    if (!messages) return [WELCOME_MESSAGE];
    const cleaned = messages.filter(isValidMessage).map(sanitizeMessage);
    if (cleaned.length === 0) return [WELCOME_MESSAGE];
    return cleaned.map((item) => (item.id === "welcome" ? { ...WELCOME_MESSAGE } : item));
  } catch {
    return [WELCOME_MESSAGE];
  }
}

export function saveChat(messages) {
  try {
    const safe = Array.isArray(messages)
      ? messages.filter(isValidMessage).map(sanitizeMessage)
      : [WELCOME_MESSAGE];
    return writeJson(STORAGE_KEYS.chat, safe.length ? safe : [WELCOME_MESSAGE]);
  } catch {
    return STORAGE_UNAVAILABLE;
  }
}

export function loadFeedback() {
  try {
    const parsed = readJson(STORAGE_KEYS.feedback, []);
    const records = Array.isArray(parsed) ? parsed : parsed?.records;
    if (!Array.isArray(records)) return [];
    return records.filter(isValidFeedback).map(sanitizeFeedback);
  } catch {
    return [];
  }
}

export function saveFeedback(records) {
  try {
    const safe = Array.isArray(records) ? records.filter(isValidFeedback).map(sanitizeFeedback) : [];
    return writeJson(STORAGE_KEYS.feedback, safe);
  } catch {
    return STORAGE_UNAVAILABLE;
  }
}

export function loadRole() {
  try {
    const role = readRaw(STORAGE_KEYS.role);
    return isAllowedRole(role) ? role : "guest";
  } catch {
    return "guest";
  }
}

export function saveRole(role) {
  try {
    return writeText(
      STORAGE_KEYS.role,
      isAllowedRole(role) ? role : "guest",
      "MoonGuide AI could not save your selected role in this browser."
    );
  } catch {
    return {
      ok: false,
      message: "MoonGuide AI could not save your selected role in this browser."
    };
  }
}

export function isManagerUnlocked() {
  try {
    return readRaw(STORAGE_KEYS.managerUnlock) === "true";
  } catch {
    return false;
  }
}

export function setManagerUnlocked(value) {
  try {
    return writeText(
      STORAGE_KEYS.managerUnlock,
      value ? "true" : "false",
      "MoonGuide AI could not save manager access in this browser."
    );
  } catch {
    return {
      ok: false,
      message: "MoonGuide AI could not save manager access in this browser."
    };
  }
}

export function createId(prefix) {
  const unique =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${unique}`;
}
