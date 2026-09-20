const SENSITIVE_LABEL =
  /\b(authorization|api[_-]?key|token|secret|password|passwd|pin|cookie|credential)\b/gi;

export function summarizeError(err) {
  if (!err || typeof err !== "object") {
    return { name: "Error", message: "Request failed" };
  }

  const name = typeof err.name === "string" && err.name.trim() ? err.name.trim().slice(0, 80) : "Error";
  let message = typeof err.message === "string" ? err.message : "Request failed";
  message = message.replace(SENSITIVE_LABEL, "[redacted]").replace(/\s+/g, " ").trim().slice(0, 180);

  if (!message) {
    message = "Request failed";
  }

  return { name, message };
}

export function handleJsonErrors(err, _req, res, next) {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({
      error: true,
      message: "That request was too large. Please shorten your question and try again."
    });
  }
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      error: true,
      message: "That request could not be read. Please send a normal question and try again."
    });
  }
  return next(err);
}

export function notFoundHandler(_req, res) {
  res.status(404).json({
    error: true,
    message:
      "MoonGuide AI could not find that page or request. Please return to the assistant and try again."
  });
}

export function serverErrorHandler(err, _req, res, _next) {
  const summary = summarizeError(err);
  console.error("MoonGuide AI request failed.", summary.name, summary.message);
  if (res.headersSent) {
    return;
  }
  res.status(500).json({
    error: true,
    message: "Something went wrong. Please try again or speak with a store employee."
  });
}
