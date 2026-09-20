import EmptyState from "./ui/EmptyState.jsx";

export default function FeedbackTable({ feedback }) {
  const rows = Array.isArray(feedback)
    ? feedback.filter((item) => item && (item.id || item.messageId))
    : [];

  if (rows.length === 0) {
    return <EmptyState>No feedback has been saved yet.</EmptyState>;
  }

  return (
    <div className="table-wrap">
      <table>
        <caption className="sr-only">Saved customer feedback</caption>
        <thead>
          <tr>
            <th scope="col">Rating</th>
            <th scope="col">Question</th>
            <th scope="col">Category</th>
            <th scope="col">Needs review</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item, index) => (
            <tr key={item.id || `${item.messageId}-${index}`}>
              <td>{item.rating === "helpful" ? "Helpful" : "Not Helpful"}</td>
              <td>{item.question || "—"}</td>
              <td>{item.category || "Unknown"}</td>
              <td>{item.needsReview ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
