function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

function normalizeDateInputDate(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12,
    0,
    0,
    0,
  );
}

export function getTodayDateInputValue() {
  const now = normalizeDateInputDate(new Date());
  const year = now.getFullYear();
  const month = padDatePart(now.getMonth() + 1);
  const day = padDatePart(now.getDate());

  return `${year}-${month}-${day}`;
}

export function convertDateInputToMeasuredAt(dateInputValue: string) {
  const match = dateInputValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return new Date().toISOString();
  }

  const [, year, month, day] = match;
  const measuredAt = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    12,
    0,
    0,
    0,
  );

  return measuredAt.toISOString();
}

export function convertMeasuredAtToDateInputValue(measuredAt: string) {
  const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(measuredAt)
    ? new Date(`${measuredAt}T12:00:00`)
    : new Date(measuredAt);

  if (!Number.isFinite(parsedDate.getTime())) {
    return getTodayDateInputValue();
  }

  const normalizedDate = normalizeDateInputDate(parsedDate);
  const year = normalizedDate.getFullYear();
  const month = padDatePart(normalizedDate.getMonth() + 1);
  const day = padDatePart(normalizedDate.getDate());

  return `${year}-${month}-${day}`;
}

export function sanitizeWeightInput(value: string) {
  const cleaned = value.replace(/[^\d.,]/g, "");
  const separatorIndex = cleaned.search(/[.,]/);

  if (separatorIndex === -1) {
    return cleaned;
  }

  const integerPart = cleaned.slice(0, separatorIndex + 1);
  const fractionalPart = cleaned.slice(separatorIndex + 1).replace(/[.,]/g, "");

  return `${integerPart}${fractionalPart}`;
}

export function parseWeightInputToKg(value: string) {
  const sanitized = sanitizeWeightInput(value.trim());

  if (!sanitized) {
    return undefined;
  }

  if (/[.,]/.test(sanitized)) {
    const normalized = sanitized.replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  const numeric = Number(sanitized);

  if (!Number.isFinite(numeric)) {
    return undefined;
  }

  if (numeric >= 1000) {
    return numeric / 1000;
  }

  if (numeric >= 100) {
    return numeric / 100;
  }

  if (numeric > 20) {
    return numeric / 10;
  }

  return numeric;
}

export function formatWeightKgForInput(valueKg: number) {
  return valueKg.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatWeightKgValue(valueKg: number) {
  return valueKg.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
