import { useEffect, useRef, useState } from "react";

export function usePersistentState(load, save) {
  const [value, setValue] = useState(() => {
    try {
      return typeof load === "function" ? load() : load;
    } catch {
      return typeof load === "function" ? undefined : load;
    }
  });
  const readyRef = useRef(false);

  useEffect(() => {
    if (!readyRef.current) {
      readyRef.current = true;
      return;
    }
    try {
      save(value);
    } catch {
      // Persistence helpers report user-facing errors themselves.
    }
  }, [value, save]);

  return [value, setValue];
}
