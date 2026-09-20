const ROLE_PATHS = {
  "/": "guest",
  "/guest": "guest",
  "/staff": "staff",
  "/manager": "manager"
};

export function pathToRole(pathname) {
  const raw = String(pathname || "/")
    .split("?")[0]
    .split("#")[0]
    .trim();
  const withoutTrailing = raw.replace(/\/+$/, "");
  const key = withoutTrailing === "" ? "/" : withoutTrailing.toLowerCase();
  const normalized = key.startsWith("/") ? key : `/${key}`;
  return ROLE_PATHS[normalized] || null;
}

export function roleToPath(role) {
  if (role === "staff") return "/staff";
  if (role === "manager") return "/manager";
  return "/";
}

export function syncRoleUrl(role, { replace = false } = {}) {
  if (typeof window === "undefined") return;
  const currentRole = pathToRole(window.location.pathname);
  if (currentRole === role) return;
  const nextPath = roleToPath(role);
  const state = { role };
  if (replace) {
    window.history.replaceState(state, "", nextPath);
  } else {
    window.history.pushState(state, "", nextPath);
  }
}
