
// Fix: Convert types/index.ts to a clean hub of re-exports to resolve all missing member errors
export * from './core';
export * from './generator';
export * from './audio';
export * from './chat';
export * from './persistence';
export * from './i18n';
export * from './schemas';

// Re-export Schema types for specific usage patterns if needed, but aggregator handles most
// UI specific states not covered in domain type files
export interface ToastState {
  msg: string;
  type: 'success' | 'info' | 'error';
  visible: boolean;
}
