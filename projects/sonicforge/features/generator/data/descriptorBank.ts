
export const DESCRIPTOR_BANK = {
  // MOOD EXPANSIONS (Simple -> Complex)
  moods: {
    happy: ['Euphoric', 'Sun-soaked', 'Uplifting anthem', 'Radiant', 'Feel-good', 'Bouncy', 'Joyful', 'Optimistic', 'Carefree', 'Vibrant'],
    sad: ['Melancholic', 'Heart-wrenching', 'Bittersweet', 'Sorrowful', 'Depressive', 'Grieving', 'Tear-jerker', 'Somber', 'Poignant', 'Emotional depth'],
    dark: ['Ominous', 'Brooding', 'Nocturnal', 'Eerie', 'Sinister', 'Shadowy', 'Gothic', 'Haunting', 'Foreboding', 'Mystery'],
    energetic: ['High-octane', 'Explosive', 'Adrenaline-fueled', 'Relentless', 'Driving', 'Frenzied', 'Hyperactive', 'Anthemic', 'Stadium-ready', 'Pumping'],
    chill: ['Laid-back', 'Mellow', 'Easy-going', 'Relaxed groove', 'Lo-fi aesthetic', 'Meditative', 'Serene', 'Downtempo', 'Floating', 'Dreamy'],
    romantic: ['Passionate', 'Intimate', 'Seductive', 'Love ballad', 'Heartfelt', 'Tender', 'Sentimental', 'Sensual', 'Warm'],
    epic: ['Cinematic', 'Grandiose', 'Larger than life', 'Monumental', 'Heroic', 'Sweeping', 'Majestic', 'Orchestral', 'Legendary'],
    aggressive: ['Brutal', 'Visceral', 'Hard-hitting', 'Punishing', 'Ferocious', 'In-your-face', 'Volatile', 'Raw', 'Unapologetic']
  } as Record<string, string[]>,

  // TEXTURE & ATMOSPHERE
  atmosphere: [
    'Spacious', 'Claustrophobic', 'Hazy', 'Dreamy', 'Ethereal', 'Surreal', 'Hypnotic',
    'Gritty', 'Polished', 'Raw', 'Industrial', 'Organic', 'Synthetic', 'Futuristic',
    'Retro', 'Vintage', 'Nostalgic', 'Warm', 'Cold', 'Icy', 'Tropical', 'Neon-lit',
    'Smoky', 'Dusty', 'Underwater', 'Celestial'
  ],

  // PRODUCTION QUALITY (V4.5 Specifics)
  production: [
    'Pristine production', 'Studio quality', 'Mastered', 'Radio-ready', 'Hi-fi',
    'Lo-fi aesthetic', 'Tape saturation', 'Vinyl crackle', 'Warm analog mixing',
    'Wide stereo field', 'Deep bass response', 'Crisp highs', 'Punchy mix',
    'Wall of sound', 'Minimalist arrangement', 'Dense layering', 'Dry mix', 'Wet reverb',
    'Gated reverb', 'Bitcrushed', '8-bit', 'Cassette tape wobble', 'Clean mix', 'Balanced levels'
  ],

  // VOCAL CHARACTER
  vocals: [
    'Soulful delivery', 'Powerful belt', 'Breath-y whisper', 'Raspy texture',
    'Autotuned precision', 'Operatic range', 'Guttural scream', 'Spoken word',
    'Rapid-fire flow', 'Melodic harmonization', 'Emotional vibrato', 'Deadpan delivery',
    'Ethereal choir', 'Gang vocals', 'Intimate close-mic', 'Whisper-soft', 'Falsetto',
    'Fried scream', 'Melismatic', 'Vocoder', 'Chanted'
  ],

  // GENRE-SPECIFIC ENHANCERS (To avoid clashes)
  genreSpecific: {
    electronic: [
      'Lush synth pads', 'Arpeggiated leads', 'Deep sub bass', 'Glitch effects', 'Sidechain compression',
      'Supersaw chords', 'Build-up and drop', 'Four-on-the-floor', 'Breakbeats', 'Modular synthesis'
    ],
    rock: [
      'Distorted power chords', 'Shredding guitar solo', 'Driving bassline', 'Thunderous drums',
      'Feedback', 'Tube amp saturation', 'Crash cymbals', 'Palm-muted riffs', 'Acoustic intro'
    ],
    hiphop: [
      'Thumping 808s', 'Tight drum groove', 'Sampled loops', 'Vinyl scratches', 'Phonk drum',
      'Trap hi-hats', 'Boom bap beat', 'Chopped and screwed', 'Ad-libs', 'Heavy kick'
    ],
    orchestral: [
      'Sweeping strings', 'Brass section swells', 'Timpani rolls', 'Orchestral hits',
      'Woodwind melody', 'Epic choir', 'Dynamic swelling', 'Concerto style'
    ],
    acoustic: [
      'Fingerpicked guitar', 'Soft piano', 'Brushed drums', 'Upright bass', 'Nylon strings',
      'Campfire vibe', 'Unplugged', 'Live recording feel', 'Room ambience'
    ]
  } as Record<string, string[]>
};

export const getDescriptors = (category: keyof typeof DESCRIPTOR_BANK): string[] => {
  if (category === 'moods') return Object.values(DESCRIPTOR_BANK.moods).flat();
  return (DESCRIPTOR_BANK as any)[category] || [];
};
