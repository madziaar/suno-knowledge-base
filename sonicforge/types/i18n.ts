
export interface ToastTranslation {
  generated: string;
  saved: string;
  cleared: string;
  modeSwitched: string;
  pyriteOn: string;
  pyriteOff: string;
  presetLoaded: string;
  copied: string;
  tagCopied: string;
  downloaded: string;
  analysisComplete: string;
  analysisError: string;
  linkCreated: string;
  linkLoaded: string;
  chatConfigUpdated: string;
  chatReset: string;
  personaSaved: string;
  personaLoaded: string;
  personaDeleted: string;
  personaEmpty: string;
  konamiSuccess: string;
  footerPoke: string;
  newVersion: string;
  historyExported: string;
  noHistory: string;
  creativeBoost: string;
}

export interface DialogTranslation {
  resetWorkflow: string;
  resetStructure: string;
  purgeHistory: string;
  deletePersona: string;
  savePersonaName: string;
  deletePreset: string;
  overwrite: string;
}

export interface ErrorTranslation {
  fileTooLarge: string;
  invalidFormat: string;
  audioTooLong: string;
  processingFailed: string;
  workerError: string;
  readFailed: string;
}

export interface ValidationTranslation {
  parensWarning: string;
  emptyWarning: string;
  lowercaseWarning: string;
  missingGenre: string;
  missingMood: string;
  missingVocal: string;
  addBpm: string;
  promptTooShort: string;
  promptTooLong: string;
  missingEnding: string;
  structuralTagWarning: string;
  conflictMood: string;
  conflictEnergy: string;
  conflictInstrument: string;
  conflictTempo: string;
  instrumentalMixTip: string;
  success: string;
}

export interface AlchemyTranslation {
  inspire: { label: string; desc: string };
  addVocals: { label: string; desc: string };
  addInstrumentals: { label: string; desc: string };
  cover: { label: string; desc: string };
}

export interface StudioTranslation {
  title: string;
  subtitle: string;
  tabs: {
    rack: string;
    sequencer: string;
    lyrics: string;
  };
  toggles: {
    modelSwitch: string;
    pro: string;
    flash: string;
    bypass: string;
    raw: string;
    smart: string;
  };
  generate: {
    scanning: string;
    compiling: string;
    raw: string;
    studio: string;
  };
}

export interface BatchTranslation {
  title: string;
  configure: string;
  intensity: string;
  count: string;
  variations: string;
  levels: {
    light: string;
    medium: string;
    heavy: string;
  };
  constraints: {
    title: string;
    genre: string;
    structure: string;
    mood: string;
    vocals: string;
  };
  generate: string;
  results: string;
  export: string;
  usePrompt: string;
}

export interface NavTranslation {
  title: string;
  forge: string;
  studio: string;
  guide: string;
  history: string;
  docs: string;
  templates: string;
  pyriteActive: string;
  pyriteToggleOn: string;
  pyriteToggleOff: string;
  settings: string;
  mute: string;
  unmute: string;
  switchLang: string;
  open: string;
  switchTo: string;
  version: string;
}

export interface EditorTranslation {
  title: string;
  fullscreen: string;
  toolsTitle: string;
  formatMenu: string;
  autoFormat: string;
  autoDetect: string;
  fix: string;
  flow: string;
  edgy: string;
  rhyme: string;
  extend: string;
  rhymes: string;
  chordAlchemy: string;
}

export interface TechniquesTranslation {
  title: string;
  tabs: {
    melodic: string;
    arrange: string;
    structure: string;
  };
  labels: {
    vowel: string;
    pitch: string;
    keypad: string;
    backing: string;
    inline: string;
    chords: string;
    optimizer: string;
    skeleton: string;
    transitions: string;
    effects: string;
    endings: string;
  };
  placeholders: {
    word: string;
    lyricLine: string;
    notes: string;
    mainLyric: string;
    backingLyric: string;
    section: string;
    style: string;
    chords: string;
    optimizer: string;
  };
  actions: {
    copySkeleton: string;
    copied: string;
  };
}

export interface DesignersTranslation {
  titles: {
    vocal: string;
    instrument: string;
    atmosphere: string;
  };
  labels: {
    voiceType: string;
    texture: string;
    delivery: string;
    regional: string;
    arrangement: string;
    energy: string;
    emotion: string;
    primaryInst: string;
    modifiers: string;
    lessCommon: string;
    textures: string;
    sfx: string;
    preview: string;
    suggestions: string;
    loadPreset: string;
    polishedMix: string;
    showLess: string;
  };
  placeholders: {
    selectOptions: string;
  };
}

export interface SunoV45Translation {
  extendedLength: string;
  enhancedVocals: string;
  genreFusion: string;
  promptEnhancer: string;
  stemSeparation: string;
  vocalUpload: string;
  instrumentalUpload: string;
}

export interface BuilderTranslation {
  config: string;
  expertMode: string;
  globalVars: string;
  structure: string;
  platform: string;
  platforms: {
    suno: string;
  };
  mode: string;
  modes: {
    custom: string;
    instrumental: string;
    general: string;
    easy: string;
  };
  lyricSource: string;
  sources: {
    ai: string;
    user: string;
  };
  aiLyricOptions: {
    remi: string;
    remiTooltip: string;
  };
  lyricsLangLabel: string;
  tooltips: {
    mode: string;
    source: string;
    lyrics: string;
    style: string;
    idea: string;
    artist: string;
    mood: string;
    instrument: string;
    bpm: string;
    expert: string;
    audio: string;
    platform: string;
  };
  alchemy: AlchemyTranslation;
  studio: StudioTranslation;
  batch: BatchTranslation;
  audio: {
    title: string;
    dropLabel: string;
    analyzing: string;
    button: string;
    pyriteButton: string;
    formatWarning: string;
    remove: string;
    ready: string;
    processing: string;
    limits: string;
    uploadModes: {
      analyze: string;
      addVocals: string;
      addInstrumentals: string;
    };
    dropLabels: {
      analyze: string;
      addVocals: string;
      addInstrumentals: string;
    };
  };
  chat: {
    placeholder: string;
    welcome: string;
    title: string;
    pyriteTitle: string;
  };
  pasteLabel: string;
  pasteCount: string;
  pastePlaceholder: string;
  conceptLabel: string;
  styleLabel: string;
  conceptPlaceholder: string;
  stylePlaceholder: string;
  artistLabel: string;
  googleBadge: string;
  artistPlaceholder: string;
  moodLabel: string;
  moodPlaceholder: string;
  instrumentsLabel: string;
  instrumentsPlaceholder: string;
  techLabel: string;
  techPlaceholder: string;
  presetsLabel: string;
  presetsPlaceholder: string;
  buttons: {
    forge: string;
    init: string;
    scanning: string;
    thinking: string;
    regen: string;
    processing: string;
  };
  steps: {
    analyzing: string;
    structuring: string;
    adlibs: string;
    tags: string;
    finalizing: string;
  };
  logs: {
    title: string;
    access: string;
    complete: string;
    lpm: string;
    thinking: string;
    autosaved: string;
  };
  output: {
    waiting: string;
    waitingDesc: string;
    analysisTitle: string;
    genTitle: string;
    optBadge: string;
    titleLabel: string;
    tagsLabel: string;
    enhanceBtn: string;
    styleDescLabel: string;
    lyricsLabel: string;
    exportJson: string;
    exportSuno: string;
    exportMd: string;
  };
  expert: {
    genre: string;
    era: string;
    tech: string;
    bpm: string;
    key: string;
    timeSig: string;
    addSection: string;
    modifiers: string;
    clearAll: string;
    share: string;
    customPersona: string;
    customPersonaPlaceholder: string;
    savePersona: string;
    loadPersona: string;
    personaNamePrompt: string;
    personaLibrary: string;
    noPersonas: string;
    applyTemplate: string;
    categories: {
      energy: string;
      instrumentation: string;
      vocals: string;
      mood: string;
      tech: string;
    };
  };
  toolbar: {
    insert: string;
    intro: string;
    verse: string;
    chorus: string;
    bridge: string;
    outro: string;
    adlib: string;
    inst: string;
  };
  editor: EditorTranslation;
  techniques: TechniquesTranslation;
  validation: ValidationTranslation;
  designers: DesignersTranslation;
  exportPanel: {
    title: string;
    download: string;
    copy: string;
    share: string;
    qrCode: string;
    copyLink: string;
    fullSuno: string;
  };
  sunoV45Features: SunoV45Translation;
}

export interface SettingsTranslation {
  title: string;
  language: string;
  theme: string;
  pyriteTheme: string;
  standardTheme: string;
  clearData: string;
  clearConfirm: string;
  clearSuccess: string;
  pwaInstall: string;
  pwaInstallDesc: string;
  close: string;
  installTitle: string;
  installButton: string;
  languageSet: string;
  setEnglish: string;
  setPolish: string;
  cloud: {
    title: string;
    desc: string;
    urlPlaceholder: string;
    keyPlaceholder: string;
    idLabel: string;
    syncNow: string;
    push: string;
    pull: string;
    status: {
      idle: string;
      syncing: string;
      success: string;
      error: string;
    };
    warning: string;
  }
}

export interface HistoryTranslation {
  title: string;
  subtitle: string;
  empty: string;
  emptyDesc: string;
  createFirst: string;
  searchPlaceholder: string;
  load: string;
  delete: string;
  clear: string;
  contextMenu: {
    load: string;
    copyStyle: string;
    compare: string;
    favorite: string;
    unfavorite: string;
    delete: string;
  };
}
