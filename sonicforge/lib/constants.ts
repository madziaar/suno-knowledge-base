import { APP_CONFIG } from '../config/appConfig';

export const APP_NAME = APP_CONFIG.NAME;
export const APP_VERSION = "7.5.0 // STUDIO";

export const LIMITS = {
  ...APP_CONFIG.LIMITS,
  TAGS: 1000,   // Expanded for v5 detailed tagging
  STYLE: 1000,  // Expanded for v5 detailed style prompts
  LYRICS: 6000  // Doubled for 8-minute songs
};
export const TIMEOUTS = APP_CONFIG.TIMEOUTS;
export const STORAGE_KEYS = APP_CONFIG.STORAGE_KEYS;
export const DEFAULTS = APP_CONFIG.DEFAULTS;