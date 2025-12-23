export interface Fragrance {
  id: string;
  name: string;
  type: 'essential' | 'fragrance_oil';
  notes?: string;
}

export interface RecipeFragrance {
  id: string;
  recipeId: string;
  fragranceId?: string; // Optional, falls nur generisch "Duft"
  percentage: number;
  weight: number;
  name?: string; // Fallback Name wenn kein Fragrance Objekt
  type: 'essential' | 'fragrance_oil' | 'none';
}
