import { useRef } from "react";
import Button from "../ui/Button.jsx";

const ROLES = [
  { id: "guest", label: "Guest" },
  { id: "staff", label: "Staff" },
  { id: "manager", label: "Manager" }
];

export default function SiteHeader({ role, onRoleChange }) {
  const buttonRefs = useRef({});

  function moveToRole(nextRole) {
    if (!nextRole || nextRole === role) {
      buttonRefs.current[nextRole]?.focus();
      return;
    }
    onRoleChange(nextRole);
    window.requestAnimationFrame(() => {
      buttonRefs.current[nextRole]?.focus();
    });
  }

  function handleKeyDown(event) {
    const index = ROLES.findIndex((item) => item.id === role);
    if (index < 0) return;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      moveToRole(ROLES[(index + 1) % ROLES.length].id);
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      moveToRole(ROLES[(index - 1 + ROLES.length) % ROLES.length].id);
    }
    if (event.key === "Home") {
      event.preventDefault();
      moveToRole(ROLES[0].id);
    }
    if (event.key === "End") {
      event.preventDefault();
      moveToRole(ROLES[ROLES.length - 1].id);
    }
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            MG
          </span>
          <div>
            <p className="brand-kicker">Moon's Food Store</p>
            <h1>MoonGuide AI</h1>
          </div>
        </div>
        <nav className="role-nav" aria-label="Application roles" onKeyDown={handleKeyDown}>
          <p id="role-nav-help" className="sr-only">
            Guest, Staff, and Manager views. Use arrow keys, Home, or End to move between roles.
          </p>
          {ROLES.map((item) => (
            <Button
              key={item.id}
              variant="role"
              selected={role === item.id}
              onClick={() => onRoleChange(item.id)}
              aria-current={role === item.id ? "page" : undefined}
              aria-describedby="role-nav-help"
              tabIndex={role === item.id ? 0 : -1}
              ref={(node) => {
                buttonRefs.current[item.id] = node;
              }}
            >
              {item.label}
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}
