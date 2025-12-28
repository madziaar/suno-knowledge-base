
import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Persona } from '../types';
import { STORAGE_KEYS } from '../lib/constants';

export const usePersonas = () => {
  const [personas, setPersonas] = useLocalStorage<Persona[]>(STORAGE_KEYS.PERSONAS, []);

  const savePersona = useCallback((name: string, prompt: string) => {
    const newPersona: Persona = { 
      id: crypto.randomUUID(), 
      name, 
      prompt 
    };
    setPersonas(prev => [...prev, newPersona]);
    return newPersona;
  }, [setPersonas]);

  const deletePersona = useCallback((id: string) => {
     setPersonas(prev => prev.filter(p => p.id !== id));
  }, [setPersonas]);

  const updatePersona = useCallback((id: string, updates: Partial<Omit<Persona, 'id'>>) => {
     setPersonas(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, [setPersonas]);

  const exportPersonas = useCallback(() => {
    const data = JSON.stringify(personas, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sonic_forge_personas_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [personas]);

  const importPersonas = useCallback((file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          if (Array.isArray(imported)) {
            setPersonas(prev => {
                const existingIds = new Set(prev.map(p => p.id));
                const newItems = imported.filter(p => p.id && p.name && p.prompt && !existingIds.has(p.id));
                return [...prev, ...newItems];
            });
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (error) {
          console.error("Failed to parse persona import:", error);
          resolve(false);
        }
      };
      reader.onerror = () => resolve(false);
      reader.readAsText(file);
    });
  }, [setPersonas]);

  return { 
    personas, 
    savePersona, 
    deletePersona, 
    updatePersona,
    exportPersonas,
    importPersonas
  };
};
