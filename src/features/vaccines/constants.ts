export interface VaccineCatalogItem {
  id: string;
  name: string;
  doseLabel?: string;
  scheduledMonth: number;
  sortOrder: number;
}

export const OFFICIAL_VACCINES: VaccineCatalogItem[] = [
  { id: "bcg", name: "BCG", doseLabel: "Dose unica", scheduledMonth: 0, sortOrder: 0 },
  { id: "hepatite-b-1", name: "Hepatite B", doseLabel: "1a dose", scheduledMonth: 0, sortOrder: 1 },
  { id: "penta-1", name: "Penta", doseLabel: "1a dose", scheduledMonth: 2, sortOrder: 0 },
  { id: "vip-1", name: "VIP", doseLabel: "1a dose", scheduledMonth: 2, sortOrder: 1 },
  { id: "pneumo10-1", name: "Pneumococica 10v", doseLabel: "1a dose", scheduledMonth: 2, sortOrder: 2 },
  { id: "rotavirus-1", name: "Rotavirus", doseLabel: "1a dose", scheduledMonth: 2, sortOrder: 3 },
  { id: "meningococica-c-1", name: "Meningococica C", doseLabel: "1a dose", scheduledMonth: 2, sortOrder: 4 },
  { id: "penta-2", name: "Penta", doseLabel: "2a dose", scheduledMonth: 4, sortOrder: 0 },
  { id: "vip-2", name: "VIP", doseLabel: "2a dose", scheduledMonth: 4, sortOrder: 1 },
  { id: "pneumo10-2", name: "Pneumococica 10v", doseLabel: "2a dose", scheduledMonth: 4, sortOrder: 2 },
  { id: "rotavirus-2", name: "Rotavirus", doseLabel: "2a dose", scheduledMonth: 4, sortOrder: 3 },
  { id: "meningococica-c-2", name: "Meningococica C", doseLabel: "2a dose", scheduledMonth: 5, sortOrder: 0 },
  { id: "penta-3", name: "Penta", doseLabel: "3a dose", scheduledMonth: 6, sortOrder: 0 },
  { id: "vip-3", name: "VIP", doseLabel: "3a dose", scheduledMonth: 6, sortOrder: 1 },
  { id: "influenza-1", name: "Influenza trivalente", doseLabel: "1a dose", scheduledMonth: 6, sortOrder: 2 },
  { id: "covid-1", name: "Covid-19", doseLabel: "1a dose", scheduledMonth: 6, sortOrder: 3 },
  { id: "covid-2", name: "Covid-19", doseLabel: "2a dose", scheduledMonth: 7, sortOrder: 0 },
  { id: "covid-3", name: "Covid-19", doseLabel: "3a dose", scheduledMonth: 9, sortOrder: 0 },
  { id: "febre-amarela-1", name: "Febre amarela", doseLabel: "1a dose", scheduledMonth: 9, sortOrder: 1 },
  { id: "pneumo10-reforco-1", name: "Pneumococica 10v", doseLabel: "Reforco", scheduledMonth: 12, sortOrder: 0 },
  { id: "meningococica-acwy-1", name: "Meningococica ACWY", doseLabel: "Dose unica", scheduledMonth: 12, sortOrder: 1 },
  { id: "scr-1", name: "SCR", doseLabel: "1a dose", scheduledMonth: 12, sortOrder: 2 },
  { id: "dtp-reforco-1", name: "DTP", doseLabel: "1o reforco", scheduledMonth: 15, sortOrder: 0 },
  { id: "vip-reforco-1", name: "VIP", doseLabel: "1o reforco", scheduledMonth: 15, sortOrder: 1 },
  { id: "scr-2", name: "SCR", doseLabel: "2a dose", scheduledMonth: 15, sortOrder: 2 },
  { id: "varicela-1", name: "Varicela", doseLabel: "1a dose", scheduledMonth: 15, sortOrder: 3 },
  { id: "hepatite-a-1", name: "Hepatite A", doseLabel: "1a dose", scheduledMonth: 15, sortOrder: 4 },
];

export function formatScheduledMonthLabel(month: number): string {
  if (month === 0) {
    return "Nascimento";
  }

  if (month === 1) {
    return "1 mes";
  }

  return `${month} meses`;
}
