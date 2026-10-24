const dateFormatter = new Intl.DateTimeFormat("pt-BR");
const monthLabelFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

function toDateInput(value: string) {
  if (/^\d{4}-\d{2}$/.test(value)) {
    return new Date(`${value}-01T12:00:00`);
  }

  return new Date(`${value}T12:00:00`);
}

export function formatDateBR(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return dateFormatter.format(toDateInput(value));
}

export function getCurrentMonth() {
  const today = new Date();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  return `${today.getFullYear()}-${month}`;
}

export function getToday() {
  const today = new Date();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

export function addMonth(value: string, amount = 1) {
  const date = toDateInput(value);
  date.setMonth(date.getMonth() + amount);
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

export function subtractMonth(value: string, amount = 1) {
  return addMonth(value, -amount);
}

export function formatMonthLabel(value: string) {
  return monthLabelFormatter.format(toDateInput(value));
}
