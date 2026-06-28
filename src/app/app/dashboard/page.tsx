"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BadgeDollarSign,
  Banknote,
  ChartNoAxesCombined,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Home,
  Info,
  Landmark,
  ListChecks,
  Plus,
  SlidersHorizontal,
  TriangleAlert,
  WalletCards,
  Zap,
} from "lucide-react";

import { BillPaymentList } from "@/components/dashboard/BillPaymentList";
import { MonthlyChart } from "@/components/dashboard/MonthlyChart";
import {
  QuickExpenseForm,
  type QuickExpenseFormValues,
} from "@/components/dashboard/QuickExpenseForm";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { useDashboard } from "@/hooks/useDashboard";
import { formatCurrencyBRL } from "@/lib/currency";
import {
  addMonth,
  formatDateBR,
  formatMonthLabel,
  getCurrentMonth,
  subtractMonth,
} from "@/lib/dates";
import { QUICK_EXPENSE_CREATED_EVENT } from "@/lib/events";
import { billPaymentsService } from "@/services/bill-payments.service";
import { quickExpensesService } from "@/services/quick-expenses.service";
import type { BillPayment } from "@/types/bill-payment";

const summaryAccent = {
  income: "bg-[var(--color-primary)]",
  bills: "bg-[var(--color-brand-blue)]",
  paid: "bg-[#087694]",
  balance: "bg-[var(--color-primary)]",
  pending: "bg-[#ff944d]",
  overdue: "bg-[#c51f29]",
  expenses: "bg-[var(--color-primary)]",
  extra: "bg-[#087694]",
};

const iconTone = {
  blue: "bg-[var(--color-primary-soft)] text-[#071a3d]",
  orange: "bg-[#fff2e7] text-[#ff7b20]",
  red: "bg-[#fff1f1] text-[#d92027]",
  cyan: "bg-[#d9efff] text-[#087694]",
};

function statusTone(status: BillPayment["status"]) {
  if (status === "paid") {
    return "paid";
  }

  if (status === "overdue") {
    return "overdue";
  }

  return "pending";
}

function statusLabel(status: BillPayment["status"]) {
  if (status === "paid") {
    return "Pago";
  }

  if (status === "overdue") {
    return "Urgente";
  }

  return "Agendado";
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updateMatch = () => setIsDesktop(mediaQuery.matches);

    updateMatch();
    mediaQuery.addEventListener("change", updateMatch);

    return () => mediaQuery.removeEventListener("change", updateMatch);
  }, []);

  return isDesktop;
}

export default function DashboardPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [busyPaymentId, setBusyPaymentId] = useState<string | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<BillPayment | null>(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [quickExpenseOpen, setQuickExpenseOpen] = useState(false);
  const { chart, data, error, isLoading, reload, updatePayment } = useDashboard(month);
  const isDesktop = useIsDesktop();

  const firstPayment = data.bill_payments[0];
  const secondaryPayments = data.bill_payments.slice(1, 3);
  const recentExpenses = data.quick_expenses.slice(0, 2);

  useEffect(() => {
    const handleQuickExpenseCreated = () => {
      void reload();
    };

    window.addEventListener(QUICK_EXPENSE_CREATED_EVENT, handleQuickExpenseCreated);

    return () => {
      window.removeEventListener(QUICK_EXPENSE_CREATED_EVENT, handleQuickExpenseCreated);
    };
  }, [reload]);

  async function togglePaymentStatus(item: BillPayment) {
    setBusyPaymentId(item.id);
    setSuccessMessage("");
    setActionError("");

    try {
      const updatedPayment =
        item.status === "paid"
          ? await billPaymentsService.markAsPending(item.id)
          : await billPaymentsService.markAsPaid(item.id);

      updatePayment(updatedPayment);

      if (item.status === "paid") {
        setSuccessMessage("Pagamento voltou para pendente.");
      } else {
        setSuccessMessage("Conta marcada como paga.");
      }
    } catch (requestError) {
      setSuccessMessage("");
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Nao foi possivel atualizar o status do pagamento.",
      );
    } finally {
      setBusyPaymentId(null);
    }
  }

  async function handleQuickExpenseSubmit(values: QuickExpenseFormValues) {
    setActionError("");

    try {
      await quickExpensesService.create({
        name: values.name,
        amount: values.amount,
        expense_date: values.expense_date || null,
      });
      setQuickExpenseOpen(false);
      setSuccessMessage("Gasto rapido criado com sucesso.");
      await reload();
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Nao foi possivel criar o gasto rapido.",
      );
    }
  }

  async function deletePayment() {
    if (!paymentToDelete) {
      return;
    }

    setActionError("");
    setSuccessMessage("");
    setDeletingPaymentId(paymentToDelete.id);

    try {
      await billPaymentsService.remove(paymentToDelete.id);
      setPaymentToDelete(null);
      setSuccessMessage("Pagamento removido com sucesso.");
      await reload();
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Nao foi possivel remover o pagamento.",
      );
    } finally {
      setDeletingPaymentId(null);
    }
  }

  return (
    <div className="space-y-6 md:space-y-5">
      <section className="md:hidden">
        <div>
          <h1 className="text-xl font-extrabold leading-tight text-slate-900">
            {formatMonthLabel(month)}
          </h1>
          <p className="mt-1 text-xs text-slate-600">Confira o resumo mensal de suas financas.</p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button className="min-h-11 rounded-[10px] bg-slate-100 text-xs font-semibold text-slate-700 shadow-none hover:bg-slate-200" onClick={() => setMonth(subtractMonth(month))}>
            <ChevronLeft className="mr-1 size-4" />
            Mes anterior
          </Button>
          <Button className="min-h-11 rounded-[10px] bg-[var(--color-primary)] text-xs font-semibold text-[#071a3d] shadow-none hover:bg-[var(--color-primary-strong)] hover:text-white" onClick={() => setMonth(addMonth(month))}>
            Proximo mes
            <ChevronRight className="ml-1 size-4" />
          </Button>
        </div>
        <Button className="mt-3 min-h-12 w-full rounded-[10px] bg-[var(--color-brand-blue)] text-xs font-semibold text-white shadow-none hover:bg-[#002f70]" onClick={() => setQuickExpenseOpen(true)}>
          <Plus className="mr-2 size-4" />
          Gasto Rapido
        </Button>
      </section>

      <section className="hidden md:block">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-primary-strong)]">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-extrabold leading-none text-slate-900">
              {formatMonthLabel(month)}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
              Veja o que ja foi pago, o que ficou pendente e o impacto das despesas
              rapidas no saldo previsto do mes.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="grid grid-cols-2 overflow-hidden rounded-[10px] bg-slate-100">
              <Button className="min-h-12 rounded-[10px] bg-transparent px-4 text-sm font-semibold text-slate-900 shadow-none hover:bg-slate-200" onClick={() => setMonth(subtractMonth(month))}>
                <ChevronLeft className="mr-2 size-4" />
                Mes anterior
              </Button>
              <Button className="min-h-12 rounded-[10px] bg-transparent px-4 text-sm font-semibold text-slate-900 shadow-none hover:bg-slate-200" onClick={() => setMonth(addMonth(month))}>
                Proximo mes
                <ChevronRight className="ml-2 size-4" />
              </Button>
            </div>
            <Button className="min-h-12 rounded-[10px] bg-[var(--color-primary)] px-5 text-sm font-bold text-[#071a3d] shadow-none hover:bg-[var(--color-primary-strong)] hover:text-white" onClick={() => setQuickExpenseOpen(true)}>
              <Zap className="mr-2 size-5 fill-white" />
              Gasto rapido
            </Button>
          </div>
        </div>
      </section>

      {successMessage ? (
        <div className="rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}
      {actionError ? <ErrorMessage message={actionError} /> : null}

      {isLoading ? <LoadingState label="Carregando dashboard..." /> : null}
      {error ? <ErrorMessage message={error} /> : null}

      {!isLoading && !error ? (
        <>
          <section className="md:hidden">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                Resumo financeiro
              </p>
              <Link className="text-[11px] font-semibold text-[var(--color-primary-strong)]" href="/app/income">
                Ver todos
              </Link>
            </div>
            <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-2">
              <div className="min-w-[152px] rounded-[10px] border border-slate-100 bg-white p-4 shadow-[0_12px_24px_rgba(15,23,42,0.04)]">
                <div className="flex items-start justify-between">
                  <p className="text-[10px] font-medium uppercase text-slate-500">Renda mensal</p>
                  <span className="inline-flex size-6 items-center justify-center rounded-[10px] bg-[var(--color-primary-soft)] text-[#071a3d]">
                    <Banknote className="size-3.5" />
                  </span>
                </div>
                <p className="mt-7 text-base font-extrabold text-slate-900">
                  {formatCurrencyBRL(data.summary.monthly_income_amount)}
                </p>
              </div>
              <div className="min-w-[152px] rounded-[10px] border border-slate-100 bg-white p-4 shadow-[0_12px_24px_rgba(15,23,42,0.04)]">
                <p className="text-[10px] font-medium uppercase text-slate-500">Saldo previsto</p>
                <p className="mt-10 text-base font-extrabold text-slate-900">
                  {formatCurrencyBRL(data.summary.projected_balance)}
                </p>
              </div>
              <div className="min-w-[152px] rounded-[10px] border border-slate-100 bg-white p-4 shadow-[0_12px_24px_rgba(15,23,42,0.04)]">
                <p className="text-[10px] font-medium uppercase text-slate-500">Gastos rapidos</p>
                <p className="mt-10 text-base font-extrabold text-slate-900">
                  {formatCurrencyBRL(data.summary.quick_expenses_total)}
                </p>
              </div>
            </div>
          </section>

          <section className="hidden grid-cols-4 gap-3 md:grid">
            <SummaryCard label="Renda mensal" value={data.summary.monthly_income_amount} icon={Landmark} accentClassName={summaryAccent.income} />
            <SummaryCard label="Total de contas" value={data.summary.total_bills_amount} icon={WalletCards} accentClassName={summaryAccent.bills} />
            <SummaryCard label="Total pago" value={data.summary.total_paid_amount} icon={ListChecks} accentClassName={summaryAccent.paid} />
            <SummaryCard label="Saldo previsto" value={data.summary.projected_balance} icon={ChartNoAxesCombined} accentClassName={summaryAccent.balance} />
            <SummaryCard label="Pendente" value={data.summary.total_pending_amount} icon={Info} accentClassName={summaryAccent.pending} iconClassName={iconTone.orange} />
            <SummaryCard label="Atrasado" value={data.summary.total_overdue_amount} icon={TriangleAlert} accentClassName={summaryAccent.overdue} iconClassName={iconTone.red} />
            <SummaryCard label="Gastos rapidos" value={data.summary.quick_expenses_total} icon={BadgeDollarSign} accentClassName={summaryAccent.expenses} iconClassName={iconTone.blue} />
            <SummaryCard label="Rendas extras" value={data.summary.extra_incomes_total} icon={CircleDollarSign} accentClassName={summaryAccent.extra} iconClassName={iconTone.cyan} />
          </section>

          <section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr)_minmax(260px,0.9fr)]">
            {chart.length ? (
              <MonthlyChart compact={!isDesktop} data={chart} />
            ) : (
              <EmptyState
                title="Grafico indisponivel"
                description="Assim que a API retornar o historico, o comparativo mensal aparecera aqui."
              />
            )}

            <Card className="hidden rounded-[10px] p-5 md:block">
              <h2 className="text-xl font-extrabold text-slate-900">Visao rapida</h2>
              <div className="mt-4 grid gap-3">
                <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Saldo previsto</p>
                  <p className="mt-2 text-xl font-extrabold text-slate-900">
                    {formatCurrencyBRL(data.summary.projected_balance)}
                  </p>
                </div>
                <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Contas em aberto</p>
                  <p className="mt-2 text-xl font-extrabold text-slate-900">
                    {formatCurrencyBRL(data.summary.total_pending_amount + data.summary.total_overdue_amount)}
                  </p>
                </div>
                <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Saidas extras</p>
                  <p className="mt-2 text-xl font-extrabold text-slate-900">
                    {formatCurrencyBRL(data.summary.quick_expenses_total)}
                  </p>
                </div>
              </div>
            </Card>
          </section>

          <section className="grid gap-4 md:grid-cols-[minmax(0,2.1fr)_minmax(260px,0.9fr)]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 md:text-2xl">
                    Pagamentos
                    <span className="hidden md:inline"> do mes</span>
                  </h2>
                  <p className="mt-1 hidden text-sm text-slate-600 md:block">
                    Marque rapidamente as contas pagas e destaque o que ficou atrasado.
                  </p>
                </div>
                <button className="inline-flex size-8 items-center justify-center rounded-[10px] text-slate-500 md:hidden">
                  <SlidersHorizontal className="size-5" />
                </button>
              </div>

              <div className="hidden md:block">
                <BillPaymentList
                  items={data.bill_payments}
                  busyId={busyPaymentId}
                  deletingId={deletingPaymentId}
                  onDelete={setPaymentToDelete}
                  onToggleStatus={(item) => {
                    void togglePaymentStatus(item);
                  }}
                />
              </div>

              <div className="space-y-3 md:hidden">
                {firstPayment ? (
                  <Card className="rounded-[10px] p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-extrabold text-slate-900">
                            {firstPayment.bill_name ?? "Conta mensal"}
                          </h3>
                          <Badge className="px-2 py-0.5 text-[8px]" tone={statusTone(firstPayment.status)}>
                            {statusLabel(firstPayment.status)}
                          </Badge>
                        </div>
                        <p className="mt-3 text-2xl font-extrabold text-[var(--color-primary-strong)]">
                          {formatCurrencyBRL(firstPayment.amount)}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Vencimento em {formatDateBR(firstPayment.due_date)}
                        </p>
                      </div>
                    </div>
                    <Button
                      className="mt-5 min-h-11 w-full rounded-[10px] bg-slate-100 text-xs text-slate-700 shadow-none hover:bg-slate-200"
                      disabled={busyPaymentId === firstPayment.id}
                      variant="secondary"
                      onClick={() => void togglePaymentStatus(firstPayment)}
                    >
                      {firstPayment.status === "paid" ? "Voltar para pendente" : "Marcar como pago"}
                    </Button>
                  </Card>
                ) : (
                  <EmptyState title="Nenhum pagamento" description="Suas contas do mes aparecerao aqui." />
                )}

                {secondaryPayments.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-[10px] bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex size-8 items-center justify-center rounded-[10px] bg-white text-[var(--color-brand-blue)]">
                        {item.status === "overdue" ? <Zap className="size-4" /> : <Home className="size-4" />}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{item.bill_name ?? "Conta mensal"}</p>
                        <p className="mt-0.5 text-[9px] text-slate-500">{formatDateBR(item.due_date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-slate-900">{formatCurrencyBRL(item.amount)}</p>
                      <p className="mt-1 text-[8px] font-extrabold uppercase text-[#d92027]">{statusLabel(item.status)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="hidden md:block">
                <h2 className="text-xl font-extrabold text-slate-900">Gastos rapidos recentes</h2>
                <p className="mt-1 text-sm text-slate-600">Ultimos lancamentos que impactaram o mes.</p>
              </div>
              <Card className="hidden rounded-[10px] p-5 md:block">
                <div className="space-y-4">
                  {data.quick_expenses.length ? (
                    data.quick_expenses.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3 last:border-b-0 last:pb-0">
                        <div>
                          <p className="text-base font-extrabold text-slate-900">{item.name}</p>
                          <p className="mt-1 text-xs text-slate-600">
                            {formatDateBR(item.expense_date ?? item.created_at ?? "")}
                          </p>
                        </div>
                        <span className="text-base font-extrabold text-slate-900">
                          {formatCurrencyBRL(item.amount)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">Nenhum gasto rapido encontrado neste mes.</p>
                  )}
                </div>
                <Link className="mt-5 block text-center text-sm font-semibold text-[var(--color-primary-strong)]" href="/app/expenses">
                  Ver todos os gastos
                </Link>
              </Card>

              <div className="space-y-4 md:hidden">
                {recentExpenses.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-[10px] bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex size-8 items-center justify-center rounded-[10px] bg-white text-[var(--color-brand-blue)]">
                        <BadgeDollarSign className="size-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{item.name}</p>
                        <p className="mt-0.5 text-[9px] text-slate-500">{formatDateBR(item.expense_date ?? item.created_at ?? "")}</p>
                      </div>
                    </div>
                    <p className="text-sm font-extrabold text-slate-900">{formatCurrencyBRL(item.amount)}</p>
                  </div>
                ))}

              </div>
            </div>
          </section>
        </>
      ) : null}

      <Modal open={quickExpenseOpen} onClose={() => setQuickExpenseOpen(false)} title="Novo gasto rapido">
        <QuickExpenseForm onSubmit={handleQuickExpenseSubmit} />
      </Modal>
      <ConfirmDialog
        description={
          paymentToDelete
            ? `O pagamento "${paymentToDelete.bill_name ?? "Conta mensal"}" de ${formatMonthLabel(paymentToDelete.reference_month)} será removido. Essa ação não pode ser desfeita.`
            : ""
        }
        isLoading={Boolean(deletingPaymentId)}
        open={Boolean(paymentToDelete)}
        title="Excluir pagamento?"
        onCancel={() => {
          if (!deletingPaymentId) {
            setPaymentToDelete(null);
          }
        }}
        onConfirm={() => void deletePayment()}
      />
    </div>
  );
}
