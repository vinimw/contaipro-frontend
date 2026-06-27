"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { BillForm } from "@/components/forms/BillForm";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { buttonStyles } from "@/components/ui/Button";
import { billsService } from "@/services/bills.service";
import type { BillPayload } from "@/types/bill";

export default function NewBillPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(payload: BillPayload) {
    setErrorMessage("");

    try {
      await billsService.create(payload);
      router.replace("/app/bills");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel criar a conta.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-primary)]">
            Nova conta
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-slate-950">
            Cadastre uma despesa fixa ou avulsa
          </h1>
        </div>
        <Link className={buttonStyles({ variant: "ghost" })} href="/app/bills">
          Voltar
        </Link>
      </div>
      {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
      <BillForm submitLabel="Criar conta" onSubmit={handleSubmit} />
    </div>
  );
}
