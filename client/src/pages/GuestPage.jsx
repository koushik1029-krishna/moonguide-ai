import { useState } from "react";
import ChatPanel from "../components/ChatPanel.jsx";
import StoreInfoCard from "../components/StoreInfoCard.jsx";
import SuggestedQuestions from "../components/SuggestedQuestions.jsx";
import LimitationsCard from "../components/LimitationsCard.jsx";

export default function GuestPage({ messages, setMessages, persistChat, onFeedback, onClearChat }) {
  const [queuedQuestion, setQueuedQuestion] = useState("");
  const [chatBusy, setChatBusy] = useState(false);

  return (
    <div className="page-grid">
      <div className="primary-column">
        <SuggestedQuestions onSelect={setQueuedQuestion} disabled={chatBusy} />
        <ChatPanel
          messages={messages}
          setMessages={setMessages}
          persistChat={persistChat}
          onFeedback={onFeedback}
          onClearChat={onClearChat}
          queuedQuestion={queuedQuestion}
          onQueuedQuestionHandled={() => setQueuedQuestion("")}
          onBusyChange={setChatBusy}
        />
      </div>
      <div className="side-column">
        <StoreInfoCard />
        <LimitationsCard />
      </div>
    </div>
  );
}
