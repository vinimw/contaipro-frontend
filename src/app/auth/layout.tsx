import type { ReactNode } from "react";

import { BrandLogo } from "@/components/layout/BrandLogo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 sm:px-6">
      <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden rounded-[10px] bg-[linear-gradient(145deg,#071a3d,#003f96_48%,#e0ad00)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex rounded-[10px] bg-white/95 p-3 shadow-[0_18px_42px_rgba(7,26,61,0.18)]">
              <BrandLogo full className="w-96" />
            </div>
            <p className="mt-4 max-w-md text-base text-white/80">
              Um painel financeiro pessoal com foco em rotina mensal, visao clara e acoes
              rapidas no celular.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="rounded-[10px] bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-white/70">Organize contas e pagamentos</p>
              <p className="mt-2 text-2xl font-semibold">Sem planilha pesada</p>
            </div>
            <div className="rounded-[10px] bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-white/70">Acompanhe entradas e saidas</p>
              <p className="mt-2 text-2xl font-semibold">Tudo em um fluxo simples</p>
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
