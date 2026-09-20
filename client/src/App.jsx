import { useCallback, useEffect, useMemo, useState } from "react";
import SiteHeader from "./components/layout/SiteHeader.jsx";
import SiteFooter from "./components/layout/SiteFooter.jsx";
import StatusMessage from "./components/StatusMessage.jsx";
import GuestPage from "./pages/GuestPage.jsx";
import StaffPage from "./pages/StaffPage.jsx";
import ManagerPage from "./pages/ManagerPage.jsx";
import {
  createId,
  loadChat,
  loadFeedback,
  loadRole,
  saveChat,
  saveFeedback,
  saveRole
} from "./services/storage.js";
import { isAllowedRole } from "./services/validation.js";
import { WELCOME_MESSAGE } from "./data/constants.js";
import { buildStats } from "./utils/analytics.js";
import { usePersistentState } from "./hooks/usePersistentState.js";
import { pathToRole, syncRoleUrl } from "./utils/routes.js";

export default function App() {
  const [storageNotice, setStorageNotice] = useState("");

  const persistRole = useCallback((nextRole) => {
    try {
      const result = saveRole(nextRole);
      if (!result.ok) setStorageNotice(result.message);
    } catch {
      setStorageNotice("MoonGuide AI could not save your selected role in this browser.");
    }
  }, []);

  const persistChat = useCallback((nextMessages) => {
    try {
      const result = saveChat(nextMessages);
      if (!result.ok) setStorageNotice(result.message);
    } catch {
      setStorageNotice(
        "MoonGuide AI could not save information in this browser. Chat and feedback may not persist after refresh."
      );
    }
  }, []);

  const persistFeedback = useCallback((nextFeedback) => {
    try {
      const result = saveFeedback(nextFeedback);
      if (!result.ok) setStorageNotice(result.message);
    } catch {
      setStorageNotice(
        "MoonGuide AI could not save information in this browser. Chat and feedback may not persist after refresh."
      );
    }
  }, []);

  const [role, setRole] = usePersistentState(() => {
    const fromPath = pathToRole(window.location.pathname);
    if (fromPath && isAllowedRole(fromPath)) return fromPath;
    return loadRole();
  }, persistRole);
  const [messages, setMessages] = usePersistentState(loadChat, persistChat);
  const [feedback, setFeedback] = usePersistentState(loadFeedback, persistFeedback);

  const stats = useMemo(() => buildStats(messages, feedback), [messages, feedback]);

  useEffect(() => {
    syncRoleUrl(role, { replace: true });
  }, [role]);

  useEffect(() => {
    function onPopState() {
      const fromPath = pathToRole(window.location.pathname);
      const nextRole = fromPath && isAllowedRole(fromPath) ? fromPath : "guest";
      setRole(nextRole);
      persistRole(nextRole);
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [persistRole, setRole]);

  function handleRoleChange(nextRole) {
    try {
      if (!isAllowedRole(nextRole) || nextRole === role) return;
      setRole(nextRole);
      persistRole(nextRole);
      syncRoleUrl(nextRole);
    } catch {
      setStorageNotice("MoonGuide AI could not switch roles in this browser. Please try again.");
    }
  }

  function handleClearChat() {
    try {
      const confirmed = window.confirm(
        "Clear the saved conversation? Feedback records will remain for the manager dashboard."
      );
      if (!confirmed) return;
      setMessages([WELCOME_MESSAGE]);
      persistChat([WELCOME_MESSAGE]);
    } catch {
      setStorageNotice("MoonGuide AI could not clear the conversation. Please try again.");
    }
  }

  function handleFeedback(message, rating) {
    try {
      if (!message?.id || (rating !== "helpful" && rating !== "not-helpful")) {
        return;
      }

      setMessages((current) => {
        const list = Array.isArray(current) ? current : [];
        const next = list.map((item) =>
          item.id === message.id ? { ...item, feedback: rating } : item
        );
        persistChat(next);
        return next;
      });
      const record = {
        id: createId("fb"),
        messageId: message.id,
        rating,
        question: message.question || "",
        answer: message.answer || "",
        category: message.sourceCategory || "Unknown",
        needsReview: Boolean(message.needsReview),
        createdAt: new Date().toISOString()
      };
      setFeedback((current) => {
        const list = Array.isArray(current) ? current : [];
        const next = [record, ...list.filter((item) => item.messageId !== message.id)];
        persistFeedback(next);
        return next;
      });
    } catch {
      setStorageNotice("MoonGuide AI could not save that feedback in this browser.");
    }
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <SiteHeader role={role} onRoleChange={handleRoleChange} />
      <main id="main" className="app-main" tabIndex={-1}>
        {storageNotice && <StatusMessage tone="error">{storageNotice}</StatusMessage>}
        {role === "guest" && (
          <GuestPage
            messages={messages}
            setMessages={setMessages}
            persistChat={persistChat}
            onFeedback={handleFeedback}
            onClearChat={handleClearChat}
          />
        )}
        {role === "staff" && <StaffPage messages={messages} feedback={feedback} />}
        {role === "manager" && (
          <ManagerPage stats={stats} feedback={feedback} messages={messages} />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
