
export interface GenreOptimizer {
  genreId: string;
  keywords: string[];
  regionalization?: Record<string, string[]>;
  techniques?: string[];
  effectiveTags?: string[];
  structureHints?: string[];
  keyTags?: Record<string, string>;
  transitionTips?: string[];
  vocals?: Record<string, string>;
  instruments?: string[];
  avoid?: string[];
}

export const GENRE_OPTIMIZERS: GenreOptimizer[] = [
  // Hip Hop / Trap
  {
    genreId: 'hip_hop',
    keywords: ['hip hop', 'rap', 'trap', 'drill', 'boom bap', 'phonk'],
    regionalization: {
       southern: ["Memphis trap", "Atlanta trap", "Houston rap", "Southern flow"],
       westCoast: ["West coast gangsta rap", "Compton hip-hop beat", "LA rap", "G-Funk"],
       eastCoast: ["New York boom bap", "Brooklyn drill", "East Coast hip hop", "NY State of Mind"]
    },
    techniques: [
       "Use 'Phonk Drum' tag to fix British accent issues",
       "Write lyrics in the desired accent/slang (phonetic spelling)",
       "Combine with soul/blues for R&B vocals",
       "Specify regional style explicitly"
    ],
    effectiveTags: [
       "Memphis trap, dark, 808 bass, hi-hat rolls",
       "Atlanta trap, auto-tune, ad-libs, southern flow",
       "Boom bap, 90s hip hop, jazzy samples, vinyl crackle"
    ]
  },
  // Electronic
  {
    genreId: 'electronic',
    keywords: ['electronic', 'edm', 'house', 'techno', 'dubstep', 'drum and bass', 'synthwave', 'trance'],
    structureHints: ["Intro", "Build-up", "Drop", "Breakdown", "Build-up", "Drop", "Outro"],
    keyTags: {
       deepHouse: "[groovy bassline][4/4 beat][sub bass][atmospheric pads]",
       drumAndBass: "[fast breakbeats][heavy bassline][160-180 BPM]",
       synthwave: "[vintage synthesizers][analog warmth][retro drums]"
    },
    transitionTips: [
       "Use [build-up] before drops",
       "Use [breakdown] for calm sections",
       "Specify bar count: [8 bar build]"
    ]
  },
  // Rock / Metal
  {
    genreId: 'rock_metal',
    keywords: ['rock', 'metal', 'punk', 'grunge', 'core'],
    vocals: {
       clean: "powerful clean vocals, soaring melody",
       harsh: "guttural aggressive vocals, screaming",
       mixed: "clean vocals in verse, screaming in chorus"
    },
    instruments: [
       "heavy riffs",
       "distorted guitars", 
       "palm-muted chugging",
       "guitar solo with wah pedal"
    ],
    techniques: [
        "For Metal, specify 'Double Kick Drum'",
        "Use [Breakdown] for heavy sections"
    ]
  },
  // Acoustic
  {
    genreId: 'acoustic',
    keywords: ['acoustic', 'folk', 'singer-songwriter', 'country', 'unplugged'],
    avoid: [
       "Don't overload with instruments",
       "Focus on vocals + 1-2 instruments",
       "Use 'intimate' and 'stripped back' descriptors"
    ],
    effectiveTags: [
       "fingerpicked acoustic guitar, intimate vocals",
       "piano ballad, emotional delivery, minimalist",
       "close-mic recording"
    ]
  }
];

export const COMMON_ISSUES = {
     abruptEndings: {
       problem: "Song cuts off suddenly",
       solutions: ["[Fade Out]", "[Outro]", "[Instrumental Fade Out][End]"]
     },
     wrongInstrument: {
       problem: "Suno ignores instrument requests",
       solutions: [
         "Use repeated tags: [sax][saxophone][solo]",
         "Try lowercase tags",
         "Use variations (e.g. 'fiddle' vs 'violin')"
       ]
     },
     randomNoises: {
       problem: "TV static or weird sounds",
       solutions: [
         "Use cleaner style prompts (avoid 'glitch' if not intended)",
         "Avoid conflicting descriptors"
       ]
     },
     loopingLyrics: {
       problem: "Same lyrics repeat endlessly",
       solutions: [
         "Use clear section markers [Verse 1], [Verse 2]",
         "Add [End] or [Outro]",
         "Vary lyric structure between sections"
       ]
     }
};

export const BEST_PRACTICES = {
     tagFormatting: [
       "Use [Square Brackets] for meta tags",
       "Use (Parentheses) for inline styles or background vocals",
       "Capitalize section names: [Verse], not [verse]",
       "Short tags work better: [Drop] not [Epic Drop Section]"
     ],
     layering: [
       "Style prompt first, then lyrics with tags",
       "Don't put lyrics in style prompt field",
       "Plan structure before writing lyrics"
     ],
     iteration: [
       "Generate 3-5 versions, pick best",
       "Make small changes between attempts",
       "Save success patterns"
     ]
};
