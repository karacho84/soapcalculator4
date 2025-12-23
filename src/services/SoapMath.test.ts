import { describe, it, expect } from 'vitest';
import { SoapMath } from './SoapMath';
import type { Recipe } from '../models/Recipe';
import type { Oil } from '../models/Oil';

describe('SoapMath', () => {
  const mockOils: Oil[] = [
    { id: '1', name: 'Olive Oil', sapNaoh: 0.134, sapKoh: 0.188, notes: '' },
    { id: '2', name: 'Coconut Oil', sapNaoh: 0.183, sapKoh: 0.257, notes: '' },
  ];

  it('should calculate NaOH correctly for a simple recipe', () => {
    const recipe: Recipe = {
      id: 'test',
      name: 'Test',
      created: new Date(),
      totalFatWeight: 500,
      superFat: 5,
      waterRatio: 33,
      lyeType: 'NaOH',
      ratioKoh: 0,
      items: [
        { id: 'i1', recipeId: 'test', oilId: '1', percentage: 100, weight: 500, isCustomSap: false }
      ]
    };

    const result = SoapMath.calculate(recipe, mockOils);

    // 500g Olive Oil * 0.134 = 67g pure NaOH
    // Superfat 5% => 67 * 0.95 = 63.65g NaOH
    expect(result.lyeAmount.naoh).toBe(63.65);
    expect(result.lyeAmount.koh).toBe(0);
    expect(result.waterAmount).toBe(165); // 500 * 0.33
    expect(result.isValid).toBe(true);
  });

  it('should calculate KOH correctly for a simple recipe', () => {
    const recipe: Recipe = {
        id: 'test',
        name: 'Test',
        created: new Date(),
        totalFatWeight: 500,
        superFat: 0,
        waterRatio: 30,
        lyeType: 'KOH',
        ratioKoh: 0,
        items: [
          { id: 'i1', recipeId: 'test', oilId: '1', percentage: 100, weight: 500, isCustomSap: false }
        ]
      };
  
      const result = SoapMath.calculate(recipe, mockOils);
  
      // 500g Olive Oil * 0.188 = 94g pure KOH
      expect(result.lyeAmount.koh).toBe(94.00);
      expect(result.lyeAmount.naoh).toBe(0);
  });

  it('should handle mixed lye recipes correctly', () => {
     const recipe: Recipe = {
         id: 'test',
         name: 'Test Mixed',
         created: new Date(),
         totalFatWeight: 100,
         superFat: 0,
         waterRatio: 30,
         lyeType: 'Mixed',
         ratioKoh: 50, // 50:50
         items: [
             { id: 'i1', recipeId: 'test', oilId: '1', percentage: 100, weight: 100, isCustomSap: false }
         ]
     };

     const result = SoapMath.calculate(recipe, mockOils);
     
     // 100g Olive Oil
     // NaOH part: 100 * 0.134 * 0.5 = 6.7g
     // KOH part: 100 * 0.188 * 0.5 = 9.4g
     expect(result.lyeAmount.naoh).toBeCloseTo(6.7, 1);
     expect(result.lyeAmount.koh).toBeCloseTo(9.4, 1);
  });

  it('should add warning if percentages do not sum up to 100%', () => {
    const recipe: Recipe = {
      id: 'test',
      name: 'Test',
      created: new Date(),
      totalFatWeight: 500,
      superFat: 5,
      waterRatio: 33,
      lyeType: 'NaOH',
      ratioKoh: 0,
      items: [
        { id: 'i1', recipeId: 'test', oilId: '1', percentage: 90, weight: 450, isCustomSap: false }
      ]
    };

    const result = SoapMath.calculate(recipe, mockOils);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
