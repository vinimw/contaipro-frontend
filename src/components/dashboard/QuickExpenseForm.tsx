"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Input } from "@/components/ui/Input";

const quickExpenseSchema = z.object({
  name: z.string().min(2, "Informe um nome para o gasto."),
  amount: z.coerce.number().positive("Informe um valor maior que zero."),
  expense_date: z.string().optional(),
});

export type QuickExpenseFormValues = z.infer<typeof quickExpenseSchema>;
type QuickExpenseFormInput = z.input<typeof quickExpenseSchema>;

export function QuickExpenseForm({
  defaultValues,
  submitLabel = "Salvar gasto",
  onSubmit,
}: {
  defaultValues?: Partial<QuickExpenseFormValues>;
  submitLabel?: string;
  onSubmit: (values: QuickExpenseFormValues) => Promise<void>;
}) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuickExpenseFormInput, unknown, QuickExpenseFormValues>({
    resolver: zodResolver(quickExpenseSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      amount: defaultValues?.amount ?? 0,
      expense_date: defaultValues?.expense_date ?? "",
    },
  });

  async function submit(values: QuickExpenseFormValues) {
    await onSubmit(values);

    if (!defaultValues) {
      reset({
        name: "",
        amount: 0,
        expense_date: "",
      });
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)}>
      <Input label="Nome" placeholder="Mercado" error={errors.name?.message} {...register("name")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencyInput
          control={control}
          label="Valor"
          error={errors.amount?.message}
          name="amount"
        />
        <Input
          label="Data"
          type="date"
          error={errors.expense_date?.message}
          {...register("expense_date")}
        />
      </div>
      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : submitLabel}
      </Button>
    </form>
  );
}
