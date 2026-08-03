
import { SongSection } from "../types";

export interface StoryArc {
  id: string;
  name: string;
  description: { en: string; pl: string };
  structure: SongSection[];
}

export const STORY_ARCS: StoryArc[] = [
  {
    id: "heros_journey",
    name: "Hero's Journey",
    description: { en: "Classic narrative structure. Ideal for Epic/Cinematic tracks.", pl: "Klasyczna struktura narracyjna. Idealna do epickich utworów." },
    structure: [
      { id: "s1", type: "Intro", modifiers: ["Atmospheric", "Low Energy"] },
      { id: "s2", type: "Verse", modifiers: ["Storytelling", "Call to Adventure"] },
      { id: "s3", type: "Pre-Chorus", modifiers: ["Rising Tension"] },
      { id: "s4", type: "Chorus", modifiers: ["Anthemic", "Declaration"] },
      { id: "s5", type: "Verse", modifiers: ["The Struggle", "Darker"] },
      { id: "s6", type: "Bridge", modifiers: ["The Abyss", "Emotional Peak"] },
      { id: "s7", type: "Chorus", modifiers: ["Triumphant", "Resolution"] },
      { id: "s8", type: "Outro", modifiers: ["Fade Out", "Peaceful"] }
    ]
  },
  {
    id: "pop_radio",
    name: "Radio Hit (3:30)",
    description: { en: "Tight, punchy structure optimized for airplay.", pl: "Zwarta, dynamiczna struktura zoptymalizowana pod radio." },
    structure: [
      { id: "p1", type: "Intro", modifiers: ["Short", "Hook Tease"] },
      { id: "p2", type: "Verse", modifiers: ["Rhythmic"] },
      { id: "p3", type: "Pre-Chorus", modifiers: ["Build-up"] },
      { id: "p4", type: "Chorus", modifiers: ["Catchy", "High Energy"] },
      { id: "p5", type: "Verse", modifiers: ["Groovy"] },
      { id: "p6", type: "Chorus", modifiers: ["High Energy"] },
      { id: "p7", type: "Bridge", modifiers: ["Stripped Back", "Vocal Focus"] },
      { id: "p8", type: "Chorus", modifiers: ["Explosive", "Ad-libs"] },
      { id: "p9", type: "Outro", modifiers: ["Hard Stop"] }
    ]
  },
  {
    id: "edm_festival",
    name: "EDM Festival Banger",
    description: { en: "Build-Drop dynamic for dance floors.", pl: "Dynamika Build-Drop na parkiety taneczne." },
    structure: [
      { id: "e1", type: "Intro", modifiers: ["DJ Friendly", "Beat"] },
      { id: "e2", type: "Breakdown", modifiers: ["Melodic", "Vocals"] },
      { id: "e3", type: "Build-up", modifiers: ["Risers", "Snare Roll"] },
      { id: "e4", type: "Drop", modifiers: ["Heavy Bass", "Main Lead"] },
      { id: "e5", type: "Breakdown", modifiers: ["Atmospheric"] },
      { id: "e6", type: "Build-up", modifiers: ["Faster"] },
      { id: "e7", type: "Drop", modifiers: ["Maximum Energy"] },
      { id: "e8", type: "Outro", modifiers: ["DJ Friendly"] }
    ]
  },
  {
    id: "progressive_journey",
    name: "Progressive Flow",
    description: { en: "Slow evolution without standard verse-chorus structure.", pl: "Powolna ewolucja bez standardowej struktury zwrotka-refren." },
    structure: [
      { id: "pr1", type: "Intro", modifiers: ["Ambient", "Slow"] },
      { id: "pr2", type: "Verse", modifiers: ["Establishing Theme"] },
      { id: "pr3", type: "Instrumental", modifiers: ["Adding Layers"] },
      { id: "pr4", type: "Verse", modifiers: ["Development"] },
      { id: "pr5", type: "Bridge", modifiers: ["Shift in Tone"] },
      { id: "pr6", type: "Solo", modifiers: ["Climax"] },
      { id: "pr7", type: "Outro", modifiers: ["Deconstruction"] }
    ]
  },
  {
    id: "metal_core",
    name: "Metalcore Breakdown",
    description: { en: "Heavy/Soft dynamics with a massive breakdown.", pl: "Dynamika Ciężko/Lekko z potężnym breakdownem." },
    structure: [
      { id: "m1", type: "Intro", modifiers: ["Feedback", "Heavy Riff"] },
      { id: "m2", type: "Verse", modifiers: ["Scream", "Aggressive"] },
      { id: "m3", type: "Chorus", modifiers: ["Clean Vocals", "Melodic"] },
      { id: "m4", type: "Verse", modifiers: ["Fast", "Double Kick"] },
      { id: "m5", type: "Chorus", modifiers: ["Anthemic"] },
      { id: "m6", type: "Breakdown", modifiers: ["Half-time", "Brutal", "Low"] },
      { id: "m7", type: "Solo", modifiers: ["Shredding", "High Gain"] },
      { id: "m8", type: "Chorus", modifiers: ["Final Energy"] },
      { id: "m9", type: "Outro", modifiers: ["Chugging", "Feedback"] }
    ]
  },
  {
    id: "hiphop_cypher",
    name: "Rap Cypher Flow",
    description: { en: "Verse-heavy structure for lyrical storytelling.", pl: "Struktura skupiona na zwrotkach i opowiadaniu historii." },
    structure: [
      { id: "h1", type: "Intro", modifiers: ["Beat Tag", "Spoken"] },
      { id: "h2", type: "Hook", modifiers: ["Catchy", "Short"] },
      { id: "h3", type: "Verse", modifiers: ["Flow", "16 Bars"] },
      { id: "h4", type: "Hook", modifiers: ["Layered"] },
      { id: "h5", type: "Verse", modifiers: ["Storytelling", "24 Bars"] },
      { id: "h6", type: "Bridge", modifiers: ["Beat Switch", "Slowed"] },
      { id: "h7", type: "Hook", modifiers: ["Hype"] },
      { id: "h8", type: "Outro", modifiers: ["Ad-libs", "Fade"] }
    ]
  },
  {
    id: "jazz_standard",
    name: "Jazz Standard (AABA)",
    description: { en: "Traditional jazz form with head and solos.", pl: "Tradycyjna forma jazzowa z tematem i solówkami." },
    structure: [
      { id: "j1", type: "Intro", modifiers: ["Piano Trio", "Swing"] },
      { id: "j2", type: "Verse", modifiers: ["Head (A)", "Melody"] },
      { id: "j3", type: "Verse", modifiers: ["Head (A)", "Repeat"] },
      { id: "j4", type: "Bridge", modifiers: ["Section (B)", "Key Change"] },
      { id: "j5", type: "Verse", modifiers: ["Head (A)", "Return"] },
      { id: "j6", type: "Solo", modifiers: ["Saxophone", "Improv"] },
      { id: "j7", type: "Solo", modifiers: ["Piano", "Trading 4s"] },
      { id: "j8", type: "Outro", modifiers: ["Head Out", "Ritardando"] }
    ]
  },
  {
    id: "euro_pop",
    name: "Euro-Pop Anthem",
    description: { en: "High energy structure with a key change.", pl: "Wysokoenergetyczna struktura ze zmianą tonacji." },
    structure: [
      { id: "ep1", type: "Intro", modifiers: ["Synth Hook"] },
      { id: "ep2", type: "Verse", modifiers: ["Pumping Bass"] },
      { id: "ep3", type: "Pre-Chorus", modifiers: ["Rising"] },
      { id: "ep4", type: "Chorus", modifiers: ["Explosive", "Earworm"] },
      { id: "ep5", type: "Verse", modifiers: ["Driving"] },
      { id: "ep6", type: "Chorus", modifiers: ["Anthemic"] },
      { id: "ep7", type: "Bridge", modifiers: ["Dramatic", "Drum Fill"] },
      { id: "ep8", type: "Chorus", modifiers: ["Key Change +1", "Maximum Energy"] },
      { id: "ep9", type: "Outro", modifiers: ["Vocal Ad-libs"] }
    ]
  },
  {
    id: "cyberpunk_narrative",
    name: "Cyberpunk Narrative",
    description: { en: "Dystopian story flow with atmospheric breaks.", pl: "Dystopijna narracja z przerwami atmosferycznymi." },
    structure: [
      { id: "cp1", type: "Intro", modifiers: ["Rain FX", "Synth Swell"] },
      { id: "cp2", type: "Verse", modifiers: ["Monologue", "Dark"] },
      { id: "cp3", type: "Build-up", modifiers: ["Tension", "Risers"] },
      { id: "cp4", type: "Drop", modifiers: ["Heavy Industrial", "Distorted"] },
      { id: "cp5", type: "Bridge", modifiers: ["Glitch Break", "Silence"] },
      { id: "cp6", type: "Verse", modifiers: ["Resolution", "Melodic"] },
      { id: "cp7", type: "Outro", modifiers: ["Fading Signal"] }
    ]
  },
  {
    id: "lofi_loop",
    name: "Lo-Fi Study Loop",
    description: { en: "Simple, repetitive structure for focus.", pl: "Prosta, powtarzalna struktura do skupienia." },
    structure: [
      { id: "lf1", type: "Intro", modifiers: ["Vinyl Crackle", "Piano"] },
      { id: "lf2", type: "Verse", modifiers: ["Main Loop", "Chill"] },
      { id: "lf3", type: "Bridge", modifiers: ["Vocal Sample", "Atmosphere"] },
      { id: "lf4", type: "Verse", modifiers: ["Main Loop", "Variation"] },
      { id: "lf5", type: "Outro", modifiers: ["Slow Fade", "Rain"] }
    ]
  },
  {
    id: "v45_odyssey",
    name: "8-Minute Odyssey (V4.5)",
    description: { en: "Massive, multi-part structure for extended generation.", pl: "Potężna, wieloczęściowa struktura dla długich generacji." },
    structure: [
      { id: "od1", type: "Intro", modifiers: ["Atmospheric", "Slow Build"] },
      { id: "od2", type: "Verse", modifiers: ["Part I: The Beginning"] },
      { id: "od3", type: "Chorus", modifiers: ["Establishing Theme"] },
      { id: "od4", type: "Instrumental", modifiers: ["The Journey", "Development"] },
      { id: "od5", type: "Bridge", modifiers: ["Shift in Tone", "Darker"] },
      { id: "od6", type: "Verse", modifiers: ["Part II: The Conflict"] },
      { id: "od7", type: "Solo", modifiers: ["Epic", "Extended"] },
      { id: "od8", type: "Bridge", modifiers: ["Quiet before Storm"] },
      { id: "od9", type: "Chorus", modifiers: ["Part III: Climax", "Grand"] },
      { id: "od10", type: "Outro", modifiers: ["Part IV: Resolution", "Long Fade"] }
    ]
  }
];
