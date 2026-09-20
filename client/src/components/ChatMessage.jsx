import FeedbackButtons from "./FeedbackButtons.jsx";

export default function ChatMessage({ message, onFeedback }) {
  if (!message || typeof message !== "object") return null;

  const isUser = message.role === "user";
  const speaker = isUser ? "You" : "MoonGuide AI";
  const body = isUser ? message.question : message.answer;
  const text = typeof body === "string" ? body : "";

  return (
    <article
      className={isUser ? "bubble user" : message.isError ? "bubble assistant error" : "bubble assistant"}
      aria-label={`${speaker} message`}
    >
      <p className="bubble-label">{speaker}</p>
      <p>{text}</p>
      {!isUser && typeof message.extraNote === "string" && message.extraNote && (
        <p className="extra-note">{message.extraNote}</p>
      )}
      {!isUser && !message.isError && (
        <p className="ai-disclaimer">
          This assistant response may be incomplete or incorrect. It is not a guaranteed fact.
        </p>
      )}
      {!isUser && message.restricted && (
        <p className="warning" role="status">
          A trained employee must verify identification in person and complete this request.
          MoonGuide AI cannot approve a restricted sale or replace a legally required ID check.
        </p>
      )}
      {!isUser && message.sourceCategory && message.sourceCategory !== "Welcome" && (
        <p className="citation">
          Source category: {message.sourceCategory}
          {message.lastUpdated ? ` · Last updated: ${message.lastUpdated}` : ""}
        </p>
      )}
      <FeedbackButtons message={message} onFeedback={onFeedback} />
    </article>
  );
}
