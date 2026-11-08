"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { BillEditForm } from "@/components/forms/BillEditForm";
import { buttonStyles } from "@/components/ui/Button";

export default function EditBillPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

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
      <BillEditForm billId={params.id} onSaved={() => router.replace("/app/bills")} />
    </div>
  );
}
