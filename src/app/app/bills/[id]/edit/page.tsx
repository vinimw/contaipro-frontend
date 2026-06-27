"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { BillForm } from "@/components/forms/BillForm";
import { buttonStyles } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingState } from "@/components/ui/LoadingState";
import { billsService } from "@/services/bills.service";
import type { Bill, BillPayload } from "@/types/bill";

export default function EditBillPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [bill, setBill] = useState<Bill | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBill() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await billsService.getById(params.id);
        setBill(response);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Erro ao carregar conta.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadBill();
  }, [params.id]);

  async function handleSubmit(payload: BillPayload) {
    setErrorMessage("");

    try {
      await billsService.update(params.id, payload);
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

      {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
      {isLoading ? <LoadingState label="Carregando conta..." /> : null}
      {!isLoading && bill ? <BillForm initialValues={bill} submitLabel="Salvar alteracoes" onSubmit={handleSubmit} /> : null}
    </div>
  );
}
