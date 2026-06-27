"use client";

import type { InputHTMLAttributes } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";

import { formatCurrencyInput, parseCurrencyInput } from "@/lib/currency";
import { inputStyles } from "@/components/ui/Input";

type CurrencyInputProps<TFieldValues extends FieldValues> = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "name" | "value" | "defaultValue" | "type" | "inputMode"
> & {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  error?: string;
};

export function CurrencyInput<TFieldValues extends FieldValues>({
  className,
  control,
  error,
  label,
  name,
  placeholder = "R$ 0,00",
  ...props
}: CurrencyInputProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const {
          name: fieldName,
          onBlur,
          onChange,
          ref,
          value,
        } = field;

        return (
          <label className="flex w-full flex-col gap-2 text-sm font-medium text-slate-700">
            {label ? <span>{label}</span> : null}
            <input
              {...props}
              ref={ref}
              className={inputStyles({ className, error })}
              inputMode="numeric"
              name={fieldName}
              placeholder={placeholder}
              type="text"
              value={formatCurrencyInput(value)}
              onBlur={onBlur}
              onChange={(event) => {
                onChange(parseCurrencyInput(event.target.value));
              }}
            />
            {error ? <span className="text-xs text-[var(--color-danger)]">{error}</span> : null}
          </label>
        );
      }}
    />
  );
}
