import type { ComponentType } from "react";
import { Banknote, CalendarDays, Landmark, LayoutDashboard, ReceiptText, Settings } from "lucide-react";

import { InvestIcon } from "@/components/layout/InvestIcon";

export type NavigationItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: ComponentType<{ className?: string }>;
  highlight?: boolean;
};

const dashboard: NavigationItem = { href: "/app/dashboard", label: "Dashboard", shortLabel: "Dashboard", icon: LayoutDashboard };
const monthly: NavigationItem = { href: "/app/monthly", label: "Mês a mês", shortLabel: "Mês a mês", icon: CalendarDays };
const bills: NavigationItem = { href: "/app/bills", label: "Contas", shortLabel: "Contas", icon: Landmark };
const income: NavigationItem = { href: "/app/income", label: "Renda", shortLabel: "Renda", icon: Banknote };
const expenses: NavigationItem = { href: "/app/expenses", label: "Gastos", shortLabel: "Gastos", icon: ReceiptText };
const investments: NavigationItem = {
  href: "/app/investments",
  label: "Invista",
  shortLabel: "Invista",
  icon: InvestIcon,
  highlight: true,
};
const settings: NavigationItem = { href: "/app/settings", label: "Configurações", shortLabel: "Ajustes", icon: Settings };

/** Desktop sidebar: every destination. */
export const appNavigation: readonly NavigationItem[] = [dashboard, monthly, bills, income, expenses, investments, settings];

/**
 * Mobile bottom bar: five links around the quick-expense action (six grid cells).
 * The action position is explicit here and no longer depends on any specific link.
 */
export const mobileNavigation = {
  beforeAction: [dashboard, monthly, bills],
  afterAction: [expenses, investments],
} as const;

/** Mobile top-right menu: destinations removed from the bottom bar. */
export const mobileMenuNavigation: readonly NavigationItem[] = [income, settings];
