export default function StatusMessage({ tone = "info", children, id, reserve = false }) {
  if (!children && !reserve) return null;
  const className =
    tone === "error" ? "status-message alert" : tone === "success" ? "status-message success" : "status-message";
  const hasText = Boolean(children);
  return (
    <p
      id={id}
      className={className}
      role={hasText ? (tone === "error" ? "alert" : "status") : undefined}
      aria-live={hasText ? (tone === "error" ? "assertive" : "polite") : "off"}
    >
      {children}
    </p>
  );
}
