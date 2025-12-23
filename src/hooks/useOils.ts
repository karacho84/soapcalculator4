import { useState, useCallback } from 'react';
import type { Oil } from '../models/Oil';
import { StorageService } from '../services/StorageService';
import { DEFAULT_OILS } from '../data/defaultOils';

export const useOils = () => {
  const [oils, setOils] = useState<Oil[]>(() => {
    const storedOils = StorageService.getOils();
    if (storedOils.length === 0) {
      StorageService.saveOils(DEFAULT_OILS);
      return DEFAULT_OILS;
    }
    return storedOils;
  });

  const loadOils = useCallback(() => {
    const storedOils = StorageService.getOils();
    if (storedOils.length === 0) {
      setOils(DEFAULT_OILS);
      StorageService.saveOils(DEFAULT_OILS);
    } else {
      setOils(storedOils);
    }
  }, []);

  const addOil = useCallback((oil: Oil) => {
    setOils(prevOils => {
        const newOils = [...prevOils, oil];
        StorageService.saveOils(newOils);
        return newOils;
    });
  }, []);

  const updateOil = useCallback((updatedOil: Oil) => {
      setOils(prevOils => {
          const newOils = prevOils.map(o => o.id === updatedOil.id ? updatedOil : o);
          StorageService.saveOils(newOils);
          return newOils;
      });
  }, []);

  const deleteOil = useCallback((id: string) => {
    setOils(prevOils => {
        const newOils = prevOils.filter(o => o.id !== id);
        StorageService.saveOils(newOils);
        return newOils;
    });
  }, []);

  const resetOils = useCallback(() => {
    setOils(DEFAULT_OILS);
    StorageService.saveOils(DEFAULT_OILS);
  }, []);

  return {
    oils,
    addOil,
    updateOil,
    deleteOil,
    resetOils,
    refreshOils: loadOils
  };
};
