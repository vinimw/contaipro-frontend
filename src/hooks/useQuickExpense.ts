"use client";

import { createContext, useContext } from "react";

type QuickExpenseContextValue = {
  openQuickExpense: () => void;
};

export const QuickExpenseContext = createContext<QuickExpenseContextValue | null>(null);

export function useQuickExpense() {
  const context = useContext(QuickExpenseContext);

  if (!context) {
    throw new Error("useQuickExpense must be used within AppShell");
  }

  return context;
}
