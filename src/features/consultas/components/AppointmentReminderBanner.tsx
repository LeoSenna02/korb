"use client";

import { AlertTriangle, CalendarClock, ChevronRight, MapPin, X } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils/format";
import type { AppointmentReminderCardState } from "../types";

interface AppointmentReminderBannerProps {
  reminder: AppointmentReminderCardState;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  onDismiss?: () => void;
  compact?: boolean;
}

export function AppointmentReminderBanner({
  reminder,
  title,
  description,
  actionLabel,
  onAction,
  onDismiss,
  compact = false,
}: AppointmentReminderBannerProps) {
  const isOverdue = reminder.kind === "overdue";
  const Icon = isOverdue ? AlertTriangle : CalendarClock;
  const accentClasses = isOverdue
    ? {
        wrapper:
          "border-[#D2B59D]/30 bg-[#D2B59D]/10",
        icon: "bg-[#D2B59D]/18 text-[#D2B59D]",
        badge: "bg-[#D2B59D]/18 text-[#D2B59D]",
        button: "bg-[#D2B59D]/18 text-[#D2B59D] hover:bg-[#D2B59D]/24",
      }
    : {
        wrapper:
          "border-[#88AFC7]/25 bg-[#88AFC7]/10",
        icon: "bg-[#88AFC7]/16 text-[#88AFC7]",
        badge: "bg-[#88AFC7]/16 text-[#88AFC7]",
        button: "bg-primary/15 text-primary hover:bg-primary/20",
      };
  return (
    <section
      className={`rounded-[28px] border p-5 ${accentClasses.wrapper} ${
        compact ? "" : "shadow-[0_12px_32px_rgba(17,19,25,0.08)]"
      }`}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${accentClasses.icon}`}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
            </div>

            <div className="min-w-0">
              <p className="font-data text-[10px] uppercase tracking-[0.18em] text-text-secondary">
                {title}
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold leading-tight text-text-primary">
                {reminder.appointment.doctorName}
              </h2>
              <p className="mt-1 font-data text-sm leading-5 text-text-secondary">
                {description}
              </p>
            </div>
          </div>

          {onDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Fechar lembrete"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container-low/80 text-text-secondary transition-colors hover:text-text-primary hover:bg-surface-variant/40"
            >
              <X className="h-4 w-4" strokeWidth={2.2} />
            </button>
          ) : null}
        </div>

        <div className="space-y-1">
          <span
            className={`inline-flex rounded-full px-3 py-1 font-data text-[10px] uppercase tracking-[0.16em] ${accentClasses.badge}`}
          >
            {reminder.timeUntilLabel}
          </span>
          <p className="font-data text-[11px] uppercase tracking-[0.16em] text-text-disabled">
            {formatDate(reminder.appointment.scheduledAt)} as{" "}
            {formatTime(reminder.appointment.scheduledAt)}
          </p>
        </div>

        <div className="flex items-center gap-2 text-text-secondary">
          <MapPin className="h-4 w-4 shrink-0" strokeWidth={1.8} />
          <span className="font-data text-sm leading-5">
            {reminder.appointment.location}
          </span>
        </div>

        <button
          type="button"
          onClick={onAction}
          className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-data text-[10px] uppercase tracking-[0.16em] transition-colors ${accentClasses.button}`}
        >
          <span>{actionLabel}</span>
          <ChevronRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </section>
  );
}
