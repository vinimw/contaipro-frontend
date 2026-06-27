import { Card } from "@/components/ui/Card";

export function LoadingState({ label = "Carregando..." }: { label?: string }) {
  return (
    <Card className="flex items-center gap-4">
      <span className="size-10 animate-spin rounded-[10px] border-4 border-slate-200 border-t-[var(--color-primary)]" />
      <p className="text-sm font-medium text-slate-600">{label}</p>
    </Card>
  );
}
