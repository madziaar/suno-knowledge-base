
export const APP_CONFIG = {
  NAME: "Pyrite's Sonic Forge V5",
  VERSION: "7.2.0 (ENHANCED)",
  LIMITS: {
    TITLE: 80,
    TAGS: 400, // Updated to V4.5 Strict Limit
    STYLE: 400, // Updated to V4.5 Strict Limit
    LYRICS: 3000, // V4.5 Limit
    FILE_SIZE_MB: 10,
  },
  TIMEOUTS: {
    DEBOUNCE: 500,
    TOAST: 3000,
  },
  STORAGE_KEYS: {
    HISTORY: 'pyrite_history',
    DRAFT: 'pyrite_draft_autosave',
    HAS_SEEN_TOUR: 'pyrite_has_seen_tour_v5',
    USER_PRESETS: 'pyrite_user_presets',
    PERSONAS: 'pyrite_personas',
    LANG: 'pyrite_lang',
    THEME: 'pyrite_mode',
  },
  DEFAULTS: {
    BPM: '120',
    KEY: 'C Minor',
  }
} as const;

export const ENV = {
  API_KEY: process.env.API_KEY
};

// Runtime Validation
if (!ENV.API_KEY) {
  console.error("CRITICAL: API_KEY is missing from environment variables.");
}
