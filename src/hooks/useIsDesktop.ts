"use client";

import { useSyncExternalStore } from "react";

const desktopQuery = "(min-width: 768px)";

function subscribe(onChange: () => void) {
  const mediaQuery = window.matchMedia(desktopQuery);
  mediaQuery.addEventListener("change", onChange);

  return () => mediaQuery.removeEventListener("change", onChange);
}

// Reads the breakpoint on the first client render, so layouts mount once with the right variant.
export function useIsDesktop() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(desktopQuery).matches,
    () => false,
  );
}
