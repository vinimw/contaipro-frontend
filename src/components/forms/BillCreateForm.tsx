"use client";

import { useState } from "react";

import { BillForm } from "@/components/forms/BillForm";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useBillMutations } from "@/hooks/useBillMutations";
import type { BillPayload } from "@/types/bill";

type BillCreateFormProps = {
  onCreated: () => void;
  onPendingChange?: (pending: boolean) => void;
};

export function BillCreateForm({ onCreated, onPendingChange }: BillCreateFormProps) {
  const { create } = useBillMutations();
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(payload: BillPayload) {
    setErrorMessage("");
    onPendingChange?.(true);

    try {
      await create.mutateAsync(payload);
      onCreated();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel criar a conta.");
    } finally {
      onPendingChange?.(false);
    }
  }

  return (
    <div className="space-y-4">
      {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
      <BillForm submitLabel="Criar conta" onSubmit={handleSubmit} />
    </div>
  );
}
