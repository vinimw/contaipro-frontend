"use client";

import dynamic from "next/dynamic";

function QuickExpenseFormSkeleton() {
  const field = (
    <div className="flex flex-col gap-2">
      <div className="h-5 w-16 rounded-[10px] bg-slate-200" />
      <div className="h-12 rounded-[10px] bg-slate-100" />
    </div>
  );

  return (
    <div aria-busy="true" aria-label="Carregando formulário" className="animate-pulse space-y-4">
      {field}
      <div className="grid gap-4 sm:grid-cols-2">
        {field}
        {field}
      </div>
      <div className="h-12 rounded-[10px] bg-slate-200" />
    </div>
  );
}

// Keeps zod and react-hook-form out of the bundle until the quick expense modal opens.
export const LazyQuickExpenseForm = dynamic(
  () => import("@/components/dashboard/QuickExpenseForm").then((mod) => mod.QuickExpenseForm),
  { ssr: false, loading: () => <QuickExpenseFormSkeleton /> },
);
