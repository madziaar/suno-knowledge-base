
import { GenreTemplate } from '../types';

export const GENRE_TEMPLATES: GenreTemplate[] = [
  // --- ELECTRONIC / SYNTH ---
  {
    id: 'synthwave_classic',
    name: { en: 'Synthwave Classic', pl: 'Klasyczny Synthwave' },
    category: 'Electronic',
    stylePrompt: 'Synthwave, Retro-futuristic, 110 BPM, A minor, Vintage synthesizers, Heavy bass, Robotic vocals, Neon-noir atmosphere, Analog warmth, 80s influence',
    bpmRange: [100, 120],
    recommendedKeys: ['A Minor', 'D Minor', 'E Minor'],
    commonStructure: ['Intro', 'Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Bridge', 'Guitar Solo', 'Chorus', 'Outro'],
    metaTags: ['[Synth Solo]', '[Gated Reverb]', '[Fade Out]'],
    tips: ['Use "Neon" imagery in lyrics', 'Add [Saxophone Solo] for authenticity'],
    variations: [
      { name: 'Dark Synthwave', modifications: 'Darker mood, heavier distortion, minor keys.' },
      { name: 'Dreamwave', modifications: 'Slower, more ambient, ethereal vocals.' }
    ],
    exampleOutput: 'Neon lights reflecting on wet pavement...'
  },
  {
    id: 'lofi_study',
    name: { en: 'Lo-Fi Hip Hop', pl: 'Lo-Fi Hip Hop' },
    category: 'Electronic',
    stylePrompt: 'Lo-Fi Hip Hop, Chill, 85 BPM, C Major, Vinyl crackle, Dusty drum samples, Mellow piano, Nostalgic atmosphere, Relaxed groove, Study beats',
    bpmRange: [70, 90],
    recommendedKeys: ['C Major', 'F Major', 'Bb Major'],
    commonStructure: ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Outro'],
    metaTags: ['[Vinyl Crackle]', '[Rain Sounds]', '[Piano Solo]'],
    tips: ['Keep lyrics minimal or use [Instrumental]', 'Focus on atmosphere over melody'],
    variations: [
      { name: 'Jazz Hop', modifications: 'More complex chords, saxophone samples.' },
      { name: 'Sleepy Lo-Fi', modifications: 'Slower, softer, more muffled.' }
    ],
    exampleOutput: 'Raindrops falling on the window pane...'
  },
  {
    id: 'deep_house',
    name: { en: 'Deep House', pl: 'Deep House' },
    category: 'Electronic',
    stylePrompt: 'Deep House, Groovy, 122 BPM, F# Minor, Soulful female vocals, Sub bass, Warm pads, 4/4 beat, Club-ready production, Spacious mix',
    bpmRange: [118, 126],
    recommendedKeys: ['A Minor', 'G Minor', 'F# Minor'],
    commonStructure: ['Intro', 'Build-up', 'Drop', 'Verse', 'Build-up', 'Drop', 'Outro'],
    metaTags: ['[Drop]', '[Bassline]', '[Vocal Chop]'],
    tips: ['Focus on the groove', 'Repetitive but catchy vocal hooks'],
    variations: [
      { name: 'Tropical House', modifications: 'Brighter, marimbas, flutes, summer vibe.' },
      { name: 'Future House', modifications: 'Metallic bass, higher energy.' }
    ],
    exampleOutput: 'Lost in the rhythm of the night...'
  },
  {
    id: 'dnb_liquid',
    name: { en: 'Liquid Drum & Bass', pl: 'Liquid Drum & Bass' },
    category: 'Electronic',
    stylePrompt: 'Liquid Drum & Bass, 174 BPM, F Minor, Soulful female vocals, Rolling reese bass, Atmospheric pads, Fast breakbeats, Melodic, Deep',
    bpmRange: [170, 180],
    recommendedKeys: ['F Minor', 'C Minor', 'G Minor'],
    commonStructure: ['Intro', 'Build-up', 'Drop', 'Breakdown', 'Build-up', 'Drop', 'Outro'],
    metaTags: ['[Amen Break]', '[Reese Bass]', '[Vocal Chop]'],
    tips: ['Contrast the fast drums with slow, evolving pads', 'Use soulful vocal samples'],
    variations: [
      { name: 'Neurofunk', modifications: 'More aggressive, technical bass sounds.' },
      { name: 'Jungle', modifications: 'More complex, chaotic breakbeats.' }
    ],
    exampleOutput: 'Floating through the city lights at high speed...'
  },
  {
    id: 'ambient_drone',
    name: { en: 'Ambient Electronic', pl: 'Ambient Elektroniczny' },
    category: 'Electronic',
    stylePrompt: 'Ambient, Drone, Atmospheric, No percussion, Evolving pads, Shimmer reverb, Cinematic texture, Meditative, 60 bpm',
    bpmRange: [50, 80],
    recommendedKeys: ['C Major', 'G Major'],
    commonStructure: ['Intro', 'Development', 'Climax', 'Resolution', 'Outro'],
    metaTags: ['[Drone]', '[Granular Synthesis]', '[Fade In]'],
    tips: ['Focus entirely on texture and atmosphere', 'Avoid strong melodies'],
    variations: [
      { name: 'Dark Ambient', modifications: 'Minor keys, unsettling textures.' },
      { name: 'Space Ambient', modifications: 'Futuristic synth sounds, sci-fi feel.' }
    ],
    exampleOutput: 'The slow breath of a sleeping nebula...'
  },
  {
    id: 'cyberpunk_industrial',
    name: { en: 'Cyberpunk Industrial', pl: 'Cyberpunk Industrial' },
    category: 'Electronic',
    stylePrompt: 'Industrial, Midtempo Bass, 100 BPM, D Minor, Distorted bass, Glitch effects, Metallic percussion, Aggressive, Dystopian atmosphere, Cinematic',
    bpmRange: [90, 110],
    recommendedKeys: ['D Minor', 'E Minor'],
    commonStructure: ['Intro', 'Verse', 'Build-up', 'Drop', 'Verse', 'Bridge', 'Drop', 'Outro'],
    metaTags: ['[Glitch]', '[Mechanical Rhythm]', '[Heavy Bass]'],
    tips: ['Use mechanical and metallic sound descriptors', 'Focus on aggressive textures'],
    variations: [
      { name: 'EBM', modifications: 'More repetitive, dance-focused structure.' },
      { name: 'Dark Electro', modifications: 'More horror-inspired, eerie synths.' }
    ],
    exampleOutput: 'System failure, reboot sequence initiated...'
  },
  {
    id: 'future_bass',
    name: { en: 'Future Bass', pl: 'Future Bass' },
    category: 'Electronic',
    stylePrompt: 'Future Bass, Euphoric, 150 BPM, F Major, Supersaw chords, Vocal chops, Trap beat, Heavy sidechain, Uplifting, Bright production',
    bpmRange: [140, 160],
    recommendedKeys: ['F Major', 'G Major', 'Ab Major'],
    commonStructure: ['Intro', 'Verse', 'Build-up', 'Drop', 'Verse', 'Build-up', 'Drop', 'Outro'],
    metaTags: ['[Supersaw]', '[Vocal Chop]', '[Sidechain]'],
    tips: ['Focus on the "Drop" with big chords', 'Use pitched-up vocal samples'],
    variations: [
      { name: 'Kawaii Future Bass', modifications: 'Higher pitch, faster, anime aesthetic.' },
      { name: 'Melodic Dubstep', modifications: 'Slower, heavier bass growls.' }
    ],
    exampleOutput: 'Flying high above the clouds...'
  },

  // --- ROCK / METAL ---
  {
    id: 'heavy_metal',
    name: { en: 'Heavy Metal', pl: 'Heavy Metal' },
    category: 'Rock',
    stylePrompt: 'Heavy Metal, Aggressive, 160 BPM, E Minor, Distorted guitars, Double kick drum, Screaming vocals, High gain, Shredding solo, Wall of sound',
    bpmRange: [140, 180],
    recommendedKeys: ['E Minor', 'D Minor'],
    commonStructure: ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Bridge', 'Guitar Solo', 'Chorus', 'Outro'],
    metaTags: ['[Guitar Solo]', '[Breakdown]', '[Scream]'],
    tips: ['Use [Guttural] for vocals', 'Mention specific guitar techniques like "Palm Mute"'],
    variations: [
      { name: 'Thrash Metal', modifications: 'Faster, more aggressive, punk influence.' },
      { name: 'Doom Metal', modifications: 'Slower, heavier, sludge tone.' }
    ],
    exampleOutput: 'Darkness falls upon the wasteland...'
  },
  {
    id: 'indie_rock',
    name: { en: 'Indie Rock', pl: 'Indie Rock' },
    category: 'Rock',
    stylePrompt: 'Indie Rock, Alternative, 120 BPM, B Major, Jangly guitars, Lo-fi vocals, Driving bass, Garage aesthetic, Energetic, Raw production',
    bpmRange: [110, 140],
    recommendedKeys: ['A Major', 'E Major', 'B Major'],
    commonStructure: ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Bridge', 'Outro'],
    metaTags: ['[Guitar Riff]', '[Stop]', '[Feedback]'],
    tips: ['Keep production "Raw" or "Garage"', 'Quirky lyrics work well'],
    variations: [
      { name: 'Shoegaze', modifications: 'More reverb, distortion, buried vocals.' },
      { name: 'Post-Punk', modifications: 'Angular guitars, driving bass, darker.' }
    ],
    exampleOutput: 'Waking up on the wrong side of town...'
  },
  {
    id: 'punk_rock',
    name: { en: 'Punk Rock', pl: 'Punk Rock' },
    category: 'Rock',
    stylePrompt: 'Punk Rock, Fast, 180 BPM, A Major, Distorted power chords, Fast drums, Shouted vocals, Raw energy, Anti-establishment, High tempo',
    bpmRange: [160, 200],
    recommendedKeys: ['A Major', 'E Major', 'D Major'],
    commonStructure: ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Bridge', 'Outro'],
    metaTags: ['[Gang Vocals]', '[Fast Riff]', '[Feedback]'],
    tips: ['Keep songs short (under 2:30)', 'Lyrics should be simple and direct'],
    variations: [
      { name: 'Pop Punk', modifications: 'More melodic, catchier chorus.' },
      { name: 'Hardcore', modifications: 'Faster, heavier, more aggressive.' }
    ],
    exampleOutput: 'Smash the system, break the chains...'
  },
  {
    id: 'math_rock',
    name: { en: 'Math Rock', pl: 'Math Rock' },
    category: 'Rock',
    stylePrompt: 'Math Rock, Midwest Emo, 130 BPM, D Major, Tapping guitar riffs, Complex time signatures, Clean tones, Emotional male vocals, Dynamic, Technical',
    bpmRange: [120, 150],
    recommendedKeys: ['D Major', 'F Major', 'E Major'],
    commonStructure: ['Intro', 'Verse', 'Chorus', 'Verse', 'Bridge', 'Chorus', 'Outro'],
    metaTags: ['[Tapping Solo]', '[Odd Time Signature]', '[Clean Riff]'],
    tips: ['Mention "twinkly" guitars', 'Use complex rhythms'],
    variations: [
      { name: 'Instrumental Math Rock', modifications: 'No vocals, focus on technicality.' },
      { name: 'Emo Revival', modifications: 'More raw, shouted vocals.' }
    ],
    exampleOutput: 'Counting the days in 7/8 time...'
  },

  // --- HIP HOP / URBAN ---
  {
    id: 'trap_banger',
    name: { en: 'Trap Banger', pl: 'Trapowy Hit' },
    category: 'Hip Hop',
    stylePrompt: 'Trap, Atlanta Style, 140 BPM, C Minor, Hard 808s, Fast hi-hats, Autotune vocals, Aggressive flow, Dark atmosphere, Phonk Drum',
    bpmRange: [130, 160],
    recommendedKeys: ['C Minor', 'F Minor', 'G Minor'],
    commonStructure: ['Intro', 'Hook', 'Verse 1', 'Hook', 'Verse 2', 'Hook', 'Outro'],
    metaTags: ['[808 Drop]', '[Ad-libs]', '[Beat Switch]'],
    tips: ['Use (skrt), (yeah) ad-libs', 'Mention "Phonk Drum" for grit'],
    variations: [
      { name: 'Drill', modifications: 'Sliding 808s, darker, UK/NY influence.' },
      { name: 'Melodic Trap', modifications: 'More singing, emotional chords.' }
    ],
    exampleOutput: 'Pull up in the ghost...'
  },
  {
    id: 'memphis_phonk',
    name: { en: 'Memphis Phonk', pl: 'Memphis Phonk' },
    category: 'Hip Hop',
    stylePrompt: 'Memphis Trap, Phonk, Dark, 135 BPM, Lo-fi production, Cowbells, Distorted 808s, Horrorcore atmosphere, Chopped samples, Cassette tape texture',
    bpmRange: [130, 150],
    recommendedKeys: ['C# Minor', 'F# Minor'],
    commonStructure: ['Intro', 'Verse', 'Hook', 'Verse', 'Hook', 'Outro'],
    metaTags: ['[Cowbell Melody]', '[Vocal Chop]', '[Distortion]'],
    tips: ['Use "lo-fi" and "tape saturation" tags', 'Lyrics should be dark/gritty'],
    variations: [
      { name: 'Drift Phonk', modifications: 'Higher energy, more cowbells, louder.' },
      { name: 'Chill Phonk', modifications: 'Jazzier samples, smoother bass.' }
    ],
    exampleOutput: 'Cruising down the street at midnight...'
  },
  {
    id: 'boom_bap',
    name: { en: '90s Boom Bap', pl: 'Boom Bap z lat 90.' },
    category: 'Hip Hop',
    stylePrompt: 'Boom Bap, East Coast Hip Hop, 90 BPM, Vinyl samples, Jazz loops, Hard hitting drums, Lyrical flow, Street atmosphere, Raw mix',
    bpmRange: [85, 95],
    recommendedKeys: ['Eb Minor', 'Bb Minor'],
    commonStructure: ['Intro', 'Verse', 'Hook', 'Verse', 'Hook', 'Verse', 'Outro'],
    metaTags: ['[Scratch Solo]', '[Sample]', '[Fade Out]'],
    tips: ['Focus on complex rhyme schemes', 'Use [DJ Scratch] tag'],
    variations: [
      { name: 'Jazz Rap', modifications: 'Smoother, saxophone/piano samples.' },
      { name: 'Hardcore', modifications: 'More aggressive, grittier samples.' }
    ],
    exampleOutput: 'Concrete jungle where dreams are made...'
  },
  {
    id: 'west_coast',
    name: { en: 'West Coast G-Funk', pl: 'West Coast G-Funk' },
    category: 'Hip Hop',
    stylePrompt: 'West Coast Hip Hop, G-Funk, 95 BPM, G Minor, Synthesizer leads, Funk bass, Laid back groove, Talkbox, Gangsta rap style, Cruising',
    bpmRange: [90, 100],
    recommendedKeys: ['G Minor', 'C Minor'],
    commonStructure: ['Intro', 'Verse', 'Hook', 'Verse', 'Hook', 'Bridge', 'Hook', 'Outro'],
    metaTags: ['[Synth Whistle]', '[Talkbox]', '[Bass Roll]'],
    tips: ['Mention "high pitched synth lead"', 'Laid back flow is key'],
    variations: [
      { name: 'Modern West Coast', modifications: 'Cleaner production, faster tempo (DJ Mustard style).' },
      { name: 'Bay Area', modifications: 'More hyphy, bouncy bass.' }
    ],
    exampleOutput: 'Rollin down the street...'
  },

  // --- JAZZ & R&B ---
  {
    id: 'jazz_fusion',
    name: { en: 'Jazz Fusion', pl: 'Jazz Fusion' },
    category: 'Jazz',
    stylePrompt: 'Jazz Fusion, 120 BPM, E Minor, Electric piano, Complex basslines, Syncopated drums, Saxophone solo, Virtuosic, Energetic, Complex harmony',
    bpmRange: [110, 140],
    recommendedKeys: ['E Minor', 'A Minor'],
    commonStructure: ['Intro', 'Theme A', 'Solo 1', 'Theme B', 'Solo 2', 'Outro'],
    metaTags: ['[Saxophone Solo]', '[Keyboard Solo]', '[Odd Time Signature]'],
    tips: ['Focus on instrumentation over vocals', 'Use complex chord changes'],
    variations: [
      { name: 'Jazz Funk', modifications: 'More groove, slap bass, horn section.' },
      { name: 'Prog Rock Fusion', modifications: 'Heavier guitar, longer compositions.' }
    ],
    exampleOutput: 'A conversation between instruments in a smoky room...'
  },
  {
    id: 'neo_soul',
    name: { en: 'Neo-Soul Lounge', pl: 'Neo-Soul Lounge' },
    category: 'R&B/Soul',
    stylePrompt: 'Neo-Soul, R&B, 85 BPM, Eb Major, Rhodes piano, Dilla beat, Laid back, Soulful vocals, Jazz chords, Intimate atmosphere',
    bpmRange: [80, 95],
    recommendedKeys: ['Eb Major', 'Db Major', 'Ab Major'],
    commonStructure: ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Bridge', 'Outro'],
    metaTags: ['[Vocal Runs]', '[Rhodes Solo]', '[Snap]'],
    tips: ['Use "Drunk beat" or "Unquantized" descriptors', 'Layer backing vocals'],
    variations: [
      { name: 'Trap Soul', modifications: 'Add 808s and hi-hat rolls.' },
      { name: 'Acoustic Soul', modifications: 'Just guitar/piano and voice.' }
    ],
    exampleOutput: 'Late night vibes...'
  },
  {
    id: 'rnb_slow_jam',
    name: { en: 'R&B Slow Jam', pl: 'R&B Slow Jam' },
    category: 'R&B/Soul',
    stylePrompt: 'Contemporary R&B, Slow Jam, 65 BPM, B Major, Smooth synth pads, Deep bass, Sensual vocals, Finger snaps, Reverb, Romantic atmosphere',
    bpmRange: [60, 75],
    recommendedKeys: ['B Major', 'Gb Major'],
    commonStructure: ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Bridge', 'Chorus', 'Outro'],
    metaTags: ['[Ad-libs]', '[High Note]', '[Fade Out]'],
    tips: ['Focus on emotion and vocal performance', 'Use water/rain FX for mood'],
    variations: [
      { name: '90s R&B', modifications: 'New Jack Swing influence, digital piano.' },
      { name: 'Alternative R&B', modifications: 'Darker, more atmospheric, druggy vibe.' }
    ],
    exampleOutput: 'Baby you know I need you...'
  },

  // --- OTHERS ---
  {
    id: 'kpop_hit',
    name: { en: 'K-Pop Anthem', pl: 'Hymn K-Pop' },
    category: 'Pop',
    stylePrompt: 'K-Pop, Dance Pop, 128 BPM, F# Minor, High production value, Catchy hook, Group vocals, Rap section, Polished, Energetic, Genre-blending',
    bpmRange: [110, 140],
    recommendedKeys: ['F# Minor', 'B Minor'],
    commonStructure: ['Intro', 'Verse', 'Pre-Chorus', 'Chorus', 'Rap Verse', 'Bridge', 'Dance Break', 'Chorus'],
    metaTags: ['[Dance Break]', '[Rap Section]', '[High Note]'],
    tips: ['Mix English and Korean (romanized)', 'Include a dedicated [Dance Break]'],
    variations: [
      { name: 'K-Ballad', modifications: 'Slower, emotional, orchestral.' },
      { name: 'K-Hip Hop', modifications: 'More focus on rap, harder beats.' }
    ],
    exampleOutput: 'Lights camera action...'
  },
  {
    id: 'acoustic_ballad',
    name: { en: 'Acoustic Ballad', pl: 'Ballada Akustyczna' },
    category: 'Folk/Country',
    stylePrompt: 'Acoustic Pop, Singer-Songwriter, 70 BPM, G Major, Acoustic guitar, Intimate vocals, Piano accompaniment, Emotional, Stripped back, Warm production',
    bpmRange: [60, 90],
    recommendedKeys: ['G Major', 'C Major', 'D Major'],
    commonStructure: ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Bridge', 'Chorus', 'Outro'],
    metaTags: ['[Acoustic Guitar Solo]', '[Silence]', '[Whisper]'],
    tips: ['Use "Intimate" or "Close Mic"', 'Keep instrumentation simple'],
    variations: [
      { name: 'Piano Ballad', modifications: 'Piano led instead of guitar.' },
      { name: 'Folk', modifications: 'Add banjo/fiddle, storytelling lyrics.' }
    ],
    exampleOutput: 'Sitting by the fire...'
  },
  {
    id: 'modern_country',
    name: { en: 'Modern Country', pl: 'Nowoczesne Country' },
    category: 'Folk/Country',
    stylePrompt: 'Modern Country, Country Pop, 110 BPM, A Major, Acoustic guitar, Electric guitar riffs, Strong male vocals, Storytelling lyrics, Radio ready, Polished',
    bpmRange: [100, 130],
    recommendedKeys: ['A Major', 'G Major', 'D Major'],
    commonStructure: ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Guitar Solo', 'Bridge', 'Chorus', 'Outro'],
    metaTags: ['[Slide Guitar]', '[Banjo Fill]', '[Vocal Twang]'],
    tips: ['Themes: Trucks, Heartbreak, Small Towns', 'Use "Radio-ready" tag'],
    variations: [
      { name: 'Bro-Country', modifications: 'More rock influence, party themes.' },
      { name: 'Classic Country', modifications: 'Slower, slide guitar, fiddle, traditional.' }
    ],
    exampleOutput: 'Driving down that dirt road...'
  },
  {
    id: 'reggae_roots',
    name: { en: 'Roots Reggae', pl: 'Roots Reggae' },
    category: 'Reggae',
    stylePrompt: 'Roots Reggae, 80 BPM, G Minor, One drop rhythm, Heavy bassline, Guitar skank, Organ bubble, Socially conscious lyrics, Male vocals, Relaxed',
    bpmRange: [60, 90],
    recommendedKeys: ['G Minor', 'A Minor', 'C Minor'],
    commonStructure: ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Dub Section', 'Chorus', 'Outro'],
    metaTags: ['[Dub Section]', '[Organ Solo]', '[Echo]'],
    tips: ['The bassline is the most important element', 'Use "one drop" for the drum beat'],
    variations: [
      { name: 'Dub', modifications: 'More instrumental, heavy on effects like reverb and delay.' },
      { name: 'Ska', modifications: 'Faster, more upbeat, with a prominent horn section.' }
    ],
    exampleOutput: 'Chant down Babylon one more time...'
  },
  {
    id: 'cinematic_epic',
    name: { en: 'Epic Cinematic', pl: 'Epickie Filmowe' },
    category: 'Cinematic',
    stylePrompt: 'Cinematic, Epic, Trailer Music, 100 BPM, D Minor, Orchestral, Hybrid percussion, Braams, Choir, Building tension, Massive sound',
    bpmRange: [80, 120],
    recommendedKeys: ['D Minor', 'C Minor'],
    commonStructure: ['Intro', 'Build-up', 'Climax', 'Resolution', 'Outro'],
    metaTags: ['[Braam]', '[Riser]', '[Silence]'],
    tips: ['Use for movie trailers or game scores', 'Focus on dynamics'],
    variations: [
      { name: 'Fantasy Score', modifications: 'More magical, woodwinds, lighter.' },
      { name: 'Horror Trailer', modifications: 'Dissonant strings, jump scares, eerie.' }
    ],
    exampleOutput: 'The hero rises from the ashes...'
  },
  {
    id: 'dungeon_synth',
    name: { en: 'Dungeon Synth', pl: 'Dungeon Synth' },
    category: 'Cinematic',
    stylePrompt: 'Dungeon Synth, Fantasy, Medieval, Lo-fi, 90 BPM, A Minor, Synthesized strings, Flute samples, Atmospheric, Nostalgic, RPG Soundtrack',
    bpmRange: [80, 100],
    recommendedKeys: ['A Minor', 'E Minor'],
    commonStructure: ['Intro', 'Theme A', 'Theme B', 'Outro'],
    metaTags: ['[Flute Melody]', '[Lo-fi Hiss]', '[Harp]'],
    tips: ['Lo-fi production is key', 'Think 90s RPG games'],
    variations: [
      { name: 'Winter Synth', modifications: 'Colder, wind sounds, bells.' },
      { name: 'Forest Synth', modifications: 'Nature sounds, lighter tone.' }
    ],
    exampleOutput: 'Entering the ancient crypt...'
  }
];
