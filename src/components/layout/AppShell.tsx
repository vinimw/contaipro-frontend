"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Banknote,
  Landmark,
  LayoutDashboard,
  CalendarDays,
  ReceiptText,
  Settings,
} from "lucide-react";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { TopBar } from "@/components/layout/TopBar";
import {
  QuickExpenseForm,
  type QuickExpenseFormValues,
} from "@/components/dashboard/QuickExpenseForm";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Modal } from "@/components/ui/Modal";
import { QUICK_EXPENSE_CREATED_EVENT } from "@/lib/events";
import { cn } from "@/lib/utils";
import { quickExpensesService } from "@/services/quick-expenses.service";

const navigation = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/monthly", label: "Mês a mês", icon: CalendarDays },
  { href: "/app/bills", label: "Contas", icon: Landmark },
  { href: "/app/income", label: "Renda", icon: Banknote },
  { href: "/app/expenses", label: "Gastos", icon: ReceiptText },
  { href: "/app/settings", label: "Configuracoes", icon: Settings },
];

export function AppShell({
  pathname,
  children,
}: {
  pathname: string;
  children: React.ReactNode;
}) {
  const [quickExpenseOpen, setQuickExpenseOpen] = useState(false);
  const [quickExpenseError, setQuickExpenseError] = useState("");

  async function handleQuickExpenseSubmit(values: QuickExpenseFormValues) {
    setQuickExpenseError("");

    try {
      await quickExpensesService.create({
        name: values.name,
        amount: values.amount,
        expense_date: values.expense_date || null,
      });
      window.dispatchEvent(new Event(QUICK_EXPENSE_CREATED_EVENT));
      setQuickExpenseOpen(false);
    } catch (error) {
      setQuickExpenseError(
        error instanceof Error ? error.message : "Nao foi possivel criar o gasto rapido.",
      );
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 md:grid md:grid-cols-[318px_1fr] md:pb-0">
      <aside className="hidden min-h-screen border-r border-slate-200 bg-white px-6 py-8 md:block">
        <div>
          <BrandLogo className="w-52" />
        </div>
        <nav className="mt-12 space-y-5">
            {navigation.map(({ href, icon: Icon, label }) => {
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
      <BottomNavigation
        onQuickExpenseClick={() => {
          setQuickExpenseError("");
          setQuickExpenseOpen(true);
        }}
      />
      <Modal
        open={quickExpenseOpen}
        title="Novo gasto rapido"
        onClose={() => setQuickExpenseOpen(false)}
      >
        <div className="space-y-4">
          {quickExpenseError ? <ErrorMessage message={quickExpenseError} /> : null}
          <QuickExpenseForm onSubmit={handleQuickExpenseSubmit} />
        </div>
      </Modal>
    </div>
  );
}
