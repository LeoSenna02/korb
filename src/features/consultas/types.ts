import type {
  GrowthRecord,
  PediatricAppointment,
} from "@/lib/db/types";
import type { VaccineRecord } from "@/features/vaccines/types";

export type {
  PediatricAppointment,
  PediatricAppointmentStatus,
} from "@/lib/db/types";

export type PediatricAppointmentDisplayStatus =
  | "scheduled"
  | "overdue"
  | "attended";

export interface AppointmentFormValues {
  doctorName: string;
  location: string;
  reason: string;
  scheduledDate: string;
  scheduledTime: string;
  preVisitNotes: string;
}

export interface AttendAppointmentFormValues {
  postVisitNotes: string;
  followUpIntervalDays: string;
  followUpInstructions: string;
  measurementsEnabled: boolean;
  weight: string;
  height: string;
  cephalicPerimeter: string;
  linkedGrowthId?: string;
  linkedVaccineIds: string[];
}

export interface AppointmentListItem extends PediatricAppointment {
  displayStatus: PediatricAppointmentDisplayStatus;
}

export interface AppointmentSummary {
  totalAppointments: number;
  upcomingAppointments: number;
  overdueAppointments: number;
  attendedAppointments: number;
}

export interface AppointmentLinkSuggestions {
  growthRecords: GrowthRecord[];
  vaccineRecords: VaccineRecord[];
}

export interface FollowUpDraft {
  doctorName: string;
  location: string;
  reason: string;
  scheduledAt: string;
  preVisitNotes?: string;
}
