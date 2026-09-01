"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { BillForm } from "@/components/forms/BillForm";
import { buttonStyles } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingState } from "@/components/ui/LoadingState";
import { billsService } from "@/services/bills.service";
import type { Bill, BillPayload } from "@/types/bill";
import { queryKeys } from "@/lib/query-keys";

export default function EditBillPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams<{ id: string }>();
  const [errorMessage, setErrorMessage] = useState("");
  const billQuery = useQuery({
    queryKey: queryKeys.bills.detail(params.id),
    queryFn: () => billsService.getById(params.id),
    initialData: () => queryClient.getQueryData<Bill[]>(queryKeys.bills.all)?.find((item) => item.id === params.id),
  });
  const updateMutation = useMutation({ mutationFn: (payload: BillPayload) => billsService.update(params.id, payload) });

  async function handleSubmit(payload: BillPayload) {
    setErrorMessage("");

    try {
      const updatedBill = await updateMutation.mutateAsync(payload);
      queryClient.setQueryData(queryKeys.bills.detail(params.id), updatedBill);
      queryClient.setQueryData<Bill[]>(queryKeys.bills.all, (current = []) =>
        current.map((item) => (item.id === params.id ? updatedBill : item)),
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.chart() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.monthlyPayments.all });
      router.replace("/app/bills");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel salvar a conta.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-primary)]">
            Editar conta
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-slate-950">
            Ajuste as informacoes da conta
          </h1>
        </div>
        <Link className={buttonStyles({ variant: "ghost" })} href="/app/bills">
          Voltar
        </Link>
      </div>

      {errorMessage || billQuery.error ? <ErrorMessage message={errorMessage || billQuery.error?.message || "Erro ao carregar conta."} /> : null}
      {billQuery.isPending ? <LoadingState label="Carregando conta..." /> : null}
      {billQuery.data ? <BillForm initialValues={billQuery.data} submitLabel="Salvar alteracoes" onSubmit={handleSubmit} /> : null}
    </div>
  );
}
