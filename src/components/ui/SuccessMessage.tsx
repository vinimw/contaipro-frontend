import { cn } from "@/lib/utils";

export function SuccessMessage({ message, className }: { message: string; className?: string }) {
  if (!message) return null;

  return (
    <div
      aria-live="polite"
      className={cn("rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700", className)}
      role="status"
    >
      {message}
    </div>
  );
}
