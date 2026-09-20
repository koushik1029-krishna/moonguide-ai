import EmptyState from "./EmptyState.jsx";

export default function RecordList({ items, empty, renderItem }) {
  const list = Array.isArray(items) ? items.filter(Boolean) : [];
  if (!list.length) {
    return <EmptyState>{empty}</EmptyState>;
  }

  return (
    <ul className="record-list">
      {list.map((item, index) => (
        <li key={item.id || item.question || index}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
