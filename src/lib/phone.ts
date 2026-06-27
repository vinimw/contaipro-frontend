export function normalizePhoneDigits(value: string | null | undefined) {
  return (value ?? "").replace(/\D/g, "");
}

export function formatPhoneInput(value: string | null | undefined) {
  const digits = normalizePhoneDigits(value);

  if (!digits) {
    return "";
  }

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function isValidPhone(value: string | null | undefined) {
  const digits = normalizePhoneDigits(value);
  return digits.length === 10 || digits.length === 11;
}
