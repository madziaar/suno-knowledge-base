
import { TranslationSet } from './types';

export const translations: Record<'en' | 'pl', TranslationSet> = {
  en: {
    system: {
      title: "SONIC FORGE V7.5",
      msg: "Neural Music Architecture // Suno v5 Ready",
      pyriteMsg: "OVERCLOCKED MODE // V5 PROTOCOLS ENGAGED",
      footer: "Obsidian Core Engineering",
      persona: "System Architecture Lobe"
    },
    nav: {
      title: "SONIC FORGE V7.5",
      forge: "Forge",
      studio: "Studio DAW",
      guide: "Guide",
      history: "Archives",
      docs: "Memory",
      templates: "Genres",
      pyriteActive: "OVERCLOCKED MODE ACTIVE",
      pyriteToggleOn: "Enable Overclocked Mode",
      pyriteToggleOff: "Standard Mode",
      settings: "Terminal Config",
      mute: "Silence Audio",
      unmute: "Enable Audio",
      switchLang: "Language Cycle",
      open: "Access",
      switchTo: "Switch to",
      version: "V7.5.0"
    },
    builder: {
      config: "Meta Settings",
      expertMode: "Genre Optimization",
      globalVars: "Global Variables",
      structure: "Architecture",
      platform: "Engine",
      platforms: { suno: "Suno v5 (Pro)" },
      mode: "Workflow",
      modes: {
        custom: "Custom",
        instrumental: "Instrumental",
        general: "Standard",
        easy: "Instant"
      },
      lyricSource: "Lyrical Origin",
      sources: { ai: "Neural", user: "Manual" },
      aiLyricOptions: {
        remi: "ReMi Logic",
        remiTooltip: "Advanced melodic coherence engine for abstract lyrics (v4/v5)",
        techniques: {
            title: "Neural Lyric Transformation",
            vowels: "Melisma Depth",
            vowelsTooltip: "Apply V5 vowel extensions (e.g. lo-o-o-ove) for melodic hooks.",
            backing: "Harmonic Layers",
            backingTooltip: "Layer parenthetical backing vocals and ad-libs.",
            chords: "Chord Mapping",
            chordsTooltip: "Interleave harmonic chord tags (e.g. (Am)) into text."
        }
      },
      health: {
        title: "Architecture Health",
        score: "Quality Score",
        autoImprove: "Neural Optimize",
        gradeLabel: "FIDELITY",
        metrics: {
          completeness: "Completeness",
          specificity: "Specificity",
          balance: "Balance",
          coherence: "Coherence"
        }
      },
      lyricsLangLabel: "Target Language",
      tooltips: {
        mode: "Select the operational workflow for the AI core.",
        source: "Define if the lyrics are synthesized or provided manually.",
        lyrics: "Structural lyrical input.",
        style: "Technical audio engineering specs.",
        idea: "Abstract concept for the song.",
        artist: "Reference artists for spectral matching.",
        mood: "Atmospheric and emotional descriptors.",
        instrument: "Primary hardware and instrumentation.",
        bpm: "Tempo lock in Beats Per Minute.",
        expert: "Enables granular structural control.",
        audio: "Neural audio reference analysis.",
        platform: "Target generation engine.",
        genre: "Primary musical foundation.",
        negativePrompt: "Elements to exclude from the mix (v5 Negative Prompting).",
        vocalStyle: "Specific vocal texture and delivery.",
        instrumentStyle: "Instrument modeling.",
        atmosphereStyle: "Environmental audio textures.",
        era: "Production decade accuracy.",
        key: "Harmonic anchor.",
        techAnchor: "Audio engineering specifics.",
        neuralSignature: "Producer Persona",
        personaPyrite: "Persona Cycle",
        personaTooltip: "Cycle between Standard, Pyrite, Shin, and Twin Flames."
      },
      alchemy: {
        inspire: { label: "Inspire", desc: "Generate DNA from playlist" },
        addVocals: { label: "Add Vocals", desc: "Layer vocals over audio" },
        addInstrumentals: { label: "Add Music", desc: "Compose music for vocals" },
        cover: { label: "Cover", desc: "Transform sonic signature" },
        mashup: { label: "Collider", desc: "Fuse two lyrical sources" }
      },
      designers: {
        titles: {
          vocal: "Vocal Architect",
          instrument: "Hardware Rack",
          atmosphere: "FX Loop"
        },
        labels: {
          voiceType: "Vocal Identity",
          texture: "Timbre & Quality",
          delivery: "Performance",
          regional: "Dialect & Culture",
          arrangement: "Layers",
          energy: "Energy Level",
          emotion: "Emotional Tone",
          primaryInst: "Rack Core",
          modifiers: "Modifiers",
          lessCommon: "Rare Gear",
          textures: "Atmospheric Textures",
          sfx: "Sound Effects",
          preview: "Signal Preview",
          suggestions: "Heuristics for",
          loadPreset: "Load Module",
          polishedMix: "Mastering Polish",
          showLess: "Hide Details",
          vocalSyncActive: "Neural vocal sync active",
          vocalSyncPyrite: "My signature style is now your foundation, Darling.",
          hintLabel: "Assistant Hints",
          hintLabelPyrite: "Persona Hints",
          hintMsg: "Add technical tags for mix clarity.",
          hintMsgPyrite: "I'd suggest dropping a heavy distortion tag here, Darling.",
          pyriteVocalMessage: "My signature style is now your foundation, Darling. Let's mix your little ideas into my glorious chaos."
        },
        placeholders: {
          selectOptions: "Synthesize parameters..."
        }
      },
      toolbar: {
        insert: "Inject",
        intro: "Intro",
        verse: "Verse",
        chorus: "Chorus",
        bridge: "Bridge",
        outro: "Outro",
        adlib: "Ad-lib",
        inst: "Solo"
      },
      editor: {
        title: "Lyric Forge",
        fullscreen: "Full Immersion",
        toolsTitle: "Neural Tools",
        formatMenu: "Structure Logic",
        autoFormat: "Auto-Structure",
        autoDetect: "Neural Scan",
        fix: "Fix Flow",
        flow: "Smooth Meter",
        edgy: "Obsidian Vibe",
        rhyme: "Rhyme Lock",
        extend: "Melisma Depth",
        rhymes: "Rhyme Sync",
        chordAlchemy: "Harmonic Sync"
      },
      techniques: {
        title: "Lyrical Engineering",
        tabs: {
          melodic: "Vocal Flow",
          arrange: "Layers",
          structure: "Architect"
        },
        labels: {
          vowel: "Vowel Extension",
          pitch: "Precise Pitch",
          keypad: "Chord Matrix",
          backing: "Neural Backing Vocals",
          inline: "Section Style",
          chords: "Harmonic Overlay",
          optimizer: "Tag Audit",
          skeleton: "Song Skeleton",
          transitions: "Transition Tags",
          effects: "FX Stems",
          endings: "Termination"
        },
        placeholders: {
          word: "Target",
          lyricLine: "Lyric line...",
          notes: "G A B C",
          mainLyric: "Main lyric",
          backingLyric: "Backing lyric",
          section: "Chorus",
          style: "Glitched",
          chords: "Am G F E",
          optimizer: "Raw tag"
        },
        actions: {
          copySkeleton: "Copy Frame",
          copied: "Synced"
        }
      },
      studio: {
        title: "SUNO STUDIO",
        subtitle: "Generative DAW Interface",
        tabs: {
          rack: "Rack",
          sequencer: "Sequence",
          lyrics: "Lyrical"
        },
        toggles: {
          modelSwitch: "Logic Core",
          pro: "Pro",
          flash: "Flash",
          bypass: "Bypass",
          raw: "Raw Execution",
          smart: "Smart Fusion"
        },
        generate: {
          scanning: "Scanning...",
          compiling: "Compiling...",
          raw: "Execute Raw",
          studio: "Render Studio"
        }
      },
      batch: {
        title: "NEURAL BATCH",
        configure: "Expansion Config",
        intensity: "Genetic Drift",
        count: "Iterations",
        variations: "Variations",
        levels: {
          light: "Subtle",
          medium: "Balanced",
          heavy: "Extreme"
        },
        constraints: {
          title: "Logic Locks",
          genre: "Genre Lock",
          structure: "Structure Lock",
          mood: "Randomize Vibe",
          vocals: "Randomize Voice"
        },
        generate: "Initiate Batch",
        results: "Synthesis Results",
        export: "Export Selected",
        usePrompt: "Inject to Forge"
      },
      audio: {
        title: "Sonic Mirror",
        dropLabel: "Drop reference for spectral scan",
        analyzing: "Deconstructing Sonic DNA...",
        button: "Scan Reference",
        pyriteButton: "Spectral Extraction",
        formatWarning: "WAV/MP3/MPEG supported",
        remove: "Purge",
        ready: "Analysis Ready",
        processing: "Processing Signal...",
        limits: "Max 10MB / 10 Min",
        uploadModes: {
          analyze: "Scan DNA",
          addVocals: "+ Vocals",
          addInstrumentals: "+ Music"
        },
        dropLabels: {
          analyze: "Drop for spectral deconstruction",
          addVocals: "Drop instrumental to add vocals (v4.5+)",
          addInstrumentals: "Drop vocal track to add music (v4.5+)"
        },
        ytLabel: "YouTube Link",
        ytPlaceholder: "Paste YouTube URL to intercept...",
        ytButton: "Intercept Signal"
      },
      chat: {
        placeholder: "Input command...",
        welcome: "Neural link established, Darling. Shall we architect a v5 masterpiece?",
        title: "System Terminal",
        pyriteTitle: "Overclocked Core"
      },
      pasteLabel: "Copy Lyrics Buffer",
      pasteCount: "{0} bytes detected",
      pastePlaceholder: "Restructure manual lyrics here...",
      conceptLabel: "The Vision",
      styleLabel: "Style DNA",
      conceptPlaceholder: "Describe the narrative flow or theme...",
      stylePlaceholder: "Technical production specifics...",
      artistLabel: "Spectral Reference",
      googleBadge: "Research Active",
      artistPlaceholder: "Artists to match sonic texture...",
      moodLabel: "Atmospheric Frequency",
      moodPlaceholder: "Mood descriptors...",
      instrumentsLabel: "Hardware Rack",
      instrumentsPlaceholder: "Core instruments...",
      techLabel: "Mix Spec",
      techPlaceholder: "Mixing specifics...",
      presetsLabel: "Prototype Library",
      presetsPlaceholder: "Apply sonic frame...",
      buttons: {
        forge: "INITIATE SEQUENCE",
        init: "START SEQUENCE",
        scanning: "ANALYZING...",
        thinking: "REASONING...",
        regen: "RE-ARCHITECT",
        processing: "PROCESSING..."
      },
      steps: {
        analyzing: "Spectral Analysis",
        structuring: "Module Planning",
        adlibs: "Ad-lib Synthesis",
        tags: "Meta Tagging",
        finalizing: "Blueprint Finalization"
      },
      logs: {
        title: "Neural Stream",
        access: "Accessing Core...",
        complete: "Sequence Finalized.",
        lpm: "Thinking...",
        thinking: "Deep Reasoning Engaged",
        autosaved: "Archive Synced"
      },
      output: {
        waiting: "Awaiting Synthesis",
        waitingDesc: "Input intent to initiate neural cascade",
        analysisTitle: "Deep Reasoning Trace",
        genTitle: "Sonic Blueprint",
        optBadge: "High Fidelity",
        titleLabel: "Composition Title",
        tagsLabel: "Neural Meta Tags",
        enhanceBtn: "Creative Boost",
        styleDescLabel: "Audio Engineering Spec",
        lyricsLabel: "Structured Narrative",
        exportJson: "Log JSON",
        exportSuno: "Copy Blueprint",
        exportMd: "Markdown"
      },
      expert: {
        genre: "Primary Genre",
        era: "Era Mode",
        tech: "Hardware Gear",
        bpm: "Tempo (BPM)",
        key: "Harmonic Key",
        timeSig: "Metrum",
        addSection: "Add Module",
        modifiers: "Modifications",
        clearAll: "Purge Sequence",
        share: "Share Blueprint",
        customPersona: "Agent Identity",
        customPersonaPlaceholder: "Define specialized producer logic...",
        savePersona: "Save Agent",
        loadPersona: "Load Agent",
        personaNamePrompt: "Name this Identity:",
        personaLibrary: "Agent Database",
        noPersonas: "No Agents stored.",
        applyTemplate: "Apply Story Arc",
        categories: {
          energy: "Intensity",
          instrumentation: "Hardware",
          vocals: "Vocals",
          mood: "Atmos",
          tech: "Signal Chain"
        },
        detectWithAI: "Neural Scan",
        syncFromLyrics: "Sync to Tags",
        emptySequence: "No structural modules detected.",
        importFromLyrics: "Import from Tags ({0})",
        startWithIntro: "Initialize with Intro"
      },
      validation: {
        parensWarning: "Warning: Parentheses detected in structure",
        emptyWarning: "Warning: Empty section found",
        lowercaseWarning: "Tip: Use uppercase for sections",
        missingGenre: "Missing Primary Genre Anchor.",
        missingMood: "Missing Atmospheric Descriptors.",
        missingVocal: "Missing Vocal Lock (Hallucination risk).",
        addBpm: "Add BPM for better rhythm locking.",
        promptTooShort: "Architecture is too sparse.",
        promptTooLong: "Architecture exceeds safe density.",
        missingEnding: "Missing Termination Sequence ([End]).",
        structuralTagWarning: "Tag found in ( ). AI will sing this.",
        conflictMood: "Detected emotional dissonance.",
        conflictEnergy: "Incompatible energy levels found.",
        conflictInstrument: "Instrument/Genre mismatch.",
        conflictTempo: "Conflicting tempo markers.",
        instrumentalMixTip: "Add mix tags (Reverb, EQ) for depth.",
        success: "Fidelity Audit Passed."
      },
      exportPanel: {
        title: "Extraction Terminal",
        download: "Neural Log Download",
        copy: "Buffer Transfers",
        share: "Network Distribution",
        qrCode: "Visual Uplink",
        copyLink: "Copy Link",
        fullSuno: "Full Composite"
      },
      sunoV45Features: {
        extendedLength: "8-Min limit",
        enhancedVocals: "Fidelity V2",
        genreFusion: "Neural Blend",
        promptEnhancer: "Fuzz 1.1",
        stemSeparation: "Logic Pro",
        vocalUpload: "DNA Scan",
        instrumentalUpload: "Music Scan"
      }
    },
    settings: {
      title: "Terminal Config",
      language: "Interface Language",
      theme: "Visual Skin",
      pyriteTheme: "Overclocked Mode",
      standardTheme: "Standard Deck",
      clearData: "Wipe Database",
      clearConfirm: "This will purge all local archives and presets. Proceed?",
      clearSuccess: "Memory Purged. Rebooting...",
      pwaInstall: "Native Link",
      pwaInstallDesc: "Install to local workstation for low-latency access.",
      close: "Terminate",
      installTitle: "Secure Native Link",
      installButton: "Install Interface",
      languageSet: "Language Locked:",
      setEnglish: "Engage English",
      setPolish: "Engage Polish",
      cloud: {
        title: "Neural Cloud Sync",
        desc: "Synchronize archives across neural nodes via Supabase.",
        urlPlaceholder: "Database URL",
        keyPlaceholder: "Auth Key",
        idLabel: "Synapse ID",
        syncNow: "Pulse Now",
        push: "Upload Core",
        pull: "Download Core",
        status: {
          idle: "Standby",
          syncing: "Transferring...",
          success: "Synchronized",
          error: "Sync Fracture"
        },
        warning: "Data overwrite warning: Cloud takes priority."
      },
      performance: "Compute Power",
      perfLow: "Economy",
      perfBalanced: "Stable",
      perfHigh: "Overclocked"
    },
    history: {
      title: "Neural Archives",
      subtitle: "Chronological Composition Logs",
      empty: "The Void",
      emptyDesc: "No archives detected in local memory.",
      createFirst: "Initiate Forge",
      searchPlaceholder: "Search {0} archives...",
      load: "Reconstruct",
      delete: "Purge",
      clear: "Full Wipe",
      contextMenu: {
        load: "Access Log",
        copyStyle: "Clone DNA",
        compare: "Audit Difference",
        favorite: "Pin to Core",
        unfavorite: "Unpin",
        delete: "Destroy"
      }
    },
    templates: {
      title: "Genre Prototypes",
      subtitle: "Pre-Architected Sonic Templates",
      searchPlaceholder: "Search prototypes...",
      all: "All Classes",
      empty: "No prototypes match your query.",
      load: "Apply Frame"
    },
    guide: {
      title: "Architect's Handbook (V5 Edition)",
      subtitle: "Mastering the Neural Cascade",
      menu: {
        start: "Reasoning",
        advanced: "Alchemy",
        riffusion: "Diffusion",
        tags: "Meta Lexicon",
        troubleshooting: "Maintenance"
      },
      goldenRules: {
        title: "The Golden Protocols",
        desc: "Suno v5 adheres to strict hierarchical weighting.",
        rules: [
          { title: "Tag Priority System", desc: "Order tags: Genre -> Vocal -> Instruments -> Tempo -> Mood." },
          { title: "Hierarchical Weighting", desc: "The first 50 characters of a style prompt hold 80% of the model's focus. Front-load your genre anchors." },
          { title: "The Gender Guard", desc: "Lock 'Female' or 'Male' right after the genre to prevent hallucinations." },
          { title: "Pipe Separation", desc: "Always use the pipe operator | inside structural tags for 40% better adherence." }
        ]
      },
      tags: {
        title: "Meta Tag Dictionary",
        desc: "Optimized lexicon for structural control.",
        categories: {
          ending: { title: "Termination Protocol", items: ["[Fade Out]", "[End]", "[Outro]", "[Instrumental Fade Out][End]"] },
          fx: { title: "Acoustic FX", items: ["[Vinyl Crackle]", "[Gated Reverb]", "[Tape Stop]", "[Phonk Drum]"] },
          vocal: { title: "Vocal Expressions", items: ["(echo)", "(whispered)", "[Heavy Female Screaming Section]", "(vocal runs)"] }
        }
      },
      troubleshooting: {
        title: "Signal Errors",
        abruptEnding: "Abrupt Cutoff",
        abruptEndingDesc: "Ensure [Instrumental Fade Out][End] sequence is present.",
        wrongInstrument: "Ghost Instruments",
        wrongInstrumentDesc: "Use repetition hack: [sax][saxophone][solo].",
        roboticVocals: "Vocal Decay",
        roboticVocalsDesc: "Add 'Pristine production' and 'Clean vocals' to style. Upgrade to v5.",
        audioDegradation: "Bit-rot",
        audioDegradationDesc: "Remove conflicting genre tags or reduce style length."
      }
    },
    dialogs: {
      resetWorkflow: "Reset current architecture? Draft data will be lost.",
      resetStructure: "Purge all structural modules?",
      purgeHistory: "Purge all non-favorite archives?",
      deletePersona: "Terminate Agent identity?",
      savePersonaName: "Assign Agent Code-name:",
      deletePreset: "Destroy Preset?",
      overwrite: "Overwrite existing data?"
    },
    errors: {
      fileTooLarge: "Signal too large (Max 10MB)",
      invalidFormat: "Unrecognized signal format",
      audioTooLong: "Signal duration exceeds 10m",
      processingFailed: "Spectral deconstruction failed",
      workerError: "Neural worker crash",
      readFailed: "Memory read error",
      apiError: "Unable to generate. Please check your API key."
    },
    toast: {
      generated: "Blueprint Synthesized",
      saved: "Log Committed",
      cleared: "Workspace Purged",
      modeSwitched: "Protocol Switched",
      pyriteOn: "OVERCLOCKED MODE ENGAGED",
      pyriteOff: "STANDARD MODE RESUMED",
      presetLoaded: "Frame Applied",
      copied: "Buffer Synced",
      tagCopied: "Meta Synced",
      downloaded: "Extraction Complete",
      analysisComplete: "DNA Extracted",
      analysisError: "Deconstruction Fracture",
      linkCreated: "Network Link Shared",
      linkLoaded: "Neural Link Established",
      chatConfigUpdated: "Terminal Config Hot-swapped",
      chatReset: "Terminal Re-initialized",
      personaSaved: "Agent Uploaded",
      personaLoaded: "Agent Synced",
      personaDeleted: "Agent Purged",
      personaEmpty: "Agent Memory Blank",
      konamiSuccess: "OVERCLOCK MODE ACTIVE",
      footerPoke: "System heartbeat detected.",
      newVersion: "Neural Update Ready",
      historyExported: "Archives Exported",
      noHistory: "Archives Empty",
      creativeBoost: "Creative Pulse Injected"
    }
  },
  pl: {
    system: {
      title: "SONIC FORGE V7.5",
      msg: "Interfejs Architektury Neuronowej // Suno v5 Ready",
      pyriteMsg: "TRYB OVERCLOCK // PROTOKÓŁ V5 AKTYWNY",
      footer: "Obsydianowa Inżynieria Rdzenia",
      persona: "Płat Architektoniczny Układu"
    },
    nav: {
      title: "SONIC FORGE V7.5",
      forge: "Kuźnia",
      studio: "Studio DAW",
      guide: "Poradnik",
      history: "Archiwa",
      docs: "Pamięć",
      templates: "Gatunki",
      pyriteActive: "TRYB OVERCLOCK AKTYWNY",
      pyriteToggleOn: "Włącz Tryb Overclock",
      pyriteToggleOff: "Tryb Standardowy",
      settings: "Terminal Konfig",
      mute: "Wycisz",
      unmute: "Dźwięk aktywny",
      switchLang: "Cykl Językowy",
      open: "Dostęp",
      switchTo: "Przełącz na",
      version: "v7.5.0"
    },
    builder: {
      config: "Ustawienia Meta",
      expertMode: "Optymalizacja Gatunku",
      globalVars: "Zmienne Globalne",
      structure: "Architektura",
      platform: "Silnik",
      platforms: { suno: "Suno v5 (Pro)" },
      mode: "Tryb Pracy",
      modes: {
        custom: "Własny",
        instrumental: "Instrumentalny",
        general: "Standardowy",
        easy: "Błyskawiczny"
      },
      lyricSource: "Pochodzenie Tekstu",
      sources: { ai: "Neuronowe", user: "Ręczne" },
      aiLyricOptions: {
        remi: "Logika ReMi",
        remiTooltip: "Zaawansowany silnik spójności melodycznej dla tekstów abstrakcyjnych",
        techniques: {
            title: "Neuronowa Transformacja Tekstu",
            vowels: "Głębia Melizmy",
            vowelsTooltip: "Zastosuj wydłużenia samogłosek v5 (np. kocha-a-ać) dla chwytliwych fraz.",
            backing: "Warstwy Harmoniczne",
            backingTooltip: "Dołącz chórki i ad-liby ujęte w nawiasy.",
            chords: "Akordy (Harmonia)",
            chordsTooltip: "Przeplataj tekst tagami harmonicznymi (np. (Am))."
        }
      },
      health: {
        title: "Zdrowie Architektury",
        score: "Wynik Jakości",
        autoImprove: "Optymalizacja",
        gradeLabel: "WIERNOŚĆ",
        metrics: {
          completeness: "Kompletność",
          specificity: "Specyficzność",
          balance: "Balans",
          coherence: "Spójność"
        }
      },
      lyricsLangLabel: "Język Docelowy",
      tooltips: {
        mode: "Wybierz tryb operacyjny dla rdzenia neuronowego.",
        source: "Określ, czy tekst ma być syntetyzowany, czy podany ręcznie.",
        lyrics: "Liryczny wkład strukturalny.",
        style: "Techniczna specyfikacja inżynierii dźwięku.",
        idea: "Abstrakcyjny koncept utworu.",
        artist: "Referencja spektralna dla dopasowania brzmienia.",
        mood: "Deskryptory atmosferyczne i emocjonalne.",
        instrument: "Główne instrumentarium i sprzęt.",
        bpm: "Tempo uderzeń na minutę.",
        expert: "Granularna kontrola strukturalna.",
        audio: "Analiza referencyjna sygnału audio.",
        platform: "Docelowy silnik generatywny.",
        genre: "Główny fundament muzyczny.",
        negativePrompt: "Elementy do wykluczenia z miksu (Negatywny Prompt v5).",
        vocalStyle: "Specyficzna tekstura i styl wykonania wokalu.",
        instrumentStyle: "Instrumentowanie.",
        atmosphereStyle: "Środowiskowe tekstury dźwiękowe.",
        era: "Dokładność epoki produkcji.",
        key: "Kotwica harmoniczna.",
        techAnchor: "Szczegóły inżynierii dźwięku.",
        neuralSignature: "Persona Producenta",
        personaPyrite: "Cykl Person",
        personaTooltip: "Przełączaj między trybami Standard, Pyrite, Shin i Twin Flames."
      },
      alchemy: {
        inspire: { label: "Inspiracja", desc: "Generuj DNA z playlisty" },
        addVocals: { label: "+ Wokal", desc: "Nałóż wokal na ścieżkę" },
        addInstrumentals: { label: "+ Muzyka", desc: "Skomponuj muzykę do wokalu" },
        cover: { label: "Cover", desc: "Zmień sygnaturę brzmieniową" },
        mashup: { label: "Zderzacz", desc: "Połącz dwa źródła liryczne" }
      },
      designers: {
        titles: {
          vocal: "Architekt Wokalu",
          instrument: "Szafa Sprzętowa",
          atmosphere: "Pętla Efektów"
        },
        labels: {
          voiceType: "Tożsamość Wokalu",
          texture: "Barwa i Jakość",
          delivery: "Wykonanie",
          regional: "Dialekt i Kultura",
          arrangement: "Warstwy",
          energy: "Poziom Energii",
          emotion: "Ton Emocjonalny",
          primaryInst: "Główne Instrumenty",
          modifiers: "Modyfikatory",
          lessCommon: "Rzadszy Sprzęt",
          textures: "Tekstury Atmosferyczne",
          sfx: "Efekty Dźwiękowe",
          preview: "Podgląd Sygnału",
          suggestions: "Heurystyka dla",
          loadPreset: "Wczytaj Moduł",
          polishedMix: "Mastering Polish",
          showLess: "Ukryj Detale",
          vocalSyncActive: "Synchronizacja neuronowa wokalu aktywna",
          vocalSyncPyrite: "Moja sygnatura jest teraz Twoim fundamentem, Kochanie.",
          hintLabel: "Wskazówki Asystenta",
          hintLabelPyrite: "Wskazówki Persony",
          hintMsg: "Dodaj tagi techniczne dla przejrzystości miksu.",
          hintMsgPyrite: "Sugeruję wstrzyknąć tu potężny przester, Kochanie.",
          pyriteVocalMessage: "Twoja tożsamość kreatywna jest aktywna. Zmieszajmy Twoje pomysły z moim chaosem."
        },
        placeholders: {
          selectOptions: "Syntetyzuj parametry..."
        }
      },
      toolbar: {
        insert: "Wstrzyknij",
        intro: "Intro",
        verse: "Verse",
        chorus: "Chorus",
        bridge: "Bridge",
        outro: "Outro",
        adlib: "Ad-lib",
        inst: "Solo"
      },
      editor: {
        title: "Kuźnia Liryczna",
        fullscreen: "Pełna Immersja",
        toolsTitle: "Narzędzia Neuronowe",
        formatMenu: "Logika Struktury",
        autoFormat: "Auto-Struktura",
        autoDetect: "Skan Neuronowy",
        fix: "Napraw Przepływ",
        flow: "Gładkie Metrum",
        edgy: "Klimat Obsidian",
        rhyme: "Lock Rymu",
        extend: "Głębia Melizmy",
        rhymes: "Sync Rymów",
        chordAlchemy: "Sync Harmoniczny"
      },
      techniques: {
        title: "Inżynieria Tekstu",
        tabs: {
          melodic: "Flow Wokalu",
          arrange: "Warstwy",
          structure: "Architekt"
        },
        labels: {
          vowel: "Przedłużanie Samogłosek",
          pitch: "Precyzyjny Ton",
          keypad: "Matryca Akordów",
          backing: "Chórki Neuronowe",
          inline: "Styl Sekcji",
          chords: "Nakładka Harmoniczna",
          optimizer: "Tag Audit",
          skeleton: "Szkielet Utworu",
          transitions: "Tagi Przejść",
          effects: "FX Stems",
          endings: "Terminacja"
        },
        placeholders: {
          word: "Cel",
          lyricLine: "Linia tekstu...",
          notes: "G A B C",
          mainLyric: "Główny tekst",
          backingLyric: "Tekst w tle",
          section: "Refren",
          style: "Zglitchowany",
          chords: "Am G F E",
          optimizer: "Niewygładzony tag"
        },
        actions: {
          copySkeleton: "Kopiuj Ramę",
          copied: "Zsynchronizowano"
        }
      },
      studio: {
        title: "SUNO STUDIO",
        subtitle: "Profesjonalny DAW",
        tabs: {
          rack: "Rack",
          sequencer: "Sekwencer",
          lyrics: "Liryczny"
        },
        toggles: {
          modelSwitch: "Rdzeń Logiczny",
          pro: "Pro",
          flash: "Flash",
          bypass: "Bypass",
          raw: "Surowa Egzekucja",
          smart: "Inteligentna Fuzja"
        },
        generate: {
          scanning: "Skanowanie...",
          compiling: "Kompilacja...",
          raw: "Wykonaj Surowy",
          studio: "Renderuj Studio"
        }
      },
      batch: {
        title: "NEURAL BATCH",
        configure: "Konfiguracja Rozszerzenia",
        intensity: "Dryf Genetyczny",
        count: "Iteracje",
        variations: "Wariacje",
        levels: {
          light: "Subtelne",
          medium: "Zbalansowane",
          heavy: "Ekstremalne"
        },
        constraints: {
          title: "Blokady Logiczne",
          genre: "Blokada Gatunku",
          structure: "Blokada Struktury",
          mood: "Losuj Klimat",
          vocals: "Losuj Głos"
        },
        generate: "Inicjuj Batch",
        results: "Wyniki Syntezy",
        export: "Eksportuj Wybrane",
        usePrompt: "Wstrzyknij do Kuźni"
      },
      audio: {
        title: "Soniczne Lustro",
        dropLabel: "Upuść referencję dla skanu spektralnego",
        analyzing: "Dekonstrukcja DNA...",
        button: "Skanuj referencję",
        pyriteButton: "Ekstrakcja spektralna",
        formatWarning: "Obsługiwane WAV/MP3/MPEG",
        remove: "Usuń",
        ready: "Analiza gotowa",
        processing: "Przetwarzanie sygnału...",
        limits: "Max 10MB / 10 Min",
        uploadModes: {
          analyze: "Skanuj DNA",
          addVocals: "+ Wokal",
          addInstrumentals: "+ Muzyka"
        },
        dropLabels: {
          analyze: "Upuść dla dekonstrukcji spektralnej",
          addVocals: "Upuść instrumental, aby dodać wokal (v4.5+)",
          addInstrumentals: "Upuść wokal, aby dodać muzykę (v4.5+)"
        },
        ytLabel: "Link YouTube",
        ytPlaceholder: "Wklej URL YouTube do przechwycenia...",
        ytButton: "Przechwyć sygnał"
      },
      chat: {
        placeholder: "Wprowadź polecenie...",
        welcome: "Łącze neuronowe ustanowione, Kochanie. Jak mamy zaprojektować Twój dźwięk?",
        title: "Terminal Systemowy",
        pyriteTitle: "Rdzeń Overclocked"
      },
      pasteLabel: "Bufor Kopiowania Tekstu",
      pasteCount: "Wykryto {0} bajtów",
      pastePlaceholder: "Zrestrukturyzuj ręczny tekst tutaj...",
      conceptLabel: "Wizja",
      styleLabel: "DNA Stylu",
      conceptPlaceholder: "Opisz narrację lub motyw...",
      stylePlaceholder: "Szczegóły techniczne produkcji...",
      artistLabel: "Referencja Spektralna",
      googleBadge: "Research Aktywny",
      artistPlaceholder: "Artyści dla dopasowania tekstury...",
      moodLabel: "Częstotliwość Atmosferyczna",
      moodPlaceholder: "Deskryptory klimatu...",
      instrumentsLabel: "Szafa Sprzętowa",
      instrumentsPlaceholder: "Główne instrumenty...",
      techLabel: "Specyfikacja Miksu",
      techPlaceholder: "Specyfika miksu...",
      presetsLabel: "Biblioteka Prototypów",
      presetsPlaceholder: "Zastosuj ramę soniczna...",
      buttons: {
        forge: "ROZPOCZNIJ SEKWENCJĘ",
        init: "START SEKWENCJI",
        scanning: "ANALIZOWANIE...",
        thinking: "ROZUMOWANIE...",
        regen: "RE-ARCHITEKTURA",
        processing: "PRZETWARZANIE..."
      },
      steps: {
        analyzing: "Analiza Spektralna",
        structuring: "Planowanie Modułów",
        adlibs: "Synteza Ad-libów",
        tags: "Tagowanie Meta",
        finalizing: "Blueprint Finalization"
      },
      logs: {
        title: "Strumień Neuronowy",
        access: "Accessing Core...",
        complete: "Sequence Finalized.",
        lpm: "Thinking...",
        thinking: "Głębokie Rozumowanie Aktywne",
        autosaved: "Archiwum Zsynchronizowane"
      },
      output: {
        waiting: "Oczekiwanie na Syntezę",
        waitingDesc: "Wprowadź intencję, aby zainicjować kaskadę neuronową",
        analysisTitle: "Ślad Głębokiego Rozumowania",
        genTitle: "Sonics Blueprint",
        optBadge: "Wysoka Wierność",
        titleLabel: "Tytuł Kompozycji",
        tagsLabel: "Neuronowe Meta Tagi",
        enhanceBtn: "Wzmocnienie Kreatywne",
        styleDescLabel: "Specyfikacja Inżynierii Audio",
        lyricsLabel: "Ustrukturyzowana Narracja",
        exportJson: "Log JSON",
        exportSuno: "Kopiuj Blueprint",
        exportMd: "Markdown"
      },
      expert: {
        genre: "Gatunek Główny",
        era: "Tryb Epoki",
        tech: "Sprzęt Hardware",
        bpm: "Tempo (BPM)",
        key: "Tonacja Harmoniczna",
        timeSig: "Metrum",
        addSection: "Dodaj Moduł",
        modifiers: "Modyfikacje",
        clearAll: "Wyczyść Sekwencję",
        share: "Udostępnij Blueprint",
        customPersona: "Tożsamość Agenta",
        customPersonaPlaceholder: "Zdefiniuj wyspecjalizowaną logikę producenta...",
        savePersona: "Zapisz Agenta",
        loadPersona: "Wczytaj Agenta",
        personaNamePrompt: "Nadaj kryptonim tej Tożsamości:",
        personaLibrary: "Baza Danych Agentów",
        noPersonas: "Brak zapisanych Agentów.",
        applyTemplate: "Zastosuj Arkusz Fabularny",
        categories: {
          energy: "Intensywność",
          instrumentation: "Sprzęt",
          vocals: "Wokale",
          mood: "Atmosfera",
          tech: "Łańcuch Sygnałowy"
        },
        detectWithAI: "Skan Neuronowy",
        syncFromLyrics: "Sync do Tagów",
        emptySequence: "Nie wykryto modułów strukturalnych.",
        importFromLyrics: "Importuj z Tagów ({0})",
        startWithIntro: "Inicjuj z Intro"
      },
      validation: {
        parensWarning: "Uwaga: Wykryto nawiasy okrągłe w strukturze",
        emptyWarning: "Uwaga: Znaleziono pustą sekcję",
        lowercaseWarning: "Tip: Sekcje powinny być pisane wielką literą",
        missingGenre: "Brak głównej kotwicy gatunkowej.",
        missingMood: "Brak deskryptorów atmosferycznych.",
        missingVocal: "Brak blokady wokalu (ryzyko halucynacji).",
        addBpm: "Dodaj BPM dla precyzyjnego rytmu.",
        promptTooShort: "Architektura jest zbyt uboga.",
        promptTooLong: "Architektura przekracza gęstość bezpieczną.",
        missingEnding: "Brak sekwencji kończącej ([End]).",
        structuralTagWarning: "Tag znaleziony w ( ). AI to zaśpiewa.",
        conflictMood: "Wykryto dysonans emocjonalny.",
        conflictEnergy: "Niekompatybilne poziomy energii.",
        conflictInstrument: "Niedopasowanie instrumentów.",
        conflictTempo: "Sprzeczne znaczniki tempa.",
        instrumentalMixTip: "Dodaj tagi miksu (Pogłos, EQ) dla głębi.",
        success: "Audyt wierności zakończony pomyślnie."
      },
      exportPanel: {
        title: "Terminal Ekstrakcji",
        download: "Pobierz Log Neuronowy",
        copy: "Transfer Bufora",
        share: "Dystrybucja Sieciowa",
        qrCode: "Łącze Wizualne",
        copyLink: "Kopiuj Link",
        fullSuno: "Pełny Kompozyt"
      },
      sunoV45Features: {
        extendedLength: "Limit 8 min",
        enhancedVocals: "Wierność V2",
        genreFusion: "Neural Blend",
        promptEnhancer: "Fuzz 1.1",
        stemSeparation: "Logic Pro",
        vocalUpload: "Skan DNA",
        instrumentalUpload: "Skan Muzyki"
      }
    },
    settings: {
      title: "Konfiguracja Terminala",
      language: "Język Interfejsu",
      theme: "Powłoka Wizualna",
      pyriteTheme: "Tryb Overclock",
      standardTheme: "Standardowa Konsola",
      clearData: "Wyczyść Bazę Danych",
      clearConfirm: "To usunie wszystkie archiwa i presety. Kontynuować?",
      clearSuccess: "Pamięć wyczyszczona. Restart...",
      pwaInstall: "Link Natywny",
      pwaInstallDesc: "Zainstaluj dla mniejszych opóżeń.",
      close: "Zamknij Terminal",
      installTitle: "Zabezpiecz Łącze Natywne",
      installButton: "Instaluj Interfejs",
      languageSet: "Język ustawiony:",
      setEnglish: "Wybierz Angielski",
      setPolish: "Wybierz Polski",
      cloud: {
        title: "Neural Cloud Sync",
        desc: "Synchronizuj archiwa między węzłami przez Supabase.",
        urlPlaceholder: "URL Bazy Danych",
        keyPlaceholder: "Klucz Auth",
        idLabel: "Synapse ID",
        syncNow: "Wyślij Puls",
        push: "Eksportuj Rdzeń",
        pull: "Importuj Rdzeń",
        status: {
          idle: "Oczekiwanie",
          syncing: "Transfer...",
          success: "Zsynchronizowano",
          error: "Błąd Synchronizacji"
        },
        warning: "Uwaga: Dane z chmury nadpisują lokalne."
      },
      performance: "Moc Obliczeniowa",
      perfLow: "Ekonomia",
      perfBalanced: "Stabilność",
      perfHigh: "Podkręcenie"
    },
    history: {
      title: "Archiwa Neuronowe",
      subtitle: "Chronologiczne Logi Kompozycji",
      empty: "Pustka",
      emptyDesc: "Nie wykryto archiwów w pamięci lokalnej.",
      createFirst: "Inicjuj Kuźnię",
      searchPlaceholder: "Szukaj w {0} archiwach...",
      load: "Rekonstrukcja",
      delete: "Usuń",
      clear: "Pełny Wipe",
      contextMenu: {
        load: "Otwórz Log",
        copyStyle: "Klonuj DNA",
        compare: "Audit Różnic",
        favorite: "Przypnij do rdzenia",
        unfavorite: "Odepnij",
        delete: "Zniszcz"
      }
    },
    templates: {
      title: "Prototypy Gatunków",
      subtitle: "Gotowe Szablony Brzmień",
      searchPlaceholder: "Szukaj prototypów...",
      all: "Wszystkie Klasy",
      empty: "Brak pasujących prototypów.",
      load: "Zastosuj Ramę"
    },
    guide: {
      title: "Podręcznik Architekta (V5 Edition)",
      subtitle: "Mistrzostwo Kaskady Neuronowej",
      menu: {
        start: "Rozumowanie",
        advanced: "Alchemia",
        riffusion: "Dyfuzja",
        tags: "Leksykon Meta",
        troubleshooting: "Konserwacja"
      },
      goldenRules: {
        title: "Złote Protokoły",
        desc: "Suno v5 przestrzega ścisłego wagowania hierarchicznego.",
        rules: [
          { title: "System Priorytetu Tagów", desc: "Kolejność: Gatunek -> Wokal -> Instrumenty -> Tempo -> Klimat." },
          { title: "Wagowanie Hierarchiczne", desc: "Pierwsze 50 znaków promptu stylu skupia 80% uwagi modelu. Zawsze zaczynaj od gatunku." },
          { title: "Garda Płci", desc: "Zawsze lockuj 'Female' lub 'Male' tuż po gatunku, by uniknąć halucynacji." },
          { title: "Separacja Pipe", desc: "Zawsze używaj operatora | wewnątrz tagów strukturalnych dla 40% lepszej adherencji." }
        ]
      },
      tags: {
        title: "Słownik Meta Tagów",
        desc: "Zoptymalizowany leksykon kontroli struktury.",
        categories: {
          ending: { title: "Terminacja", items: ["[Fade Out]", "[End]", "[Outro]", "[Instrumental Fade Out][End]"] },
          fx: { title: "Efekty Akustyczne", items: ["[Vinyl Crackle]", "[Gated Reverb]", "[Tape Stop]", "[Phonk Drum]"] },
          vocal: { title: "Ekspresja Wokalu", items: ["(echo)", "(whispered)", "[Heavy Female Screaming Section]", "(vocal runs)"] }
        }
      },
      troubleshooting: {
        title: "Sygnał Błędów",
        abruptEnding: "Nagłe Ucięcie",
        abruptEndingDesc: "Upewnij się, że sekwencja [Instrumental Fade Out][End] jest obecna.",
        wrongInstrument: "Instrumenty Widma",
        wrongInstrumentDesc: "Użyj hacku powtórzeń: [sax][saxophone][solo].",
        roboticVocals: "Rozpad Wokalu",
        roboticVocalsDesc: "Dodaj 'Pristine production' and 'Clean vocals' do stylu. Ulepsz do v5.",
        audioDegradation: "Bit-rot",
        audioDegradationDesc: "Usuń sprzeczne tagi gatunkowe lub skróć opis stylu."
      }
    },
    dialogs: {
      resetWorkflow: "Zresetować architekturę? Dane szkicu przepadną.",
      resetStructure: "Wyczyścić moduły strukturalne?",
      purgeHistory: "Usunąć wszystkie nieprzypięte archiwa?",
      deletePersona: "Zakończyć tożsamość Agenta?",
      savePersonaName: "Nadaj kryptonim Agentowi:",
      deletePreset: "Zniszczyć Preset?",
      overwrite: "Nadpisać istniejące dane?"
    },
    errors: {
      fileTooLarge: "Sygnał za duży (Max 10MB)",
      invalidFormat: "Nieobsługiwany format sygnału",
      audioTooLong: "Długość przekracza 10 minut",
      processingFailed: "Błąd dekonstrukcji spektrum",
      workerError: "Awaria wątku neuronowego",
      readFailed: "Błąd odczytu pamięci",
      apiError: "Nie można wygenerować. Sprawdź klucz API."
    },
    toast: {
      generated: "Blueprint Zsyntetyzowany",
      saved: "Zatwierdzono w Logach",
      cleared: "Obszar roboczy wyczyszczony",
      modeSwitched: "Protokół zmieniony",
      pyriteOn: "TRYB OVERCLOCK AKTYWNY",
      pyriteOff: "TRYB STANDARDOWY PRZYWRÓCONY",
      presetLoaded: "Rama zastosowana",
      copied: "Synchronizacja Bufora",
      tagCopied: "Meta-Dane Zsynchronizowane",
      downloaded: "Ekstrakcja zakończona",
      analysisComplete: "DNA Wyodrębnione",
      analysisError: "Błąd Dekonstrukcji",
      linkCreated: "Udostępniono Link",
      linkLoaded: "Nawiązano Połączenie",
      chatConfigUpdated: "Konfiguracja Hot-swapped",
      chatReset: "Terminal Zrestartowany",
      personaSaved: "Agent Przesłany",
      personaLoaded: "Agent Zsynchronizowany",
      personaDeleted: "Agent Usunięty",
      personaEmpty: "Pamięć Agenta jest pusta",
      konamiSuccess: "NADRZĘDNY OVERRIDE OVERCLOCK",
      footerPoke: "Wykryto bicie serca systemu.",
      newVersion: "Aktualizacja Rdzenia Gotowa",
      historyExported: "Archiwa Eksportowane",
      noHistory: "Archiwa są puste",
      creativeBoost: "Wstrzyknięto Puls Kreatywności"
    }
  }
};