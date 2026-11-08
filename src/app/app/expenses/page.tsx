"use client";

import { Suspense, useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";

import {
  QuickExpenseForm,
  type QuickExpenseFormValues,
} from "@/components/dashboard/QuickExpenseForm";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { SuccessMessage } from "@/components/ui/SuccessMessage";
import { formatCurrencyBRL } from "@/lib/currency";
import {
  addMonth,
  formatDateBR,
  formatMonthLabel,
  getCurrentMonth,
  getValidMonth,
  subtractMonth,
} from "@/lib/dates";
import { queryKeys } from "@/lib/query-keys";
import { quickExpensesService } from "@/services/quick-expenses.service";
import { useExpenseMutations } from "@/hooks/useExpenseMutations";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { useFinanceInvalidation } from "@/hooks/useFinanceInvalidation";
import type { QuickExpense } from "@/types/quick-expense";

function ExpensesPageContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const month = getValidMonth(searchParams.get("month")) ?? getCurrentMonth();
  const expenseMutations = useExpenseMutations();
  const { invalidateMonth } = useFinanceInvalidation();
  const [editingExpense, setEditingExpense] = useState<QuickExpense | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isDesktop = useIsDesktop();
  const [expenseToDelete, setExpenseToDelete] = useState<QuickExpense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const expensesQuery = useQuery({
    queryKey: queryKeys.quickExpenses.month(month),
    queryFn: () => quickExpensesService.list(month),
  });
  const items = expensesQuery.data ?? [];
  const isLoading = expensesQuery.isPending;
  const loadExpenses = async () => {
    await expensesQuery.refetch();
  };
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

  async function handleSubmit(values: QuickExpenseFormValues) {
    setErrorMessage("");
    setSuccessMessage("");
    setIsSaving(true);

    try {
      const previousMonth = editingExpense
        ? editingExpense.expense_date?.slice(0, 7) ?? month
        : null;
      const expenseMonth = values.expense_date?.slice(0, 7) ?? month;

      if (editingExpense) {
        await expenseMutations.update.mutateAsync({ id: editingExpense.id, month: expenseMonth, payload: {
          name: values.name,
          amount: values.amount,
          expense_date: values.expense_date || null,
        } });
        setSuccessMessage("Gasto rápido atualizado.");
      } else {
        await expenseMutations.create.mutateAsync({ month: expenseMonth, payload: {
          name: values.name,
          amount: values.amount,
          expense_date: values.expense_date || null,
        } });
        setSuccessMessage("Gasto rápido criado.");
      }

      setEditingExpense(null);
      setSheetOpen(false);
      await loadExpenses();
      if (previousMonth && previousMonth !== expenseMonth) await invalidateMonth(previousMonth, { expenses: true });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o gasto.",
      );
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!expenseToDelete) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsDeleting(true);

    try {
      const expenseMonth = expenseToDelete.expense_date?.slice(0, 7) ?? month;
      await expenseMutations.remove.mutateAsync({ id: expenseToDelete.id, month: expenseMonth });

      if (editingExpense?.id === expenseToDelete.id) {
        setEditingExpense(null);
      }

      setExpenseToDelete(null);
      setSuccessMessage("Gasto rápido removido.");
      await loadExpenses();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível remover o gasto.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-primary)]">
              Gastos rápidos
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold text-slate-950">
              {formatMonthLabel(month)}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Controle saídas pontuais sem precisar abrir uma conta recorrente.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-[auto_minmax(170px,210px)_auto]">
            <Button variant="secondary" onClick={() => updateMonth(subtractMonth(month))}>
              <ChevronLeft className="mr-1 size-4" />
              Anterior
            </Button>
            <Input
              aria-label="Selecionar mês dos gastos"
              className="min-w-0 text-center"
              type="month"
              value={month}
              onChange={(event) => updateMonth(event.target.value)}
            />
            <Button onClick={() => updateMonth(addMonth(month))}>
              Próximo
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      </Card>

      <SuccessMessage message={successMessage} />
      {(errorMessage && !sheetOpen) || expensesQuery.error ? (
        <ErrorMessage
          message={(!sheetOpen && errorMessage) || expensesQuery.error?.message || "Erro ao carregar gastos."}
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        {isDesktop ? (
          <Card>
            <h2 className="font-display text-xl font-semibold text-slate-950">
              {editingExpense ? "Editar gasto rápido" : "Novo gasto rápido"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Use um formulário curto para registrar o que saiu do caixa neste mês.
            </p>
            <div className="mt-5">
              <QuickExpenseForm
                key={editingExpense?.id ?? "create-expense"}
                defaultValues={
                  editingExpense
                    ? {
                        name: editingExpense.name,
                        amount: editingExpense.amount,
                        expense_date: editingExpense.expense_date?.slice(0, 10) ?? "",
                      }
                    : undefined
                }
                submitLabel={editingExpense ? "Salvar alterações" : "Adicionar gasto"}
                onSubmit={handleSubmit}
              />
              {editingExpense ? (
                <Button className="mt-3 w-full" variant="ghost" onClick={() => setEditingExpense(null)}>
                  Cancelar edição
                </Button>
              ) : null}
            </div>
          </Card>
        ) : (
          <Button
            className="w-full"
            onClick={() => {
              setErrorMessage("");
              setEditingExpense(null);
              setSheetOpen(true);
            }}
          >
            <Plus className="mr-2 size-4" />
            Adicionar gasto rápido
          </Button>
        )}

        <div className="space-y-4">
          {isLoading ? <LoadingState label="Carregando gastos..." /> : null}
          {!isLoading && !items.length ? (
            <EmptyState
              title="Nenhum gasto encontrado neste mês"
              description="Adicione um gasto rápido para manter o saldo previsto mais fiel."
            />
          ) : null}
          {!isLoading
            ? items.map((item) => (
                <Card key={item.id}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatDateBR(item.expense_date ?? item.created_at ?? "")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-950">
                        {formatCurrencyBRL(item.amount)}
                      </span>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setErrorMessage("");
                          setEditingExpense(item);
                          setSheetOpen(true);
                        }}
                      >
                        <Pencil className="mr-2 size-4" />
                        Editar
                      </Button>
                      <Button variant="danger" onClick={() => setExpenseToDelete(item)}>
                        <Trash2 className="mr-2 size-4" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            : null}
        </div>
      </div>
      <BottomSheet
        dismissible={!isSaving}
        open={sheetOpen && !isDesktop}
        title={editingExpense ? "Editar gasto rápido" : "Novo gasto rápido"}
        onClose={() => {
          setSheetOpen(false);
          setEditingExpense(null);
        }}
      >
        <div className="space-y-4">
          {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
          <QuickExpenseForm
            key={editingExpense?.id ?? "create-expense-sheet"}
            defaultValues={
              editingExpense
                ? {
                    name: editingExpense.name,
                    amount: editingExpense.amount,
                    expense_date: editingExpense.expense_date?.slice(0, 10) ?? "",
                  }
                : undefined
            }
            submitLabel={editingExpense ? "Salvar alterações" : "Adicionar gasto"}
            onSubmit={handleSubmit}
          />
        </div>
      </BottomSheet>
      <ConfirmDialog
        description={
          expenseToDelete
            ? `O gasto "${expenseToDelete.name}" será removido. Essa ação não pode ser desfeita.`
            : ""
        }
        isLoading={isDeleting}
        open={Boolean(expenseToDelete)}
        title="Excluir gasto rápido?"
        onCancel={() => {
          if (!isDeleting) {
            setExpenseToDelete(null);
          }
        }}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}

export default function ExpensesPage() {
  return (
    <Suspense fallback={<LoadingState label="Carregando mês selecionado..." />}>
      <ExpensesPageContent />
    </Suspense>
  );
}
