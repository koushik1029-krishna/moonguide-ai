import { forwardRef } from "react";

const Button = forwardRef(function Button(
  {
    variant = "primary",
    selected = false,
    className = "",
    type = "button",
    children,
    ...props
  },
  ref
) {
  const variantClass = {
    primary: "primary",
    ghost: "ghost",
    chip: "chip",
    role: "role-btn",
    feedback: "feedback"
  }[variant];

  const stateClass = selected ? (variant === "role" ? "active" : "selected") : "";

  return (
    <button
      ref={ref}
      type={type}
      className={[variantClass, stateClass, className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;
