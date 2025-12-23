import type { Oil } from '../models/Oil';
import type { Recipe } from '../models/Recipe';

const KEYS = {
  OILS: 'seifenrechner_oils',
  RECIPES: 'seifenrechner_recipes',
} as const;

export const StorageService = {
  // --- Generic Helper ---
  getItem: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error loading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  setItem: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error);
    }
  },

  // --- Oils ---
  getOils: (): Oil[] => {
    return StorageService.getItem<Oil[]>(KEYS.OILS, []);
  },

  saveOils: (oils: Oil[]): void => {
    StorageService.setItem(KEYS.OILS, oils);
  },

  // --- Recipes ---
  getRecipes: (): Recipe[] => {
    // Recipes might need Date reconstruction if stored as strings
    const recipes = StorageService.getItem<Recipe[]>(KEYS.RECIPES, []);
    return recipes.map(r => ({
      ...r,
      created: new Date(r.created) 
    }));
  },

  saveRecipes: (recipes: Recipe[]): void => {
    StorageService.setItem(KEYS.RECIPES, recipes);
  },

  saveRecipe: (recipe: Recipe): void => {
    const recipes = StorageService.getRecipes();
    const index = recipes.findIndex(r => r.id === recipe.id);
    if (index >= 0) {
      recipes[index] = recipe;
    } else {
      recipes.push(recipe);
    }
    StorageService.saveRecipes(recipes);
  },

  deleteRecipe: (id: string): void => {
    const recipes = StorageService.getRecipes();
    const filteredRecipes = recipes.filter(r => r.id !== id);
    StorageService.saveRecipes(filteredRecipes);
  },

  // --- Import Helpers ---
  importBackup: (oils: Oil[], recipes: Recipe[]): void => {
    // 1. Merge Oils (Overwrite if exists, add if new)
    const currentOils = StorageService.getOils();
    const mergedOils = [...currentOils];
    
    oils.forEach(newOil => {
      const index = mergedOils.findIndex(o => o.id === newOil.id);
      if (index >= 0) {
        mergedOils[index] = newOil;
      } else {
        mergedOils.push(newOil);
      }
    });
    StorageService.saveOils(mergedOils);

    // 2. Merge Recipes
    const currentRecipes = StorageService.getRecipes();
    const mergedRecipes = [...currentRecipes];

    recipes.forEach(newRecipe => {
      // Ensure Dates are Date objects
      const parsedRecipe = {
          ...newRecipe,
          created: new Date(newRecipe.created)
      };

      const index = mergedRecipes.findIndex(r => r.id === parsedRecipe.id);
      if (index >= 0) {
        mergedRecipes[index] = parsedRecipe;
      } else {
        mergedRecipes.push(parsedRecipe);
      }
    });
    StorageService.saveRecipes(mergedRecipes);
  }
};
