/**
 * Parse a date-only string (YYYY-MM-DD) in local timezone.
 * Using noon avoids midnight-boundary shifts in UTC-offset timezones.
 * Falls back to new Date() for full ISO datetime strings.
 */
export function parseDateLocal(dateStr: string): Date {
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  if (!isDateOnly) return new Date(dateStr);
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function formatDate(isoString: string): string {
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(isoString);
  const date = isDateOnly ? parseDateLocal(isoString) : new Date(isoString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });
}

export function formatDateLong(isoString: string): string {
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(isoString);
  const date = isDateOnly ? parseDateLocal(isoString) : new Date(isoString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });
}

export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Sao_Paulo",
  });
}

export function formatMonthShort(isoString: string): string {
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(isoString);
  const date = isDateOnly ? parseDateLocal(isoString) : new Date(isoString);
  return date.toLocaleDateString("pt-BR", { month: "short", timeZone: "America/Sao_Paulo" });
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (remainingMins === 0) return `${hours}h`;
  return `${hours}h ${remainingMins}m`;
}

export function formatDurationFromDates(startIso: string, endIso: string): string {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  const seconds = Math.floor((end - start) / 1000);
  return formatDuration(seconds);
}

export function formatNumber(value: number): string {
  return value.toLocaleString("pt-BR");
}

export function calculateBabyAge(birthDate: string): string {
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(birthDate);
  const birth = isDateOnly ? parseDateLocal(birthDate) : new Date(birthDate);
  const now = new Date();

  const diffMs = now.getTime() - birth.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Nascimento futuro";
  if (diffDays === 0) return "Recem-nascido(a)";

  if (diffDays < 7) {
    return diffDays === 1 ? "1 dia" : `${diffDays} dias`;
  }

  const weeks = Math.floor(diffDays / 7);
  const remainingDays = diffDays % 7;

  if (weeks < 8) {
    if (remainingDays === 0) {
      return weeks === 1 ? "1 semana" : `${weeks} semanas`;
    }
    const w = weeks === 1 ? "semana" : "semanas";
    const d = remainingDays === 1 ? "dia" : "dias";
    return `${weeks} ${w} e ${remainingDays} ${d}`;
  }

  const months = Math.floor(weeks / 4.345);
  const remainingWeeks = Math.floor(weeks % 4.345);

  if (months < 12) {
    if (remainingWeeks === 0) {
      return months === 1 ? "1 mes" : `${months} meses`;
    }
    const m = months === 1 ? "mes" : "meses";
    const w = remainingWeeks === 1 ? "semana" : "semanas";
    return `${months} ${m} e ${remainingWeeks} ${w}`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) {
    return years === 1 ? "1 ano" : `${years} anos`;
  }
  const y = years === 1 ? "ano" : "anos";
  const m = remainingMonths === 1 ? "mes" : "meses";
  return `${years} ${y} e ${remainingMonths} ${m}`;
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "agora";
  if (diffMinutes < 60) {
    return diffMinutes === 1 ? "ha 1 min" : `ha ${diffMinutes} min`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  const remainingMinutes = diffMinutes % 60;

  if (diffHours < 24) {
    if (remainingMinutes === 0) {
      return diffHours === 1 ? "ha 1h" : `ha ${diffHours}h`;
    }
    return `ha ${diffHours}h ${remainingMinutes}min`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return `ha ${diffDays} dias`;

  const diffWeeks = Math.floor(diffDays / 7);
  return diffWeeks === 1 ? "ha 1 semana" : `ha ${diffWeeks} semanas`;
}
