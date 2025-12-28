
export * from './core';
export * from './generator';
export * from './audio';
export * from './persistence';
export * from './chat';
export * from './i18n';
export * from './schemas';

// FIX: Add ModifierCategory to exports to make it available
export interface ModifierCategory {
  id: string;
  name: string;
  options: string[];
}
