
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
    id: 'deep_house',
    name: { en: 'Deep House', pl: 'Deep House' },
    category: 'Electronic',
    stylePrompt: 'Deep House, Groovy, 122 BPM, F# Minor, Soulful female vocals, Sub bass, Warm pads, 4/4 beat, Club-ready production, Spacious mix, Minimalist',
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
    id: 'techno_peak',
    name: { en: 'Peak Time Techno', pl: 'Peak Time Techno' },
    category: 'Electronic',
    stylePrompt: 'Techno, Peak Time, 135 BPM, A Minor, Rumble kick, Industrial percussion, Acid 303 lines, Dark atmosphere, Hypnotic, Driving, Club system ready',
    bpmRange: [130, 140],
    recommendedKeys: ['A Minor', 'D Minor'],
    commonStructure: ['Intro', 'Build', 'Drop', 'Loop', 'Build', 'Climax', 'Outro'],
    metaTags: ['[Rumble]', '[Acid Synth]', '[Industrial]'],
    tips: ['Minimal lyrics, focus on rhythm', 'Use [Build-up] effectively'],
    variations: [
      { name: 'Acid Techno', modifications: 'Heavy use of Roland TB-303 squelches.' },
      { name: 'Dub Techno', modifications: 'Echo, delay, chords, atmospheric.' }
    ],
    exampleOutput: 'The system is operational...'
  },
  {
    id: 'dubstep_modern',
    name: { en: 'Modern Dubstep', pl: 'Nowoczesny Dubstep' },
    category: 'Electronic',
    stylePrompt: 'Dubstep, Brostep, 145 BPM, E Minor, Heavy wobble bass, Growl bass, Hard hitting snare, Vocal chops, Aggressive, High energy drop',
    bpmRange: [140, 150],
    recommendedKeys: ['E Minor', 'F Minor'],
    commonStructure: ['Intro', 'Build-up', 'Drop', 'Verse', 'Build-up', 'Drop 2', 'Outro'],
    metaTags: ['[Bass Drop]', '[Wobble]', '[Growl]'],
    tips: ['The drop is the most important part', 'Use "Pre-drop vocal"'],
    variations: [
      { name: 'Melodic Dubstep', modifications: 'Emotional chords, supersaws, female vocals.' },
      { name: 'Riddim', modifications: 'Repetitive, swampy, metallic bass.' }
    ],
    exampleOutput: 'Wait for the drop...'
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
      { name: 'Chill Future Bass', modifications: 'Slower, more ambient, relaxed.' }
    ],
    exampleOutput: 'Flying high above the clouds...'
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

  // --- ROCK / METAL ---
  {
    id: 'indie_rock',
    name: { en: 'Indie Rock', pl: 'Indie Rock' },
    category: 'Rock',
    stylePrompt: 'Indie Rock, Alternative, 128 BPM, B Major, Jangly electric guitars, Driving bass, Raw energetic drums, Emotional male vocals, Lo-fi aesthetic, Garage style, Anthemic',
    bpmRange: [110, 140],
    recommendedKeys: ['A Major', 'E Major', 'B Major'],
    commonStructure: ['Intro', 'Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Bridge', 'Outro'],
    metaTags: ['[Jangly Guitar]', '[Feedback]', '[Raw Mix]'],
    tips: ['Keep production "Raw" or "Garage"', 'Quirky lyrics work well'],
    variations: [
      { name: 'Shoegaze', modifications: 'More reverb, distortion, buried vocals, wall of sound.' },
      { name: 'Post-Punk', modifications: 'Angular guitars, driving bass, darker, mechanical.' }
    ],
    exampleOutput: 'Waking up on the wrong side of town...'
  },
  {
    id: 'alt_rock_90s',
    name: { en: '90s Alternative Rock', pl: 'Rock Alternatywny 90s' },
    category: 'Rock',
    stylePrompt: 'Alternative Rock, Grunge influence, 110 BPM, C# Minor, Distorted guitars, Quiet-Loud dynamics, Angsty vocals, Heavy bass, Raw production',
    bpmRange: [100, 130],
    recommendedKeys: ['C# Minor', 'E Major'],
    commonStructure: ['Intro', 'Verse (Quiet)', 'Chorus (Loud)', 'Verse (Quiet)', 'Chorus (Loud)', 'Bridge', 'Outro'],
    metaTags: ['[Distortion]', '[Feedback]', '[Scream]'],
    tips: ['Use dynamics: Quiet verses, loud choruses', 'Abstract lyrics'],
    variations: [
      { name: 'Grunge', modifications: 'Sludgier, darker, more distortion.' },
      { name: 'Britpop', modifications: 'Brighter, more melodic, acoustic layers.' }
    ],
    exampleOutput: 'Smells like rain in the afternoon...'
  },
  {
    id: 'hard_rock',
    name: { en: 'Classic Hard Rock', pl: 'Klasyczny Hard Rock' },
    category: 'Rock',
    stylePrompt: 'Hard Rock, 130 BPM, A Major, Overdriven guitar riffs, Powerful male vocals, Thunderous drums, Guitar solo, High energy, Arena rock, Anthemic',
    bpmRange: [120, 140],
    recommendedKeys: ['A Major', 'E Major', 'G Major'],
    commonStructure: ['Intro', 'Riff', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Solo', 'Chorus', 'Outro'],
    metaTags: ['[Guitar Solo]', '[Power Chords]', '[High Note]'],
    tips: ['Focus on the "Riff"', 'Make the chorus big and singalong'],
    variations: [
      { name: 'Glam Metal', modifications: 'Higher vocals, more synths, faster.' },
      { name: 'Blues Rock', modifications: 'More swing, blues scale, harmonica.' }
    ],
    exampleOutput: 'Revving the engine on the highway...'
  },
  {
    id: 'punk_rock',
    name: { en: 'Punk Rock', pl: 'Punk Rock' },
    category: 'Rock',
    stylePrompt: 'Punk Rock, Fast, 180 BPM, A Major, Distorted power chords, Fast drums, Shouted vocals, Raw energy, Anti-establishment, High tempo, Short song',
    bpmRange: [160, 200],
    recommendedKeys: ['A Major', 'E Major', 'D Major'],
    commonStructure: ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Bridge', 'Outro'],
    metaTags: ['[Gang Vocals]', '[Fast Riff]', '[Feedback]'],
    tips: ['Keep songs under 2:30', 'Lyrics should be simple and direct'],
    variations: [
      { name: 'Pop Punk', modifications: 'More melodic, catchier chorus, polished.' },
      { name: 'Hardcore', modifications: 'Faster, heavier, more aggressive.' }
    ],
    exampleOutput: 'Smash the system, break the chains...'
  },
  {
    id: 'heavy_metal',
    name: { en: 'Heavy Metal', pl: 'Heavy Metal' },
    category: 'Metal',
    stylePrompt: 'Heavy Metal, Aggressive, 160 BPM, E Minor, Distorted guitars, Double kick drum, Screaming vocals, High gain, Shredding solo, Wall of sound',
    bpmRange: [140, 180],
    recommendedKeys: ['E Minor', 'D Minor'],
    commonStructure: ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Bridge', 'Guitar Solo', 'Chorus', 'Outro'],
    metaTags: ['[Guitar Solo]', '[Breakdown]', '[Scream]'],
    tips: ['Use [Guttural] for vocals', 'Mention specific guitar techniques like "Palm Mute"'],
    variations: [
      { name: 'Thrash Metal', modifications: 'Faster, more aggressive, punk influence.' },
      { name: 'Groove Metal', modifications: 'Slower, heavier, rhythmic focus.' }
    ],
    exampleOutput: 'Darkness falls upon the wasteland...'
  },
  {
    id: 'metalcore',
    name: { en: 'Modern Metalcore', pl: 'Metalcore' },
    category: 'Metal',
    stylePrompt: 'Metalcore, Modern Metal, 135 BPM, Drop C, High gain distortion, Massive breakdowns, Clean chorus, Screamed verses, Gang vocals, Polished production',
    bpmRange: [130, 150],
    recommendedKeys: ['D Minor', 'C Minor'],
    commonStructure: ['Intro', 'Verse (Scream)', 'Chorus (Clean)', 'Verse', 'Chorus', 'Breakdown', 'Bridge', 'Chorus', 'Outro'],
    metaTags: ['[Breakdown]', '[Blegh]', '[Clean Vocals]'],
    tips: ['Contrast between heavy verses and melodic choruses', 'The breakdown is essential'],
    variations: [
      { name: 'Melodic Metalcore', modifications: 'More focus on guitar melodies and singing.' },
      { name: 'Deathcore', modifications: 'Heavier, lower tuning, no clean vocals.' }
    ],
    exampleOutput: 'Breaking the chains of this reality...'
  },
  {
    id: 'post_rock',
    name: { en: 'Cinematic Post-Rock', pl: 'Post-Rock' },
    category: 'Rock',
    stylePrompt: 'Post-Rock, Cinematic, Atmospheric, 100 BPM, Tremolo guitars, Gradual build-up, Explosive climax, Orchestral elements, Instrumental focus, Emotional',
    bpmRange: [80, 120],
    recommendedKeys: ['D Major', 'B Minor'],
    commonStructure: ['Intro', 'Atmosphere', 'Build-up', 'Climax', 'Resolution', 'Outro'],
    metaTags: ['[Crescendo]', '[Tremolo Picking]', '[Wall of Sound]'],
    tips: ['Often instrumental', 'Focus on dynamics and texture'],
    variations: [
      { name: 'Math Rock', modifications: 'Complex time signatures, clean tapping.' },
      { name: 'Ambient Rock', modifications: 'Slower, more reverb, less aggressive.' }
    ],
    exampleOutput: 'Echoes of a distant memory...'
  },
  {
    id: 'black_metal',
    name: { en: 'Atmospheric Black Metal', pl: 'Black Metal' },
    category: 'Metal',
    stylePrompt: 'Atmospheric Black Metal, 180 BPM, E Minor, Tremolo picking, Blast beats, Shrieking vocals, Lo-fi production, Cold atmosphere, Reverb, Raw',
    bpmRange: [160, 220],
    recommendedKeys: ['E Minor', 'C# Minor'],
    commonStructure: ['Intro', 'Blast Section', 'Atmospheric Break', 'Blast Section', 'Outro'],
    metaTags: ['[Blast Beats]', '[Shriek]', '[Tremolo]'],
    tips: ['Use "Cold" and "Winter" imagery', 'Production should be raw'],
    variations: [
      { name: 'Symphonic Black Metal', modifications: 'Add orchestral elements, keyboards.' },
      { name: 'Blackgaze', modifications: 'Mix with shoegaze, major keys, emotional.' }
    ],
    exampleOutput: 'Wolves howling in the frozen north...'
  },
  {
    id: 'prog_metal',
    name: { en: 'Progressive Metal', pl: 'Metal Progresywny' },
    category: 'Metal',
    stylePrompt: 'Progressive Metal, Djent, 120 BPM, B Minor, Complex time signatures, Polyrhythms, Extended range guitars, Virtuosic solos, Clean and harsh vocals, Technical',
    bpmRange: [110, 140],
    recommendedKeys: ['B Minor', 'F# Minor'],
    commonStructure: ['Intro', 'Riff A', 'Verse', 'Chorus', 'Riff B', 'Solo', 'Chorus', 'Outro'],
    metaTags: ['[Odd Time Signature]', '[Polyrythm]', '[Synthesizer Solo]'],
    tips: ['Highlight technicality', 'Mix heavy riffs with ambient sections'],
    variations: [
      { name: 'Djent', modifications: 'Staccato riffs, very low tuning, modern production.' },
      { name: 'Symphonic Prog', modifications: 'Orchestral layers, epic scope.' }
    ],
    exampleOutput: 'Calculated chaos in the machine...'
  },

  // --- HIP HOP / URBAN ---
  {
    id: 'trap_memphis',
    name: { en: 'Memphis Phonk Trap', pl: 'Memphis Phonk Trap' },
    category: 'Hip Hop',
    stylePrompt: 'Memphis Trap, Phonk, Dark, 140 BPM, C Minor, Cowbell melodies, Southern flow, Distorted 808 bass, Lo-fi texture, Street atmosphere, Tape saturation',
    bpmRange: [130, 150],
    recommendedKeys: ['C# Minor', 'F# Minor'],
    commonStructure: ['Intro', 'Hook', 'Verse 1', 'Hook', 'Verse 2', 'Hook', 'Outro'],
    metaTags: ['[Cowbell Melody]', '[808 Drop]', '[Tape Saturation]'],
    tips: ['Mention "Phonk Drum" for authentic V4.5 trap grit', 'Use dark, nocturnal lyrical themes'],
    variations: [
      { name: 'Drift Phonk', modifications: 'Aggressive energy, louder cowbells, distorted.' },
      { name: 'Horrorcore', modifications: 'Darker atmosphere, cinematic eerie textures.' }
    ],
    exampleOutput: 'Cruising through the fog in a silver frame...'
  },
  {
    id: 'trap_atlanta',
    name: { en: 'Atlanta Trap Banger', pl: 'Atlanta Trap Banger' },
    category: 'Hip Hop',
    stylePrompt: 'Atlanta Trap, Modern Hip Hop, 145 BPM, F Minor, Hard-hitting 808s, Rapid hi-hat rolls, Autotune melodic vocals, Ad-libs, Aggressive, Polished radio production',
    bpmRange: [140, 160],
    recommendedKeys: ['F Minor', 'G Minor', 'C Minor'],
    commonStructure: ['Intro', 'Hook', 'Verse 1', 'Hook', 'Verse 2', 'Hook', 'Bridge', 'Hook', 'Outro'],
    metaTags: ['[Rapid Hi-Hats]', '[Ad-libs]', '[Sub Bass]'],
    tips: ['Add (skrt) or (yeah) in parentheses for background ad-libs', 'Ensure "Southern Accent" is in vocals'],
    variations: [
      { name: 'Melodic Trap', modifications: 'R&B influence, smoother vocals, piano chords.' },
      { name: 'Rage Trap', modifications: 'Synthesizer leads, explosive energy, fast tempo.' }
    ],
    exampleOutput: 'Wrist ice cold like a winter breeze...'
  },
  {
    id: 'boom_bap',
    name: { en: '90s Boom Bap', pl: 'Boom Bap z lat 90.' },
    category: 'Hip Hop',
    stylePrompt: 'Boom Bap, East Coast Hip Hop, 90 BPM, Vinyl samples, Jazz loops, Hard hitting drums, Lyrical flow, Street atmosphere, Raw mix, Scratches',
    bpmRange: [85, 95],
    recommendedKeys: ['Eb Minor', 'Bb Minor'],
    commonStructure: ['Intro', 'Verse', 'Hook', 'Verse', 'Hook', 'Verse', 'Outro'],
    metaTags: ['[Scratch Solo]', '[Sample]', '[Fade Out]'],
    tips: ['Focus on complex rhyme schemes', 'Use [DJ Scratch] tag'],
    variations: [
      { name: 'Jazz Rap', modifications: 'Smoother, saxophone/piano samples, conscious lyrics.' },
      { name: 'Hardcore Hip Hop', modifications: 'More aggressive, grittier samples, energetic.' }
    ],
    exampleOutput: 'Concrete jungle where dreams are made...'
  },
  {
    id: 'drill_uk',
    name: { en: 'UK Drill', pl: 'UK Drill' },
    category: 'Hip Hop',
    stylePrompt: 'UK Drill, Dark, 140 BPM, C Minor, Sliding 808 bass, Syncopated snares, Dark piano melody, Aggressive flow, UK accent, Gritty production',
    bpmRange: [140, 145],
    recommendedKeys: ['C Minor', 'G Minor'],
    commonStructure: ['Intro', 'Hook', 'Verse 1', 'Hook', 'Verse 2', 'Outro'],
    metaTags: ['[Sliding 808]', '[Dark Piano]', '[Gunshot FX]'],
    tips: ['808 slides are essential', 'Use dark, violent or street themes'],
    variations: [
      { name: 'NY Drill', modifications: 'Similar beats, US accent, higher energy.' },
      { name: 'Melodic Drill', modifications: 'R&B samples, auto-tuned vocals.' }
    ],
    exampleOutput: 'Demons in the night, moving in silence...'
  },
  {
    id: 'cloud_rap',
    name: { en: 'Cloud Rap', pl: 'Cloud Rap' },
    category: 'Hip Hop',
    stylePrompt: 'Cloud Rap, Ethereal, 130 BPM, D Major, Ambient pads, Reverb-heavy vocals, Trap drums, Dreamy atmosphere, Hazy, Lo-fi',
    bpmRange: [120, 140],
    recommendedKeys: ['D Major', 'E Major'],
    commonStructure: ['Intro', 'Hook', 'Verse', 'Hook', 'Verse', 'Outro'],
    metaTags: ['[Ambient Pad]', '[Vocal Reverb]', '[Hazy]'],
    tips: ['"Spaced out" vocals', 'Surreal or emotional lyrics'],
    variations: [
      { name: 'Sad Rap', modifications: 'More melancholic, acoustic guitar samples.' },
      { name: 'Trillwave', modifications: 'Trippier, slower, deeper bass.' }
    ],
    exampleOutput: 'Floating on a cloud of purple smoke...'
  },

  // --- POP ---
  {
    id: 'synthpop_modern',
    name: { en: 'Modern Synth-Pop', pl: 'Nowoczesny Synth-Pop' },
    category: 'Pop',
    stylePrompt: 'Synth-Pop, Electropop, 120 BPM, C Major, Bright synthesizers, Catchy melody, Punchy drums, Female vocals, Polished production, Upbeat',
    bpmRange: [115, 125],
    recommendedKeys: ['C Major', 'F Major', 'G Major'],
    commonStructure: ['Intro', 'Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Bridge', 'Chorus', 'Outro'],
    metaTags: ['[Synth Riff]', '[Handclap]', '[Vocal Harmony]'],
    tips: ['Focus on a catchy chorus hook', '80s influence but modern sound'],
    variations: [
      { name: 'Indie Pop', modifications: 'More guitar, quirky vocals, lo-fi touch.' },
      { name: 'Dark Pop', modifications: 'Minor key, moody atmosphere, heavier bass.' }
    ],
    exampleOutput: 'Dancing in the shadows of the neon light...'
  },
  {
    id: 'kpop_anthem',
    name: { en: 'K-Pop Anthem', pl: 'Hymn K-Pop' },
    category: 'Pop',
    stylePrompt: 'K-Pop, Dance Pop, 130 BPM, F# Minor, High production value, Catchy hook, Group vocals, Electronic-trap fusion, Energetic, Polished, Genre-blending',
    bpmRange: [110, 140],
    recommendedKeys: ['F# Minor', 'B Minor'],
    commonStructure: ['Intro', 'Verse 1', 'Pre-Chorus', 'Chorus', 'Verse 2', 'Chorus', 'Rap Section', 'Bridge', 'Dance Break', 'Chorus', 'Outro'],
    metaTags: ['[Dance Break]', '[Rap Section]', '[High Note]'],
    tips: ['Mix English and Korean (romanized) in lyrics', 'Include a designated [Dance Break]'],
    variations: [
      { name: 'K-Ballad', modifications: 'Slower, emotional, orchestral.' },
      { name: 'K-Hip Hop', modifications: 'More focus on rap, harder beats.' }
    ],
    exampleOutput: 'Lights, camera, action, the stage is mine...'
  },
  {
    id: 'dream_pop',
    name: { en: 'Ethereal Dream Pop', pl: 'Dream Pop' },
    category: 'Pop',
    stylePrompt: 'Dream Pop, Shoegaze influence, 90 BPM, Eb Major, Shimmering guitars, Breath-y vocals, Washed out reverb, Nostalgic, Floating atmosphere',
    bpmRange: [80, 100],
    recommendedKeys: ['Eb Major', 'Db Major'],
    commonStructure: ['Intro', 'Verse', 'Chorus', 'Verse', 'Chorus', 'Bridge', 'Outro'],
    metaTags: ['[Reverb]', '[Shimmer]', '[Ethereal]'],
    tips: ['Vocals should be "buried" in the mix', 'Atmosphere is key'],
    variations: [
      { name: 'Indie Pop', modifications: 'More upbeat, cleaner vocals.' },
      { name: 'Ambient Pop', modifications: 'Less structure, more texture.' }
    ],
    exampleOutput: 'Drifting through the memories of yesterday...'
  },
  {
    id: 'electropop_chart',
    name: { en: 'Chart Electropop', pl: 'Electropop' },
    category: 'Pop',
    stylePrompt: 'Electropop, Mainstream Pop, 124 BPM, A Minor, Heavy sidechain, Vocal chops, Big synth chords, Female diva vocals, Radio ready, Danceable',
    bpmRange: [120, 128],
    recommendedKeys: ['A Minor', 'E Minor'],
    commonStructure: ['Intro', 'Verse', 'Pre-Chorus', 'Chorus', 'Verse', 'Pre-Chorus', 'Chorus', 'Bridge', 'Chorus', 'Outro'],
    metaTags: ['[Drop]', '[Vocal Chop]', '[Ad-libs]'],
    tips: ['High energy chorus', 'Polished, compressed production'],
    variations: [
      { name: 'Hyperpop', modifications: 'Faster, distorted, exaggerated autotune.' },
      { name: 'Disco Pop', modifications: 'Funky bassline, string stabs.' }
    ],
    exampleOutput: 'Heartbeat racing like a drum machine...'
  },

  // --- OTHER ---
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
      { name: 'Smooth Jazz', modifications: 'Slower, simpler, more polished.' }
    ],
    exampleOutput: 'A conversation between instruments in a smoky room...'
  },
  {
    id: 'acoustic_ballad',
    name: { en: 'Acoustic Ballad', pl: 'Ballada Akustyczna' },
    category: 'Acoustic',
    stylePrompt: 'Acoustic Ballad, Singer-Songwriter, 70 BPM, G Major, Fingerpicked acoustic guitar, Intimate breathy vocals, Piano accompaniment, Emotional, Stripped back, Warm production',
    bpmRange: [60, 80],
    recommendedKeys: ['G Major', 'C Major', 'D Major'],
    commonStructure: ['Intro', 'Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Bridge', 'Chorus', 'Outro'],
    metaTags: ['[Acoustic Guitar Solo]', '[Silence]', '[Whisper]'],
    tips: ['Use "Intimate" or "Close Mic"', 'Keep instrumentation simple'],
    variations: [
      { name: 'Piano Ballad', modifications: 'Piano led instead of guitar.' },
      { name: 'Indie Folk', modifications: 'Add banjo/fiddle, storytelling lyrics.' }
    ],
    exampleOutput: 'Sitting by the fire...'
  },
  {
    id: 'modern_country',
    name: { en: 'Modern Country', pl: 'Nowoczesne Country' },
    category: 'Country',
    stylePrompt: 'Modern Country, Country Pop, 110 BPM, A Major, Acoustic guitar, Electric guitar riffs, Strong male vocals, Storytelling lyrics, Radio ready, Polished',
    bpmRange: [100, 130],
    recommendedKeys: ['A Major', 'G Major', 'D Major'],
    commonStructure: ['Intro', 'Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Guitar Solo', 'Bridge', 'Chorus', 'Outro'],
    metaTags: ['[Telecaster]', '[Slide Guitar]', '[Steel Guitar]'],
    tips: ['Themes: Trucks, Heartbreak, Small Towns', 'Use "Radio-ready" tag'],
    variations: [
      { name: 'Bro-Country', modifications: 'More rock influence, party themes.' },
      { name: 'Classic Country', modifications: 'Slower, slide guitar, fiddle, traditional.' }
    ],
    exampleOutput: 'Driving down that dirt road...'
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
