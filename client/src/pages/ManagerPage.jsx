import { useEffect, useRef, useState } from "react";
import { DEMO_MANAGER_PIN } from "../data/constants.js";
import { isManagerUnlocked, setManagerUnlocked } from "../services/storage.js";
import { PIN_LENGTH, validateManagerPin } from "../services/validation.js";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import StatGrid from "../components/ui/StatGrid.jsx";
import FeedbackTable from "../components/FeedbackTable.jsx";
import LoadingIndicator from "../components/LoadingIndicator.jsx";
import StatusMessage from "../components/StatusMessage.jsx";

const MAX_PIN_ATTEMPTS = 5;
const PIN_LOCKOUT_MS = 20000;
const PIN_CHECK_DELAY_MS = 250;
const LOCKOUT_MESSAGE =
  "Too many incorrect PIN attempts. Please wait about 20 seconds and try again. This demonstration PIN is not production authentication.";

export default function ManagerPage({ stats, feedback, messages }) {
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return isManagerUnlocked();
    } catch {
      return false;
    }
  });
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState(0);
  const unlockingRef = useRef(false);

  const lockedOut = lockUntil > Date.now();

  useEffect(() => {
    if (!lockUntil) return undefined;
    const remaining = lockUntil - Date.now();
    if (remaining <= 0) {
      setLockUntil(0);
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setLockUntil(0);
      setError("");
    }, remaining);
    return () => window.clearTimeout(timer);
  }, [lockUntil]);

  function handleUnlock(event) {
    event.preventDefault();
    if (unlockingRef.current || unlocking) {
      return;
    }

    if (lockUntil > Date.now()) {
      setError(LOCKOUT_MESSAGE);
      return;
    }

    const checked = validateManagerPin(pin);
    if (!checked.valid) {
      setError(checked.message);
      return;
    }

    unlockingRef.current = true;
    setUnlocking(true);
    setError("");

    const delayMs = PIN_CHECK_DELAY_MS + failedAttempts * 150;

    window.setTimeout(() => {
      try {
        if (checked.value !== DEMO_MANAGER_PIN) {
          const nextFails = failedAttempts + 1;
          if (nextFails >= MAX_PIN_ATTEMPTS) {
            setFailedAttempts(0);
            setLockUntil(Date.now() + PIN_LOCKOUT_MS);
            setError(LOCKOUT_MESSAGE);
          } else {
            setFailedAttempts(nextFails);
            setError("That PIN is not correct. Use the educational demo PIN 1234.");
          }
          setPin("");
          return;
        }
        const persist = setManagerUnlocked(true);
        if (!persist.ok) {
          setError(persist.message);
          return;
        }
        setFailedAttempts(0);
        setLockUntil(0);
        setUnlocked(true);
        setPin("");
      } catch {
        setError("MoonGuide AI could not unlock the dashboard. Please try again.");
      } finally {
        unlockingRef.current = false;
        setUnlocking(false);
      }
    }, delayMs);
  }

  function handleLock() {
    try {
      const persist = setManagerUnlocked(false);
      setUnlocked(false);
      setPin("");
      setError(persist.ok ? "" : persist.message);
    } catch {
      setUnlocked(false);
      setPin("");
      setError("MoonGuide AI could not save manager access in this browser.");
    }
  }

  function handlePinChange(event) {
    const next = String(event.target.value || "")
      .replace(/\D/g, "")
      .slice(0, PIN_LENGTH);
    setPin(next);
    if (error && Date.now() >= lockUntil) setError("");
  }

  if (!unlocked) {
    return (
      <Card title="Manager dashboard" titleId="manager-lock-heading" className="pin-card">
        <p>
          This educational prototype uses a demonstration PIN only. It is not
          production authentication. Do not use this pattern for a production system.
        </p>
        <form onSubmit={handleUnlock} noValidate>
          <label htmlFor="manager-pin">Manager PIN</label>
          <input
            id="manager-pin"
            name="pin"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={PIN_LENGTH}
            value={pin}
            onChange={handlePinChange}
            required
            disabled={unlocking || lockedOut}
            aria-invalid={Boolean(error)}
            aria-describedby="pin-help pin-error"
            aria-required="true"
          />
          <p id="pin-help" className="helper">
            Enter the 4-digit classroom demonstration PIN. The PIN stays in this browser
            and is not sent to the assistant service. Do not use a real personal PIN.
          </p>
          <Button type="submit" disabled={unlocking || lockedOut || pin.length === 0} aria-busy={unlocking}>
            {unlocking ? "Checking PIN…" : "Unlock dashboard"}
          </Button>
          {unlocking && <LoadingIndicator label="Checking the demonstration PIN…" />}
          <StatusMessage id="pin-error" tone="error" reserve>
            {error}
          </StatusMessage>
        </form>
      </Card>
    );
  }

  const safeStats = {
    totalQuestions: Number(stats?.totalQuestions) || 0,
    helpful: Number(stats?.helpful) || 0,
    notHelpful: Number(stats?.notHelpful) || 0,
    needsReview: Number(stats?.needsReview) || 0,
    categories: stats?.categories && typeof stats.categories === "object" ? stats.categories : {},
    assistantCount: Number(stats?.assistantCount) || 0
  };
  const categoryEntries = Object.entries(safeStats.categories);
  const conversationCount = Array.isArray(messages)
    ? messages.filter((item) => item?.role === "assistant" && item.id !== "welcome").length
    : safeStats.assistantCount;

  return (
    <div className="page-stack">
      <Card
        title="Manager dashboard"
        titleId="manager-heading"
        description={
          <p className="muted">
            Demonstration access only. Demo PIN: 1234. Use this dashboard to review questions
            that need a person. It does not approve sales or replace identification checks.
          </p>
        }
        actions={
          <Button variant="ghost" onClick={handleLock}>
            Lock dashboard
          </Button>
        }
      />
      <StatGrid
        items={[
          { label: "Total questions", value: safeStats.totalQuestions },
          { label: "Helpful responses", value: safeStats.helpful },
          { label: "Not helpful", value: safeStats.notHelpful },
          { label: "Responses needing review", value: safeStats.needsReview }
        ]}
      />
      <Card title="Answer categories" titleId="manager-categories-heading">
        {categoryEntries.length === 0 ? (
          <EmptyState>No categorized answers yet.</EmptyState>
        ) : (
          <ul className="category-bars">
            {categoryEntries.map(([name, count]) => (
              <li key={name}>
                <span>{name}</span>
                <span>{count}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card title="Feedback records" titleId="manager-feedback-heading">
        <FeedbackTable feedback={feedback} />
      </Card>
      <Card title="Conversation snapshot" titleId="manager-snapshot-heading">
        {conversationCount === 0 ? (
          <EmptyState>No assistant replies are stored in this browser yet.</EmptyState>
        ) : (
          <p className="muted">
            {conversationCount} assistant replies are stored in this browser.
          </p>
        )}
      </Card>
    </div>
  );
}
