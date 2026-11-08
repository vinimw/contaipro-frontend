"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** When false, ESC, backdrop click and the close button are ignored (e.g. while submitting). */
  dismissible?: boolean;
  className?: string;
};

const exitDurationMs = 220;

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  dismissible = true,
  className,
}: BottomSheetProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const dismissibleRef = useRef(dismissible);
  const [exiting, setExiting] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  if (prevOpen !== open) {
    setPrevOpen(open);
    setExiting(!open);
  }

  useEffect(() => {
    onCloseRef.current = onClose;
    dismissibleRef.current = dismissible;
  });

  // Keeps the sheet mounted while the exit animation plays.
  useEffect(() => {
    if (!exiting) {
      return;
    }

    const timeout = window.setTimeout(() => setExiting(false), exitDurationMs);

    return () => window.clearTimeout(timeout);
  }, [exiting]);

  // Body scroll lock, ESC, initial focus and focus restoration.
  useEffect(() => {
    if (!open) {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && dismissibleRef.current) {
        onCloseRef.current();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open && !exiting) {
    return null;
  }

  const closing = !open;

  const animation = (name: string) =>
    ({ animation: `${name} ${exitDurationMs}ms ease-out forwards` });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        aria-label="Fechar"
        className="absolute inset-0 bg-slate-950/40"
        data-sheet-backdrop
        style={animation(closing ? "sheet-fade-out" : "sheet-fade-in")}
        tabIndex={-1}
        type="button"
        onClick={() => {
          if (dismissible) {
            onClose();
          }
        }}
      />
      <div
        ref={panelRef}
        aria-labelledby={titleId}
        aria-modal="true"
        className={cn(
          "relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-[16px] bg-white shadow-2xl outline-none",
          className,
        )}
        data-sheet
        role="dialog"
        style={animation(closing ? "sheet-down" : "sheet-up")}
        tabIndex={-1}
      >
        <div className="flex items-center justify-between gap-4 px-5 pb-3 pt-4">
          <h2 className="font-display text-lg font-semibold text-slate-950" id={titleId}>
            {title}
          </h2>
          <button
            aria-label="Fechar"
            className="inline-flex size-10 items-center justify-center rounded-[10px] bg-slate-100 text-slate-600 disabled:opacity-50"
            disabled={!dismissible}
            type="button"
            onClick={onClose}
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  );
}
