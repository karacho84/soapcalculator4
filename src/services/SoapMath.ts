import type { Oil } from '../models/Oil';
import type { Recipe } from '../models/Recipe';

export interface CalculationResult {
  lyeAmount: {
    naoh: number;
    koh: number;
  };
  waterAmount: number;
  fragranceAmount: number; // New field for fragrance weight
  totalWeight: number; // Soap + Water + Lye + Fragrance
  iodine: number; // Gewichtete Jodzahl
  ins: number;    // Gewichteter INS-Wert
  warnings: string[];
  isValid: boolean;
}

// Constants for calculations
const KOH_CONVERSION_FACTOR = 1.4025; // Ratio molecular weight KOH/NaOH
const PERCENTAGE_EPSILON = 0.1; // Tolerance for 100% check

export const SoapMath = {
  calculate: (recipe: Recipe, oils: Oil[]): CalculationResult => {
    const { totalFatWeight, superFat, waterRatio, lyeType, ratioKoh, fragrance } = recipe;
    const items = recipe.items || [];

    let totalNaohNeeded = 0;
    let totalKohNeeded = 0;
    let currentTotalPercentage = 0;
    let weightedIodine = 0;
    let weightedIns = 0;
    const warnings: string[] = [];

    // Helper to find oil
    const getOil = (id: string) => oils.find((o) => o.id === id);

    // 1. Calculate Lye for each item
    items.forEach((item) => {
      const oil = getOil(item.oilId);
      if (!oil) {
        warnings.push(`Oil with ID ${item.oilId} not found.`);
        return;
      }

      currentTotalPercentage += item.percentage;

      const itemWeight = (totalFatWeight * item.percentage) / 100;
      
      // Determine SAP values
      const sapNaoh = item.isCustomSap && item.customSapNaoh ? item.customSapNaoh : (oil.sapNaoh || 0);
      let sapKoh = oil.sapKoh || 0; 
      
      if (!item.isCustomSap && (oil.sapNaoh === undefined || oil.sapKoh === undefined)) {
          warnings.push(`Oil "${oil.name}" has missing SAP values. Treated as 0.`);
      }

      // If custom SAP is provided (usually NaOH), estimate KOH if needed.
      if (item.isCustomSap && item.customSapNaoh) {
          sapKoh = item.customSapNaoh * KOH_CONVERSION_FACTOR;
      }

      // Calculate pure lye requirement for this item (0% superfat)
      if (lyeType === 'NaOH') {
        totalNaohNeeded += itemWeight * sapNaoh;
      } else if (lyeType === 'KOH') {
        totalKohNeeded += itemWeight * sapKoh;
      } else if (lyeType === 'Mixed') {
        const kohRatio = (ratioKoh || 0) / 100;
        const naohRatio = 1 - kohRatio;

        totalNaohNeeded += itemWeight * sapNaoh * naohRatio;
        totalKohNeeded += itemWeight * sapKoh * kohRatio;
      }

      // Calculate Iodine and INS Contribution
      // INS = (SAP_KOH * 1000) - Iodine
      const iodineValue = oil.iodine || 0;
      // Use standard SAP KOH for INS calculation to be consistent with standard INS definitions, 
      // regardless of lye type used in recipe.
      const insValue = (sapKoh * 1000) - iodineValue;

      weightedIodine += iodineValue * (item.percentage / 100);
      weightedIns += insValue * (item.percentage / 100);
    });

    // 2. Validate Totals
    if (Math.abs(currentTotalPercentage - 100) > PERCENTAGE_EPSILON) {
      warnings.push(`Sum of oils is ${currentTotalPercentage.toFixed(1)}% (should be 100%).`);
    }

    // 3. Apply Superfat
    // Lye = CalculatedLye * (1 - superFat/100)
    const superFatFactor = 1 - (superFat / 100);
    
    totalNaohNeeded = totalNaohNeeded * superFatFactor;
    totalKohNeeded = totalKohNeeded * superFatFactor;

    // 4. Calculate Water
    const waterAmount = (totalFatWeight * waterRatio) / 100;

    // 5. Calculate Fragrance
    let fragranceAmount = 0;
    if (fragrance && fragrance.percentage > 0) {
      fragranceAmount = (totalFatWeight * fragrance.percentage) / 100;
    }

    // 6. Total Batch Weight
    // Fat + Water + Lye + Fragrance
    const totalWeight = totalFatWeight + waterAmount + totalNaohNeeded + totalKohNeeded + fragranceAmount;

    return {
      lyeAmount: {
        naoh: parseFloat(totalNaohNeeded.toFixed(2)),
        koh: parseFloat(totalKohNeeded.toFixed(2)),
      },
      waterAmount: parseFloat(waterAmount.toFixed(2)),
      fragranceAmount: parseFloat(fragranceAmount.toFixed(2)),
      totalWeight: parseFloat(totalWeight.toFixed(2)),
      iodine: Math.round(weightedIodine),
      ins: Math.round(weightedIns),
      warnings,
      isValid: warnings.length === 0,
    };
  }
};
