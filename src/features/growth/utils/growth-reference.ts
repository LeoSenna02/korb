import type { Baby } from "@/lib/db/types";
import { parseDateLocal } from "@/lib/utils/format";
import { WHO_GROWTH_STANDARDS } from "../data/who-growth-standards";
import type {
  GrowthChartDataPoint,
  GrowthMetric,
  GrowthMetricReferenceState,
  GrowthMetricStatus,
  GrowthReferencePoint,
} from "../types";

const OMS_MAX_AGE_IN_MONTHS = 60;
const OMS_MISSING_PROFILE_MESSAGE =
  "Informe sexo e data de nascimento para ver a referencia OMS.";
const OMS_MISSING_BIRTHDATE_MESSAGE =
  "Informe a data de nascimento para ver a referencia OMS.";
const OMS_MISSING_GENDER_MESSAGE =
  "Informe o sexo do bebe para ver a referencia OMS.";
const OMS_AGE_RANGE_MESSAGE =
  "Referencia OMS disponivel apenas de 0 a 60 meses.";
const OMS_INVALID_BIRTHDATE_MESSAGE =
  "Data de nascimento invalida para calcular a referencia OMS.";
const OMS_INVALID_MEASUREMENT_DATE_MESSAGE =
  "Data da medicao invalida para calcular a referencia OMS.";
const OMS_BEFORE_BIRTH_MESSAGE =
  "Existe medicao anterior a data de nascimento do bebe.";

function parseReferenceDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? parseDateLocal(date) : new Date(date);
}

function normalizeToLocalCalendarDate(date: string) {
  const parsedDate = parseReferenceDate(date);

  if (!isValidDate(parsedDate)) {
    return parsedDate;
  }

  return new Date(
    parsedDate.getFullYear(),
    parsedDate.getMonth(),
    parsedDate.getDate(),
    12,
    0,
    0,
    0,
  );
}

function isValidDate(date: Date) {
  return Number.isFinite(date.getTime());
}

export function getAgeInCompletedMonths(birthDate: string, measuredAt: string) {
  const birth = normalizeToLocalCalendarDate(birthDate);
  const measured = normalizeToLocalCalendarDate(measuredAt);

  if (!isValidDate(birth) || !isValidDate(measured) || measured < birth) {
    return null;
  }

  const yearDiff = measured.getFullYear() - birth.getFullYear();
  const monthDiff = measured.getMonth() - birth.getMonth();
  let completedMonths = yearDiff * 12 + monthDiff;

  if (measured.getDate() < birth.getDate()) {
    completedMonths -= 1;
  }

  return completedMonths;
}

export function getGrowthMetricStatus(
  value: number,
  reference: Pick<GrowthReferencePoint, "lower" | "upper">,
): GrowthMetricStatus {
  if (value < reference.lower) {
    return "below";
  }

  if (value > reference.upper) {
    return "above";
  }

  return "within";
}

function getReferenceEligibilityError(
  birthDate: string,
  measuredAt: string,
) {
  const birth = normalizeToLocalCalendarDate(birthDate);

  if (!isValidDate(birth)) {
    return OMS_INVALID_BIRTHDATE_MESSAGE;
  }

  const measured = normalizeToLocalCalendarDate(measuredAt);

  if (!isValidDate(measured)) {
    return OMS_INVALID_MEASUREMENT_DATE_MESSAGE;
  }

  if (measured < birth) {
    return OMS_BEFORE_BIRTH_MESSAGE;
  }

  const ageInMonths = getAgeInCompletedMonths(birthDate, measuredAt);

  if (ageInMonths == null) {
    return OMS_INVALID_MEASUREMENT_DATE_MESSAGE;
  }

  if (ageInMonths > OMS_MAX_AGE_IN_MONTHS) {
    return OMS_AGE_RANGE_MESSAGE;
  }

  return null;
}

export function getGrowthMetricStatusLabel(status: GrowthMetricStatus) {
  switch (status) {
    case "below":
      return "Abaixo da faixa OMS";
    case "above":
      return "Acima da faixa OMS";
    case "within":
    default:
      return "Dentro da faixa OMS";
  }
}

function getReferenceEntry(
  metric: GrowthMetric,
  gender: Baby["gender"],
  ageInMonths: number,
) {
  const triplet = WHO_GROWTH_STANDARDS[metric][gender][ageInMonths];

  if (!triplet) {
    return null;
  }

  return {
    ageInMonths,
    lower: triplet[0],
    median: triplet[1],
    upper: triplet[2],
  };
}

export function buildGrowthMetricReferenceState(params: {
  baby: Baby | null;
  metric: GrowthMetric;
  series: GrowthChartDataPoint[];
}): GrowthMetricReferenceState {
  const { baby, metric, series } = params;

  if (!baby?.birthDate && !baby?.gender) {
    return { band: null, reason: OMS_MISSING_PROFILE_MESSAGE, status: null };
  }

  if (!baby?.birthDate) {
    return { band: null, reason: OMS_MISSING_BIRTHDATE_MESSAGE, status: null };
  }

  if (!baby.gender) {
    return { band: null, reason: OMS_MISSING_GENDER_MESSAGE, status: null };
  }

  if (series.length === 0) {
    return { band: null, reason: null, status: null };
  }

  const band: GrowthReferencePoint[] = [];
  let firstEligibilityError: string | null = null;

  series.forEach((point, seriesIndex) => {
    const eligibilityError = getReferenceEligibilityError(
      baby.birthDate,
      point.date,
    );

    if (eligibilityError) {
      firstEligibilityError ??= eligibilityError;
      return;
    }

    const ageInMonths = getAgeInCompletedMonths(baby.birthDate, point.date);

    if (ageInMonths == null || ageInMonths < 0) {
      firstEligibilityError ??= OMS_INVALID_MEASUREMENT_DATE_MESSAGE;
      return;
    }

    const reference = getReferenceEntry(metric, baby.gender, ageInMonths);

    if (!reference) {
      firstEligibilityError ??= OMS_AGE_RANGE_MESSAGE;
      return;
    }

    band.push({
      ...reference,
      date: point.date,
      seriesIndex,
    });
  });

  if (band.length === 0) {
    return {
      band: null,
      reason: firstEligibilityError ?? OMS_INVALID_MEASUREMENT_DATE_MESSAGE,
      status: null,
    };
  }

  const latestReference = band[band.length - 1];
  const latestPoint = series[latestReference.seriesIndex];

  return {
    band,
    reason: null,
    status: getGrowthMetricStatus(latestPoint.value, latestReference),
  };
}
