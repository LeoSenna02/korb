// Milestone categories
export type MilestoneCategory = "motor_grossa" | "motor_fina" | "linguagem" | "social";

// Category display info
export const CATEGORY_INFO: Record<
  MilestoneCategory,
  { label: string; color: string; icon: string }
> = {
  motor_grossa: {
    label: "Motor Grossa",
    color: "#7B9E87", // primary sage green
    icon: "body",
  },
  motor_fina: {
    label: "Motor Fina",
    color: "#584325", // warm brown
    icon: "hand",
  },
  linguagem: {
    label: "Linguagem",
    color: "#5B7B9E", // cool blue
    icon: "message-circle",
  },
  social: {
    label: "Social",
    color: "#9E7B9E", // soft purple
    icon: "users",
  },
};

// Default milestone templates (based on OMS/AAP guidelines)
export interface MilestoneTemplate {
  id: string;
  category: MilestoneCategory;
  name: string;
  description: string;
  expectedAgeMonthsMin: number;
  expectedAgeMonthsMax: number;
}

export const DEFAULT_MILESTONES: MilestoneTemplate[] = [
  // Motor Grossa
  {
    id: "mg-001",
    category: "motor_grossa",
    name: "Sustenta a cabeça",
    description: "consegue levantar e sustentar a cabeça quando de bruços",
    expectedAgeMonthsMin: 0,
    expectedAgeMonthsMax: 2,
  },
  {
    id: "mg-002",
    category: "motor_grossa",
    name: "Senta com apoio",
    description: "consegue sentar com apoio nas mãos",
    expectedAgeMonthsMin: 4,
    expectedAgeMonthsMax: 6,
  },
  {
    id: "mg-003",
    category: "motor_grossa",
    name: "Senta sem apoio",
    description: "consegue sentar sozinho sem apoio",
    expectedAgeMonthsMin: 6,
    expectedAgeMonthsMax: 8,
  },
  {
    id: "mg-004",
    category: "motor_grossa",
    name: "Engatinha",
    description: "consegue engatinhar de forma autônoma",
    expectedAgeMonthsMin: 8,
    expectedAgeMonthsMax: 10,
  },
  {
    id: "mg-005",
    category: "motor_grossa",
    name: "Anda apoiado",
    description: "consegue andar segurando em móveis ou mãos",
    expectedAgeMonthsMin: 9,
    expectedAgeMonthsMax: 12,
  },
  {
    id: "mg-006",
    category: "motor_grossa",
    name: "Anda sozinho",
    description: "consegue andar sem apoio",
    expectedAgeMonthsMin: 12,
    expectedAgeMonthsMax: 15,
  },

  // Motor Fina
  {
    id: "mf-001",
    category: "motor_fina",
    name: "Segue objetos com olhos",
    description: "consegue seguir objetos em movimento com o olhar",
    expectedAgeMonthsMin: 0,
    expectedAgeMonthsMax: 2,
  },
  {
    id: "mf-002",
    category: "motor_fina",
    name: "Alcança objetos",
    description: "estende a mão para alcançar objetos",
    expectedAgeMonthsMin: 3,
    expectedAgeMonthsMax: 4,
  },
  {
    id: "mf-003",
    category: "motor_fina",
    name: "Passa objetos",
    description: "consegue passar objetos de uma mão para outra",
    expectedAgeMonthsMin: 5,
    expectedAgeMonthsMax: 6,
  },
  {
    id: "mf-004",
    category: "motor_fina",
    name: "Pega objetos com polegar",
    description: "consegue segurar objetos usando o polegar",
    expectedAgeMonthsMin: 6,
    expectedAgeMonthsMax: 8,
  },
  {
    id: "mf-005",
    category: "motor_fina",
    name: "Pinça",
    description: "consegue pegar pequenos objetos com polegar e indicador",
    expectedAgeMonthsMin: 9,
    expectedAgeMonthsMax: 12,
  },

  // Linguagem
  {
    id: "li-001",
    category: "linguagem",
    name: "Vocaliza vogais",
    description: "produz sons com vogais (a, e, i, o, u)",
    expectedAgeMonthsMin: 2,
    expectedAgeMonthsMax: 3,
  },
  {
    id: "li-002",
    category: "linguagem",
    name: "Balbucia",
    description: "faz sons de balbuciação (ma-ma-ma, pa-pa-pa)",
    expectedAgeMonthsMin: 4,
    expectedAgeMonthsMax: 6,
  },
  {
    id: "li-003",
    category: "linguagem",
    name: "Diz 'mamã' / 'papá'",
    description: "consegue associar 'mamã' ou 'papá' com significado",
    expectedAgeMonthsMin: 6,
    expectedAgeMonthsMax: 9,
  },
  {
    id: "li-004",
    category: "linguagem",
    name: "Primeira palavra",
    description: "diz primeira palavra com sentido próprio",
    expectedAgeMonthsMin: 10,
    expectedAgeMonthsMax: 12,
  },
  {
    id: "li-005",
    category: "linguagem",
    name: "10+ palavras",
    description: "consegue dizer pelo menos 10 palavras diferentes",
    expectedAgeMonthsMin: 15,
    expectedAgeMonthsMax: 18,
  },

  // Social
  {
    id: "so-001",
    category: "social",
    name: "Sorri social",
    description: "sorri em resposta a interações sociais",
    expectedAgeMonthsMin: 2,
    expectedAgeMonthsMax: 3,
  },
  {
    id: "so-002",
    category: "social",
    name: "Ri alto",
    description: "consegue dar risadas audíveis e expressivas",
    expectedAgeMonthsMin: 4,
    expectedAgeMonthsMax: 5,
  },
  {
    id: "so-003",
    category: "social",
    name: "Ansiedade de estranho",
    description: "mostra reservations com pessoas desconhecidas",
    expectedAgeMonthsMin: 7,
    expectedAgeMonthsMax: 9,
  },
  {
    id: "so-004",
    category: "social",
    name: "Ondas 'tchau'",
    description: "faz gestos de despedida como 'tchau'",
    expectedAgeMonthsMin: 9,
    expectedAgeMonthsMax: 12,
  },
  {
    id: "so-005",
    category: "social",
    name: "Brinca de 'esconde-esconde'",
    description: "diverte-se com jogos de esconder e aparecer",
    expectedAgeMonthsMin: 12,
    expectedAgeMonthsMax: 15,
  },
];

// Get milestones by category
export function getMilestonesByCategory(
  category: MilestoneCategory
): MilestoneTemplate[] {
  return DEFAULT_MILESTONES.filter((m) => m.category === category);
}

// Format age range for display
export function formatAgeRange(min: number, max: number): string {
  if (min === 0 && max === 2) return "0-2 meses";
  if (min === max) return `${min} meses`;
  return `${min}-${max} meses`;
}
