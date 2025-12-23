import type { Oil } from '../models/Oil';
import type { Recipe } from '../models/Recipe';

export type ExportType = 'oil' | 'recipe' | 'backup';

export interface ExportData {
  version: number;
  type: ExportType;
  timestamp: string;
}

export interface SingleOilExport extends ExportData {
  type: 'oil';
  data: Oil;
}

export interface SingleRecipeExport extends ExportData {
  type: 'recipe';
  data: Recipe;
}

export interface FullBackupExport extends ExportData {
  type: 'backup';
  oils: Oil[];
  recipes: Recipe[];
}

export const DataService = {
  CURRENT_VERSION: 1,

  createExportData: (type: ExportType, data: any): string => {
    const base: ExportData = {
      version: DataService.CURRENT_VERSION,
      type,
      timestamp: new Date().toISOString()
    };

    let exportObj: any = { ...base };

    if (type === 'oil') {
      exportObj.data = data;
    } else if (type === 'recipe') {
      exportObj.data = data;
    } else if (type === 'backup') {
       exportObj.oils = data.oils;
       exportObj.recipes = data.recipes;
    }

    return JSON.stringify(exportObj, null, 2);
  },

  downloadJson: (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  readJsonFile: (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          resolve(json);
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }
};
