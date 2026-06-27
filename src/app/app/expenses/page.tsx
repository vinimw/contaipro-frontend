"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import {
  QuickExpenseForm,
  type QuickExpenseFormValues,
} from "@/components/dashboard/QuickExpenseForm";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrencyBRL } from "@/lib/currency";
import { formatDateBR, getCurrentMonth } from "@/lib/dates";
import { QUICK_EXPENSE_CREATED_EVENT } from "@/lib/events";
import { quickExpensesService } from "@/services/quick-expenses.service";
import type { QuickExpense } from "@/types/quick-expense";

export default function ExpensesPage() {
  const currentMonth = getCurrentMonth();
  const [items, setItems] = useState<QuickExpense[]>([]);
  const [editingExpense, setEditingExpense] = useState<QuickExpense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<QuickExpense | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadExpenses = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await quickExpensesService.list(currentMonth);
      setItems(response);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erro ao carregar gastos.");
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadExpenses();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadExpenses]);

  useEffect(() => {
    const handleQuickExpenseCreated = () => {
      void loadExpenses();
    };

    window.addEventListener(QUICK_EXPENSE_CREATED_EVENT, handleQuickExpenseCreated);

    return () => {
      window.removeEventListener(QUICK_EXPENSE_CREATED_EVENT, handleQuickExpenseCreated);
    };
  }, [loadExpenses]);

  async function handleSubmit(values: QuickExpenseFormValues) {
    setSuccessMessage("");

    if (editingExpense) {
      await quickExpensesService.update(editingExpense.id, {
        name: values.name,
        amount: values.amount,
        expense_date: values.expense_date || null,
      });
      setSuccessMessage("Gasto rapido atualizado.");
    } else {
      await quickExpensesService.create({
        name: values.name,
        amount: values.amount,
        expense_date: values.expense_date || null,
      });
      setSuccessMessage("Gasto rapido criado.");
    }

    setEditingExpense(null);
    await loadExpenses();
  }

  async function handleDelete() {
    if (!expenseToDelete) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsDeleting(true);

    try {
      await quickExpensesService.remove(expenseToDelete.id);

      if (editingExpense?.id === expenseToDelete.id) {
        setEditingExpense(null);
      }

      setExpenseToDelete(null);
      setSuccessMessage("Gasto rapido removido.");
      await loadExpenses();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel remover o gasto.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-primary)]">
          Gastos rapidos
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-slate-950">
          Registre despesas do dia a dia
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Controle saídas pontuais sem precisar abrir uma conta recorrente.
        </p>
      </Card>

      {successMessage ? (
        <div className="rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}
      {errorMessage ? <ErrorMessage message={errorMessage} /> : null}

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <h2 className="font-display text-xl font-semibold text-slate-950">
            {editingExpense ? "Editar gasto rapido" : "Novo gasto rapido"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Use um formulario curto para registrar o que saiu do caixa neste mes.
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
              submitLabel={editingExpense ? "Salvar alteracoes" : "Adicionar gasto"}
              onSubmit={handleSubmit}
            />
            {editingExpense ? (
              <Button className="mt-3 w-full" variant="ghost" onClick={() => setEditingExpense(null)}>
                Cancelar edicao
              </Button>
            ) : null}
          </div>
        </Card>

        <div className="space-y-4">
          {isLoading ? <LoadingState label="Carregando gastos..." /> : null}
          {!isLoading && !items.length ? (
            <EmptyState
              title="Nenhum gasto encontrado neste mes"
              description="Adicione um gasto rapido para manter o saldo previsto mais fiel."
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
                          setEditingExpense(item);
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
