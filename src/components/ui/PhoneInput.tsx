"use client";

import type { InputHTMLAttributes } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";

import { inputStyles } from "@/components/ui/Input";
import { formatPhoneInput, normalizePhoneDigits } from "@/lib/phone";

type PhoneInputProps<TFieldValues extends FieldValues> = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "name" | "value" | "defaultValue" | "type" | "inputMode"
> & {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  error?: string;
};

export function PhoneInput<TFieldValues extends FieldValues>({
  className,
  control,
  error,
  label,
  name,
  placeholder = "(11) 99999-9999",
  ...props
}: PhoneInputProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const { name: fieldName, onBlur, onChange, ref, value } = field;

        return (
          <label className="flex w-full flex-col gap-2 text-sm font-medium text-slate-700">
            {label ? <span>{label}</span> : null}
            <input
              {...props}
              ref={ref}
              autoComplete="tel"
              className={inputStyles({ className, error })}
              inputMode="numeric"
              name={fieldName}
              placeholder={placeholder}
              type="tel"
              value={formatPhoneInput(value)}
              onBlur={onBlur}
              onChange={(event) => {
                onChange(normalizePhoneDigits(event.target.value).slice(0, 11));
              }}
            />
            {error ? <span className="text-xs text-[var(--color-danger)]">{error}</span> : null}
          </label>
        );
      }}
    />
  );
}
