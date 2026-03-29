export type DiaperType = "xixi" | "coco" | "ambos";
export type Consistency = "liquido" | "pastoso" | "solido";
export type DiaperColor = "#8B4513" | "#DAA520" | "#556B2F";

export interface DiaperRegistryForm {
  type: DiaperType;
  consistency: Consistency;
  color: DiaperColor;
  notes: string;
}

export interface GrowthRegistryForm {
  weight: number | null;
  height: number | null;
  cephalicPerimeter: number | null;
  date: Date;
  notes: string;
}
