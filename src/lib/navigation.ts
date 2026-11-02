import { Banknote, CalendarDays, Landmark, LayoutDashboard, ReceiptText, Settings } from "lucide-react";

export const appNavigation = [
  { href: "/app/dashboard", label: "Dashboard", shortLabel: "Dashboard", icon: LayoutDashboard },
  { href: "/app/monthly", label: "Mês a mês", shortLabel: "Mês a mês", icon: CalendarDays },
  { href: "/app/bills", label: "Contas", shortLabel: "Contas", icon: Landmark },
  { href: "/app/income", label: "Renda", shortLabel: "Renda", icon: Banknote },
  { href: "/app/expenses", label: "Gastos", shortLabel: "Gastos", icon: ReceiptText },
  { href: "/app/settings", label: "Configurações", shortLabel: "Ajustes", icon: Settings },
] as const;
