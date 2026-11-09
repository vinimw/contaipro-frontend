"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { mobileNavigation, type NavigationItem } from "@/lib/navigation";

function NavigationLink({ item, pathname }: { item: NavigationItem; pathname: string }) {
  const { href, icon: Icon, shortLabel: label, highlight } = item;
  const active = pathname.startsWith(href);

  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-[10px] text-[8px] font-bold uppercase leading-tight transition",
          active
            ? "text-[var(--color-primary)]"
            : "text-slate-500 hover:bg-[var(--color-primary-soft)] hover:text-[#071a3d]",
          highlight && !active && "text-[#071a3d]",
        )}
      >
        {/* The bar makes the active state visible without relying only on color. */}
        {active ? (
          <span aria-hidden="true" className="absolute inset-x-3 -top-2 h-0.5 rounded-full bg-[var(--color-primary)]" />
        ) : null}
        <span
          className={cn(
            "inline-flex size-6 items-center justify-center rounded-full transition",
            highlight && !active && "bg-[var(--color-primary-soft)]",
          )}
        >
          <Icon className="size-5" />
        </span>
        <span>{label}</span>
      </Link>
    </li>
  );
}

export function BottomNavigation({
  onQuickExpenseClick,
}: {
  onQuickExpenseClick: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-100 bg-white px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_28px_rgba(15,23,42,0.08)] md:hidden"
    >
      <ul className="grid grid-cols-6 items-end gap-0.5">
        {mobileNavigation.beforeAction.map((item) => (
          <NavigationLink key={item.href} item={item} pathname={pathname} />
        ))}
        <li>
          <button
            aria-label="Adicionar gasto rápido"
            className="-mt-7 flex h-14 w-full flex-col items-center justify-center gap-1 text-[9px] font-bold uppercase text-slate-500 transition"
            type="button"
            onClick={onQuickExpenseClick}
          >
            <span className="inline-flex size-14 items-center justify-center rounded-[10px] bg-[var(--color-primary)] text-[#071a3d] shadow-[0_14px_24px_rgba(224,173,0,0.34)]">
              <Plus className="size-7" />
            </span>
          </button>
        </li>
        {mobileNavigation.afterAction.map((item) => (
          <NavigationLink key={item.href} item={item} pathname={pathname} />
        ))}
      </ul>
    </nav>
  );
}
