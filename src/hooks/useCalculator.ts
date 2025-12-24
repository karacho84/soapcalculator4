import { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Recipe, RecipeItem } from '../models/Recipe';
import { SoapMath } from '../services/SoapMath';
import { useOils } from './useOils';
import { StorageService } from '../services/StorageService';
import { useCloudSync } from './useCloudSync';

const DEFAULT_RECIPE: Recipe = {
  id: '',
  name: 'My Recipe',
  created: new Date(),
  totalFatWeight: 500, // g
  superFat: 5,        // %
  waterRatio: 33,     // %
  lyeType: 'NaOH',
  ratioKoh: 0,
  items: []
};

const createNewRecipe = (): Recipe => ({
  ...DEFAULT_RECIPE,
  id: uuidv4(),
  created: new Date()
});

const calculateItemWeight = (totalFat: number, percentage: number): number => {
  return (totalFat * percentage) / 100;
};

export const useCalculator = (initialRecipeId?: string) => {
  const { oils } = useOils();
  const { syncNow, isAuthenticated } = useCloudSync();
  const [recipe, setRecipe] = useState<Recipe>(createNewRecipe);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Load recipe if ID is provided
  useEffect(() => {
    // We only load if we haven't loaded yet to prevent loops, unless ID changes.
    // However, the error is about calling setState synchronously.
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (initialRecipeId && initialRecipeId !== 'new') {
      const recipes = StorageService.getRecipes();
      const found = recipes.find(r => r.id === initialRecipeId);
      if (found) {
        setRecipe(found);
      }
      setIsDirty(false);
    } else if (initialRecipeId === 'new') {
        // Reset to default for new recipe
        setRecipe(createNewRecipe());
        setIsDirty(false);
    }
    setIsLoaded(true);
  }, [initialRecipeId]);

  // Derived state: Calculation Result
  const calculationResult = useMemo(() => {
    if (!isLoaded) return null;
    return SoapMath.calculate(recipe, oils);
  }, [recipe, oils, isLoaded]);

  // Update general settings
  const updateSettings = useCallback((settings: Partial<Recipe>) => {
    setRecipe(prev => {
        const next = { ...prev, ...settings };
        // Recalculate weights if totalFatWeight changes
        if (settings.totalFatWeight !== undefined) {
             next.items = next.items.map(item => ({
                 ...item,
                 weight: calculateItemWeight(next.totalFatWeight, item.percentage)
             }));
        }
        return next;
    });
    setIsDirty(true);
  }, []);

  // Add an oil to the recipe
  const addOilItem = useCallback((oilId: string) => {
    setRecipe(prev => {
      const newItem: RecipeItem = {
        id: uuidv4(),
        recipeId: prev.id,
        oilId,
        percentage: 0,
        weight: 0,
        isCustomSap: false
      };
      return { ...prev, items: [...prev.items, newItem] };
    });
    setIsDirty(true);
  }, []);

  // Remove an oil from the recipe
  const removeOilItem = useCallback((itemId: string) => {
    setRecipe(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
    setIsDirty(true);
  }, []);

  // Update a specific item (percentage, etc.)
  const updateOilItem = useCallback((itemId: string, updates: Partial<RecipeItem>) => {
    setRecipe(prev => ({
      ...prev,
      items: prev.items.map(item => {
          if (item.id !== itemId) return item;
          
          const updatedItem = { ...item, ...updates };
          
          // If percentage changed, update weight
          if (updates.percentage !== undefined) {
              updatedItem.weight = calculateItemWeight(prev.totalFatWeight, updatedItem.percentage);
          }
          
          return updatedItem;
      })
    }));
    setIsDirty(true);
  }, []);

  const saveCurrentRecipe = useCallback(() => {
    StorageService.saveRecipe(recipe);
    setIsDirty(false);
    if (isAuthenticated) {
      syncNow();
    }
  }, [recipe, isAuthenticated, syncNow]);

  return {
    recipe,
    calculationResult,
    updateSettings,
    addOilItem,
    removeOilItem,
    updateOilItem,
    saveCurrentRecipe,
    availableOils: oils,
    isLoaded,
    isDirty
  };
};
