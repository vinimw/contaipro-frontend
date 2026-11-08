"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { BillForm } from "@/components/forms/BillForm";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingState } from "@/components/ui/LoadingState";
import { useBillMutations } from "@/hooks/useBillMutations";
import { queryKeys } from "@/lib/query-keys";
import { billsService } from "@/services/bills.service";
import type { Bill, BillPayload } from "@/types/bill";

type BillEditFormProps = {
  billId: string;
  onSaved: () => void;
  onPendingChange?: (pending: boolean) => void;
};

export function BillEditForm({ billId, onSaved, onPendingChange }: BillEditFormProps) {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState("");
  const { update } = useBillMutations();
  const billQuery = useQuery({
    queryKey: queryKeys.bills.detail(billId),
    queryFn: () => billsService.getById(billId),
    initialData: () => queryClient.getQueryData<Bill[]>(queryKeys.bills.all)?.find((item) => item.id === billId),
  });

  async function handleSubmit(payload: BillPayload) {
    setErrorMessage("");
    onPendingChange?.(true);

    try {
      const updatedBill = await update.mutateAsync({ id: billId, payload });
      queryClient.setQueryData(queryKeys.bills.detail(billId), updatedBill);
      queryClient.setQueryData<Bill[]>(queryKeys.bills.all, (current = []) =>
        current.map((item) => (item.id === billId ? updatedBill : item)),
      );
      onSaved();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel salvar a conta.");
    } finally {
      onPendingChange?.(false);
    }
  }

  return (
    <div className="space-y-4">
      {errorMessage || billQuery.error ? (
        <ErrorMessage message={errorMessage || billQuery.error?.message || "Erro ao carregar conta."} />
      ) : null}
      {billQuery.isPending ? <LoadingState label="Carregando conta..." /> : null}
      {billQuery.data ? (
        <BillForm initialValues={billQuery.data} submitLabel="Salvar alteracoes" onSubmit={handleSubmit} />
      ) : null}
    </div>
  );
}
