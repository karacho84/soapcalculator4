import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCalculator } from './useCalculator';
import { StorageService } from '../services/StorageService';
import { useOils } from './useOils';
import { useCloudSync } from './useCloudSync';
import type { Oil } from '../models/Oil';
import type { Recipe } from '../models/Recipe';

// Mocks
vi.mock('../services/StorageService');
vi.mock('./useOils');
vi.mock('./useCloudSync');

describe('useCalculator', () => {
  const mockOils: Oil[] = [
    { id: 'oil1', name: 'Olive Oil', sapNaoh: 0.134, sapKoh: 0.188, iodine: 82 }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useOils as any).mockReturnValue({ oils: mockOils });
    (useCloudSync as any).mockReturnValue({ syncNow: vi.fn(), isAuthenticated: false });
    (StorageService.getRecipes as any).mockReturnValue([]);
  });

  it('should initialize with default recipe', () => {
    const { result } = renderHook(() => useCalculator());
    expect(result.current.recipe.name).toBe('My Recipe');
    expect(result.current.recipe.totalFatWeight).toBe(500);
    expect(result.current.isDirty).toBe(false);
  });

  it('should load recipe by ID', () => {
    const mockRecipe: Recipe = {
      id: 'r1',
      name: 'Loaded Recipe',
      created: new Date(),
      totalFatWeight: 700,
      superFat: 8,
      waterRatio: 30,
      lyeType: 'NaOH',
      items: []
    };
    (StorageService.getRecipes as any).mockReturnValue([mockRecipe]);

    const { result } = renderHook(() => useCalculator('r1'));
    
    expect(result.current.recipe.name).toBe('Loaded Recipe');
    expect(result.current.recipe.totalFatWeight).toBe(700);
  });

  it('should update settings and recalculate weights', () => {
    const { result } = renderHook(() => useCalculator());
    
    act(() => {
      result.current.addOilItem('oil1');
    });

    act(() => {
      result.current.updateOilItem(result.current.recipe.items[0].id, { percentage: 50 });
    });

    expect(result.current.recipe.items[0].weight).toBe(250); // 50% of 500

    act(() => {
      result.current.updateSettings({ totalFatWeight: 1000 });
    });

    expect(result.current.recipe.totalFatWeight).toBe(1000);
    expect(result.current.recipe.items[0].weight).toBe(500); // 50% of 1000
    expect(result.current.isDirty).toBe(true);
  });

  it('should add and remove oil items', () => {
    const { result } = renderHook(() => useCalculator());
    
    act(() => {
      result.current.addOilItem('oil1');
    });
    expect(result.current.recipe.items.length).toBe(1);
    expect(result.current.recipe.items[0].oilId).toBe('oil1');

    act(() => {
      result.current.removeOilItem(result.current.recipe.items[0].id);
    });
    expect(result.current.recipe.items.length).toBe(0);
  });

  it('should save recipe and sync if authenticated', () => {
    const syncNow = vi.fn();
    (useCloudSync as any).mockReturnValue({ syncNow, isAuthenticated: true });
    
    const { result } = renderHook(() => useCalculator());
    
    act(() => {
      result.current.saveCurrentRecipe();
    });

    expect(StorageService.saveRecipe).toHaveBeenCalledWith(result.current.recipe);
    expect(syncNow).toHaveBeenCalled();
    expect(result.current.isDirty).toBe(false);
  });
});
