import Card from "../components/ui/Card.jsx";
import RecordList from "../components/ui/RecordList.jsx";
import StatGrid from "../components/ui/StatGrid.jsx";
import {
  getRestrictedMessages,
  getReviewMessages,
  getUserQuestions
} from "../utils/analytics.js";

export default function StaffPage({ messages, feedback }) {
  const questions = getUserQuestions(messages);
  const reviews = getReviewMessages(messages);
  const restricted = getRestrictedMessages(messages);
  const safeFeedback = Array.isArray(feedback) ? feedback : [];

  return (
    <div className="page-stack">
      <Card title="Staff workspace" titleId="staff-heading">
        <p>
          Use this view to see customer questions that still need a trained employee.
          MoonGuide AI never makes a final restricted-sale decision and cannot replace a
          legally required identification check. Complete ID verification in person before
          any age-restricted sale.
        </p>
      </Card>
      <StatGrid
        items={[
          { label: "Customer questions", value: questions.length },
          { label: "Need employee review", value: reviews.length },
          { label: "Restricted escalations", value: restricted.length }
        ]}
      />
      <Card title="Questions needing employee assistance" titleId="staff-review-heading">
        <RecordList
          items={reviews}
          empty="No escalated questions yet."
          renderItem={(item) => (
            <>
              <p>
                <strong>{item.question}</strong>
              </p>
              <p>{item.answer}</p>
              <p className="citation">
                {item.restricted ? "Restricted-sale escalation" : "Needs review"} ·{" "}
                {item.sourceCategory}
              </p>
            </>
          )}
        />
      </Card>
      <Card title="Recent customer questions" titleId="staff-questions-heading">
        <RecordList
          items={questions}
          empty="No customer questions yet."
          renderItem={(item) => item.question}
        />
      </Card>
      <Card title="Feedback snapshot" titleId="staff-feedback-heading">
        <RecordList
          items={safeFeedback.slice(0, 8)}
          empty="No feedback recorded yet."
          renderItem={(item) =>
            `${item.rating === "helpful" ? "Helpful" : "Not helpful"}: ${item.question}`
          }
        />
      </Card>
    </div>
  );
}
