"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  RotateCcw,
  ShoppingBasket,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrencyBRL } from "@/lib/currency";
import {
  addMonth,
  formatMonthLabel,
  getCurrentMonth,
  subtractMonth,
} from "@/lib/dates";
import { QUICK_EXPENSE_CREATED_EVENT } from "@/lib/events";
import { cn } from "@/lib/utils";
import { billPaymentsService } from "@/services/bill-payments.service";
import { quickExpensesService } from "@/services/quick-expenses.service";
import type {
  BillPayment,
  BillPaymentStatus,
  MonthlyItem,
} from "@/types/bill-payment";

type PaymentTotals = {
  paid: number;
  pending: number;
  overdue: number;
  total: number;
};

const statusLabel: Record<BillPaymentStatus, string> = {
  paid: "Pago",
  pending: "Agendado",
  overdue: "Urgente",
};

const statusClasses: Record<BillPaymentStatus, string> = {
  paid: "bg-emerald-50 text-emerald-700",
  pending: "bg-slate-100 text-slate-600",
  overdue: "bg-rose-50 text-rose-700",
};

const iconClasses: Record<BillPaymentStatus, string> = {
  paid: "bg-emerald-50 text-emerald-600",
  pending: "bg-[var(--color-primary-soft)] text-[#071a3d]",
  overdue: "bg-rose-50 text-rose-600",
};

function getValidMonth(value: string | null) {
  if (value && /^\d{4}-\d{2}$/.test(value)) {
    return value;
  }

  return null;
}

function getTotals(items: MonthlyItem[]): PaymentTotals {
  return items.reduce(
    (totals, item) => ({
      paid: totals.paid + (item.status === "paid" ? item.amount : 0),
      pending: totals.pending + (item.status === "pending" ? item.amount : 0),
      overdue: totals.overdue + (item.status === "overdue" ? item.amount : 0),
      total: totals.total + item.amount,
    }),
    { paid: 0, pending: 0, overdue: 0, total: 0 },
  );
}

function isPaymentItem(item: MonthlyItem) {
  return item.item_type === "bill_payment";
}

function isDeletableItem(item: MonthlyItem) {
  return item.item_type === "bill_payment" || item.item_type === "quick_expense";
}

function formatShortDate(value: string) {
  const dateParts = value.match(/^\d{4}-(\d{2})-(\d{2})/);

  if (dateParts) {
    return `${dateParts[2]}/${dateParts[1]}`;
  }

  return value;
}

function mergePaymentUpdate(item: MonthlyItem, payment: BillPayment): MonthlyItem {
  return {
    ...item,
    name: payment.bill_name ?? item.name,
    description: payment.bill_description ?? item.description,
    amount: payment.amount,
    occurrence_date: payment.due_date,
    reference_month: payment.reference_month,
    status: payment.status,
    paid_at: payment.paid_at ?? null,
    bill_id: payment.bill_id,
    bill_type: payment.bill_type ?? item.bill_type,
    recurrence_type: payment.recurrence_type ?? item.recurrence_type,
    due_day: payment.due_day ?? item.due_day,
    is_fixed: payment.is_fixed ?? item.is_fixed,
    is_single: payment.is_single ?? item.is_single,
  };
}

function ActionTooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-[10px] bg-slate-950 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100">
        {label}
      </span>
    </span>
  );
}

function MonthlyPageContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const month = getValidMonth(searchParams.get("month")) ?? getCurrentMonth();
  const [items, setItems] = useState<MonthlyItem[]>([]);
  const [busyPaymentId, setBusyPaymentId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MonthlyItem | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const totals = useMemo(() => getTotals(items), [items]);

  const updateMonth = useCallback(
    (nextMonth: string) => {
      const validMonth = getValidMonth(nextMonth);

      if (!validMonth) {
        return;
      }

      const params = new URLSearchParams(searchParams);
      params.set("month", validMonth);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await billPaymentsService.list(month);
      setItems(response.items);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erro ao carregar pagamentos do mês.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [month]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadPayments();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadPayments]);

  useEffect(() => {
    const handleQuickExpenseCreated = () => {
      void loadPayments();
    };

    window.addEventListener(QUICK_EXPENSE_CREATED_EVENT, handleQuickExpenseCreated);

    return () => {
      window.removeEventListener(QUICK_EXPENSE_CREATED_EVENT, handleQuickExpenseCreated);
    };
  }, [loadPayments]);

  async function togglePaymentStatus(item: MonthlyItem) {
    if (!isPaymentItem(item) || !item.status) {
      return;
    }

    setBusyPaymentId(item.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const updatedPayment =
        item.status === "paid"
          ? await billPaymentsService.markAsPending(item.id)
          : await billPaymentsService.markAsPaid(item.id);

      setItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.id === updatedPayment.id
            ? mergePaymentUpdate(currentItem, updatedPayment)
            : currentItem,
        ),
      );
      setSuccessMessage(
        item.status === "paid"
          ? "Pagamento voltou para pendente."
          : "Conta marcada como paga.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o pagamento.",
      );
    } finally {
      setBusyPaymentId(null);
    }
  }

  async function deleteItem() {
    if (!itemToDelete || !isDeletableItem(itemToDelete)) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsDeletingItem(true);

    try {
      if (itemToDelete.item_type === "bill_payment") {
        await billPaymentsService.remove(itemToDelete.id);
      } else {
        await quickExpensesService.remove(itemToDelete.id);
      }

      setItems((currentItems) =>
        currentItems.filter((currentItem) => currentItem.id !== itemToDelete.id),
      );
      setItemToDelete(null);
      setSuccessMessage("Gasto removido com sucesso.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível remover o gasto.",
      );
    } finally {
      setIsDeletingItem(false);
    }
  }

  return (
    <div className="space-y-6 md:space-y-4">
      <Card className="rounded-[10px] p-4 md:rounded-[10px] md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-primary-strong)] md:text-xs">
              Mês a mês
            </p>
            <h1 className="mt-3 text-3xl font-extrabold text-slate-900 md:mt-2 md:text-3xl">
              {formatMonthLabel(month)}
            </h1>
            <p className="mt-3 hidden max-w-2xl text-sm leading-6 text-slate-600 md:mt-2 md:block md:max-w-xl md:text-sm">
              Acompanhe as contas geradas para o mês selecionado e altere o status de
              pagamento sem sair da listagem.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-[auto_minmax(180px,220px)_auto] sm:gap-3">
            <Button
              className="rounded-[10px] bg-slate-100 px-2 text-xs text-slate-700 shadow-none hover:bg-slate-200 sm:px-4 sm:text-sm md:min-h-10 md:px-3"
              onClick={() => updateMonth(subtractMonth(month))}
            >
              <ChevronLeft className="mr-1 size-4 sm:mr-2" />
              Anterior
            </Button>
            <Input
              aria-label="Selecionar mês"
              className="min-w-0 px-2 text-center text-xs sm:px-3 sm:text-sm md:min-h-10 md:rounded-[10px]"
              type="month"
              value={month}
              onChange={(event) => updateMonth(event.target.value)}
            />
            <Button
              className="rounded-[10px] bg-[var(--color-primary)] px-2 text-xs text-[#071a3d] shadow-none hover:bg-[var(--color-primary-strong)] hover:text-white sm:px-4 sm:text-sm md:min-h-10 md:px-3"
              onClick={() => updateMonth(addMonth(month))}
            >
              Próximo
              <ChevronRight className="ml-1 size-4 sm:ml-2" />
            </Button>
          </div>
        </div>
      </Card>

      {successMessage ? (
        <div className="rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}
      {errorMessage ? <ErrorMessage message={errorMessage} /> : null}

      <section className="hidden gap-3 md:grid md:grid-cols-4">
        <Card className="rounded-[10px] p-4">
          <p className="text-xs font-medium text-slate-500">Total do mês</p>
          <p className="mt-2 text-xl font-extrabold text-slate-900">
            {formatCurrencyBRL(totals.total)}
          </p>
        </Card>
        <Card className="rounded-[10px] p-4">
          <p className="text-xs font-medium text-slate-500">Pago</p>
          <p className="mt-2 text-xl font-extrabold text-emerald-700">
            {formatCurrencyBRL(totals.paid)}
          </p>
        </Card>
        <Card className="rounded-[10px] p-4">
          <p className="text-xs font-medium text-slate-500">Pendente</p>
          <p className="mt-2 text-xl font-extrabold text-amber-700">
            {formatCurrencyBRL(totals.pending)}
          </p>
        </Card>
        <Card className="rounded-[10px] p-4">
          <p className="text-xs font-medium text-slate-500">Atrasado</p>
          <p className="mt-2 text-xl font-extrabold text-rose-700">
            {formatCurrencyBRL(totals.overdue)}
          </p>
        </Card>
      </section>

      <section className="space-y-4 md:space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 md:text-xl">Gastos do mês</h2>
          </div>
          <span className="hidden items-center gap-2 rounded-[10px] bg-[var(--color-primary-soft)] px-3 py-1.5 text-xs font-semibold text-[#071a3d] md:inline-flex">
            <CalendarDays className="size-3.5" />
            {items.length} contas
          </span>
        </div>

        {isLoading ? <LoadingState label="Carregando contas do mês..." /> : null}

        {!isLoading && !items.length ? (
          <EmptyState
            title="Nenhum gasto encontrado"
            description="Quando houver contas geradas para este mês, elas aparecerão aqui."
          />
        ) : null}

        {!isLoading && items.length ? (
          <div className="space-y-2">
            {items.map((item) => (
              <Card
                key={item.id}
                className={cn(
                  "rounded-[10px] p-4 shadow-[0_16px_34px_rgba(0,71,255,0.06)] md:rounded-[10px] md:px-3.5 md:py-2.5",
                  item.status === "overdue"
                    ? "border-rose-100 bg-rose-50/80"
                    : "border-white/80 bg-white",
                )}
              >
                <div className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3 md:grid-cols-[40px_minmax(0,1fr)_auto] md:gap-3">
                  <span
                    className={cn(
                      "inline-flex size-[52px] shrink-0 items-center justify-center rounded-[10px] md:size-10 md:rounded-[10px]",
                      item.status ? iconClasses[item.status] : "bg-[var(--color-brand-blue-soft)] text-[var(--color-brand-blue)]",
                    )}
                  >
                    {item.item_type === "quick_expense" ? (
                      <ShoppingBasket className="size-6 md:size-4.5" />
                    ) : item.status === "paid" ? (
                      <CheckCircle2 className="size-7 md:size-5" />
                    ) : (
                      <Clock3 className="size-6 md:size-4.5" />
                    )}
                  </span>

                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <h3 className="truncate text-xl font-semibold tracking-[-0.04em] text-slate-900 md:text-base md:leading-tight">
                        {item.name}
                      </h3>
                      <span
                        className={cn(
                          "shrink-0 rounded-[10px] px-2 py-1 text-[0.68rem] font-extrabold uppercase leading-none md:rounded-[10px] md:px-2 md:py-1 md:text-[0.65rem]",
                          item.status ? statusClasses[item.status] : "bg-[var(--color-brand-blue-soft)] text-[var(--color-brand-blue)]",
                        )}
                      >
                        {item.status ? statusLabel[item.status] : "Gasto"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-500 md:text-[0.72rem]">
                      {item.item_type === "bill_payment" ? "Vence" : "Data"}{" "}
                      {formatShortDate(item.occurrence_date)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <p className="min-w-[104px] text-right text-xl font-extrabold tracking-[-0.04em] text-slate-900 md:min-w-[112px] md:text-lg md:leading-tight">
                      {formatCurrencyBRL(item.amount)}
                    </p>

                    <div className="flex items-center gap-1.5">
                      {item.can_mark_as_paid || item.can_mark_as_pending ? (
                        <ActionTooltip
                          label={
                            item.status === "paid"
                              ? "Voltar para pendente"
                              : "Confirmar pagamento"
                          }
                        >
                          <Button
                            aria-label={
                              item.status === "paid"
                                ? `Voltar ${item.name} para pendente`
                                : `Confirmar pagamento de ${item.name}`
                            }
                            className={cn(
                              "size-11 min-h-0 rounded-[10px] p-0 shadow-none md:size-8",
                              item.status === "paid"
                                ? "bg-[var(--color-primary-soft)] text-[#8a6400] hover:bg-[#ffefb6]"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                            )}
                            disabled={busyPaymentId === item.id}
                            variant="secondary"
                            onClick={() => void togglePaymentStatus(item)}
                          >
                            {item.status === "paid" ? (
                              <RotateCcw className="size-5 md:size-3.5" />
                            ) : (
                              <CheckCircle2 className="size-5 md:size-3.5" />
                            )}
                          </Button>
                        </ActionTooltip>
                      ) : null}
                      {isDeletableItem(item) ? (
                        <ActionTooltip label="Excluir gasto">
                          <Button
                            aria-label={`Excluir ${item.name}`}
                            className="size-11 min-h-0 rounded-[10px] p-0 shadow-none md:size-8"
                            disabled={isDeletingItem && itemToDelete?.id === item.id}
                            variant="danger"
                            onClick={() => setItemToDelete(item)}
                          >
                            <Trash2 className="size-5 md:size-3.5" />
                          </Button>
                        </ActionTooltip>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : null}
      </section>
      <ConfirmDialog
        description={
          itemToDelete
            ? `O gasto "${itemToDelete.name}" de ${formatMonthLabel(itemToDelete.reference_month)} será removido. Essa ação não pode ser desfeita.`
            : ""
        }
        isLoading={isDeletingItem}
        open={Boolean(itemToDelete)}
        title="Excluir gasto?"
        onCancel={() => {
          if (!isDeletingItem) {
            setItemToDelete(null);
          }
        }}
        onConfirm={() => void deleteItem()}
      />
    </div>
  );
}

export default function MonthlyPage() {
  return (
    <Suspense fallback={<LoadingState label="Carregando mês selecionado..." />}>
      <MonthlyPageContent />
    </Suspense>
  );
}
