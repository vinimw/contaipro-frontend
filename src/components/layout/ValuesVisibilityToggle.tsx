"use client";

import { Eye, EyeOff } from "lucide-react";

import { useValuesVisibility } from "@/hooks/useValuesVisibility";
import { cn } from "@/lib/utils";

export function ValuesVisibilityToggle({ compact = false }: { compact?: boolean }) {
  const { hidden, toggle } = useValuesVisibility();
  const Icon = hidden ? EyeOff : Eye;
  const label = hidden ? "Mostrar valores" : "Ocultar valores";

  return (
    <button
      aria-label={label}
      aria-pressed={hidden}
      className={cn(
        "inline-flex items-center justify-center rounded-[10px] bg-[var(--color-brand-blue-soft)] text-[var(--color-brand-blue)] transition hover:bg-blue-100",
        compact ? "size-9" : "size-12",
      )}
      title={label}
      type="button"
      onClick={toggle}
    >
      <Icon className={compact ? "size-4" : "size-5"} />
    </button>
  );
}
