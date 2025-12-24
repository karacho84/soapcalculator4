import { useState, useCallback } from 'react';
import type { Recipe } from '../models/Recipe';
import { StorageService } from '../services/StorageService';
import { useCloudSync } from './useCloudSync';

export const useRecipes = () => {
  const { syncNow, isAuthenticated } = useCloudSync();

  // Initialize state directly with data from storage
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const storedRecipes = StorageService.getRecipes();
    return storedRecipes.sort((a, b) => 
      new Date(b.created).getTime() - new Date(a.created).getTime()
    );
  });

  const loadRecipes = useCallback(() => {
    const storedRecipes = StorageService.getRecipes();
    // Sort by created date descending (newest first)
    const sortedRecipes = storedRecipes.sort((a, b) => 
      new Date(b.created).getTime() - new Date(a.created).getTime()
    );
    setRecipes(sortedRecipes);
  }, []);

  const deleteRecipe = useCallback((id: string) => {
    StorageService.deleteRecipe(id);
    loadRecipes();
    if (isAuthenticated) {
        syncNow();
    }
  }, [loadRecipes, isAuthenticated, syncNow]);

  const saveRecipe = useCallback((recipe: Recipe) => {
    StorageService.saveRecipe(recipe);
    loadRecipes();
    if (isAuthenticated) {
        syncNow();
    }
  }, [loadRecipes, isAuthenticated, syncNow]);

  return {
    recipes,
    deleteRecipe,
    saveRecipe,
    refreshRecipes: loadRecipes
  };
};
