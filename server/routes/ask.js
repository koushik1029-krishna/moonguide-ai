import { Router } from "express";
import { answerQuestion } from "../lib/matcher.js";
import { loadKnowledge } from "../lib/knowledge.js";
import { validateQuestion } from "../../shared/validation.js";

const router = Router();

router.post("/", (req, res) => {
  try {
    if (req.body != null && typeof req.body !== "object") {
      return res.status(400).json({
        error: true,
        message: "That request could not be read. Please send a normal question and try again."
      });
    }

    const checked = validateQuestion(req.body?.question);
    if (!checked.valid) {
      return res.status(400).json({
        error: true,
        message: checked.message
      });
    }

    const knowledge = loadKnowledge();
    if (!Array.isArray(knowledge) || knowledge.length === 0) {
      return res.status(500).json({
        error: true,
        message:
          "Approved store information is temporarily unavailable. Please ask a store employee for help."
      });
    }

    const result = answerQuestion(checked.value, knowledge);
    if (!result || typeof result.answer !== "string" || !result.answer.trim()) {
      return res.status(500).json({
        error: true,
        message:
          "The assistant could not process that question. Please try again or ask a store employee."
      });
    }

    // Do not log the question or PIN. Return only guest-facing fields (no matcher internals).
    return res.json({
      question: checked.value,
      answer: result.answer,
      extraNote: typeof result.extraNote === "string" ? result.extraNote : null,
      sourceCategory: typeof result.sourceCategory === "string" ? result.sourceCategory : null,
      lastUpdated: typeof result.lastUpdated === "string" ? result.lastUpdated : null,
      needsReview: Boolean(result.needsReview),
      restricted: Boolean(result.restricted),
      supported: Boolean(result.supported),
      generatedAt: new Date().toISOString()
    });
  } catch {
    return res.status(500).json({
      error: true,
      message:
        "The assistant could not process that question. Please try again or ask a store employee."
    });
  }
});

export default router;
