import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageService } from './StorageService';
import type { Oil } from '../models/Oil';
import type { Recipe } from '../models/Recipe';

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should save and get oils', () => {
    const mockOils: Oil[] = [
      { id: '1', name: 'Olive Oil', sapNaoh: 0.134, sapKoh: 0.188, iodine: 82 }
    ];
    StorageService.saveOils(mockOils);
    expect(StorageService.getOils()).toEqual(mockOils);
  });

  it('should save and get recipes with date reconstruction', () => {
    const now = new Date();
    const mockRecipes: Recipe[] = [
      {
        id: '1',
        name: 'Test Recipe',
        created: now,
        totalFatWeight: 500,
        superFat: 5,
        waterRatio: 33,
        lyeType: 'NaOH',
        items: []
      }
    ];
    StorageService.saveRecipes(mockRecipes);
    const retrieved = StorageService.getRecipes();
    expect(retrieved[0].created).toBeInstanceOf(Date);
    expect(retrieved[0].created.getTime()).toBe(now.getTime());
    expect(retrieved[0].name).toBe('Test Recipe');
  });

  it('should save a single recipe (insert)', () => {
    const recipe: Recipe = {
      id: '1',
      name: 'New Recipe',
      created: new Date(),
      totalFatWeight: 500,
      superFat: 5,
      waterRatio: 33,
      lyeType: 'NaOH',
      items: []
    };
    StorageService.saveRecipe(recipe);
    expect(StorageService.getRecipes().length).toBe(1);
    expect(StorageService.getRecipes()[0].id).toBe('1');
  });

  it('should update an existing recipe', () => {
    const recipe: Recipe = {
      id: '1',
      name: 'Original',
      created: new Date(),
      totalFatWeight: 500,
      superFat: 5,
      waterRatio: 33,
      lyeType: 'NaOH',
      items: []
    };
    StorageService.saveRecipe(recipe);
    
    const updatedRecipe = { ...recipe, name: 'Updated' };
    StorageService.saveRecipe(updatedRecipe);
    
    expect(StorageService.getRecipes().length).toBe(1);
    expect(StorageService.getRecipes()[0].name).toBe('Updated');
  });

  it('should delete a recipe', () => {
    const recipe: Recipe = {
      id: '1',
      name: 'To Delete',
      created: new Date(),
      totalFatWeight: 500,
      superFat: 5,
      waterRatio: 33,
      lyeType: 'NaOH',
      items: []
    };
    StorageService.saveRecipe(recipe);
    StorageService.deleteRecipe('1');
    expect(StorageService.getRecipes().length).toBe(0);
  });

  it('should handle errors in getItem', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Force a JSON parse error
    localStorage.setItem('seifenrechner_oils', 'invalid json');
    
    const oils = StorageService.getOils();
    expect(oils).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should import backup data correctly', () => {
    const existingOils: Oil[] = [{ id: '1', name: 'Old Oil', sapNaoh: 0.1, sapKoh: 0.14, iodine: 50 }];
    const existingRecipes: Recipe[] = [{
        id: 'r1', name: 'Old Recipe', created: new Date(), totalFatWeight: 100, superFat: 5, waterRatio: 30, lyeType: 'NaOH', items: []
    }];
    StorageService.saveOils(existingOils);
    StorageService.saveRecipes(existingRecipes);

    const newOils: Oil[] = [
        { id: '1', name: 'Updated Oil', sapNaoh: 0.2, sapKoh: 0.28, iodine: 60 },
        { id: '2', name: 'New Oil', sapNaoh: 0.3, sapKoh: 0.42, iodine: 70 }
    ];
    const newRecipes: Recipe[] = [{
        id: 'r2', name: 'New Recipe', created: new Date(), totalFatWeight: 200, superFat: 10, waterRatio: 33, lyeType: 'NaOH', items: []
    }];

    StorageService.importBackup(newOils, newRecipes);

    const resultOils = StorageService.getOils();
    expect(resultOils.length).toBe(2);
    expect(resultOils.find(o => o.id === '1')?.name).toBe('Updated Oil');
    expect(resultOils.find(o => o.id === '2')?.name).toBe('New Oil');

    const resultRecipes = StorageService.getRecipes();
    expect(resultRecipes.length).toBe(2);
    expect(resultRecipes.find(r => r.id === 'r2')?.name).toBe('New Recipe');
  });
});
