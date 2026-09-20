export default function Card({
  as: Tag = "section",
  title,
  titleId,
  description,
  actions,
  className = "",
  children,
  ...props
}) {
  return (
    <Tag className={`card ${className}`.trim()} aria-labelledby={titleId} {...props}>
      {(title || actions) && (
        <div className={actions ? "toolbar-row" : undefined}>
          <div>
            {title && (
              <h2 id={titleId}>{title}</h2>
            )}
            {description}
          </div>
          {actions}
        </div>
      )}
      {children}
    </Tag>
  );
}
