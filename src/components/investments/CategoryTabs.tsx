"use client";

import { useRef, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils";
import type { InvestmentCategory, InvestmentCategoryId } from "@/types/investment";

export const investmentPanelId = "invest-panel";
export const tabId = (id: string) => `invest-tab-${id}`;

/** ARIA tabs with roving tabindex: arrows, Home and End move and select. */
export function CategoryTabs({
  categories,
  value,
  onChange,
}: {
  categories: InvestmentCategory[];
  value: InvestmentCategoryId;
  onChange: (id: InvestmentCategoryId) => void;
}) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  function move(index: number) {
    const target = categories[(index + categories.length) % categories.length];
    onChange(target.id);
    refs.current[target.id]?.focus();
  }

  function onKeyDown(event: KeyboardEvent, index: number) {
    const keys: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: categories.length - 1,
    };

    if (event.key in keys) {
      event.preventDefault();
      move(keys[event.key]);
    }
  }

  return (
    <div aria-label="Categorias de investimento" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist">
      {categories.map((category, index) => {
        const selected = category.id === value;

        return (
          <button
            key={category.id}
            ref={(element) => {
              refs.current[category.id] = element;
            }}
            aria-controls={investmentPanelId}
            aria-selected={selected}
            className={cn(
              "min-h-11 shrink-0 rounded-[10px] border px-4 text-sm font-semibold transition",
              selected
                ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[#071a3d]"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            )}
            id={tabId(category.id)}
            role="tab"
            tabIndex={selected ? 0 : -1}
            type="button"
            onClick={() => onChange(category.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
