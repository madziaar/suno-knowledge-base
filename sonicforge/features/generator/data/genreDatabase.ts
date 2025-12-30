
import { GenreDef, StructureTemplate } from '../../../types/generator';

// --- VOCAL STYLES (EXPANDED FOR V4.5) ---
export const VOCAL_STYLES = {
  gender: [
    'male vocals', 'female vocals', 'duet', 'choir', 'androgynous', 
    'masculine', 'feminine', 'mixed vocals', 'gang vocals', 'child voice',
    'angelic voice'
  ],
  texture: [
    'airy', 'breathy', 'gritty', 'raspy', 'smooth', 'silky', 'rough', 
    'gravelly', 'clean', 'distorted', 'harsh', 'ethereal', 'angelic',
    'guttural', 'fried', 'warm', 'cold', 'robotic'
  ],
  delivery: [
    'whispered', 'spoken word', 'rapping', 'screaming', 'growling', 
    'shouting', 'belting', 'crooning', 'falsetto', 'operatic', 
    'melismatic', 'staccato', 'flow', 'yelling', 'chanting', 
    'emotional', 'vulnerable', 'confident'
  ],
  processing: [
    'auto-tuned', 'vocoder', 'reverb-drenched', 'dry', 'lo-fi', 
    'telephone effect', 'chorused', 'microtonal', 'processed',
    'wide stereo'
  ],
  regional: [
    'southern flow', 'west coast accent', 'uk accent', 'atlanta style',
    'memphis style', 'east coast flow', 'k-pop style', 'latin style', 'jamaican patois'
  ]
};

// --- MOOD DESCRIPTORS ---
export const MOOD_DESCRIPTORS = {
  energy: ['energetic', 'aggressive', 'powerful', 'explosive', 'driving', 'relentless', 'chill', 'laid-back', 'calm', 'relaxed', 'frenzied', 'anthemic', 'high-octane', 'bouncy', 'groove'],
  emotion: ['sad', 'melancholic', 'depressive', 'happy', 'joyful', 'euphoric', 'uplifting', 'hopeful', 'angry', 'rage', 'sentimental', 'nostalgic', 'romantic', 'longing', 'bittersweet', 'heartfelt', 'painful'],
  atmosphere: ['dark', 'ominous', 'eerie', 'haunting', 'spooky', 'bright', 'sunny', 'dreamy', 'ethereal', 'surreal', 'psychedelic', 'hypnotic', 'mysterious', 'neon-noir', 'cinematic', 'intimate', 'spacious']
};

// --- PRODUCTION QUALITY ---
export const PRODUCTION_DESCRIPTORS = [
  'lo-fi', 'hi-fi', 'studio quality', 'bedroom pop', 'live recording', 
  'concert', 'acoustic', 'unplugged', 'produced', 'polished', 'raw', 
  'demo', 'mastered', 'wide stereo', 'mono', 'tape saturation', 
  'vinyl crackle', 'bitcrushed', '8-bit', 'reverb-heavy', 'dry mix',
  'pristine production', 'analog warmth', 'gated reverb', 'phonk drum',
  'wall of sound', 'minimalist'
];

// --- STRUCTURE TEMPLATES ---
export const STRUCTURE_TEMPLATES: Record<string, StructureTemplate> = {
  pop: {
    name: "Standard Pop",
    description: "Radio-friendly verse-chorus structure",
    structure: ["Intro", "Verse 1", "Pre-Chorus", "Chorus", "Verse 2", "Pre-Chorus", "Chorus", "Bridge", "Chorus", "Outro"]
  },
  hiphop: {
    name: "Hip Hop / Trap",
    description: "Beat-focused with hooks and bars",
    structure: ["Intro", "Hook", "Verse 1", "Hook", "Verse 2", "Hook", "Bridge", "Hook", "Outro"]
  },
  phonk: {
    name: "Phonk / Memphis",
    description: "Repetitive hooks, cowbells, and short verses",
    structure: ["Intro", "Hook", "Verse 1", "Hook", "Verse 2", "Hook", "Outro"]
  },
  electronic: {
    name: "EDM / Club",
    description: "Build-drop dynamics for dance floors",
    structure: ["Intro", "Build-up", "Drop", "Breakdown", "Build-up", "Drop", "Outro"]
  },
  dnb: {
    name: "Drum & Bass",
    description: "Fast paced, breakdown focused",
    structure: ["Intro", "Atmosphere", "Build-up", "Drop", "Bridge", "Build-up", "Drop 2", "Outro"]
  },
  ballad: {
    name: "Power Ballad",
    description: "Slow build to emotional climax",
    structure: ["Intro", "Verse 1", "Chorus", "Verse 2", "Chorus", "Bridge", "Guitar Solo", "Chorus", "Outro"]
  },
  progressive: {
    name: "Progressive Journey",
    description: "Evolving structure without clear repetition",
    structure: ["Intro", "Theme A", "Development", "Theme B", "Solo", "Climax", "Resolution", "Outro"]
  },
  punk: {
    name: "Punk Rock",
    description: "Short, fast, high energy",
    structure: ["Intro", "Verse 1", "Chorus", "Verse 2", "Chorus", "Guitar Solo", "Chorus", "Outro"]
  },
  jazz: {
    name: "Jazz Standard",
    description: "Head-Solos-Head structure",
    structure: ["Intro", "Head (Theme)", "Solo Section 1", "Solo Section 2", "Trading 4s", "Head (Out)", "Outro"]
  },
  eurobeat: {
    name: "Eurobeat / High Energy",
    description: "Synth riff focused structure",
    structure: ["Intro", "Synth Riff", "Verse 1", "Chorus", "Synth Riff", "Verse 2", "Chorus", "Synth Solo", "Chorus", "Outro"]
  },
  cinematic: {
    name: "Cinematic Score",
    description: "Linear build without traditional chorus",
    structure: ["Intro", "Atmospheric Build", "Theme Introduction", "Rising Action", "Climax", "Resolution", "Outro"]
  },
  instrumental_journey: {
    name: "Instrumental Journey",
    description: "Musical progression without vocal sections",
    structure: ["Intro", "Theme A", "Theme B", "Solo", "Bridge", "Theme A", "Outro"]
  },
  instrumental_electronic: {
    name: "Electronic Instrumental",
    description: "Build-Drop structure without vocal emphasis",
    structure: ["Intro", "Atmosphere", "Build-up", "Drop", "Breakdown", "Build-up", "Drop", "Outro"]
  },
  instrumental_rock: {
    name: "Rock Instrumental",
    description: "Riff-based structure with solos",
    structure: ["Intro", "Main Riff", "Verse Theme", "Chorus Theme", "Solo", "Bridge", "Main Riff", "Outro"]
  },
  instrumental_jazz: {
    name: "Jazz Instrumental",
    description: "Head-Solo-Head structure",
    structure: ["Intro", "Head", "Solos", "Trading 4s", "Head", "Outro"]
  },
  v45_extended: {
    name: "V4.5 Extended (8 min)",
    description: "Long-form structure with multiple movements",
    structure: ["Intro", "Atmospheric Build", "Verse 1", "Chorus", "Verse 2", "Chorus", "Bridge with Ostinato", "Transition Section", "Solo", "Chorus", "Emotional Bridge", "Outro", "Instrumental Fade Out", "End"]
  }
};

// --- GENRE DATABASE (EXPANDED TO 80+ ENTRIES) ---
export const GENRE_DATABASE: GenreDef[] = [
  // --- ROCK & METAL ---
  {
    name: "Alternative Rock",
    category: "Rock",
    subGenres: ["Indie Rock", "Grunge", "Post-Punk", "Shoegaze"],
    bpmRange: [110, 140],
    commonKeys: ["E Major", "A Major", "C# Minor"],
    instruments: ["Electric Guitar", "Bass", "Drum Kit", "Synthesizer"],
    vocalsStyle: ["Raw", "Emotional", "Dynamic", "Powerful"],
    characteristics: ["Distorted guitars", "Quiet-Loud dynamics", "Angsty lyrics"]
  },
  {
    name: "Heavy Metal",
    category: "Rock",
    subGenres: ["Thrash Metal", "Speed Metal", "Groove Metal"],
    bpmRange: [140, 200],
    commonKeys: ["E Minor", "D Minor"],
    instruments: ["Distorted Guitar", "Double Kick Drum", "Bass"],
    vocalsStyle: ["Screaming", "Clean", "Guttural"],
    characteristics: ["Aggressive", "Technical", "Loud"]
  },
  {
    name: "Death Metal",
    category: "Rock",
    subGenres: ["Tech Death", "Melodic Death Metal", "Brutal Death Metal"],
    bpmRange: [160, 240],
    commonKeys: ["B Minor", "A Minor", "D Minor"],
    instruments: ["Downtuned Guitar", "Blast Beats", "Bass"],
    vocalsStyle: ["Growling", "Guttural", "Pig Squeals"],
    characteristics: ["Brutal", "Complex", "Dark", "Virtuosic"]
  },
  {
    name: "Black Metal",
    category: "Rock",
    subGenres: ["Atmospheric Black Metal", "Symphonic Black Metal", "DSBM"],
    bpmRange: [140, 220],
    commonKeys: ["E Minor", "C# Minor"],
    instruments: ["Tremolo Guitar", "Blast Beats", "Lo-fi Production"],
    vocalsStyle: ["Shrieking", "High-pitched Screams"],
    characteristics: ["Raw", "Cold", "Atmospheric", "Lo-fi"]
  },
  {
    name: "Doom Metal",
    category: "Rock",
    subGenres: ["Stoner Doom", "Funeral Doom", "Sludge"],
    bpmRange: [40, 80],
    commonKeys: ["C Minor", "B Minor"],
    instruments: ["Fuzz Bass", "Downtuned Guitar", "Slow Drums"],
    vocalsStyle: ["Clean", "Growling", "Wailing"],
    characteristics: ["Slow", "Heavy", "Despair", "Wall of Sound"]
  },
  {
    name: "Metalcore",
    category: "Rock",
    subGenres: ["Melodic Metalcore", "Mathcore", "Deathcore"],
    bpmRange: [130, 180],
    commonKeys: ["Drop C", "Drop D"],
    instruments: ["High Gain Guitar", "Breakdowns", "Double Bass"],
    vocalsStyle: ["Screaming", "Clean Chorus", "Gang Vocals"],
    characteristics: ["Breakdowns", "Aggressive", "Melodic choruses"]
  },
  {
    name: "Punk Rock",
    category: "Rock",
    subGenres: ["Hardcore Punk", "Pop Punk", "Skate Punk"],
    bpmRange: [160, 200],
    commonKeys: ["A Major", "E Major"],
    instruments: ["Power Chords", "Fast Drums", "Bass"],
    vocalsStyle: ["Shouting", "Raw", "Energetic"],
    characteristics: ["Fast", "Anti-establishment", "Simple structure"]
  },
  {
    name: "Post-Punk",
    category: "Rock",
    subGenres: ["Goth Rock", "Coldwave", "Darkwave"],
    bpmRange: [110, 140],
    commonKeys: ["D Minor", "A Minor"],
    instruments: ["Chorus Bass", "Drum Machine", "Jagged Guitar"],
    vocalsStyle: ["Baritone", "Monotone", "Reverb-heavy"],
    characteristics: ["Dark", "Angular", "Atmospheric", "Bass-driven"]
  },
  {
    name: "Shoegaze",
    category: "Rock",
    subGenres: ["Dream Pop", "Nu-Gaze", "Blackgaze"],
    bpmRange: [80, 120],
    commonKeys: ["E Major", "B Major"],
    instruments: ["Effects Pedals", "Reverb", "Distortion"],
    vocalsStyle: ["Buried", "Ethereal", "Whispered"],
    characteristics: ["Wall of sound", "Noisy", "Dreamy", "Hazy"]
  },
  {
    name: "Math Rock",
    category: "Rock",
    subGenres: ["Midwest Emo", "Japanese Math Rock"],
    bpmRange: [120, 150],
    commonKeys: ["D Major", "F Major"],
    instruments: ["Clean Electric Guitar", "Tapping", "Complex Drums"],
    vocalsStyle: ["Clean", "Emotional", "Shouted"],
    characteristics: ["Odd time signatures", "Technical", "Twinkly"]
  },
  {
    name: "Classic Rock",
    category: "Rock",
    subGenres: ["Hard Rock", "Blues Rock", "Psychedelic Rock"],
    bpmRange: [100, 130],
    commonKeys: ["A Major", "E Major", "G Major"],
    instruments: ["Electric Guitar", "Organ", "Drums"],
    vocalsStyle: ["Powerful", "Gritty", "Rockstar"],
    characteristics: ["Riffs", "Solos", "Anthemic"]
  },

  // --- ELECTRONIC & DANCE ---
  {
    name: "Techno",
    category: "Electronic",
    subGenres: ["Industrial Techno", "Acid Techno", "Minimal Techno", "Detroit Techno"],
    bpmRange: [125, 145],
    commonKeys: ["A Minor", "D Minor"],
    instruments: ["909 Kick", "Modular Synth", "Rumble Bass"],
    vocalsStyle: ["Spoken", "Minimal", "Sampled"],
    characteristics: ["Repetitive", "Driving", "Dark", "Mechanical"]
  },
  {
    name: "House",
    category: "Electronic",
    subGenres: ["Deep House", "Tech House", "Chicago House", "Tropical House"],
    bpmRange: [118, 128],
    commonKeys: ["C Minor", "G Minor"],
    instruments: ["909 Drums", "Piano", "Organ", "Sub Bass"],
    vocalsStyle: ["Soulful", "Diva", "Sampled"],
    characteristics: ["Groovy", "4/4 Beat", "Uplifting"]
  },
  {
    name: "Trance",
    category: "Electronic",
    subGenres: ["Psytrance", "Uplifting Trance", "Progressive Trance"],
    bpmRange: [130, 145],
    commonKeys: ["G Minor", "F# Minor"],
    instruments: ["Supersaw", "Arpeggios", "Pads"],
    vocalsStyle: ["Ethereal", "Female", "Soaring"],
    characteristics: ["Euphoric", "Melodic", "Build-ups", "Energy"]
  },
  {
    name: "Dubstep",
    category: "Electronic",
    subGenres: ["Brostep", "Riddim", "Melodic Dubstep", "Deathstep"],
    bpmRange: [140, 150],
    commonKeys: ["F Minor", "E Minor"],
    instruments: ["Wobble Bass", "Growl Bass", "Sub Bass"],
    vocalsStyle: ["Hype", "Chopped", "Pop Vocals"],
    characteristics: ["Heavy Drop", "Half-time", "Aggressive bass"]
  },
  {
    name: "Drum and Bass",
    category: "Electronic",
    subGenres: ["Liquid DnB", "Neurofunk", "Jump Up", "Jungle"],
    bpmRange: [170, 180],
    commonKeys: ["F Minor", "E Minor"],
    instruments: ["Reese Bass", "Breakbeats", "Amen Break"],
    vocalsStyle: ["Soulful", "MC", "Rapid"],
    characteristics: ["Fast tempo", "Complex drums", "Deep bass"]
  },
  {
    name: "Synthwave",
    category: "Electronic",
    subGenres: ["Retrowave", "Darksynth", "Outrun"],
    bpmRange: [100, 120],
    commonKeys: ["A Minor", "C Minor"],
    instruments: ["Analog Synths", "LinnDrum", "Gated Reverb"],
    vocalsStyle: ["Robotic", "Reverb-heavy", "Nostalgic"],
    characteristics: ["80s aesthetic", "Neon", "Cinematic"]
  },
  {
    name: "UK Garage",
    category: "Electronic",
    subGenres: ["2-Step", "Speed Garage", "Bassline"],
    bpmRange: [130, 135],
    commonKeys: ["G Minor", "C Minor"],
    instruments: ["Shuffling Hats", "Chopped Vocals", "Warped Bass"],
    vocalsStyle: ["Soulful", "Pitch-shifted", "Rhythmic"],
    characteristics: ["Syncopated", "Swing", "Urban"]
  },
  {
    name: "Hardstyle",
    category: "Electronic",
    subGenres: ["Rawstyle", "Euphoric Hardstyle", "Happy Hardcore"],
    bpmRange: [150, 160],
    commonKeys: ["G# Minor", "F Minor"],
    instruments: ["Distorted Kick", "Supersaw Lead", "Screech"],
    vocalsStyle: ["Spoken Intro", "Anthemic", "Sampled"],
    characteristics: ["Hard kick", "High energy", "Melodic breaks"]
  },
  {
    name: "IDM",
    category: "Electronic",
    subGenres: ["Glitch", "Braindance", "Ambient Techno"],
    bpmRange: [100, 140],
    commonKeys: ["Atonal", "Complex"],
    instruments: ["Modular Synth", "Glitch FX", "Granular"],
    vocalsStyle: ["Abstract", "Processed", "None"],
    characteristics: ["Experimental", "Complex rhythms", "Intellectual"]
  },
  {
    name: "Eurobeat",
    category: "Electronic",
    subGenres: ["Italo Disco", "Hi-NRG"],
    bpmRange: [140, 160],
    commonKeys: ["D Minor", "A Minor"],
    instruments: ["Synth Brass", "Fast Arps", "Electric Guitar"],
    vocalsStyle: ["High Energy", "Dramatic", "Falsetto"],
    characteristics: ["Fast", "Melodic", "Driving", "Anime"]
  },

  // --- HIP HOP & RAP ---
  {
    name: "Trap",
    category: "Hip Hop",
    subGenres: ["Atlanta Trap", "Cloud Rap", "Rage"],
    bpmRange: [130, 160],
    commonKeys: ["C Minor", "F Minor"],
    instruments: ["808 Bass", "Hi-hat Rolls", "Trap Snares"],
    vocalsStyle: ["Auto-tuned", "Mumbled", "Triplet flow"],
    characteristics: ["Heavy bass", "Dark", "Rhythmic"]
  },
  {
    name: "Drill",
    category: "Hip Hop",
    subGenres: ["UK Drill", "NY Drill", "Chicago Drill"],
    bpmRange: [140, 145],
    commonKeys: ["C Minor", "C# Minor"],
    instruments: ["Sliding 808s", "Dark Piano", "Violent Snares"],
    vocalsStyle: ["Aggressive", "Dark", "Direct"],
    characteristics: ["Sliding bass", "Dark atmosphere", "Syncopated"]
  },
  {
    name: "Boom Bap",
    category: "Hip Hop",
    subGenres: ["East Coast", "Jazz Rap", "Conscious Hip Hop"],
    bpmRange: [85, 95],
    commonKeys: ["Bb Minor", "Eb Minor"],
    instruments: ["Sampled Drums", "Jazz Samples", "Vinyl Crackle"],
    vocalsStyle: ["Lyrical", "Rhythmic", "Storytelling"],
    characteristics: ["Sample-based", "Groovy", "Raw"]
  },
  {
    name: "Lo-fi Hip Hop",
    category: "Hip Hop",
    subGenres: ["Chillhop", "Jazz Hop", "Sleep Beats"],
    bpmRange: [70, 90],
    commonKeys: ["C Major", "Eb Major"],
    instruments: ["Piano", "Vinyl FX", "Muffled Drums"],
    vocalsStyle: ["None", "Sampled quotes", "Soft"],
    characteristics: ["Relaxing", "Nostalgic", "Dusty"]
  },
  {
    name: "Memphis Trap",
    category: "Hip Hop",
    subGenres: ["Phonk", "Drift Phonk", "Horrorcore"],
    bpmRange: [130, 150],
    commonKeys: ["F# Minor", "C# Minor"],
    instruments: ["Cowbell", "Phonk Drum", "Distorted 808"],
    vocalsStyle: ["Memphis Samples", "Dark", "Distorted"],
    characteristics: ["Dark", "Lo-fi", "Street", "Aggressive"]
  },
  {
    name: "West Coast Rap",
    category: "Hip Hop",
    subGenres: ["G-Funk", "Hyphy"],
    bpmRange: [90, 100],
    commonKeys: ["G Minor", "C Minor"],
    instruments: ["Sine Lead", "Funk Bass", "Talkbox"],
    vocalsStyle: ["Laid back", "Flow", "Gangsta"],
    characteristics: ["Bounce", "Groovy", "Cruising"]
  },
  {
    name: "Grime",
    category: "Hip Hop",
    subGenres: ["Eskibeat", "8-bar"],
    bpmRange: [140, 140],
    commonKeys: ["F Minor", "E Minor"],
    instruments: ["Square Wave Bass", "Skippy Strings", "Sub"],
    vocalsStyle: ["Fast", "Aggressive", "UK Accent"],
    characteristics: ["Electronic", "Fast", "Syncopated"]
  },
  {
    name: "Cloud Rap",
    category: "Hip Hop",
    subGenres: ["Sad Rap", "Trillwave"],
    bpmRange: [120, 140],
    commonKeys: ["D Major", "E Major"],
    instruments: ["Ambient Pads", "Reverb", "808"],
    vocalsStyle: ["Spaced out", "Auto-tuned", "Emotional"],
    characteristics: ["Hazy", "Dreamy", "Atmospheric"]
  },

  // --- POP ---
  {
    name: "Synthpop",
    category: "Pop",
    subGenres: ["Electropop", "Indie Pop", "Nu-Disco"],
    bpmRange: [100, 130],
    commonKeys: ["C Minor", "F Major"],
    instruments: ["Synthesizers", "Drum Machine", "Bass Synth"],
    vocalsStyle: ["Clean", "Processed", "Catchy"],
    characteristics: ["Electronic", "Danceable", "Melodic"]
  },
  {
    name: "K-Pop",
    category: "Pop",
    subGenres: ["K-Rap", "K-Ballad", "K-EDM"],
    bpmRange: [100, 140],
    commonKeys: ["F# Minor", "B Minor"],
    instruments: ["Synth", "Bass", "Samples"],
    vocalsStyle: ["Group", "Harmonies", "Rap/Singing mix"],
    characteristics: ["High production", "Genre-blending", "Polished"]
  },
  {
    name: "Indie Pop",
    category: "Pop",
    subGenres: ["Bedroom Pop", "Twee Pop", "Dream Pop"],
    bpmRange: [100, 120],
    commonKeys: ["D Major", "G Major"],
    instruments: ["Clean Guitar", "Synth", "Drum Machine"],
    vocalsStyle: ["Soft", "Quirky", "Reverb"],
    characteristics: ["Catchy", "Lo-fi aesthetic", "Personal"]
  },
  {
    name: "Art Pop",
    category: "Pop",
    subGenres: ["Avant-Pop", "Chamber Pop"],
    bpmRange: [90, 120],
    commonKeys: ["Eb Major", "C Minor"],
    instruments: ["Orchestral", "Synth", "Piano"],
    vocalsStyle: ["Theatrical", "Unique", "Expressive"],
    characteristics: ["Experimental", "Artistic", "Complex"]
  },
  {
    name: "City Pop",
    category: "Pop",
    subGenres: ["Japanese Funk", "Future Funk"],
    bpmRange: [100, 120],
    commonKeys: ["F Major", "Bb Major"],
    instruments: ["Slap Bass", "Brass Section", "FM Synth"],
    vocalsStyle: ["Clear", "Japanese", "Melodic"],
    characteristics: ["Retro", "Funk-influenced", "Nostalgic"]
  },
  {
    name: "J-Pop",
    category: "Pop",
    subGenres: ["Anime Song", "Idol Pop"],
    bpmRange: [130, 170],
    commonKeys: ["E Major", "A Major"],
    instruments: ["Piano", "Strings", "Synth", "Rock Guitar"],
    vocalsStyle: ["Cute", "High-pitched", "Energetic"],
    characteristics: ["Fast", "Complex chords", "Upbeat"]
  },

  // --- JAZZ, SOUL & FUNK ---
  {
    name: "Jazz Fusion",
    category: "Jazz",
    subGenres: ["Jazz Rock", "Funk Jazz"],
    bpmRange: [110, 140],
    commonKeys: ["E Minor", "A Minor"],
    instruments: ["Electric Guitar", "Synth", "Saxophone"],
    vocalsStyle: ["Instrumental", "Scat"],
    characteristics: ["Virtuosic", "Complex", "Groovy"]
  },
  {
    name: "Bebop",
    category: "Jazz",
    subGenres: ["Hard Bop", "Post-Bop"],
    bpmRange: [200, 300],
    commonKeys: ["Bb Major", "F Major"],
    instruments: ["Saxophone", "Trumpet", "Double Bass", "Piano"],
    vocalsStyle: ["Scat", "None"],
    characteristics: ["Fast", "Complex harmony", "Swing"]
  },
  {
    name: "Swing",
    category: "Jazz",
    subGenres: ["Big Band", "Gypsy Jazz", "Electro Swing"],
    bpmRange: [120, 180],
    commonKeys: ["C Major", "G Major"],
    instruments: ["Brass Section", "Upright Bass", "Drums"],
    vocalsStyle: ["Crooner", "Energetic"],
    characteristics: ["Swinging rhythm", "Danceable", "Vintage"]
  },
  {
    name: "Neo-Soul",
    category: "R&B/Soul",
    subGenres: ["Future Soul", "Alternative R&B"],
    bpmRange: [80, 95],
    commonKeys: ["Eb Major", "Db Major"],
    instruments: ["Rhodes", "Bass", "Drums"],
    vocalsStyle: ["Soulful", "Laid-back", "Melismatic"],
    characteristics: ["Dilla beat", "Groovy", "Relaxed"]
  },
  {
    name: "Funk",
    category: "R&B/Soul",
    subGenres: ["P-Funk", "Synth-Funk", "Disco Funk"],
    bpmRange: [100, 120],
    commonKeys: ["E Minor", "A Minor"],
    instruments: ["Slap Bass", "Wah Guitar", "Brass"],
    vocalsStyle: ["Rhythmic", "Soulful", "Group"],
    characteristics: ["Syncopated", "Bass-heavy", "Danceable"]
  },
  {
    name: "Disco",
    category: "R&B/Soul",
    subGenres: ["Italo Disco", "Nu-Disco"],
    bpmRange: [110, 130],
    commonKeys: ["D Minor", "A Minor"],
    instruments: ["String Section", "Funky Guitar", "Four-on-the-floor"],
    vocalsStyle: ["Diva", "Falsetto", "Reverb"],
    characteristics: ["Dance", "Orchestral hits", "Groovy"]
  },
  {
    name: "Motown Soul",
    category: "R&B/Soul",
    subGenres: ["Northern Soul", "Classic Soul"],
    bpmRange: [100, 130],
    commonKeys: ["C Major", "F Major"],
    instruments: ["Bass", "Tambourine", "Brass", "Piano"],
    vocalsStyle: ["Powerful", "Call and Response", "Choir"],
    characteristics: ["Pop structure", "Catchy", "Retro"]
  },

  // --- FOLK & COUNTRY ---
  {
    name: "Country",
    category: "Country",
    subGenres: ["Outlaw Country", "Pop Country", "Bro-Country"],
    bpmRange: [100, 130],
    commonKeys: ["G Major", "D Major"],
    instruments: ["Acoustic Guitar", "Telecaster", "Fiddle", "Pedal Steel"],
    vocalsStyle: ["Twang", "Clear", "Storytelling"],
    characteristics: ["Radio-friendly", "Southern", "Melodic"]
  },
  {
    name: "Bluegrass",
    category: "Country",
    subGenres: ["Progressive Bluegrass", "Traditional"],
    bpmRange: [140, 180],
    commonKeys: ["G Major", "A Major"],
    instruments: ["Banjo", "Mandolin", "Fiddle", "Upright Bass"],
    vocalsStyle: ["High Lonesome", "Harmony"],
    characteristics: ["Fast", "Acoustic", "Virtuosic"]
  },
  {
    name: "Americana",
    category: "Folk",
    subGenres: ["Roots Rock", "Alt-Country"],
    bpmRange: [90, 120],
    commonKeys: ["E Major", "A Major"],
    instruments: ["Acoustic Guitar", "Electric Guitar", "Organ"],
    vocalsStyle: ["Raw", "Authentic", "Gravelly"],
    characteristics: ["Rootsy", "Storytelling", "Organic"]
  },
  {
    name: "Indie Folk",
    category: "Folk",
    subGenres: ["Chamber Folk", "Freak Folk"],
    bpmRange: [80, 110],
    commonKeys: ["C Major", "F Major"],
    instruments: ["Acoustic Guitar", "Piano", "Handclaps"],
    vocalsStyle: ["Soft", "Harmonies", "Indie"],
    characteristics: ["Acoustic", "Intimate", "Melodic"]
  },

  // --- LATIN & WORLD ---
  {
    name: "Reggaeton",
    category: "Latin",
    subGenres: ["Dembow", "Latin Trap"],
    bpmRange: [90, 100],
    commonKeys: ["F# Minor", "B Minor"],
    instruments: ["Dembow Beat", "Synth", "Sub Bass"],
    vocalsStyle: ["Rapping", "Singing", "Autotune"],
    characteristics: ["Dembow rhythm", "Danceable", "Urban"]
  },
  {
    name: "Salsa",
    category: "Latin",
    subGenres: ["Salsa Dura", "Salsa Romantica"],
    bpmRange: [160, 200],
    commonKeys: ["C Minor", "G Minor"],
    instruments: ["Piano", "Brass", "Congas", "Timbales"],
    vocalsStyle: ["Passionate", "Call and Response"],
    characteristics: ["Clave rhythm", "Complex", "Dance"]
  },
  {
    name: "Bossa Nova",
    category: "Latin",
    subGenres: ["Samba", "Jazz Bossa"],
    bpmRange: [120, 140],
    commonKeys: ["D Major", "G Major"],
    instruments: ["Nylon Guitar", "Piano", "Soft Drums"],
    vocalsStyle: ["Whispered", "Soft", "Portuguese"],
    characteristics: ["Syncopated", "Relaxed", "Jazz chords"]
  },
  {
    name: "Afrobeat",
    category: "World",
    subGenres: ["Afrobeats", "Highlife"],
    bpmRange: [100, 120],
    commonKeys: ["F Major", "Bb Major"],
    instruments: ["Horns", "Percussion", "Guitar"],
    vocalsStyle: ["Chanted", "Pidgin", "Energetic"],
    characteristics: ["Polyrhythmic", "Groovy", "Dance"]
  },
  {
    name: "Reggae",
    category: "World",
    subGenres: ["Roots Reggae", "Dub", "Dancehall", "Ska"],
    bpmRange: [60, 90],
    commonKeys: ["A Minor", "G Minor"],
    instruments: ["Bass", "Offbeat Guitar", "Organ"],
    vocalsStyle: ["Patois", "Melodic", "Relaxed"],
    characteristics: ["Off-beat", "Heavy bass", "Chill"]
  },
  {
    name: "Bollywood",
    category: "World",
    subGenres: ["Filmi", "Indi-Pop"],
    bpmRange: [100, 140],
    commonKeys: ["C# Minor", "D Major"],
    instruments: ["Strings", "Sitar", "Tabla", "Dhol"],
    vocalsStyle: ["High-pitched", "Melismatic", "Duet"],
    characteristics: ["Cinematic", "Fusion", "Dramatic"]
  },

  // --- EXPERIMENTAL & NICHE ---
  {
    name: "Hyperpop",
    category: "Experimental",
    subGenres: ["Digicore", "Glitchcore"],
    bpmRange: [140, 180],
    commonKeys: ["F Major", "C Major"],
    instruments: ["Distorted Synth", "Hard Kick", "Glitch"],
    vocalsStyle: ["Pitch-shifted", "Autotune", "Fast"],
    characteristics: ["Chaos", "Maximalist", "Internet"]
  },
  {
    name: "Vaporwave",
    category: "Experimental",
    subGenres: ["Future Funk", "Mallsoft"],
    bpmRange: [60, 90],
    commonKeys: ["Eb Major", "Ab Major"],
    instruments: ["Sampled Jazz/Funk", "Slowed", "Reverb"],
    vocalsStyle: ["Sampled", "Chopped", "Deep"],
    characteristics: ["Nostalgic", "Slowed", "Surreal"]
  },
  {
    name: "Dungeon Synth",
    category: "Experimental",
    subGenres: ["Fantasy Synth", "Winter Synth"],
    bpmRange: [70, 100],
    commonKeys: ["A Minor", "E Minor"],
    instruments: ["Lo-fi Synth", "Flute", "Harpsichord"],
    vocalsStyle: ["None", "Spoken"],
    characteristics: ["Medieval", "RPG", "Lo-fi"]
  },
  {
    name: "Breakcore",
    category: "Experimental",
    subGenres: ["Drill 'n' Bass", "Mashcore"],
    bpmRange: [180, 220],
    commonKeys: ["Atonal", "Chaotic"],
    instruments: ["Amen Break", "Samples", "Gabber Kick"],
    vocalsStyle: ["Sampled", "Screaming", "Anime samples"],
    characteristics: ["Chaotic", "Fast", "Glitchy"]
  },
  {
    name: "Witch House",
    category: "Experimental",
    subGenres: ["Darkwave", "Goth"],
    bpmRange: [60, 70],
    commonKeys: ["F Minor", "C Minor"],
    instruments: ["Reese Bass", "Trap Beats", "Saw Waves"],
    vocalsStyle: ["Distorted", "Ghostly", "Reverb"],
    characteristics: ["Dark", "Occult", "Slow"]
  },
  {
    name: "Industrial",
    category: "Experimental",
    subGenres: ["EBM", "Industrial Metal", "Power Noise"],
    bpmRange: [100, 140],
    commonKeys: ["E Minor", "D Minor"],
    instruments: ["Metallic Percussion", "Distortion", "Sampler"],
    vocalsStyle: ["Distorted", "Shouted", "Processed"],
    characteristics: ["Mechanical", "Harsh", "Abrasive"]
  },

  // --- CLASSICAL & ORCHESTRAL ---
  {
    name: "Cinematic",
    category: "Classical",
    subGenres: ["Epic Orchestral", "Trailer Music", "Score"],
    bpmRange: [60, 120],
    commonKeys: ["D Minor", "C Minor"],
    instruments: ["Full Orchestra", "Braams", "Hybrid Percussion"],
    vocalsStyle: ["Choir", "Operatic"],
    characteristics: ["Epic", "Dynamic", "Visual"]
  },
  {
    name: "Classical",
    category: "Classical",
    subGenres: ["Baroque", "Romantic", "Chamber"],
    bpmRange: [60, 140],
    commonKeys: ["C Major", "A Minor"],
    instruments: ["Strings", "Piano", "Woodwinds", "Harpsichord"],
    vocalsStyle: ["Opera", "Soprano"],
    characteristics: ["Acoustic", "Formal", "Complex"]
  }
];
