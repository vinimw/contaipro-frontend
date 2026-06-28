import type { ReactNode } from "react";

import { BrandLogo } from "@/components/layout/BrandLogo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 sm:px-6">
      <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden rounded-[10px] border border-slate-200 bg-white p-10 text-[var(--color-brand-blue)] shadow-[0_18px_60px_rgba(15,23,42,0.08)] lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex">
              <BrandLogo full className="w-96" />
            </div>
            <p className="mt-4 max-w-md text-base text-[var(--color-brand-blue)]/80">
              Um painel financeiro pessoal com foco em rotina mensal, visao clara e acoes
              rapidas no celular.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="rounded-[10px] border border-[var(--color-brand-blue-soft)] bg-[var(--color-brand-blue-soft)] p-5">
              <p className="text-sm text-[var(--color-brand-blue)]/70">Organize contas e pagamentos</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--color-brand-blue)]">Sem planilha pesada</p>
            </div>
            <div className="rounded-[10px] border border-[var(--color-brand-blue-soft)] bg-[var(--color-brand-blue-soft)] p-5">
              <p className="text-sm text-[var(--color-brand-blue)]/70">Acompanhe entradas e saidas</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--color-brand-blue)]">Tudo em um fluxo simples</p>
            </div>
          </div>
        </section>
        <section className="rounded-[10px] border border-slate-200 bg-white/95 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandLogo className="w-64 max-w-full" />
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
