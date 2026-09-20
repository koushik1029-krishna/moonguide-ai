import { useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage.jsx";
import LoadingIndicator from "./LoadingIndicator.jsx";
import StatusMessage from "./StatusMessage.jsx";
import Button from "./ui/Button.jsx";
import Card from "./ui/Card.jsx";
import EmptyState from "./ui/EmptyState.jsx";
import { askQuestion, toUserFacingError } from "../services/api.js";
import { createId } from "../services/storage.js";
import { QUESTION_MAX_LENGTH, validateQuestion } from "../services/validation.js";

const ASK_FALLBACK =
  "Something went wrong while looking up that question. Please try again or speak with a store employee.";

export default function ChatPanel({
  messages,
  setMessages,
  persistChat,
  onFeedback,
  onClearChat,
  queuedQuestion,
  onQueuedQuestionHandled,
  onBusyChange
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastFailedQuestion, setLastFailedQuestion] = useState("");
  const listRef = useRef(null);
  const sendingRef = useRef(false);

  const safeMessages = Array.isArray(messages) ? messages : [];

  useEffect(() => {
    onBusyChange?.(loading);
  }, [loading, onBusyChange]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [safeMessages, loading]);

  useEffect(() => {
    if (!queuedQuestion) return;
    submitQuestion(queuedQuestion);
    onQueuedQuestionHandled?.();
  }, [queuedQuestion]);

  function commitMessages(updater) {
    setMessages((current) => {
      const base = Array.isArray(current) ? current : [];
      const next = typeof updater === "function" ? updater(base) : updater;
      try {
        persistChat?.(next);
      } catch {
        setError("MoonGuide AI could not save this conversation in this browser.");
      }
      return next;
    });
  }

  async function submitQuestion(questionText) {
    const checked = validateQuestion(questionText);
    if (!checked.valid) {
      setError(checked.message);
      return;
    }
    if (sendingRef.current || loading) {
      setError("Please wait for the current answer before sending another question.");
      return;
    }

    sendingRef.current = true;
    setError("");
    setLastFailedQuestion("");
    setLoading(true);
    const userMessage = {
      id: createId("user"),
      role: "user",
      question: checked.value,
      createdAt: new Date().toISOString()
    };
    commitMessages((current) => [...current, userMessage]);
    setInput("");

    try {
      const result = await askQuestion(checked.value);
      const assistantMessage = {
        id: createId("asst"),
        role: "assistant",
        question: checked.value,
        answer: result.answer,
        extraNote: result.extraNote,
        sourceCategory: result.sourceCategory,
        lastUpdated: result.lastUpdated,
        needsReview: result.needsReview,
        restricted: result.restricted,
        supported: result.supported,
        createdAt: result.generatedAt
      };
      commitMessages((current) => [...current, assistantMessage]);
    } catch (err) {
      const message = toUserFacingError(err, ASK_FALLBACK);
      setError(message);
      setLastFailedQuestion(checked.value);
      commitMessages((current) => [
        ...current,
        {
          id: createId("asst-error"),
          role: "assistant",
          question: checked.value,
          answer: message,
          sourceCategory: "System",
          lastUpdated: null,
          needsReview: true,
          restricted: false,
          supported: false,
          isError: true,
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      sendingRef.current = false;
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;
    submitQuestion(input);
  }

  function handleInputChange(event) {
    const nextValue = event.target.value.slice(0, QUESTION_MAX_LENGTH);
    setInput(nextValue);
    if (!error) return;
    if (!nextValue.trim()) {
      setError("");
      return;
    }
    const checked = validateQuestion(nextValue);
    if (checked.valid) setError("");
  }

  function handleComposerKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!loading) submitQuestion(input);
    }
  }

  const remaining = Math.max(0, QUESTION_MAX_LENGTH - input.length);
  const canSend = !loading && input.trim().length > 0;

  return (
    <Card
      className="chat-card"
      title="Customer assistant"
      titleId="chat-heading"
      description={
        <p id="chat-disclaimer" className="muted">
          MoonGuide AI looks up approved sample store information. Answers may be incomplete
          or incorrect. Ask a store employee when you need a person to review your question.
        </p>
      }
      actions={
        <Button variant="ghost" onClick={onClearChat} disabled={loading} aria-label="Clear conversation history">
          Clear chat
        </Button>
      }
    >
      <div
        className="chat-log"
        ref={listRef}
        role="log"
        aria-live="polite"
        aria-busy={loading}
        aria-label="Conversation with MoonGuide AI"
      >
        {safeMessages.length === 0 && !loading && (
          <EmptyState>No conversation yet. Ask a question about Moon's Food Store.</EmptyState>
        )}
        <ol className="chat-thread">
          {safeMessages.map((message) => (
            <li key={message.id}>
              <ChatMessage message={message} onFeedback={onFeedback} />
            </li>
          ))}
        </ol>
        {loading && <LoadingIndicator label="Looking up approved store information…" />}
      </div>
      <form className="chat-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="question">Ask a question</label>
        <div className="composer">
          <textarea
            id="question"
            name="question"
            rows="3"
            maxLength={QUESTION_MAX_LENGTH}
            value={input}
            disabled={loading}
            onChange={handleInputChange}
            onKeyDown={handleComposerKeyDown}
            placeholder="Ask about hours, location, products, services, or EBT/SNAP"
            required
            autoComplete="off"
            spellCheck="true"
            aria-invalid={Boolean(error)}
            aria-describedby="chat-disclaimer question-help question-error"
          />
          <Button
            type="submit"
            disabled={!canSend}
            aria-busy={loading}
            aria-label={loading ? "Sending question" : "Send question"}
          >
            {loading ? "Sending…" : "Send"}
          </Button>
        </div>
        <p id="question-help" className="helper">
          {remaining} characters remaining. Press Enter to send, or Shift+Enter for a new line.
          Do not enter names, payment details, or other personal information. Answers come only
          from approved store information and may be incorrect.
        </p>
        <StatusMessage id="question-error" tone="error" reserve>
          {error}
        </StatusMessage>
        {lastFailedQuestion && !loading && (
          <Button variant="ghost" onClick={() => submitQuestion(lastFailedQuestion)} disabled={loading}>
            Try that question again
          </Button>
        )}
      </form>
    </Card>
  );
}
