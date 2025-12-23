import type { RecipeFragrance } from './Fragrance';

export type LyeType = 'NaOH' | 'KOH' | 'Mixed';

export interface RecipeItem {
  id: string;
  recipeId: string;
  oilId: string;
  percentage: number; // Anteil im Rezept (%)
  weight: number;     // Berechnetes Gewicht (g)
  isCustomSap: boolean;
  customSapNaoh?: number;
}

export interface Recipe {
  id: string;
  name: string;
  created: Date;
  totalFatWeight: number; // Gesamtfettmenge (g)
  superFat: number;       // Überfettung (%)
  waterRatio: number;     // Wasseranteil an Fett (%)
  lyeType: LyeType;
  ratioKoh?: number;      // Anteil KOH bei Mixed (%)
  notes?: string;

  // Fragrance Settings (Simple for MVP)
  fragrance?: {
    percentage: number; // % of Total Oil Weight
    type: 'essential' | 'fragrance_oil' | 'none';
    name?: string; 
  };

  items: RecipeItem[];
  fragrances?: RecipeFragrance[]; // For future detailed list
}
