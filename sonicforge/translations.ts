
import { BuilderTranslation, ToastTranslation, SettingsTranslation, DialogTranslation, ErrorTranslation, HistoryTranslation, NavTranslation } from './types/i18n';

interface SystemTranslation {
  title: string;
  msg: string;
  pyriteMsg: string;
  footer: string;
  persona: string;
}

interface ChatTranslation {
  title: string;
  pyriteTitle: string;
  placeholder: string;
  welcome: string;
}

interface GuideTranslation {
  title: string;
  subtitle: string;
  menu: {
    start: string;
    goldenRules: string;
    advanced: string;
    tags: string;
    troubleshooting: string;
    v45plus: string;
    riffusion?: string;
  };
  start: {
    title: string;
    step1: string;
    step1Desc: string;
    step2: string;
    step2Desc: string;
    step3: string;
    step3Desc: string;
  };
  goldenRules: {
    title: string;
    desc: string;
    rules: { title: string; desc: string }[];
  };
  advanced: {
    title: string;
    expertTitle: string;
    expertDesc: string;
    mirrorTitle: string;
    mirrorDesc: string;
  };
  tags: {
    title: string;
    desc: string;
    categories: {
      structure: { title: string; items: string[] };
      instruments: { title: string; items: string[] };
      vocals: { title: string; items: string[] };
      transitions: { title: string; items: string[] };
      endings: { title: string; items: string[] };
    };
  };
  troubleshooting: {
    title: string;
    desc: string;
    abruptEnding: string;
    abruptEndingDesc: string;
    wrongInstrument: string;
    wrongInstrumentDesc: string;
    wrongAccent: string;
    wrongAccentDesc: string;
    roboticVocals: string;
    roboticVocalsDesc: string;
    loopingLyrics: string;
    loopingLyricsDesc: string;
    randomNoise: string;
    randomNoiseDesc: string;
    audioDegradation: string;
    audioDegradationDesc: string;
    genericOutput: string;
    genericOutputDesc: string;
    inconsistentResults: string;
    inconsistentResultsDesc: string;
  };
  v45plus: {
    title: string;
    desc: string;
    addVocals: string;
    addVocalsDesc: string;
    addInstrumentals: string;
    addInstrumentalsDesc: string;
    inspire: string;
    inspireDesc: string;
    remaster: string;
    remasterDesc: string;
    covers: string;
    coversDesc: string;
    remiLyrics: string;
    remiLyricsDesc: string;
    versionToggle: string;
    versionToggleDesc: string;
    longerSongs: string;
    longerSongsDesc: string;
    genreMashups: string;
    genreMashupsDesc: string;
    vocalExpressions: string;
    vocalExpressionsDesc: string;
  }
}

interface TemplatesTranslation {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  load: string;
  empty: string;
}

export type { SettingsTranslation, DialogTranslation, ErrorTranslation };

export interface TranslationSet {
  system: SystemTranslation;
  nav: NavTranslation;
  builder: BuilderTranslation;
  toast: ToastTranslation;
  dialogs: DialogTranslation;
  errors: ErrorTranslation;
  history: HistoryTranslation;
  chat: ChatTranslation;
  guide: GuideTranslation;
  templates: TemplatesTranslation;
  settings: SettingsTranslation;
}

export const translations: Record<'en' | 'pl', TranslationSet> = {
  en: {
    system: {
      title: "SONIC FORGE V5",
      msg: "Advanced Prompt Engineering Terminal for Suno",
      pyriteMsg: "PYRITE PROTOCOL ENGAGED // CHAOS ENGINE ACTIVE",
      footer: "Powered by Gemini & Suno Architecture",
      persona: "System Status: OPTIMAL"
    },
    nav: {
      title: "SONIC FORGE",
      forge: "Forge",
      studio: "Studio",
      guide: "Manual",
      history: "Archives",
      docs: "Memory",
      templates: "Templates",
      pyriteActive: "PYRITE OVERRIDE",
      pyriteToggleOn: "Enable Pyrite Protocol",
      pyriteToggleOff: "Disable Pyrite Protocol",
      settings: "Settings",
      mute: "Mute Audio",
      unmute: "Unmute Audio",
      switchLang: "Switch Language",
      open: "Open",
      switchTo: "Switch to",
      version: "V7.0 AETHER"
    },
    builder: {
      config: "Configuration",
      expertMode: "Expert Protocol",
      globalVars: "Global Variables",
      structure: "Structure Builder",
      platform: "Platform",
      platforms: {
        suno: "Suno"
      },
      mode: "Generation Mode",
      modes: {
        custom: "Custom",
        instrumental: "Instrumental",
        general: "General",
        easy: "Easy (One-Shot)"
      },
      lyricSource: "Lyrics Source",
      sources: {
        ai: "AI Generated",
        user: "My Lyrics"
      },
      aiLyricOptions: {
        remi: "Use ReMi Lyrics Model",
        remiTooltip: "Enable the more creative, 'unhinged', and artistic lyrics AI."
      },
      lyricsLangLabel: "Lyrics Language",
      tooltips: {
        mode: "Select 'Custom' for full control (Title, Tags, Style, Lyrics), 'General' for quick ideas, or 'Instrumental' for non-vocal tracks.",
        source: "Let AI write the lyrics from scratch based on your concept, OR paste your own text.",
        lyrics: "Paste your raw lyrics here. Pyrite will fix the rhythm, organize into Verse/Chorus, and add genre-specific ad-libs.",
        style: "Describes the SONIC VIBE (Mixing, production, vocal style). Does not control the topic. Max 1000 chars.",
        idea: "What is the song about? Describe the topic, story, or central metaphor. (e.g. 'A ballad about a ghost ship')",
        artist: "Enter an Artist Name or specific style description (e.g. 'Dark R&B Era'). This guides the research agent to analyze specific production techniques, eras, or albums.",
        mood: "The emotional direction. (e.g. 'Melancholic', 'Aggressive', 'Hopeful', 'Eerie').",
        instrument: "Key instruments to feature. (e.g. 'Distorted 808', 'Violin', 'Tape Loop', 'Saxophone').",
        bpm: "Specific technical details for Suno V5. Define the precise Tempo and Key. (e.g. '128 BPM, F Minor')",
        expert: "Enable Expert Protocol for granular control over Song Structure, Era Anchoring, and Pipe Operator syntax.",
        audio: "Upload an audio file to analyze its style, generate vocals over it, or generate instruments for it.",
        platform: "Target platform."
      },
      alchemy: {
        inspire: { label: 'Inspire', desc: 'From Playlist' },
        addVocals: { label: 'Add Vocals', desc: 'To Instrumental' },
        addInstrumentals: { label: 'Add Instr.', desc: 'To Vocal' },
        cover: { label: 'Cover', desc: 'Remix Song' }
      },
      studio: {
        title: "Studio Command",
        subtitle: "Modular Workflow Environment",
        tabs: {
          rack: "Sound Rack",
          sequencer: "Sequencer",
          lyrics: "Lyrics"
        },
        toggles: {
          modelSwitch: "Switch AI Logic Core",
          pro: "Pro (Thinking)",
          flash: "Flash (Speed)",
          bypass: "Bypass AI Creative Expansion",
          raw: "Raw Mode",
          smart: "Smart Mode"
        },
        generate: {
          scanning: "SCANNING NETWORK...",
          compiling: "KOMPILACJA DANYCH...",
          raw: "EXECUTE RAW SEQUENCE",
          studio: "INITIATE STUDIO RENDER"
        }
      },
      batch: {
        title: "Batch Generator",
        configure: "Configure",
        intensity: "Variation Intensity",
        count: "Count",
        variations: "Variations",
        levels: {
          light: "Light",
          medium: "Medium",
          heavy: "Heavy"
        },
        constraints: {
          title: "Creative Constraints",
          genre: "Keep Genre",
          structure: "Keep Structure",
          mood: "Randomize Mood",
          vocals: "Randomize Vocals"
        },
        generate: "Generate Variations",
        results: "Results",
        export: "Export Selected",
        usePrompt: "Use This Prompt"
      },
      audio: {
        title: "Audio Transmutation Hub",
        dropLabel: "Drop MP3/WAV Reference",
        analyzing: "Deconstructing Audio...",
        button: "Use Audio Reference",
        pyriteButton: "Extract Sonic DNA",
        formatWarning: "Format not supported. Use MP3/WAV.",
        remove: "Remove File",
        ready: "Ready for Generation",
        processing: "Processing Binary Data...",
        limits: "Max 10MB • Max 8 Mins",
        uploadModes: {
          analyze: "Analyze Style",
          addVocals: "Add Vocals",
          addInstrumentals: "Add Instruments"
        },
        dropLabels: {
          analyze: "Drop Audio to Analyze for Style",
          addVocals: "Drop Instrumental to Add Vocals To",
          addInstrumentals: "Drop Vocal Track to Add Instruments To"
        }
      },
      chat: {
        placeholder: "Describe changes or ask for ideas...",
        welcome: "I am listening. What do you desire?",
        title: "Assistant",
        pyriteTitle: "Pyrite Alpha"
      },
      pasteLabel: "Raw Lyrics",
      pasteCount: "chars",
      pastePlaceholder: "Paste your lyrics here...",
      conceptLabel: "Song Concept",
      styleLabel: "Style Description",
      conceptPlaceholder: "Describe the song's theme, story, or vibe...",
      stylePlaceholder: "Describe the sonic characteristics...",
      artistLabel: "Reference & Style",
      googleBadge: "Google Search",
      artistPlaceholder: "e.g. The Weeknd (Dark R&B Era), Hans Zimmer (Interstellar Organ)...",
      moodLabel: "Mood",
      moodPlaceholder: "e.g. Dark, Energetic...",
      instrumentsLabel: "Instruments",
      instrumentsPlaceholder: "e.g. Synth, Guitar...",
      techLabel: "Technical Specs",
      techPlaceholder: "e.g. Roland Juno, Tape Saturation...",
      presetsLabel: "Presets",
      presetsPlaceholder: "Select a template...",
      buttons: {
        forge: "INITIATE SEQUENCE",
        init: "INITIALIZING...",
        scanning: "SCANNING...",
        thinking: "DEEP THINKING...",
        regen: "REGENERATE",
        processing: "PROCESSING..."
      },
      steps: {
        analyzing: "Analyzing Intent",
        structuring: "Architecting Structure",
        adlibs: "Injecting Ad-libs",
        tags: "Optimizing Meta-Tags",
        finalizing: "Finalizing JSON"
      },
      logs: {
        title: "System Logs",
        access: "Accessing Neural Network...",
        complete: "Analysis Complete",
        lpm: "LPM",
        thinking: "Reasoning & Planning...",
        autosaved: "Draft Autosaved at"
      },
      output: {
        waiting: "Awaiting Input...",
        waitingDesc: "Configure the parameters on the left to begin the generation sequence.",
        analysisTitle: "Neural Analysis",
        genTitle: "Generated Output",
        optBadge: "OPTIMIZED",
        titleLabel: "Title",
        tagsLabel: "Meta Tags",
        enhanceBtn: "Enhance",
        styleDescLabel: "Style Prompt",
        lyricsLabel: "Lyrics & Structure",
        exportJson: "JSON",
        exportSuno: "TXT",
        exportMd: "Markdown"
      },
      expert: {
        genre: "Genre",
        era: "Era",
        tech: "Tech Anchor",
        bpm: "BPM",
        key: "Key",
        timeSig: "Time Sig",
        addSection: "Add Section",
        modifiers: "Modifiers",
        clearAll: "Clear All",
        share: "Share Configuration",
        customPersona: "Custom Agent Persona",
        customPersonaPlaceholder: "Define a custom identity for the AI (e.g. 'You are a jazz snob')...",
        savePersona: "Save Persona",
        loadPersona: "Load Persona",
        personaNamePrompt: "Enter a name for this persona:",
        personaLibrary: "Persona Library",
        noPersonas: "No personas saved yet.",
        applyTemplate: "Apply Template...",
        categories: {
          energy: "Energy",
          instrumentation: "Instrumentation",
          vocals: "Vocals",
          mood: "Mood",
          tech: "Advanced Audio / Tech"
        }
      },
      toolbar: {
        insert: "Insert",
        intro: "Intro",
        verse: "Verse",
        chorus: "Chorus",
        bridge: "Bridge",
        outro: "Outro",
        adlib: "Ad-lib",
        inst: "Instrumental"
      },
      editor: {
        title: "Lyrical Architect",
        fullscreen: "Lyrical Forge (Fullscreen)",
        toolsTitle: "Tools & Chords",
        formatMenu: "Format Structure",
        autoFormat: "Auto-Format",
        autoDetect: "Auto-Detect",
        fix: "Fix",
        flow: "Flow",
        edgy: "Edgy",
        rhyme: "Rhyme",
        extend: "Ext",
        rhymes: "Rhymes",
        chordAlchemy: "Chord Alchemy"
      },
      techniques: {
        title: "Lyrical Alchemy Lab",
        tabs: {
          melodic: "Melodic",
          arrange: "Arrangement",
          structure: "Structure"
        },
        labels: {
          vowel: "Vowel Extension (Melisma)",
          pitch: "Syllabic Pitch Mapping",
          keypad: "Pitch Keypad",
          backing: "Backing Vocals",
          inline: "Inline Section Style",
          chords: "Inline Chords",
          optimizer: "Tag Optimizer",
          skeleton: "Template Generator",
          transitions: "Transitions",
          effects: "Effects & Dynamics",
          endings: "Endings"
        },
        placeholders: {
          word: "Word",
          lyricLine: "Lyric Line",
          notes: "Notes (G G A B)",
          mainLyric: "Main Lyric",
          backingLyric: "Backing Lyric",
          section: "Section (e.g. Chorus)",
          style: "Style (e.g. heavy riffs)",
          chords: "Chords (space separated) e.g. C G Am F",
          optimizer: "e.g. sax solo"
        },
        actions: {
          copySkeleton: "Copy Skeleton",
          copied: "Copied!"
        }
      },
      validation: {
        parensWarning: "Warning: Parentheses detected",
        emptyWarning: "Warning: Empty section",
        lowercaseWarning: "Tip: Use uppercase for sections",
        missingGenre: "Missing Genre/Subgenre.",
        missingMood: "Missing Mood.",
        missingVocal: "Missing Vocal Style.",
        addBpm: "Add BPM or Tempo for better rhythm control.",
        promptTooShort: "Prompt too short.",
        promptTooLong: "Prompt is very long. Ensure keywords don't contradict each other.",
        missingEnding: "Missing Ending Tag.",
        structuralTagWarning: "Structural tag found in ( ). AI will sing this. Use [Square Brackets] instead.",
        conflictMood: "Mood Conflict: Prompt contains both Happy and Sad elements.",
        conflictEnergy: "Energy Conflict: High Energy vs Chill elements detected.",
        conflictInstrument: "Instrumentation Conflict: Acoustic vs Electronic dominant styles.",
        conflictTempo: "Tempo Conflict: Conflicting speed descriptors.",
        instrumentalMixTip: "For polished instrumentals, add mix tags like 'Reverb', 'EQ', or 'Wide Stereo'.",
        success: "System Optimized. Ready for Forge."
      },
      designers: {
        titles: {
          vocal: "Vocal Style Designer",
          instrument: "Instrument Designer",
          atmosphere: "Atmosphere & FX Designer"
        },
        labels: {
          voiceType: "Voice Type",
          texture: "Texture & Quality",
          delivery: "Delivery Style",
          regional: "Regional & Cultural",
          arrangement: "Arrangement & Layers",
          energy: "Energy Level",
          emotion: "Emotional Tone",
          primaryInst: "Primary Instruments",
          modifiers: "Modifiers",
          lessCommon: "Show Less Common",
          textures: "Atmospheric Textures",
          sfx: "Sound Effects",
          preview: "Live Preview",
          suggestions: "Suggestions for",
          loadPreset: "Load Preset...",
          polishedMix: "Polished Mix",
          showLess: "Show Less"
        },
        placeholders: {
          selectOptions: "Select options to build style..."
        }
      },
      exportPanel: {
        title: "Export & Share Hub",
        download: "Download",
        copy: "Copy to Clipboard",
        share: "Share Neural Link",
        qrCode: "Scan for Mobile",
        copyLink: "Copy Link",
        fullSuno: "Full Prompt (Suno)"
      },
      sunoV45Features: {
        extendedLength: 'Up to 8 minutes',
        enhancedVocals: 'Enhanced vocal expression',
        genreFusion: 'Advanced genre blending',
        promptEnhancer: 'AI prompt enhancement',
        stemSeparation: 'Stem isolation',
        vocalUpload: 'Add vocals to track',
        instrumentalUpload: 'Add instrumental'
      }
    },
    toast: {
      generated: "Sequence Generated Successfully",
      saved: "Saved to Archives",
      cleared: "Form Cleared",
      modeSwitched: "Mode Switched",
      pyriteOn: "PYRITE PROTOCOL ENGAGED",
      pyriteOff: "Standard Protocol Resumed",
      presetLoaded: "Template Loaded:",
      copied: "Copied to Clipboard",
      tagCopied: "Tag Copied:",
      downloaded: "File Downloaded",
      analysisComplete: "Audio Analysis Complete",
      analysisError: "Analysis Failed",
      linkCreated: "Neural Link Created",
      linkLoaded: "Neural Link Established",
      chatConfigUpdated: "Configuration Updated by AI",
      chatReset: "Configuration Reset by AI",
      personaSaved: "Persona Saved",
      personaLoaded: "Persona Loaded",
      personaDeleted: "Persona Deleted",
      personaEmpty: "Persona prompt is empty.",
      konamiSuccess: "SECRET PROTOCOL: PYRITE OVERDRIVE ENGAGED",
      footerPoke: "Stop poking me, darling. Or don't... I'm not your boss.",
      newVersion: "New Version Available. Click to update.",
      historyExported: "History Archive Exported",
      noHistory: "No history to export.",
      creativeBoost: "Creative Idea Injected"
    },
    dialogs: {
      resetWorkflow: "Reset entire workflow? AI memory will be cleared.",
      resetStructure: "Reset Structure? All sections will be removed.",
      purgeHistory: "Purge archives? Favorites will be kept.",
      deletePersona: "Delete this persona? This cannot be undone.",
      savePersonaName: "Enter a name for this persona:",
      deletePreset: "Delete this preset?",
      overwrite: "Overwrite existing data?"
    },
    errors: {
      fileTooLarge: "File too large. Max 10MB.",
      invalidFormat: "Invalid format. Please upload an audio file.",
      audioTooLong: "Audio too long. Max 8 minutes.",
      processingFailed: "Processing failed.",
      workerError: "Worker error.",
      readFailed: "Read failed."
    },
    history: {
      title: "Archives",
      subtitle: "Past generations and experiments",
      empty: "The Archives are Empty",
      emptyDesc: "Your generated songs will be archived here for future access.",
      createFirst: "Create your first song",
      searchPlaceholder: "Search {0} archives...",
      load: "Load Config",
      delete: "Delete",
      clear: "Purge All",
      contextMenu: {
        load: "Load",
        copyStyle: "Copy Style",
        compare: "Compare",
        favorite: "Favorite",
        unfavorite: "Unfavorite",
        delete: "Delete"
      }
    },
    chat: {
      title: "Assistant",
      pyriteTitle: "Pyrite",
      placeholder: "Ask me to change the genre, mood, or clear the form...",
      welcome: "Ready to assist. Describe the song you want to create."
    },
    guide: {
      title: "User Manual",
      subtitle: "Operational protocols for new architects.",
      menu: {
        start: "Getting Started",
        goldenRules: "Golden Rules",
        advanced: "Expert Tools",
        tags: "Tag Dictionary",
        troubleshooting: "Troubleshooting",
        v45plus: "Suno v4.5+ Features",
        riffusion: "Riffusion"
      },
      start: {
        title: "Initiation",
        step1: "1. The Concept",
        step1Desc: "Enter your song idea or paste your lyrics. If you paste lyrics, the AI becomes a 'Structural Architect', organizing your words into Verses and Choruses.",
        step2: "2. The Vibe",
        step2Desc: "Use the 'Sonic Mirror' to upload an MP3 and steal its vibe, or type an Artist Name to have the AI research their production style.",
        step3: "3. The Forge",
        step3Desc: "Click 'Initiate Sequence'. The system will reason, plan, and output a JSON optimized for Suno V4.5."
      },
      goldenRules: {
        title: "Prompting Strategy (The Golden Rules)",
        desc: "Best practices for achieving high-fidelity generation in Suno v4.5+.",
        rules: [
          { title: "Be Specific", desc: "Avoid generic tags like 'Rock'. Use 'Alternative Indie Rock with Post-Punk influences'." },
          { title: "Use Custom Mode", desc: "Always separate the Style Prompt from Lyrics for maximum control." },
          { title: "Comma Separation", desc: "Separate stylistic elements clearly: 'Heavy Metal, Dark, 140 BPM, Aggressive vocals'." },
          { title: "Meta Tags", desc: "Use [Square Brackets] for structure and instructions. Use (Parentheses) for audible vocals." },
          { title: "Ordering", desc: "Genre → Mood → Tempo → Vocals → Instruments → Production." }
        ]
      },
      advanced: {
        title: "Advanced Systems",
        expertTitle: "Expert Protocol",
        expertDesc: "Drag-and-drop song sections. Force specific BPMs. Define the Era. Design granular vocal and instrumental styles.",
        mirrorTitle: "Sonic Mirror",
        mirrorDesc: "Multimodal analysis of audio files to extract Keys, Instruments, and Moods."
      },
      tags: {
        title: "Tag Dictionary",
        desc: "Essential meta-tags for steering the AI. Click to copy.",
        categories: {
          structure: {
            title: "Structure",
            items: ["[Intro]", "[Verse]", "[Pre-Chorus]", "[Chorus]", "[Bridge]", "[Outro]", "[Hook]", "[Instrumental]", "[Breakdown]", "[Build-up]", "[Drop]", "[Solo]"]
          },
          instruments: {
            title: "Instruments",
            items: ["[Guitar Solo]", "[Piano Solo]", "[Sax Solo]", "[Drum Break]", "[Bass Drop]", "[String Section]", "[Synth Solo]"]
          },
          vocals: {
            title: "Vocals",
            items: ["[Female Vocal]", "[Male Vocal]", "[Whispered]", "[Screaming]", "[Choir]", "[Auto-tune]", "[Spoken Word]", "[A cappella]"]
          },
          transitions: {
            title: "Transitions",
            items: ["[Build-up]", "[Breakdown]", "[Drop]", "[Fade in]", "[Silence]", "[Pause]", "[Stop]"]
          },
          endings: {
            title: "Endings",
            items: ["[End]", "[Fade Out]", "[Outro]", "[Instrumental Fade Out]"]
          }
        }
      },
      troubleshooting: {
        title: "Troubleshooting",
        desc: "Common issues and how to fix them in v4.5, based on the official knowledge base.",
        abruptEnding: "Abrupt Song Endings",
        abruptEndingDesc: "If your song cuts off suddenly, ensure your lyrics end with a proper termination tag like [End] or [Fade Out].",
        wrongInstrument: "Wrong Instrument",
        wrongInstrumentDesc: "To force a specific instrument, use repeated, lowercase tags (e.g. '[sax][saxophone][solo]').",
        wrongAccent: "Wrong Accent (Hip Hop)",
        wrongAccentDesc: "To get authentic regional accents, specify the region (e.g. 'Atlanta Trap', 'UK Drill') and use genre-specific tags like 'Phonk Drum'.",
        roboticVocals: "Robotic Vocals",
        roboticVocalsDesc: "v4.5 greatly improves vocal naturalness. Use detailed descriptors like 'Emotional', 'Breathy', or 'Vibrato'.",
        loopingLyrics: "Looping Lyrics",
        loopingLyricsDesc: "Use clear section markers ([Verse 1], [Verse 2]) and ensure sections have distinct content.",
        randomNoise: "Random Noises / TV Static",
        randomNoiseDesc: "Use cleaner style prompts and avoid conflicting descriptors. Provide specific feedback via thumbs down.",
        audioDegradation: "Audio Degrades After 2 Minutes",
        audioDegradationDesc: "This issue is largely fixed in v4.5+. Use 'Remaster' on old tracks.",
        genericOutput: "Generic / Boring Output",
        genericOutputDesc: "Increase specific texture/artist descriptors or include unusual instrument combinations.",
        inconsistentResults: "Inconsistent Results",
        inconsistentResultsDesc: "Make prompts more specific and use the 'Prompt Multiplication' technique if necessary."
      },
      v45plus: {
        title: "Suno v4.5+ Exclusive Features",
        desc: "These advanced features are available in Suno v4.5+ (Pro/Premier tiers).",
        addVocals: "Add Vocals (PRO)",
        addVocalsDesc: "Upload instrumental tracks and add AI-generated vocals with lyrics. Specify vocal style and gender for a complete song.",
        addInstrumentals: "Add Instrumentals (PRO)",
        addInstrumentalsDesc: "Upload vocal recordings or stems, and AI will generate matching backing tracks, turning voice memos into full productions.",
        inspire: "Inspire from Playlist (PRO)",
        inspireDesc: "Analyze your favorite playlists to generate new songs inspired by your musical taste, providing personalized recommendations.",
        remaster: "Remaster Old Tracks (PRO)",
        remasterDesc: "Upgrade your old tracks (from v3, v3.5, v4) to v4.5 quality with one-click enhancement.",
        covers: "Create Covers (PRO)",
        coversDesc: "Reimagine existing songs in different genres or styles, with v4.5+ offering better melody preservation.",
        remiLyrics: "ReMi Lyrics Model",
        remiLyricsDesc: "Access a more creative, 'unhinged' and artistic lyrics AI via 'Write with Suno' in Custom Mode.",
        versionToggle: "Version Selector",
        versionToggleDesc: "Choose between available Suno versions. Free tier users automatically get v4.5-all.",
        longerSongs: "Extended Song Length (Up to 8 Minutes)",
        longerSongsDesc: "Create longer, more epic compositions without quality degradation.",
        genreMashups: "Enhanced Genre Mashups",
        genreMashupsDesc: "Seamlessly blend over 1,200 genres with improved blending algorithms." ,
        vocalExpressions: "Improved Vocal Expressions",
        vocalExpressionsDesc: "Access microtonal pitch variations, formant shifting, emotional range control, and vibrato intensity for incredibly nuanced vocals."
      }
    },
    templates: {
        title: "Template Library",
        subtitle: "Jumpstart your creation with verified genre templates.",
        searchPlaceholder: "Search templates...",
        load: "Load Template",
        empty: "No templates found."
    },
    settings: {
      title: "System Settings",
      language: "Interface Language",
      theme: "Theme",
      pyriteTheme: "Pyrite Protocol (Chaos)",
      standardTheme: "Standard Protocol (Order)",
      clearData: "Clear All Local Data",
      clearConfirm: "Are you sure you want to clear ALL local data (History, Settings, Drafts)? This cannot be undone.",
      clearSuccess: "All local data purged. Rebooting...",
      pwaInstall: "Install Application",
      pwaInstallDesc: "Install Sonic Forge as a native app for offline capability.",
      close: "Close Settings",
      installTitle: "Neural Interface",
      installButton: "Install App (Offline Capable)",
      languageSet: "Language set to",
      setEnglish: "Set language to English",
      setPolish: "Set language to Polish",
      cloud: {
        title: "Neural Cloud (Experimental)",
        desc: "Connect to a Supabase database to sync your archives across devices.",
        urlPlaceholder: "Supabase URL (https://xyz.supabase.co)",
        keyPlaceholder: "Supabase Anon Key",
        idLabel: "Neural Identity (Sync ID)",
        syncNow: "Sync Now",
        push: "Upload to Cloud",
        pull: "Download from Cloud",
        status: {
          idle: "Ready to Sync",
          syncing: "Transmitting Data...",
          success: "Sync Complete",
          error: "Connection Failed"
        },
        warning: "Requires a 'user_data' table in your Supabase project with columns: id (text, primary), content (jsonb), updated_at (timestamptz)."
      }
    }
  },
  pl: {
    system: {
      title: "SONIC FORGE V5",
      msg: "Zaawansowany Terminal Promptów dla Suno",
      pyriteMsg: "PROTOKÓŁ PYRITE AKTYWNY // SILNIK CHAOSU WŁĄCZONY",
      footer: "Zasilane przez Gemini & Suno Architecture",
      persona: "Status Systemu: OPTYMALNY"
    },
    nav: {
      title: "SONIC FORGE",
      forge: "Kuźnia",
      studio: "Studio",
      guide: "Instrukcja",
      history: "Archiwum",
      docs: "Pamięć",
      templates: "Szablony",
      pyriteActive: "NADRZĘDNOŚĆ PYRITE",
      pyriteToggleOn: "Włącz Protokół Pyrite",
      pyriteToggleOff: "Wyłącz Protokół Pyrite",
      settings: "Ustawienia",
      mute: "Wycisz Dźwięk",
      unmute: "Włącz Dźwięk",
      switchLang: "Zmień Język",
      open: "Otwórz",
      switchTo: "Przełącz na",
      version: "V7.0 ETER"
    },
    builder: {
      config: "Konfiguracja",
      expertMode: "Protokół Ekspercki",
      globalVars: "Zmienne Globalne",
      structure: "Kreator Struktury",
      platform: "Platforma",
      platforms: {
        suno: "Suno"
      },
      mode: "Tryb Generowania",
      modes: {
        custom: "Własny",
        instrumental: "Instr",
        general: "Ogólny",
        easy: "Błyskawiczny (One-Shot)"
      },
      lyricSource: "Źródło Tekstu",
      sources: {
        ai: "Generuj AI",
        user: "Mój Tekst"
      },
      aiLyricOptions: {
        remi: "Użyj modelu ReMi",
        remiTooltip: "Włącz bardziej kreatywne, 'nieokiełznane' i artystyczne AI do tekstów."
      },
      lyricsLangLabel: "Język Tekstu",
      tooltips: {
        mode: "Wybierz 'Własny' dla pełnej kontroli, 'Ogólny' dla szybkich pomysłów, lub 'Instr' dla utworów bez wokalu.",
        source: "Pozwól AI napisać tekst od zera LUB wklej własny tekst do restrukturyzacji.",
        lyrics: "Wklej surowy tekst tutaj. Pyrite poprawi rytm, zorganizuje Zwrotki/Refreny i doda ad-liby.",
        style: "Opisuje BRZMIENIE (Miks, produkcja, styl wokalu). Nie kontroluje tematu. Max 1000 znaków.",
        idea: "O czym jest utwór? Opisz temat, historię lub metaforę.",
        artist: "Wpisz nazwę artysty lub specyficzny opis stylu (np. 'Era Mrocznego R&B'). Pozwala to agentowi badawczemu na analizę konkretnych technik produkcji.",
        mood: "Kierunek emocjonalny (np. Melancholijny, Agresywny).",
        instrument: "Kluczowe instrumenty (np. Przesterowany 808, Skrzypce, Saksofon).",
        bpm: "Precyzyjne tempo i tonacja dla Suno V5.",
        expert: "Włącz Protokół Ekspercki dla kontroli struktury i zaawansowanych technik.",
        audio: "Prześlij plik audio, aby przeanalizować jego styl, wygenerować na nim wokal lub wygenerować do niego instrumenty.",
        platform: "Wybierz platformę docelową."
      },
      alchemy: {
        inspire: { label: 'Inspiracja', desc: 'Analiza Playlisty' },
        addVocals: { label: 'Dodaj Wokal', desc: 'Do Instrumentala' },
        addInstrumentals: { label: 'Dodaj Instr.', desc: 'Do Wokalu' },
        cover: { label: 'Cover / Remiks', desc: 'Reinterpretacja' }
      },
      studio: {
        title: "Centrum Studio",
        subtitle: "Modułowe Środowisko Pracy",
        tabs: {
          rack: "Rack Brzmień",
          sequencer: "Sekwencer",
          lyrics: "Tekst"
        },
        toggles: {
          modelSwitch: "Zmień Model AI",
          pro: "Pro (Myślenie)",
          flash: "Flash (Szybkość)",
          bypass: "Pomiń Kreatywność AI",
          raw: "Tryb Surowy (Raw)",
          smart: "Tryb Inteligentny"
        },
        generate: {
          scanning: "SKANOWANIE SIECI...",
          compiling: "KOMPILACJA DANYCH...",
          raw: "WYKONAJ SEKWENCJĘ",
          studio: "RENDERUJ STUDIO"
        }
      },
      batch: {
        title: "Generator Seryjny",
        configure: "Konfiguruj",
        intensity: "Intensywność Wariacji",
        count: "Liczba",
        variations: "Wariacje",
        levels: {
          light: "Lekki",
          medium: "Średni",
          heavy: "Mocny"
        },
        constraints: {
          title: "Ograniczenia Kreatywne",
          genre: "Zachowaj Gatunek",
          structure: "Zachowaj Strukturę",
          mood: "Losuj Nastrój",
          vocals: "Losuj Wokal"
        },
        generate: "Generuj Wariacje",
        results: "Wyniki",
        export: "Eksportuj Wybrane",
        usePrompt: "Użyj Tego Promptu"
      },
      audio: {
        title: "Centrum Transmutacji Audio",
        dropLabel: "Upuść plik MP3/WAV",
        analyzing: "Dekonstrukcja Audio...",
        button: "Użyj Referencji",
        pyriteButton: "Ekstrakcja DNA Sonicznego",
        formatWarning: "Format nieobsługiwany. Użyj MP3/WAV.",
        remove: "Usuń Plik",
        ready: "Gotowy do Generowania",
        processing: "Przetwarzanie Danych Binarnych...",
        limits: "Maks 10MB • Maks 8 Min",
        uploadModes: {
          analyze: "Analiza Sygnatury Dźwiękowej",
          addVocals: "Dodaj Wokal",
          addInstrumentals: "Dodaj Instrumenty"
        },
        dropLabels: {
          analyze: "Upuść plik referencyjny do analizy spektralnej",
          addVocals: "Upuść instrumental, aby dodać wokal",
          addInstrumentals: "Upuść wokal, aby dodać instrumenty"
        }
      },
      chat: {
        placeholder: "Opisz zmiany lub poproś o pomysły...",
        welcome: "Słucham. Czego potrzebujesz?",
        title: "Asystent",
        pyriteTitle: "Pyrite Alpha"
      },
      pasteLabel: "Surowy Tekst",
      pasteCount: "znaków",
      pastePlaceholder: "Wklej tekst tutaj...",
      conceptLabel: "Koncept Utworu",
      styleLabel: "Opis Stylu",
      conceptPlaceholder: "Opisz temat, historię lub klimat...",
      stylePlaceholder: "Opisz charakterystykę brzmieniową...",
      artistLabel: "Referencja & Styl",
      googleBadge: "Google Search",
      artistPlaceholder: "np. The Weeknd (Era Dark R&B), Hans Zimmer (Organy Interstellar)...",
      moodLabel: "Nastrój",
      moodPlaceholder: "np. Mroczny, Energetyczny...",
      instrumentsLabel: "Instrumenty",
      instrumentsPlaceholder: "np. Syntezator, Gitara...",
      techLabel: "Specyfikacja Tech",
      techPlaceholder: "np. Roland Juno, Nasycenie Taśmy...",
      presetsLabel: "Szablony",
      presetsPlaceholder: "Wybierz szablon...",
      buttons: {
        forge: "INICJUJ SEKWENCJĘ",
        init: "INICJALIZACJA...",
        scanning: "SKANOWANIE...",
        thinking: "GŁĘBOKIE MYŚLENIE...",
        regen: "REGENERUJ",
        processing: "PRZETWARZANIE..."
      },
      steps: {
        analyzing: "Analiza Intencji",
        structuring: "Konstruowanie Struktury",
        adlibs: "Wstrzykiwanie Ad-libów",
        tags: "Optymalizacja Tagów",
        finalizing: "Finalizacja JSON"
      },
      logs: {
        title: "Logi Systemowe",
        access: "Dostęp do Sieci Neuronowej...",
        complete: "Analiza Zakończona",
        lpm: "LPM",
        thinking: "Rozumowanie i Planowanie...",
        autosaved: "Szkic zapisano o"
      },
      output: {
        waiting: "Oczekiwanie na Dane...",
        waitingDesc: "Skonfiguruj parametry po lewej stronie, aby rozpocząć sekwencję generowania.",
        analysisTitle: "Analiza Neuronalna",
        genTitle: "Wygenerowany Wynik",
        optBadge: "ZOPTYMALIZOWANE",
        titleLabel: "Tytuł",
        tagsLabel: "Tagi Meta",
        enhanceBtn: "Ulepsz",
        styleDescLabel: "Prompt Stylu",
        lyricsLabel: "Tekst i Struktura",
        exportJson: "JSON",
        exportSuno: "TXT",
        exportMd: "Markdown"
      },
      expert: {
        genre: "Gatunek",
        era: "Era",
        tech: "Baza Techniczna",
        bpm: "BPM",
        key: "Tonacja",
        timeSig: "Metrum",
        addSection: "Dodaj Sekcję",
        modifiers: "Modyfikatory",
        clearAll: "Wyczyść Wszystko",
        share: "Udostępnij Konfigurację",
        customPersona: "Własna Persona Agenta",
        customPersonaPlaceholder: "Zdefiniuj własną tożsamość AI (np. 'Jesteś snobem jazzowym')...",
        savePersona: "Zapisz Personę",
        loadPersona: "Wczytaj Personę",
        personaNamePrompt: "Wpisz nazwę dla tej persony:",
        personaLibrary: "Biblioteka Person",
        noPersonas: "Nie zapisano jeszcze żadnych person.",
        applyTemplate: "Zastosuj Szablon...",
        categories: {
          energy: "Energia",
          instrumentation: "Instrumentacja",
          vocals: "Wokale",
          mood: "Nastrój",
          tech: "Zaawansowane Audio / Tech"
        }
      },
      toolbar: {
        insert: "Wstaw",
        intro: "Intro",
        verse: "Zwrotka",
        chorus: "Refren",
        bridge: "Mostek",
        outro: "Outro",
        adlib: "Ad-lib",
        inst: "Instr"
      },
      editor: {
        title: "Architekt Liryczny",
        fullscreen: "Liryczna Kuźnia (Pełny Ekran)",
        toolsTitle: "Narzędzia i Akordy",
        formatMenu: "Formatuj Strukturę",
        autoFormat: "Auto-Format",
        autoDetect: "Auto-Wykryj",
        fix: "Napraw",
        flow: "Rytm",
        edgy: "Pazur",
        rhyme: "Rym",
        extend: "Wydłuż",
        rhymes: "Rymy",
        chordAlchemy: "Alchemia Akordów"
      },
      techniques: {
        title: "Laboratorium Alchemii Lirycznej",
        tabs: {
          melodic: "Melodyka",
          arrange: "Aranżacja",
          structure: "Struktura"
        },
        labels: {
          vowel: "Wydłużanie Samogłosek (Melizmat)",
          pitch: "Sylabiczne Mapowanie Tonacji",
          keypad: "Klawiatura Tonacji",
          backing: "Wokale W tle",
          inline: "Styl Sekcji (Inline)",
          chords: "Akordy (Inline)",
          optimizer: "Optymalizator Tagów",
          skeleton: "Generator Szablonu",
          transitions: "Przejścia",
          effects: "Efekty i Dynamika",
          endings: "Zakończenia"
        },
        placeholders: {
          word: "Słowo",
          lyricLine: "Linijka tekstu",
          notes: "Nuty (G G A B)",
          mainLyric: "Główny tekst",
          backingLyric: "Tekst w tle",
          section: "Sekcja (np. Refren)",
          style: "Styl (np. ciężkie riffy)",
          chords: "Akordy (oddzielone spacją) np. C G Am F",
          optimizer: "np. solo saksofonowe"
        },
        actions: {
          copySkeleton: "Kopiuj Szablon",
          copied: "Skopiowano!"
        }
      },
      validation: {
        parensWarning: "Ostrzeżenie: Wykryto nawiasy okrągłe",
        emptyWarning: "Ostrzeżenie: Pusta sekcja",
        lowercaseWarning: "Wskazówka: Używaj wielkich liter dla sekcji",
        missingGenre: "Brak Gatunku/Podgatunku.",
        missingMood: "Brak Nastroju.",
        missingVocal: "Brak Stylu Wokalnego.",
        addBpm: "Dodaj BPM dla lepszej kontroli rytmu.",
        promptTooShort: "Prompt zbyt krótki.",
        promptTooLong: "Prompt jest bardzo długi. Upewnij się, że słowa kluczowe nie są sprzeczne.",
        missingEnding: "Brak tagu zakończenia [End].",
        structuralTagWarning: "Tag strukturalny znaleziony w ( ). AI to zaśpiewa. Użyj [Nawiasów Kwadratowych].",
        conflictMood: "Konflikt Nastroju: Wykryto sprzeczne emocje.",
        conflictEnergy: "Konflikt Poziomów Energii.",
        conflictInstrument: "Konflikt Instrumentów (Akustyczne vs Elektroniczne).",
        conflictTempo: "Konflikt Tempa: Sprzeczne opisy prędkości.",
        instrumentalMixTip: "Dla profesjonalnego brzmienia instrumentalnego, dodaj tagi miksu jak 'Reverb', 'EQ' lub 'Wide Stereo'.",
        success: "System Zoptymalizowany. Gotowy do Kuźni."
      },
      designers: {
        titles: {
          vocal: "Projektant Wokalu",
          instrument: "Projektant Instrumentów",
          atmosphere: "Projektant Atmosfery"
        },
        labels: {
          voiceType: "Typ Głosu",
          texture: "Tekstura",
          delivery: "Styl Wykonania",
          regional: "Regionalne",
          arrangement: "Aranżacja",
          energy: "Energia",
          emotion: "Emocje",
          primaryInst: "Główne Instrumenty",
          modifiers: "Modyfikatory",
          lessCommon: "Rzadsze",
          textures: "Tekstury",
          sfx: "Efekty SFX",
          preview: "Podgląd",
          suggestions: "Sugestie",
          loadPreset: "Wczytaj Preset...",
          polishedMix: "Mastering Studyjny",
          showLess: "Pokaż Mniej"
        },
        placeholders: {
          selectOptions: "Wybierz opcje..."
        }
      },
      exportPanel: {
        title: "Centrum Eksportu",
        download: "Pobierz",
        copy: "Kopiuj do Schowka",
        share: "Udostępnij Link",
        qrCode: "Skanuj QR",
        copyLink: "Kopiuj Link",
        fullSuno: "Pełny Prompt (Suno)"
      },
      sunoV45Features: {
        extendedLength: 'Do 8 minut',
        enhancedVocals: 'Ulepszona ekspresja wokalna',
        genreFusion: 'Zaawansowane mieszanie gatunków',
        promptEnhancer: 'Ulepszanie promptu AI',
        stemSeparation: 'Izolacja ścieżek',
        vocalUpload: 'Dodaj wokal do utworu',
        instrumentalUpload: 'Dodaj podkład instrumentalny'
      }
    },
    toast: {
      generated: "Sekwencja Wygenerowana Pomyślnie",
      saved: "Zapisano w Archiwum",
      cleared: "Formularz Wyczyszczony",
      modeSwitched: "Przełączono Tryb",
      pyriteOn: "PROTOKÓŁ PYRITE WŁĄCZONY",
      pyriteOff: "Przywrócono Protokół Standardowy",
      presetLoaded: "Załadowano Szablon:",
      copied: "Skopiowano do Schowka",
      tagCopied: "Tag Skopiowany:",
      downloaded: "Plik Pobrany",
      analysisComplete: "Analiza Audio Zakończona",
      analysisError: "Analiza Nieudana",
      linkCreated: "Link Neuronowy Utworzony",
      linkLoaded: "Link Neuronowy Ustanowiony",
      chatConfigUpdated: "Konfiguracja Zaktualizowana przez AI",
      chatReset: "Konfiguracja Zresetowana przez AI",
      personaSaved: "Persona Zapisana",
      personaLoaded: "Persona Wczytana",
      personaDeleted: "Persona Usunięta",
      personaEmpty: "Prompt persony jest pusty.",
      konamiSuccess: "TAJNY PROTOKÓŁ: PYRITE OVERDRIVE AKTYWOWANY",
      footerPoke: "Przestań mnie dźgać, kochanie. Albo nie... nie jestem twoim szefem.",
      newVersion: "Dostępna nowa wersja. Kliknij, aby zaktualizować.",
      historyExported: "Archiwum Historii Wyeksportowane",
      noHistory: "Brak historii do eksportu.",
      creativeBoost: "Wstrzyknięto Kreatywny Pomysł"
    },
    dialogs: {
      resetWorkflow: "Zresetować cały przepływ pracy? Pamięć AI zostanie wyczyszczona.",
      resetStructure: "Zresetować Strukturę? Wszystkie sekcje zostaną usunięte.",
      purgeHistory: "Wyczyścić archiwum? Ulubione zostaną zachowane.",
      deletePersona: "Usunąć tę personę? Tej operacji nie można cofnąć.",
      savePersonaName: "Wpisz nazwę dla tej persony:",
      deletePreset: "Usunąć ten szablon?",
      overwrite: "Nadpisać istniejące dane?"
    },
    errors: {
      fileTooLarge: "Plik zbyt duży. Maks 10MB.",
      invalidFormat: "Nieprawidłowy format. Prześlij plik audio.",
      audioTooLong: "Audio zbyt długie. Maks 8 minut.",
      processingFailed: "Przetwarzanie nieudane.",
      workerError: "Błąd Workera.",
      readFailed: "Błąd odczytu."
    },
    history: {
      title: "Archiwum",
      subtitle: "Przeszłe generacje i eksperymenty",
      empty: "Archiwum jest puste",
      emptyDesc: "Twoje wygenerowane utwory będą tutaj archiwizowane.",
      createFirst: "Stwórz pierwszy utwór",
      searchPlaceholder: "Szukaj w {0} archiwach...",
      load: "Załaduj",
      delete: "Usuń",
      clear: "Wyczyść Wszystko",
      contextMenu: {
        load: "Załaduj",
        copyStyle: "Kopiuj Styl",
        compare: "Porównaj",
        favorite: "Ulubione",
        unfavorite: "Usuń z Ulub.",
        delete: "Usuń"
      }
    },
    chat: {
      title: "Asystent",
      pyriteTitle: "Pyrite",
      placeholder: "Poproś o zmianę gatunku, nastroju lub wyczyszczenie...",
      welcome: "Gotowy do pomocy. Opisz utwór, który chcesz stworzyć."
    },
    guide: {
      title: "Instrukcja Obsługi",
      subtitle: "Protokoły operacyjne dla nowych architektów.",
      menu: {
        start: "Start",
        goldenRules: "Złote Zasady",
        advanced: "Ekspert",
        tags: "Dane",
        troubleshooting: "Rozwiązywanie Problemów",
        v45plus: "Funkcje Suno v4.5+"
      },
      start: {
        title: "Inicjacja",
        step1: "1. Koncept",
        step1Desc: "Wpisz pomysł na utwór lub wklej tekst. Jeśli wkleisz tekst, AI stanie się 'Architektem Strukturalnym', organizując słowa w Zwrotki i Refreny.",
        step2: "2. Wibracja",
        step2Desc: "Użyj 'Sonicznego Lustra', aby przesłać MP3 i ukraść jego klimat, lub wpisz nazwę artysty, aby AI zbadało jego styl produkcji.",
        step3: "3. Kuźnia",
        step3Desc: "Kliknij 'Rozpocznij Sekwencję'. System przeanalizuje dane, zaplanuje strukturę i wygeneruje wynik JSON zoptymalizowany dla Suno V4.5."
      },
      goldenRules: {
        title: "Strategia Tworzenia Promptów (Złote Zasady)",
        desc: "Najlepsze praktyki dla uzyskania wysokiej wierności generowania w Suno v4.5+.",
        rules: [
          { title: "Bądź Konkretny", desc: "Unikaj ogólnych tagów jak 'Rock'. Użyj 'Alternatywny Indie Rock z wpływami Post-Punk'." },
          { title: "Tryb Własny", desc: "Zawsze oddzielaj Prompt Stylu od Tekstu dla maksymalnej kontroli." },
          { title: "Przecinki", desc: "Oddzielaj elementy stylistyczne wyraźnie: 'Heavy Metal, Mroczny, 140 BPM, Agresywny wokal'." },
          { title: "Tagi Meta", desc: "Używaj [Nawiasów Kwadratowych] dla struktury. Używaj (Okrągłych) dla słyszalnych wokali." },
          { title: "Kolejność", desc: "Gatunek → Nastrój → Tempo → Wokal → Instrumenty → Produkcja." }
        ]
      },
      advanced: {
        title: "Systemy Zaawansowane",
        expertTitle: "Protokół Ekspercki",
        expertDesc: "Przeciągaj i upuszczaj sekcje utworu. Wymuszaj konkretne BPM. Definiuj Erę. Projektuj szczegółowe style wokalne i instrumentalne.",
        mirrorTitle: "Soniczne Lustro",
        mirrorDesc: "Analiza multimodalna plików audio w celu ekstrakcji tonacji, instrumentów i nastrojów."
      },
      tags: {
        title: "Słownik Tagów",
        desc: "Kluczowe meta-tagi do sterowania AI. Kliknij, aby skopiować.",
        categories: {
          structure: {
            title: "Struktura",
            items: ["[Intro]", "[Verse]", "[Pre-Chorus]", "[Chorus]", "[Bridge]", "[Outro]", "[Hook]", "[Instrumental]", "[Breakdown]", "[Build-up]", "[Drop]", "[Solo]"]
          },
          instruments: {
            title: "Instrumenty",
            items: ["[Guitar Solo]", "[Piano Solo]", "[Sax Solo]", "[Drum Break]", "[Bass Drop]", "[String Section]", "[Synth Solo]"]
          },
          vocals: {
            title: "Wokale",
            items: ["[Female Vocal]", "[Male Vocal]", "[Whispered]", "[Screaming]", "[Choir]", "[Auto-tune]", "[Spoken Word]", "[A cappella]"]
          },
          transitions: {
            title: "Przejścia",
            items: ["[Build-up]", "[Breakdown]", "[Drop]", "[Fade in]", "[Silence]", "[Pause]", "[Stop]"]
          },
          endings: {
            title: "Zakończenia",
            items: ["[End]", "[Fade Out]", "[Outro]", "[Instrumental Fade Out]"]
          }
        }
      },
      troubleshooting: {
        title: "Rozwiązywanie Problemów",
        desc: "Częste problemy i sposoby ich rozwiązywania w v4.5, oparte na oficjalnej bazie wiedzy.",
        abruptEnding: "Nagłe Zakończenia Utworów",
        abruptEndingDesc: "Jeśli utwór nagle się urywa, upewnij się, że tekst kończy się odpowiednim tagiem, np. [End] lub [Fade Out].",
        wrongInstrument: "Zły Instrument",
        wrongInstrumentDesc: "Aby wymusić konkretny instrument, użyj powtórzonych, małych tagów (np. '[sax][saxophone][solo]').",
        wrongAccent: "Zły Akcent (Hip Hop)",
        wrongAccentDesc: "Aby uzyskać autentyczne regionalne akcenty, określ region (np. 'Atlanta Trap') i użyj tagów gatunkowych jak 'Phonk Drum'.",
        roboticVocals: "Roboticzne Wokale",
        roboticVocalsDesc: "Wersja v4.5 drastycznie poprawia naturalność brzmienia. Używaj szczegółowych deskryptorów jak 'Emotional', 'Breathy' lub 'Vibrato'.",
        loopingLyrics: "Powtarzające się Teksty",
        loopingLyricsDesc: "Używaj wyraźnych znaczników sekcji ([Verse 1], [Verse 2]) i dbaj o różnorodność treści.",
        randomNoise: "Losowe Szumy / Statyka",
        randomNoiseDesc: "Używaj czystszych promptów stylu i unikaj sprzecznych deskryptorów.",
        audioDegradation: "Degradacja Audio po 2 Minutach",
        audioDegradationDesc: "Ten problem jest w dużej mierze naprawiony w v4.5+. Użyj funkcji 'Remaster' na starych utworach.",
        genericOutput: "Ogólny / Nudny Wynik",
        genericOutputDesc: "Zwiększ ilość specyficznych deskryptorów tekstury/artysty lub uwzględnij niezwykłe instrumenty.",
        inconsistentResults: "Niespójne Wyniki",
        inconsistentResultsDesc: "Uczyń prompty bardziej specyficznymi i używaj techniki 'Mnożenia Promptów' jeśli to konieczne."
      },
      v45plus: {
        title: "Funkcje Ekskluzywne Suno v4.5+",
        desc: "Te zaawansowane funkcje są dostępne w Suno v4.5+ (poziomy Pro/Premier).",
        addVocals: "Dodaj Wokal (PRO)",
        addVocalsDesc: "Prześlij ścieżki instrumentalne i dodaj wokale generowane przez AI z tekstem. Określ styl i płeć wokalu, aby uzyskać kompletny utwór.",
        addInstrumentals: "Dodaj Instrumental (PRO)",
        addInstrumentalsDesc: "Prześlij nagrania wokalu lub ścieżki wokalne, a AI wygeneruje pasujące podkłady instrumentalne, zamieniając notatki głosowe w pełne produkcje.",
        inspire: "Inspiracja Playlistą (PRO)",
        inspireDesc: "Analizuj swoje ulubione playlisty, aby generować nowe utwory inspirowane Twoim gustem muzycznym, zapewniając spersonalizowane rekomendacje.",
        remaster: "Remaster Starych Utworów (PRO)",
        remasterDesc: "Ulepsz swoje stare utwory (z v3, v3.5, v4) to jakości v4.5 za pomocą jednego kliknięcia.",
        covers: "Twórz Covery (PRO)",
        coversDesc: "Reinterpretuj istniejące utwory w różnych gatunkach lub stylach, z v4.5+ oferującym lepsze zachowanie melodii.",
        remiLyrics: "Model Liryczny ReMi",
        remiLyricsDesc: "Uzyskaj dostęp do bardziej kreatywnego, 'nieokiełznanego' i artystycznego AI do tekstów za pośrednictwem funkcji 'Pisz z Suno' w Trybie Niestandardowym.",
        versionToggle: "Selektor Wersji",
        versionToggleDesc: "Wybierz spośród dostępnych wersji Suno. Użytkownicy darmowi automatycznie otrzymują v4.5-all.",
        longerSongs: "Dłuższe Utwory (do 8 Minut)",
        longerSongsDesc: "Twórz dłuższe, bardziej epickie kompozycje bez degradacji jakości.",
        genreMashups: "Ulepszone Mieszanie Gatunków",
        genreMashupsDesc: "Płynnie łącz ponad 1200 gatunków dzięki ulepszonym algorytmom łączenia." ,
        vocalExpressions: "Ulepszone Ekspresje Wokalne",
        vocalExpressionsDesc: "Uzyskaj dostęp do mikrotonalnych wariacji wysokości dźwięku, zmiany formantów, kontroli zakresu emocjonalnego i intensywności vibrato, aby uzyskać niezwykle subtelne wokale."
      }
    },
    templates: {
        title: "Biblioteka Szablonów",
        subtitle: "Rozpocznij tworzenie dzięki zweryfikowanym szablonom gatunków.",
        searchPlaceholder: "Szukaj szablonów...",
        load: "Załaduj Szablon",
        empty: "Nie znaleziono szablonów."
    },
    settings: {
      title: "Ustawienia Systemu",
      language: "Język Interfejsu",
      theme: "Motyw",
      pyriteTheme: "Protokół Pyrite (Chaos)",
      standardTheme: "Protokół Standardowy (Porządek)",
      clearData: "Wyczyść Dane Lokalne",
      clearConfirm: "Czy na pewno chcesz wyczyścić WSZYSTKIE dane lokalne (Historię, Ustawienia, Szkice)? Tej operacji nie można cofnąć.",
      clearSuccess: "Wszystkie dane lokalne wyczyszczone. Ponowne uruchamianie...",
      pwaInstall: "Zainstaluj Aplikację",
      pwaInstallDesc: "Zainstaluj Sonic Forge jako natywną aplikację offline.",
      close: "Zamknij Ustawienia",
      installTitle: "Interfejs Neuralny",
      installButton: "Zainstaluj Aplikację (Offline)",
      languageSet: "Język ustawiony na",
      setEnglish: "Ustaw język na Angielski",
      setPolish: "Ustaw język na Polski",
      cloud: {
        title: "Neuralna Chmura (Eksperymentalne)",
        desc: "Połącz z bazą danych Supabase, aby synchronizować archiwum między urządzeniami.",
        urlPlaceholder: "Adres URL Supabase (https://xyz.supabase.co)",
        keyPlaceholder: "Klucz Anonimowy Supabase",
        idLabel: "Tożsamość Neuralna (ID Synchronizacji)",
        syncNow: "Synchronizuj Teraz",
        push: "Wyślij do Chmury",
        pull: "Pobierz z Chmury",
        status: {
          idle: "Gotowy do Synchronizacji",
          syncing: "Przesyłanie Danych...",
          success: "Synchronizacja Zakończona",
          error: "Błąd Połączenia"
        },
        warning: "Wymaga tabeli 'user_data' w Twoim projekcie Supabase z kolumnami: id (text, primary), content (jsonb), updated_at (timestamptz)."
      }
    }
  }
};
