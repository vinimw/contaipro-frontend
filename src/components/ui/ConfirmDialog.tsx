"use client";

import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Excluir",
  cancelLabel = "Cancelar",
  isLoading = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal className="max-w-md" open={open} title={title} onClose={onCancel}>
      <div className="flex gap-4">
        <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-[10px] bg-rose-50 text-rose-600">
          <TriangleAlert className="size-6" />
        </span>
        <div>
          <p className="text-sm leading-6 text-slate-600">{description}</p>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              className="shadow-none"
              disabled={isLoading}
              variant="secondary"
              onClick={onCancel}
            >
              {cancelLabel}
            </Button>
            <Button disabled={isLoading} variant="danger" onClick={onConfirm}>
              {isLoading ? "Excluindo..." : confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
