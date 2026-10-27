"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Loader2,
  ReceiptText,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrencyBRL } from "@/lib/currency";
import { formatDateBR, formatMonthLabel } from "@/lib/dates";
import { queryKeys } from "@/lib/query-keys";
import { billPaymentsService } from "@/services/bill-payments.service";
import type {
  OverdueBillPayment,
  OverdueBillPaymentsResponse,
} from "@/types/bill-payment";

export default function OverdueBillsPage() {
  const queryClient = useQueryClient();
  const [busyPaymentId, setBusyPaymentId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const overdueQuery = useQuery({
    queryKey: queryKeys.overduePayments,
    queryFn: billPaymentsService.listOverdue,
  });

  async function markAsPaid(item: OverdueBillPayment) {
    if (busyPaymentId) {
      return;
    }

    setBusyPaymentId(item.id);
    setSuccessMessage("");
    setActionError("");

    try {
      await billPaymentsService.markAsPaid(item.id);
      queryClient.setQueryData<OverdueBillPaymentsResponse>(
        queryKeys.overduePayments,
        (current) => {
          if (!current) {
            return current;
          }

          return {
            items: current.items.filter((payment) => payment.id !== item.id),
            total_count: Math.max(0, current.total_count - 1),
            total_amount: Math.max(0, current.total_amount - item.amount),
          };
        },
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.overduePayments }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.monthlyPayments.month(item.reference_month),
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.chart() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
      ]);
      setSuccessMessage(`${item.bill_name} foi marcada como paga.`);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Não foi possível marcar a conta como paga.",
      );
    } finally {
      setBusyPaymentId(null);
    }
  }

  const data = overdueQuery.data;

  return (
    <div className="space-y-6 md:space-y-5">
      <section className="md:flex md:items-end md:justify-between md:gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-700">
            Pendências
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
            Contas atrasadas
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Consulte todos os vencimentos em aberto, inclusive de meses anteriores,
            e confirme os pagamentos por aqui.
          </p>
        </div>
      </section>

      {successMessage ? (
        <div className="rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}
      {actionError || overdueQuery.error ? (
        <ErrorMessage
          message={
            actionError ||
            overdueQuery.error?.message ||
            "Não foi possível carregar as contas atrasadas."
          }
        />
      ) : null}

      {overdueQuery.isPending ? (
        <LoadingState label="Carregando contas atrasadas..." />
      ) : null}

      {!overdueQuery.isPending && !overdueQuery.error && data ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2">
            <Card className="relative overflow-hidden rounded-[10px] p-5">
              <div className="absolute inset-x-0 top-0 h-1 bg-rose-600" />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total em atraso</p>
                  <p className="mt-2 text-2xl font-extrabold text-rose-700">
                    {formatCurrencyBRL(data.total_amount)}
                  </p>
                </div>
                <span className="inline-flex size-11 items-center justify-center rounded-[10px] bg-rose-50 text-rose-700">
                  <CircleAlert className="size-5" />
                </span>
              </div>
            </Card>
            <Card className="relative overflow-hidden rounded-[10px] p-5">
              <div className="absolute inset-x-0 top-0 h-1 bg-[var(--color-primary)]" />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">Contas pendentes</p>
                  <p className="mt-2 text-2xl font-extrabold text-slate-900">
                    {data.total_count}
                  </p>
                </div>
                <span className="inline-flex size-11 items-center justify-center rounded-[10px] bg-[var(--color-primary-soft)] text-[#071a3d]">
                  <ReceiptText className="size-5" />
                </span>
              </div>
            </Card>
          </section>

          {!data.items.length ? (
            <EmptyState
              title="Nenhuma conta atrasada"
              description="Tudo certo por aqui. Novos vencimentos em atraso aparecerão nesta tela."
            />
          ) : (
            <section className="space-y-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Vencimentos</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Da conta mais antiga para a mais recente.
                </p>
              </div>

              <div className="space-y-2.5">
                {data.items.map((item) => {
                  const isBusy = busyPaymentId === item.id;

                  return (
                    <Card
                      key={item.id}
                      aria-busy={isBusy}
                      className="rounded-[10px] border-rose-100 bg-rose-50/60 p-4 md:px-5"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-white text-rose-700 shadow-sm">
                            <CalendarClock className="size-5" />
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="break-words text-base font-extrabold text-slate-900">
                                {item.bill_name}
                              </h3>
                              <span className="rounded-[10px] bg-rose-100 px-2 py-1 text-[0.65rem] font-extrabold uppercase leading-none text-rose-700">
                                Atrasada
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-600">
                              Referência: {formatMonthLabel(item.reference_month)}
                            </p>
                            <p className="mt-1 text-xs font-medium text-rose-700">
                              Vencimento previsto: {formatDateBR(item.due_date)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 border-t border-rose-100 pt-3 md:border-0 md:pt-0">
                          <p className="text-lg font-extrabold text-slate-900 md:min-w-32 md:text-right">
                            {formatCurrencyBRL(item.amount)}
                          </p>
                          <Button
                            className="min-h-10 rounded-[10px] bg-emerald-600 px-4 text-xs text-white shadow-none hover:bg-emerald-700"
                            disabled={Boolean(busyPaymentId)}
                            onClick={() => void markAsPaid(item)}
                          >
                            {isBusy ? (
                              <Loader2 className="mr-2 size-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="mr-2 size-4" />
                            )}
                            {isBusy ? "Processando..." : "Marcar como paga"}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}
        </>
      ) : null}
    </div>
  );
}
