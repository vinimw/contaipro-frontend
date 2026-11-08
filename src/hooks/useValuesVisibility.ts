"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  areValuesHidden,
  setValuesHidden,
  subscribeToValuesVisibility,
} from "@/lib/values-visibility";

export function useValuesVisibility() {
  const hidden = useSyncExternalStore(subscribeToValuesVisibility, areValuesHidden, () => false);
  const toggle = useCallback(() => setValuesHidden(!areValuesHidden()), []);

  return { hidden, toggle };
}
