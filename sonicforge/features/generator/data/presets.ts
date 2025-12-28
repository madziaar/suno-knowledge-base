
import { Preset } from '../../../types';

export const presetTemplates: Preset[] = [
  // --- CINEMATIC / AMBIENT (SUNO) ---
  {
    id: 'epic-metal',
    category: 'Cinematic & Epic',
    platform: 'suno',
    name: { en: 'Epic Symphonic Metal', pl: 'Epicki Metal Symfoniczny' },
    description: { en: 'Orchestral backing with heavy guitars', pl: 'Orkiestrowe tło z ciężkimi gitarami' },
    tags: 'symphonic metal, orchestral, operatic vocals, epic, fast tempo, heavy distortion, double kick drum',
    style: 'A massive wall of sound production featuring a full orchestra layered with distorted electric guitars. High dynamic range, cinematic atmosphere, soaring operatic vocals mixed with aggressive growls.',
    mood: 'Epic, Triumphant',
    instruments: 'Electric Guitar, Orchestra, Drums, Choir',
    suggestedMode: 'custom'
  },
  {
    id: 'cinematic-trailer',
    category: 'Cinematic & Epic',
    platform: 'suno',
    name: { en: 'Epic Cinematic Trailer', pl: 'Epicki Zwiastun Filmowy' },
    description: { en: 'Huge impacts, risers, orchestral hybrid', pl: 'Wielkie uderzenia, risery, hybryda orkiestrowa' },
    tags: 'cinematic, trailer, hybrid orchestral, epic, dramatic, action, suspense, instrumental',
    style: 'Modern Hollywood trailer production. Starts with solitary piano ping, builds with rapid string ostinatos, heavy braams, and massive percussion impacts. Includes electronic risers and silence drops.',
    mood: 'Dramatic, Tense',
    instruments: 'Orchestra, Braams, Hybrid FX, Percussion',
    suggestedMode: 'instrumental'
  },
  {
    id: 'dark-ambient',
    category: 'Cinematic & Epic',
    platform: 'suno',
    name: { en: 'Dark Cinematic Ambient', pl: 'Mroczny Ambient Filmowy' },
    description: { en: 'Atmospheric horror soundscape', pl: 'Atmosferyczny pejzaż horroru' },
    tags: 'dark ambient, cinematic, drone, eerie, horror, suspense, slow tempo',
    style: 'Deep, resonant drones and unsettling textures. Massive reverb spaces, metallic scrapes, and subsonic bass frequencies. A feeling of dread and isolation.',
    mood: 'Dark, Eerie',
    instruments: 'Synth Pads, Drones, FX',
    suggestedMode: 'instrumental'
  },
  {
    id: 'meditation-hz',
    category: 'Cinematic & Epic',
    platform: 'suno',
    name: { en: '432Hz Healing Drone', pl: 'Uzdrawiający Dron 432Hz' },
    description: { en: 'Pure tones for meditation', pl: 'Czyste tony do medytacji' },
    tags: 'ambient, drone, meditation, healing, 432hz, spiritual, peaceful, instrumental',
    style: 'A continuous, evolving soundscape of pure sine waves and soft pads tuned to 432Hz. No percussion. Gentle binaural beats and tibetan singing bowl textures. Extreme reverb.',
    mood: 'Peaceful, Spiritual',
    instruments: 'Sine Waves, Pads, Singing Bowls',
    suggestedMode: 'instrumental'
  },

  // --- POP & MAINSTREAM (SUNO) ---
  {
    id: 'pop-banger',
    category: 'Pop & Electronic',
    platform: 'suno',
    name: { en: 'Modern Pop Banger', pl: 'Nowoczesny Popowy Hit' },
    description: { en: 'Chart-topping energy', pl: 'Energia z list przebojów' },
    tags: 'pop, dance-pop, upbeat, female vocals, catchy, high energy, radio ready',
    style: 'Pristine, polished modern pop production. Punchy drums, sidechained bass, bright synthesizers, and heavily processed, crisp vocals with perfect pitch correction.',
    mood: 'Happy, Energetic',
    instruments: 'Synth, Drum Machine, Bass',
    suggestedMode: 'custom'
  },
  {
    id: 'kpop-high',
    category: 'Pop & Electronic',
    platform: 'suno',
    name: { en: 'K-Pop Anthem', pl: 'Hymn K-Pop' },
    description: { en: 'High production value, group vocals', pl: 'Wysoka produkcja, wokale grupowe' },
    tags: 'k-pop, dance-pop, high energy, group vocals, polished, catchy, complex arrangement',
    style: 'Extremely polished production with rapid genre switches. Punchy electronic beats mixed with trap hi-hats. Bright, layered group vocals with crisp harmonies and high-energy raps.',
    mood: 'Energetic, Confident',
    instruments: 'Synth, Sub Bass, Samples',
    suggestedMode: 'custom'
  },
  {
    id: 'future-bass',
    category: 'Pop & Electronic',
    platform: 'suno',
    name: { en: 'Future Bass', pl: 'Future Bass' },
    description: { en: 'Huge supersaws and vocal chops', pl: 'Wielkie supersawy i wokalne sample' },
    tags: 'future bass, edm, melodic, high energy, supersaw, vocal chops, heavy sidechain',
    style: 'Massive, detuned supersaw chords with heavy sidechain compression linked to the kick drum. Bright, pitched-up vocal chops forming the melody. Trap-influenced hi-hats and deep sub-bass.',
    mood: 'Euphoric, Energetic',
    instruments: 'Supersaw Synths, Sub Bass, Vocal Chops',
    suggestedMode: 'custom'
  },

  // --- URBAN & HIP HOP (SUNO) ---
  {
    id: 'chill-lofi',
    category: 'Urban & Hip Hop',
    platform: 'suno',
    name: { en: 'Chill Lo-Fi Hip Hop', pl: 'Chill Lo-Fi Hip Hop' },
    description: { en: 'Relaxing beats to study to', pl: 'Relaksujące bity do nauki' },
    tags: 'lo-fi, hip hop, chill, downtempo, vinyl crackle, nostalgic, instrumental',
    style: 'Warm, vintage production with audible vinyl crackle and tape hiss. Muffled kick drums, jazzy piano samples, and a relaxed, unquantized groove. Low fidelity aesthetic.',
    mood: 'Relaxed, Nostalgic',
    instruments: 'Piano, Drum Machine, Vinyl FX',
    suggestedMode: 'instrumental'
  },
  {
    id: 'phonk-drift',
    category: 'Urban & Hip Hop',
    platform: 'suno',
    name: { en: 'Drift Phonk', pl: 'Drift Phonk' },
    description: { en: 'Aggressive, cowbell-heavy, distorted', pl: 'Agresywny, przesterowany, z cowbellami' },
    tags: 'phonk, drift phonk, cowbell, distorted, aggressive, memphis rap samples, high energy',
    style: 'Extremely distorted and compressed production. Features loud, rhythmic 808 cowbell melodies, heavy bass distortion, and lo-fi Memphis rap vocal samples. Gritty and aggressive.',
    mood: 'Aggressive, Hype',
    instruments: '808 Cowbell, Distorted Bass, Lo-fi Samples',
    suggestedMode: 'custom'
  },
  {
    id: 'gregorian-trap',
    category: 'Urban & Hip Hop',
    platform: 'suno',
    name: { en: 'Gregorian Chant Trap', pl: 'Gregoriański Trap' },
    description: { en: 'Monks meeting 808s', pl: 'Mnisi spotykają 808' },
    tags: 'trap, gregorian chant, choir, ominous, 808 bass, dark, atmospheric',
    style: 'A haunting fusion of deep, reverb-drenched Gregorian monk chants layered over rattling hi-hats and distorted 808 sub-bass. A massive, cathedral-like atmosphere with modern trap percussion.',
    mood: 'Ominous, Holy',
    instruments: 'Male Choir, 808, Trap Drums',
    suggestedMode: 'custom'
  },
  {
    id: 'jazz-hop-study',
    category: 'Urban & Hip Hop',
    platform: 'suno',
    name: { en: 'Jazz Hop Study Beats', pl: 'Jazz Hop do Nauki' },
    description: { en: 'Piano loops and swing drums', pl: 'Pętle pianina i perkusja ze swingiem' },
    tags: 'jazz hop, chillhop, instrumental, study beats, relaxing, piano, boom bap',
    style: 'Sample-based production style featuring a chopped jazz piano loop. Dusty, swinging boom-bap drums with heavy swing. Upright bass walking lines and occasional trumpet mutes.',
    mood: 'Relaxed, Groovy',
    instruments: 'Piano Sample, Upright Bass, Boom Bap Drums',
    suggestedMode: 'instrumental'
  },

  // --- ROCK & ALTERNATIVE (SUNO) ---
  {
    id: 'math-rock',
    category: 'Rock & Alternative',
    platform: 'suno',
    name: { en: 'Math Rock / Mid-West Emo', pl: 'Math Rock / Emo' },
    description: { en: 'Complex time signatures, twinkly guitars', pl: 'Złożone metrum, czyste gitary' },
    tags: 'math rock, midwest emo, angular melodies, complex time signatures, clean electric guitar, tapping, energetic',
    style: 'Clean, jangly electric guitars using tapping techniques. Complex, changing time signatures (5/4, 7/8). Tight, punchy drums with dry production. Emotional, slightly strained male vocals.',
    mood: 'Complex, Nostalgic',
    instruments: 'Clean Electric Guitar, Bass, Drums',
    suggestedMode: 'custom'
  },
  {
    id: 'darkwave-goth',
    category: 'Rock & Alternative',
    platform: 'suno',
    name: { en: 'Darkwave / Post-Punk', pl: 'Darkwave / Post-Punk' },
    description: { en: 'Goth club atmosphere, reverb heavy', pl: 'Atmosfera klubu gotyckiego, dużo pogłosu' },
    tags: 'darkwave, post-punk, gothic, dark, coldwave, drum machine, chorus guitar, baritone vocals',
    style: 'Cold, mechanical drum machine beats soaked in reverb. Chorus-heavy bass guitar playing melodic lines. Icy synthesizers and deep, monotone baritone vocals. A dark, foggy atmosphere.',
    mood: 'Dark, Melancholic',
    instruments: 'Drum Machine, Chorus Bass, Synth',
    suggestedMode: 'custom'
  },
  {
    id: 'grunge',
    category: 'Rock & Alternative',
    platform: 'suno',
    name: { en: '90s Grunge', pl: 'Grunge lat 90.' },
    description: { en: 'Dirty guitars and angst', pl: 'Brudne gitary i angst' },
    tags: 'grunge, 90s, alternative rock, distorted, angst, raw, heavy',
    style: 'Raw, unpolished production typical of the 90s Seattle sound. Heavy, sludge-like distorted guitars, aggressive basslines, and loud, crashing cymbals. Vocals shift between mumbling and screaming.',
    mood: 'Angsty, Raw',
    instruments: 'Distorted Guitar, Bass, Drums',
    suggestedMode: 'custom'
  },
  {
    id: 'anime-opening',
    category: 'Rock & Alternative',
    platform: 'suno',
    name: { en: 'Anime Opening (J-Rock)', pl: 'Opening Anime (J-Rock)' },
    description: { en: 'High energy, melodic rock', pl: 'Wysokoenergetyczny, melodyjny rock' },
    tags: 'j-rock, j-pop, anime, high energy, fast tempo, female vocals, melodic, upbeat',
    style: 'Fast-paced, high-energy rock production with intricate guitar leads and driving drums. Bright, powerful vocals with catchy melodies and sudden rhythmic stops.',
    mood: 'Heroic, Energetic',
    instruments: 'Electric Guitar, Drums, Bass, Synth',
    suggestedMode: 'custom'
  },

  // --- ELECTRONIC & SYNTH (SUNO) ---
  {
    id: 'synthwave-drive',
    category: 'Electronic & Synth',
    platform: 'suno',
    name: { en: 'Nightcall Synthwave', pl: 'Nocny Synthwave' },
    description: { en: 'Retro 80s night drive', pl: 'Retro jazda nocna lat 80.' },
    tags: 'synthwave, retrowave, 80s, driving, neon, analog synths, nostalgic',
    style: 'Classic 80s aesthetic with gated reverb drums and pulsing analog basslines. Bright, glassy synth leads and warm pads. evokes a feeling of driving through a neon city at night.',
    mood: 'Nostalgic, Cool',
    instruments: 'Analog Synths, LinnDrum, Gated Reverb',
    suggestedMode: 'instrumental'
  },
  {
    id: 'cyberpunk-industrial',
    category: 'Electronic & Synth',
    platform: 'suno',
    name: { en: 'Cyberpunk Industrial', pl: 'Cyberpunk Industrial' },
    description: { en: 'Futuristic, dystopian, mechanical', pl: 'Futurystyczny, dystopijny, mechaniczny' },
    tags: 'industrial, cyberpunk, midtempo, darksynth, mechanical, dystopian, heavy',
    style: 'Futuristic sound design with metallic textures and heavy, stomping beats. glitchy synthesizers, distorted basslines, and sci-fi sound effects. A dark, neon-soaked atmosphere.',
    mood: 'Dystopian, Intense',
    instruments: 'Industrial Drums, Darksynth, Glitch FX',
    suggestedMode: 'instrumental'
  },
  {
    id: 'dnb-liquid',
    category: 'Electronic & Synth',
    platform: 'suno',
    name: { en: 'Liquid Drum & Bass', pl: 'Liquid Drum & Bass' },
    description: { en: 'Fast but soulful', pl: 'Szybki ale z duszą' },
    tags: 'drum and bass, liquid funk, fast tempo, soulful, atmospheric, deep bass',
    style: 'Fast-paced breakbeats (174 BPM) combined with smooth, melodic synthesizer pads and soulful vocal chops. Rolling sub-bass lines and crisp, tight percussion.',
    mood: 'Energetic, Soulful',
    instruments: 'Synthesizer, Breakbeats, Sub Bass',
    suggestedMode: 'custom'
  },
  {
    id: 'ethereal-techno',
    category: 'Electronic & Synth',
    platform: 'suno',
    name: { en: 'Ethereal Techno', pl: 'Eteryczne Techno' },
    description: { en: 'Melodic, spacious, driving', pl: 'Melodyjne, przestrzenne, napędzające' },
    tags: 'melodic techno, ethereal, progressive, atmospheric, driving, hypnotic',
    style: 'Clean, spacious production with a driving 4/4 kick drum. lush, reverb-heavy synthesizer pads and arpeggios that evolve slowly over time. Hypnotic and deep.',
    mood: 'Hypnotic, Ethereal',
    instruments: 'Analog Synths, Drum Machine, Reverb',
    suggestedMode: 'instrumental'
  },
  {
    id: 'coding-flow',
    category: 'Electronic & Synth',
    platform: 'suno',
    name: { en: 'Coding Flow State', pl: 'Flow Programisty' },
    description: { en: 'Deep focus electronic background', pl: 'Głębokie skupienie, tło elektroniczne' },
    tags: 'downtempo, idm, glitch, deep focus, cerebral, instrumental, minimal',
    style: 'Precise, intricate electronic beats with glitch textures. Warm, non-intrusive synthesizer pads and deep sub-bass. Designed for concentration and productivity. Minimal melodic variation.',
    mood: 'Focused, Cerebral',
    instruments: 'Modular Synth, Glitch Drums, Sub Bass',
    suggestedMode: 'instrumental'
  },

  // --- ACOUSTIC & JAZZ (SUNO) ---
  {
    id: 'neo-soul',
    category: 'Acoustic & Jazz',
    platform: 'suno',
    name: { en: 'Neo-Soul Lounge', pl: 'Neo-Soul Lounge' },
    description: { en: 'Smooth, jazzy chords with a groove', pl: 'Gładkie, jazzowe akordy z groovem' },
    tags: 'neo-soul, r&b, smooth, laid back, groovy, rhodes piano, female vocals, soulful',
    style: 'Laid back, behind-the-beat drum groove (Dilla style). Rich, extended jazz chords played on a Rhodes piano. Deep, warm bassline. Smooth, breathy, and soulful vocals with stacked harmonies.',
    mood: 'Smooth, Romantic',
    instruments: 'Rhodes Piano, Bass, Drums, Saxophone',
    suggestedMode: 'custom'
  },
  {
    id: 'jazz-noir',
    category: 'Acoustic & Jazz',
    platform: 'suno',
    name: { en: 'Jazz Noir', pl: 'Jazz Noir' },
    description: { en: 'Smoky, detective movie atmosphere', pl: 'Zadymiona atmosfera filmu detektywistycznego' },
    tags: 'jazz noir, dark jazz, slow tempo, atmospheric, smoky, saxophone, double bass',
    style: 'A dark, smoky atmosphere reminiscent of old detective films. Slow-tempo brushed drums, a deep walking double bass, and a lonely, reverb-drenched saxophone solo.',
    mood: 'Mysterious, Melancholic',
    instruments: 'Saxophone, Double Bass, Brushed Drums, Piano',
    suggestedMode: 'instrumental'
  },
  {
    id: 'bluegrass-modern',
    category: 'Acoustic & Jazz',
    platform: 'suno',
    name: { en: 'Modern Bluegrass', pl: 'Nowoczesny Bluegrass' },
    description: { en: 'Fast picking, high harmony', pl: 'Szybkie kostkowanie, wysokie harmonie' },
    tags: 'bluegrass, folk, americana, fast tempo, acoustic, energetic, male vocals',
    style: 'Virtuosic acoustic instrumentation featuring fast banjo rolls, mandolin chops, and fiddle solos. Tight three-part vocal harmonies. Bright, organic production with no electronic elements.',
    mood: 'Energetic, Rural',
    instruments: 'Banjo, Fiddle, Mandolin, Acoustic Guitar',
    suggestedMode: 'custom'
  },
  {
    id: 'acoustic-indie',
    category: 'Acoustic & Jazz',
    platform: 'suno',
    name: { en: 'Indie Folk Acoustic', pl: 'Akustyczny Indie Folk' },
    description: { en: 'Intimate, warm, raw', pl: 'Intymny, ciepły, surowy' },
    tags: 'indie folk, acoustic, intimate, raw, warm, emotional, male vocals',
    style: 'Stripped-back, intimate production. Close-miked acoustic guitar with fingerpicking. Raw, dry vocals with minimal processing to emphasize emotion. Warm and organic.',
    mood: 'Intimate, Emotional',
    instruments: 'Acoustic Guitar, Shaker, Soft Vocals',
    suggestedMode: 'custom'
  },
  {
    id: 'dungeon-synth',
    category: 'Experimental & Niche',
    platform: 'suno',
    name: { en: 'Dungeon Synth', pl: 'Dungeon Synth' },
    description: { en: 'Medieval fantasy RPG atmosphere', pl: 'Atmosfera średniowiecznego RPG' },
    tags: 'dungeon synth, fantasy, medieval, lo-fi, instrumental, atmospheric, nostalgic',
    style: 'Lo-fi production mimicking early 90s keyboards. Simple, medieval-inspired melodies played on synthesized strings, flutes, and harpsichords. Atmospheric tape hiss and a sense of ancient mystery.',
    mood: 'Mysterious, Ancient',
    instruments: 'Lo-fi Synths, Flute, Strings',
    suggestedMode: 'instrumental'
  }
];
