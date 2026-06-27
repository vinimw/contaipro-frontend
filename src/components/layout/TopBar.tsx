"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Bell, LogOut } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

const titles: Record<string, string> = {
  "/app/dashboard": "Resumo do mes",
  "/app/monthly": "Mês a mês",
  "/app/bills": "Contas fixas",
  "/app/income": "Renda e perfil",
  "/app/expenses": "Gastos rapidos",
  "/app/settings": "Configuracoes",
};

export function TopBar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const title = useMemo(() => {
    const exactMatch = Object.keys(titles).find((item) => pathname.startsWith(item));
    return exactMatch ? titles[exactMatch] : "Contaí Pro";
  }, [pathname]);

  return (
    <header className="hidden md:block">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-primary-strong)]">
            {pathname.startsWith("/app/dashboard") ? "Dashboard" : "Contaí Pro"}
          </p>
          <p className="mt-1 text-xl font-bold text-slate-900">{title}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="rounded-[10px] bg-slate-100 px-5 py-3 text-base text-slate-700">
            {user?.name ? `Ola, ${user.name.split(" ")[0]}` : "Seu painel financeiro"}
          </div>
          <span className="inline-flex size-12 items-center justify-center rounded-[10px] bg-[var(--color-brand-blue-soft)] text-[var(--color-brand-blue)]">
            <Bell className="size-5" />
          </span>
          <Button className="min-h-0 px-0 py-0 text-base text-slate-600 hover:bg-transparent" variant="ghost" onClick={logout}>
            <LogOut className="mr-2 size-5" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
