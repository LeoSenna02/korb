"use client";

import type { GrowthMetricReferenceState } from "../types";
import { getGrowthMetricStatusLabel } from "../utils/growth-reference";

interface GrowthMetricReferenceMetaProps {
  reference: GrowthMetricReferenceState;
}

const STATUS_STYLES = {
  below:
    "border-[#D2B59D]/30 bg-[#D2B59D]/10 text-[#D2B59D]",
  within:
    "border-[#8EAF96]/30 bg-[#8EAF96]/10 text-[#8EAF96]",
  above:
    "border-[#E6A87A]/30 bg-[#E6A87A]/10 text-[#E6A87A]",
} as const;

export function GrowthMetricReferenceMeta({
  reference,
}: GrowthMetricReferenceMetaProps) {
  if (reference.reason) {
    return (
      <p className="mt-1 font-data text-[10px] text-text-disabled">
        {reference.reason}
      </p>
    );
  }

  if (!reference.status) {
    return null;
  }

  return (
    <span
      className={`mt-1 inline-flex rounded-full border px-2 py-1 font-data text-[9px] uppercase tracking-wider ${STATUS_STYLES[reference.status]}`}
    >
      {getGrowthMetricStatusLabel(reference.status)}
    </span>
  );
}
