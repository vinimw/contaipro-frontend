"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { Bill, BillPayload } from "@/types/bill";

const billSchema = z
  .object({
    name: z.string().min(2, "Informe o nome da conta."),
    description: z.string().optional(),
    amount: z.coerce.number().positive("Informe um valor maior que zero."),
    due_day: z.coerce
      .number()
      .int("Use um dia valido.")
      .min(1, "Use um dia entre 1 e 31.")
      .max(31, "Use um dia entre 1 e 31."),
    bill_type: z.enum(["single", "fixed"]),
    recurrence_type: z.enum(["none", "monthly_forever", "monthly_until_date"]),
    start_month: z.string().min(7, "Informe o mes inicial."),
    end_date: z.string().optional(),
    auto_pay: z.boolean(),
  })
  .superRefine((values, context) => {
    if (values.bill_type === "single" && values.recurrence_type !== "none") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["recurrence_type"],
        message: "Contas avulsas precisam usar recorrencia nenhuma.",
      });
    }

    if (values.bill_type === "fixed" && values.recurrence_type === "none") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["recurrence_type"],
        message: "Contas fixas precisam ter recorrencia mensal.",
      });
    }

    if (values.recurrence_type === "monthly_until_date" && !values.end_date) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end_date"],
        message: "Informe a data final da recorrencia.",
      });
    }

    if (
      values.recurrence_type === "monthly_until_date" &&
      values.end_date &&
      values.start_month &&
      values.end_date < `${values.start_month}-01`
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end_date"],
        message: "A data final nao pode ser anterior ao mes inicial.",
      });
    }
  });

type BillFormValues = z.infer<typeof billSchema>;
type BillFormInput = z.input<typeof billSchema>;

function toDefaultValues(initialValues?: Bill): BillFormValues {
  return {
    name: initialValues?.name ?? "",
    description: initialValues?.description ?? "",
    amount: initialValues?.amount ?? 0,
    due_day: initialValues?.due_day ?? 1,
    bill_type: initialValues?.bill_type ?? "fixed",
    recurrence_type: initialValues?.recurrence_type ?? "monthly_forever",
    start_month: initialValues?.start_month ?? new Date().toISOString().slice(0, 7),
    end_date: initialValues?.end_date?.slice(0, 10) ?? "",
    auto_pay: initialValues?.auto_pay ?? false,
  };
}

export function BillForm({
  initialValues,
  submitLabel,
  onSubmit,
}: {
  initialValues?: Bill;
  submitLabel: string;
  onSubmit: (payload: BillPayload) => Promise<void>;
}) {
  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BillFormInput, unknown, BillFormValues>({
    resolver: zodResolver(billSchema),
    defaultValues: toDefaultValues(initialValues),
  });

  const billType = useWatch({ control, name: "bill_type" });
  const recurrenceType = useWatch({ control, name: "recurrence_type" });
  const startMonth = useWatch({ control, name: "start_month" });
  const endDate = useWatch({ control, name: "end_date" });
  const minEndDate = startMonth ? `${startMonth}-01` : undefined;

  useEffect(() => {
    if (billType === "single") {
      setValue("recurrence_type", "none");
      setValue("end_date", "");
      return;
    }

    if (billType === "fixed" && recurrenceType === "none") {
      setValue("recurrence_type", "monthly_forever");
    }
  }, [billType, recurrenceType, setValue]);

  useEffect(() => {
    if (
      recurrenceType === "monthly_until_date" &&
      minEndDate &&
      endDate &&
      endDate < minEndDate
    ) {
      setValue("end_date", "");
    }
  }, [endDate, minEndDate, recurrenceType, setValue]);

  async function submit(values: BillFormValues) {
    await onSubmit({
      name: values.name,
      description: values.description || null,
      amount: values.amount,
      due_day: values.due_day,
      bill_type: values.bill_type,
      recurrence_type: values.bill_type === "single" ? "none" : values.recurrence_type,
      start_month: values.start_month,
      end_date:
        values.recurrence_type === "monthly_until_date" ? values.end_date ?? null : null,
      auto_pay: values.auto_pay,
    });
  }

  return (
    <Card className="space-y-5">
      <form className="space-y-5" onSubmit={handleSubmit(submit)}>
        <Input label="Nome" placeholder="Aluguel" error={errors.name?.message} {...register("name")} />
        <Textarea
          label="Descricao"
          placeholder="Observacoes opcionais"
          error={errors.description?.message}
          {...register("description")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <CurrencyInput
            control={control}
            label="Valor"
            error={errors.amount?.message}
            name="amount"
          />
          <Input
            label="Dia de vencimento"
            type="number"
            min="1"
            max="31"
            error={errors.due_day?.message}
            {...register("due_day")}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Tipo da conta" error={errors.bill_type?.message} {...register("bill_type")}>
            <option value="fixed">Fixa</option>
            <option value="single">Avulsa</option>
          </Select>
          <Input
            label="Mes inicial"
            type="month"
            error={errors.start_month?.message}
            {...register("start_month")}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            disabled={billType === "single"}
            label="Recorrencia"
            error={errors.recurrence_type?.message}
            {...register("recurrence_type")}
          >
            {billType === "single" ? <option value="none">Nenhuma</option> : null}
            <option value="monthly_forever">Mensal para sempre</option>
            <option value="monthly_until_date">Mensal ate data final</option>
          </Select>
          {recurrenceType === "monthly_until_date" ? (
            <Input
              label="Data final"
              type="date"
              min={minEndDate}
              error={errors.end_date?.message}
              {...register("end_date")}
            />
          ) : null}
        </div>
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-[10px] border border-slate-200 bg-slate-50 px-4 py-3">
          <span>
            <span className="block text-sm font-semibold text-slate-900">
              Pagamento automático
            </span>
            <span className="mt-1 block text-xs leading-5 text-slate-500">
              Ative quando essa conta não precisa de confirmação manual de
              pagamento.
            </span>
          </span>
          <span className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-[10px] bg-slate-300 p-1 transition has-[:checked]:bg-[var(--color-primary)]">
            <input
              className="peer sr-only"
              type="checkbox"
              {...register("auto_pay")}
            />
            <span className="size-5 rounded-[10px] bg-white shadow-sm transition peer-checked:translate-x-5" />
          </span>
        </label>
        <Button className="w-full sm:w-auto" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : submitLabel}
        </Button>
      </form>
    </Card>
  );
}
