import { Inbox } from "lucide-react";

import { Card } from "@/components/ui/Card";

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center gap-3 py-10 text-center">
      <span className="rounded-[10px] bg-slate-100 p-4 text-slate-500">
        <Inbox className="size-6" />
      </span>
      <div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </Card>
  );
}
