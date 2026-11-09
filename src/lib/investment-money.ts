import { areValuesHidden, } from "@/lib/values-visibility";
import { hiddenValueMask } from "@/lib/currency";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const notCalculated = "Não calculado";

/**
 * Display only. The API sends money as decimal strings with two places; we format them, never recompute.
 * `null` means "unknown" and is shown as such (never as R$ 0,00). Honors the global hide-values control.
 */
export function formatMoneyString(value: string | null | undefined, emptyLabel = notCalculated) {
  if (value === null || value === undefined) {
    return emptyLabel;
  }
  if (areValuesHidden()) {
    return hiddenValueMask;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? brl.format(parsed) : emptyLabel;
}

/** "Lucro", "Prejuízo" or "Sem variação": the sign is also written, so it never depends on color. */
export function profitLabel(value: string) {
  const parsed = Number(value);

  if (parsed > 0) {
    return "Lucro bruto";
  }
  if (parsed < 0) {
    return "Prejuízo bruto";
  }

  return "Resultado bruto (sem variação)";
}

const rateFormatter = new Intl.NumberFormat("pt-BR", { style: "percent", minimumFractionDigits: 0, maximumFractionDigits: 4 });

export function formatRate(fraction: string | null) {
  if (fraction === null) {
    return "—";
  }
  const parsed = Number(fraction);

  return Number.isFinite(parsed) ? rateFormatter.format(parsed) : "—";
}

/**
 * Converts a percentage typed by the user ("12,5") into a decimal fraction string ("0.125") by moving the
 * decimal point with string operations (no floating point, no interest math). Returns null when invalid.
 */
export function percentToFraction(input: string): string | null {
  const text = input.trim().replace(",", ".");

  if (!/^-?\d{1,4}(\.\d{1,6})?$/.test(text)) {
    return null;
  }

  const negative = text.startsWith("-");
  const [integerPart, decimalPart = ""] = text.replace("-", "").split(".");
  const digits = integerPart + decimalPart;
  const pointAt = integerPart.length - 2;
  const raw = pointAt <= 0 ? `0.${"0".repeat(-pointAt)}${digits}` : `${digits.slice(0, pointAt)}.${digits.slice(pointAt)}`;
  const [whole, fraction = ""] = raw.split(".");
  const cleanWhole = whole.replace(/^0+(?=\d)/, "") || "0";
  const cleanFraction = fraction.replace(/0+$/, "");
  const result = cleanFraction ? `${cleanWhole}.${cleanFraction}` : cleanWhole;

  return negative && result !== "0" ? `-${result}` : result;
}

/** Local calendar date in the product timezone, as YYYY-MM-DD (sent as as_of for historical runs). */
export function todayInBrazil() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}
