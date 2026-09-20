export function buildStats(messages, feedback) {
  const safeMessages = Array.isArray(messages) ? messages : [];
  const safeFeedback = Array.isArray(feedback) ? feedback : [];
  const questions = safeMessages.filter((message) => message.role === "user");
  const answers = safeMessages.filter(
    (message) => message.role === "assistant" && message.id !== "welcome"
  );
  const helpful = safeFeedback.filter((item) => item.rating === "helpful").length;
  const notHelpful = safeFeedback.filter((item) => item.rating === "not-helpful").length;
  const needsReview = answers.filter((item) => item.needsReview).length;
  const categories = {};
  for (const answer of answers) {
    const key = answer.sourceCategory || "Unknown";
    categories[key] = (categories[key] || 0) + 1;
  }
  return {
    totalQuestions: questions.length,
    helpful,
    notHelpful,
    needsReview,
    categories,
    assistantCount: answers.length
  };
}

export function getUserQuestions(messages) {
  return (Array.isArray(messages) ? messages : []).filter((message) => message.role === "user");
}

export function getReviewMessages(messages) {
  return (Array.isArray(messages) ? messages : []).filter(
    (message) => message.role === "assistant" && message.needsReview
  );
}

export function getRestrictedMessages(messages) {
  return (Array.isArray(messages) ? messages : []).filter(
    (message) => message.role === "assistant" && message.restricted
  );
}
