import { areValuesHidden } from "@/lib/values-visibility";

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const hiddenValueMask = "***";

export function formatCurrencyBRL(value: number | null | undefined) {
  if (areValuesHidden()) {
    return hiddenValueMask;
  }

  return brlFormatter.format(value ?? 0);
}

export function formatCurrencyInput(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const normalizedValue =
    typeof value === "string" ? Number(value.replace(",", ".")) : value;

  if (Number.isNaN(normalizedValue)) {
    return "";
  }

  return brlFormatter.format(normalizedValue);
}

export function parseCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return undefined;
  }

  return Number(digits) / 100;
}
