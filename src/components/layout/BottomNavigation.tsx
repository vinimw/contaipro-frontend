"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Banknote,
  CalendarDays,
  Landmark,
  LayoutDashboard,
  Plus,
  ReceiptText,
  Settings,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/monthly", label: "Mes a mes", icon: CalendarDays },
  { href: "/app/bills", label: "Contas", icon: Landmark },
  { href: "/app/income", label: "Renda", icon: Banknote },
  { href: "/app/expenses", label: "Gastos", icon: ReceiptText },
  { href: "/app/settings", label: "Ajustes", icon: Settings },
];

export function BottomNavigation({
  onQuickExpenseClick,
}: {
  onQuickExpenseClick: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-100 bg-white px-3 pb-4 pt-2 shadow-[0_-10px_28px_rgba(15,23,42,0.08)] md:hidden">
      <ul className="grid grid-cols-7 items-end gap-0.5">
        {navigation.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          const insertAction = href === "/app/income";

          return (
            <Fragment key={href}>
              {insertAction ? (
                <li key="quick-expense-action">
                  <button
                    aria-label="Adicionar gasto rápido"
                    className="-mt-7 flex h-14 w-full flex-col items-center justify-center gap-1 text-[9px] font-bold uppercase text-slate-500 transition"
                    onClick={onQuickExpenseClick}
                  >
                    <span className="inline-flex size-14 items-center justify-center rounded-[10px] bg-[var(--color-primary)] text-[#071a3d] shadow-[0_14px_24px_rgba(224,173,0,0.34)]">
                      <Plus className="size-7" />
                    </span>
                  </button>
                </li>
              ) : null}
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex h-14 flex-col items-center justify-center gap-1 text-[8px] font-bold uppercase leading-tight text-slate-500 transition",
                    active && "text-[var(--color-primary-strong)]",
                  )}
                >
                  <span className="inline-flex size-5 items-center justify-center">
                    <Icon className="size-5" />
                  </span>
                  <span>{label}</span>
                </Link>
              </li>
            </Fragment>
          );
        })}
      </ul>
    </nav>
  );
}
