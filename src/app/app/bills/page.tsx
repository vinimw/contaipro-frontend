"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { buttonStyles } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrencyBRL } from "@/lib/currency";
import { formatDateBR } from "@/lib/dates";
import { billsService } from "@/services/bills.service";
import type { Bill, RecurrenceType } from "@/types/bill";

const recurrenceLabels: Record<Exclude<RecurrenceType, "monthly_until_date">, string> = {
  none: "Sem recorrência",
  monthly_forever: "Mensal sem data final",
};

function getRecurrenceLabel(item: Bill) {
  if (item.recurrence_type === "monthly_until_date") {
    return item.end_date ? `Até ${formatDateBR(item.end_date)}` : "Até data final não informada";
  }

  return recurrenceLabels[item.recurrence_type];
}

export default function BillsPage() {
  const [items, setItems] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [billToDelete, setBillToDelete] = useState<Bill | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadBills = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await billsService.list();
      setItems(response);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erro ao carregar contas.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadBills();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadBills]);

  async function handleDelete() {
    if (!billToDelete) {
      return;
    }

    setSuccessMessage("");
    setErrorMessage("");
    setIsDeleting(true);

    try {
      await billsService.remove(billToDelete.id);
      setItems((current) => current.filter((item) => item.id !== billToDelete.id));
      setBillToDelete(null);
      setSuccessMessage("Conta removida com sucesso.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel remover a conta.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-primary)]">
            Contas
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-slate-950">
            Suas contas cadastradas
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Gerencie recorrencia, vencimento e os principais detalhes das despesas fixas.
          </p>
        </div>
        <Link className={buttonStyles({})} href="/app/bills/new">
          <Plus className="mr-2 size-4" />
          Nova conta
        </Link>
      </Card>

      {successMessage ? (
        <div className="rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}
      {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
      {isLoading ? <LoadingState label="Carregando contas..." /> : null}

      {!isLoading && !items.length ? (
        <EmptyState
          title="Nenhuma conta cadastrada ainda"
          description="Crie sua primeira conta para acompanhar pagamentos e previsao mensal."
        />
      ) : null}

      {!isLoading ? (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-950">{item.name}</h2>
                    <span className="rounded-[10px] bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {item.bill_type === "single" ? "Avulsa" : "Fixa"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{item.description || "Sem descricao adicional."}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <span>Valor: {formatCurrencyBRL(item.amount)}</span>
                    <span>Vencimento: dia {item.due_day}</span>
                    <span>Recorrência: {getRecurrenceLabel(item)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    className={buttonStyles({ variant: "secondary" })}
                    href={`/app/bills/${item.id}/edit`}
                  >
                    <Pencil className="mr-2 size-4" />
                    Editar
                  </Link>
                  <Button variant="danger" onClick={() => setBillToDelete(item)}>
                    <Trash2 className="mr-2 size-4" />
                    Deletar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
      <ConfirmDialog
        description={
          billToDelete
            ? `A conta "${billToDelete.name}" será removida. Essa ação não pode ser desfeita.`
            : ""
        }
        isLoading={isDeleting}
        open={Boolean(billToDelete)}
        title="Excluir conta?"
        onCancel={() => {
          if (!isDeleting) {
            setBillToDelete(null);
          }
        }}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
