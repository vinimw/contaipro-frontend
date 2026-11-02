"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { TopBar } from "@/components/layout/TopBar";
import { LazyQuickExpenseForm } from "@/components/dashboard/LazyQuickExpenseForm";
import type { QuickExpenseFormValues } from "@/components/dashboard/QuickExpenseForm";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { QuickExpenseContext } from "@/hooks/useQuickExpense";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { getCurrentMonth } from "@/lib/dates";
import { appNavigation } from "@/lib/navigation";
import { useExpenseMutations } from "@/hooks/useExpenseMutations";

export function AppShell({
  pathname,
  children,
}: {
  pathname: string;
  children: React.ReactNode;
}) {
  const { create: createExpense } = useExpenseMutations();
  const [quickExpenseOpen, setQuickExpenseOpen] = useState(false);
  const [quickExpenseError, setQuickExpenseError] = useState("");

  const openQuickExpense = useCallback(() => {
    setQuickExpenseError("");
    setQuickExpenseOpen(true);
  }, []);
  const quickExpenseContext = useMemo(() => ({ openQuickExpense }), [openQuickExpense]);

  async function handleQuickExpenseSubmit(values: QuickExpenseFormValues) {
    setQuickExpenseError("");

    try {
      const month = values.expense_date?.slice(0, 7) || getCurrentMonth();
      await createExpense.mutateAsync({ month, payload: { name: values.name, amount: values.amount, expense_date: values.expense_date || null } });
      setQuickExpenseOpen(false);
    } catch (error) {
      setQuickExpenseError(
        error instanceof Error ? error.message : "Não foi possível criar o gasto rápido.",
      );
    }
  }

  return (
    <QuickExpenseContext.Provider value={quickExpenseContext}>
      <div className="min-h-screen bg-[var(--background)] pb-24 md:grid md:grid-cols-[318px_1fr] md:pb-0">
        <aside className="hidden min-h-screen border-r border-slate-200 bg-white px-6 py-8 md:block">
          <div>
            <BrandLogo className="w-52" />
          </div>
          <nav className="mt-12 space-y-5">
              {appNavigation.map(({ href, icon: Icon, label }) => {
                const active = pathname.startsWith(href);

                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex h-14 items-center gap-4 rounded-[10px] px-4 text-lg font-medium transition",
                      active
                        ? "bg-[var(--color-primary)] text-[#071a3d] shadow-[0_18px_32px_rgba(224,173,0,0.22)]"
                        : "text-slate-600 hover:bg-slate-50 hover:text-[#071a3d]",
                    )}
                  >
                    <Icon className="size-6" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
        </aside>
        <div className="min-w-0 px-5 py-4 md:px-8 md:py-4">
          <TopBar />
          <main className="min-w-0 pt-6 md:pt-10">{children}</main>
        </div>
        <BottomNavigation onQuickExpenseClick={openQuickExpense} />
        <Modal
          open={quickExpenseOpen}
          title="Novo gasto rápido"
          onClose={() => setQuickExpenseOpen(false)}
        >
          <div className="space-y-4">
            {quickExpenseError ? <ErrorMessage message={quickExpenseError} /> : null}
            <LazyQuickExpenseForm onSubmit={handleQuickExpenseSubmit} />
          </div>
        </Modal>
      </div>
    </QuickExpenseContext.Provider>
  );
}
