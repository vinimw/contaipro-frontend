import { EmptyState } from "@/components/ui/EmptyState";

export default function InvestmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-primary)]">
          Invista
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-slate-950">
          Simule aportes em investimentos
        </h1>
      </div>
      <EmptyState
        title="Em breve"
        description="Esta área ainda está em construção. Nenhum valor é calculado ou recomendado por enquanto."
      />
    </div>
  );
}
