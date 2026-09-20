import EmptyState from "./EmptyState.jsx";

export default function StatGrid({ items }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <EmptyState>No summary numbers are available yet.</EmptyState>;
  }

  return (
    <div className="stats-grid">
      {items.map((item) => (
        <article key={item.label} className="stat-card">
          <p>{item.label}</p>
          <strong aria-label={`${item.label}: ${item.value}`}>{item.value}</strong>
        </article>
      ))}
    </div>
  );
}
