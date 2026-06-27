import { Home, RotateCcw, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrencyBRL } from "@/lib/currency";
import { formatDateBR } from "@/lib/dates";
import type { BillPayment } from "@/types/bill-payment";

type BillPaymentListProps = {
  items: BillPayment[];
  busyId?: string | null;
  deletingId?: string | null;
  onToggleStatus: (item: BillPayment) => void;
  onDelete?: (item: BillPayment) => void;
};

const statusConfig = {
  paid: { label: "Pago", tone: "paid" as const },
  pending: { label: "Pendente", tone: "pending" as const },
  overdue: { label: "Atrasado", tone: "overdue" as const },
};

export function BillPaymentList({
  items,
  busyId,
  deletingId,
  onToggleStatus,
  onDelete,
}: BillPaymentListProps) {
  if (!items.length) {
    return (
      <EmptyState
        title="Nenhuma conta para este mes"
        description="Quando suas contas aparecerem aqui, voce podera marcar pagamentos com um toque."
      />
    );
  }

  return (
    <div className="space-y-2.5">
      {items.map((item) => {
        const status = statusConfig[item.status];

        return (
          <Card
            key={item.id}
            className="rounded-[10px] p-3"
          >
            <div className="flex flex-col gap-3 rounded-[10px] bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--color-primary-soft)] text-[#071a3d]">
                  <Home className="size-5" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900">
                      {item.bill_name ?? "Conta mensal"}
                    </h3>
                    <Badge className="px-2 py-0.5 text-[10px]" tone={status.tone}>{status.label}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-600">
                    Vencimento em {formatDateBR(item.due_date)}
                  </p>
                  <p className="mt-1.5 text-lg font-extrabold text-slate-900">
                    {formatCurrencyBRL(item.amount)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  className="min-h-9 rounded-[10px] border border-slate-300 bg-white px-4 text-xs text-slate-800 shadow-none hover:bg-slate-50 sm:min-w-44"
                  disabled={busyId === item.id}
                  variant="secondary"
                  onClick={() => onToggleStatus(item)}
                >
                  <RotateCcw className="mr-2 size-4" />
                  {item.status === "paid" ? "Voltar para pendente" : "Marcar como pago"}
                </Button>
                {onDelete ? (
                  <Button
                    aria-label={`Excluir ${item.bill_name ?? "Conta mensal"}`}
                    className="min-h-9 rounded-[10px] px-3 shadow-none"
                    disabled={deletingId === item.id}
                    variant="danger"
                    onClick={() => onDelete(item)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
