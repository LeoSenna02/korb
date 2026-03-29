import type { WeeklyStat } from "./types";

const today = new Date().toLocaleDateString("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const yesterday = new Date(Date.now() - 86400000).toLocaleDateString("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const HISTORY_MOCK_DATA: any[] = [
  {
    label: "Hoje",
    activities: [
      {
        id: "h1",
        type: "mamada",
        title: "Amamentação",
        details: "Seio esquerdo",
        date: today,
        time: "14:30",
        duration: "15 min",
      },
      {
        id: "h2",
        type: "sono",
        title: "Sono da Tarde",
        details: "Berço",
        date: today,
        time: "13:15",
        duration: "1h 20m",
        isOngoing: true,
      },
      {
        id: "h3",
        type: "fralda",
        title: "Troca de Fralda",
        details: "Xixi + Cocô",
        date: today,
        time: "11:45",
        duration: "Suje",
      },
    ],
  },
  {
    label: "Ontem",
    activities: [
      {
        id: "h4",
        type: "mamada",
        title: "Amamentação",
        details: "Mamadeira",
        date: yesterday,
        time: "21:00",
        duration: "120ml",
      },
      {
        id: "h5",
        type: "sono",
        title: "Sono Noturno",
        details: "Cama",
        date: yesterday,
        time: "19:30",
        duration: "10h 45m",
      },
    ],
  },
];

export const WEEKLY_STATS: WeeklyStat[] = [
  {
    id: "ws1",
    icon: "feeding",
    value: "42",
    label: "Mamadas Totais",
  },
  {
    id: "ws2",
    icon: "sleep",
    value: "14h",
    label: "Média de Sono/Dia",
  },
];
