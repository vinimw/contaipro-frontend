"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
};

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 md:items-center">
      <button
        aria-label="Fechar modal"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-[10px] bg-white p-6 shadow-2xl",
          className,
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-semibold text-slate-950">
            {title}
          </h2>
          <button
            aria-label="Fechar"
            className="rounded-[10px] bg-slate-100 px-3 py-2 text-sm text-slate-600"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
