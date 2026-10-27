"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  ChevronRight,
  CircleAlert,
  Loader2,
  WalletCards,
} from "lucide-react";

import { formatCurrencyBRL } from "@/lib/currency";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import { notificationsService } from "@/services/notifications.service";
import type { AppNotification } from "@/types/notification";

const notificationDestination = {
  overdue_bills: "/app/overdue",
  missing_income: "/app/income",
} as const;

function NotificationRow({
  item,
  onNavigate,
}: {
  item: AppNotification;
  onNavigate: () => void;
}) {
  const isOverdue = item.type === "overdue_bills";
  const Icon = isOverdue ? CircleAlert : WalletCards;

  return (
    <Link
      className="flex items-center gap-3 rounded-[10px] border border-slate-100 bg-slate-50 p-3 transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]"
      href={notificationDestination[item.type]}
      onClick={onNavigate}
    >
      <span
        className={cn(
          "inline-flex size-10 shrink-0 items-center justify-center rounded-[10px]",
          isOverdue
            ? "bg-rose-100 text-rose-700"
            : "bg-[var(--color-primary-soft)] text-[#071a3d]",
        )}
      >
        <Icon className="size-4.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-slate-900">{item.title}</span>
        <span className="mt-0.5 block text-xs text-slate-500">
          {isOverdue
            ? `${item.quantity} ${item.quantity === 1 ? "vencimento" : "vencimentos"} · ${formatCurrencyBRL(item.amount)}`
            : "Confira seu perfil financeiro"}
        </span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-slate-400" />
    </Link>
  );
}

export function NotificationBell({ compact = false }: { compact?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: notificationsService.list,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  const count = notificationsQuery.data?.total_count ?? 0;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={
          count
            ? `Notificações: ${count} ${count === 1 ? "pendência" : "pendências"}`
            : "Notificações"
        }
        className={cn(
          "relative inline-flex items-center justify-center rounded-[10px] bg-[var(--color-brand-blue-soft)] text-[var(--color-brand-blue)] transition hover:bg-blue-100",
          compact ? "size-9" : "size-12",
        )}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
      >
        <Bell className={compact ? "size-4" : "size-5"} />
        {count ? (
          <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-white ring-2 ring-white">
            {count > 9 ? "9+" : count}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div
          aria-label="Central de notificações"
          className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(22rem,calc(100vw-2.5rem))] rounded-[10px] border border-slate-200 bg-white p-4 shadow-[0_24px_64px_rgba(15,23,42,0.18)]"
          role="dialog"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-slate-900">Notificações</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Pendências que precisam da sua atenção.
              </p>
            </div>
            {notificationsQuery.isFetching ? (
              <Loader2 className="size-4 animate-spin text-slate-400" />
            ) : null}
          </div>

          <div className="mt-4 space-y-2">
            {notificationsQuery.isPending ? (
              <div className="flex items-center gap-2 py-5 text-sm text-slate-500">
                <Loader2 className="size-4 animate-spin" />
                Carregando notificações...
              </div>
            ) : null}
            {notificationsQuery.error ? (
              <div className="rounded-[10px] bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {notificationsQuery.error.message}
              </div>
            ) : null}
            {!notificationsQuery.isPending &&
            !notificationsQuery.error &&
            !notificationsQuery.data?.items.length ? (
              <div className="py-5 text-center">
                <p className="text-sm font-semibold text-slate-800">Tudo em dia</p>
                <p className="mt-1 text-xs text-slate-500">
                  Nenhuma pendência encontrada.
                </p>
              </div>
            ) : null}
            {notificationsQuery.data?.items.map((item) => (
              <NotificationRow
                key={item.type}
                item={item}
                onNavigate={() => setIsOpen(false)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
