import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => (
    <label className="flex w-full flex-col gap-2 text-sm font-medium text-slate-700">
      {label ? <span>{label}</span> : null}
      <textarea
        ref={ref}
        className={cn(
          "min-h-28 rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,white)]",
          error && "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-red-100",
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs text-[var(--color-danger)]">{error}</span> : null}
    </label>
  ),
);

Textarea.displayName = "Textarea";
