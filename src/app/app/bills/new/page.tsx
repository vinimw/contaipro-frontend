"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { BillCreateForm } from "@/components/forms/BillCreateForm";
import { buttonStyles } from "@/components/ui/Button";

export default function NewBillPage() {
  const router = useRouter();

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
      <BillCreateForm onCreated={() => router.replace("/app/bills")} />
    </div>
  );
}
