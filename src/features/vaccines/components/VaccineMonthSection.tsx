"use client";

import { VaccineCard } from "./VaccineCard";
import type { VaccineMonthGroup, VaccineTimelineItem } from "../types";

interface VaccineMonthSectionProps {
  month: VaccineMonthGroup;
  onSelect: (item: VaccineTimelineItem) => void;
}

function SummaryPill({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) {
  return (
    <div className="rounded-full bg-surface-variant/15 px-3 py-2">
      <span className={`font-data text-[10px] uppercase tracking-wider ${colorClass}`}>
        {label}
      </span>
      <span className="font-data text-sm text-text-primary ml-2">{value}</span>
    </div>
  );
}

export function VaccineMonthSection({
  month,
  onSelect,
}: VaccineMonthSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-display text-2xl text-text-primary font-semibold">
            {month.label}
          </h2>
          <p className="font-data text-sm text-text-secondary mt-1">
            {month.summary.total} vacina{month.summary.total === 1 ? "" : "s"} neste periodo
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <SummaryPill
            label="Tomadas"
            value={month.summary.taken}
            colorClass="text-[#8EAF96]"
          />
          <SummaryPill
            label="Pendentes"
            value={month.summary.pending}
            colorClass="text-[#D2B59D]"
          />
          <SummaryPill
            label="Trancadas"
            value={month.summary.locked}
            colorClass="text-text-disabled"
          />
        </div>
      </div>

      <div className="grid gap-3">
        {month.items.map((item) => (
          <VaccineCard key={item.id} item={item} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}
