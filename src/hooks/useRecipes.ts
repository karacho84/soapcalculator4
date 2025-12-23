import { useState, useCallback } from 'react';
import type { Recipe } from '../models/Recipe';
import { StorageService } from '../services/StorageService';

export const useRecipes = () => {
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
  }, [loadRecipes]);

  const saveRecipe = useCallback((recipe: Recipe) => {
    StorageService.saveRecipe(recipe);
    loadRecipes();
  }, [loadRecipes]);

  return {
    recipes,
    deleteRecipe,
    saveRecipe,
    refreshRecipes: loadRecipes
  };
};
