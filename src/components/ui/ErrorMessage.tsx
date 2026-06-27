import { AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";

type ErrorMessageProps = {
  message: string;
  className?: string;
};

export function ErrorMessage({ message, className }: ErrorMessageProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-[10px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700",
        className,
      )}
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
