import { Card } from "@/components/ui/Card";

export function MonthlyChartSkeleton() {
  return (
    <Card
      aria-busy="true"
      aria-label="Carregando gráfico"
      className="flex h-[172px] flex-col rounded-[10px] p-5 md:h-[330px]"
    >
      <div className="mb-2 animate-pulse md:mb-3">
        <div className="h-4 w-24 rounded-[10px] bg-slate-200 md:h-6 md:w-64" />
        <div className="mt-2 h-2.5 w-48 rounded-[10px] bg-slate-100 md:h-3.5 md:w-80" />
      </div>
      <div className="min-h-0 flex-1 animate-pulse rounded-[10px] bg-slate-100 md:h-[242px] md:min-h-[242px] md:flex-none" />
    </Card>
  );
}
