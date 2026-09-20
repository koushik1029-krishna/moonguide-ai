import Button from "./ui/Button.jsx";

export default function FeedbackButtons({ message, onFeedback }) {
  if (!message || message.id === "welcome" || message.role !== "assistant" || message.isError) {
    return null;
  }

  function rate(rating) {
    try {
      onFeedback?.(message, rating);
    } catch {
      // App-level persistence already reports save failures.
    }
  }

  return (
    <div className="feedback-row" role="group" aria-label="Was this answer helpful?">
      <Button
        variant="feedback"
        selected={message.feedback === "helpful"}
        aria-pressed={message.feedback === "helpful"}
        onClick={() => rate("helpful")}
      >
        Helpful
      </Button>
      <Button
        variant="feedback"
        selected={message.feedback === "not-helpful"}
        aria-pressed={message.feedback === "not-helpful"}
        onClick={() => rate("not-helpful")}
      >
        Not Helpful
      </Button>
    </div>
  );
}
