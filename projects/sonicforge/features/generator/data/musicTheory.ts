
export interface PianoKey {
  note: string;
  type: 'white' | 'black';
}

export const PIANO_KEYS: PianoKey[] = [
  { note: 'C', type: 'white' },
  { note: 'C#', type: 'black' },
  { note: 'D', type: 'white' },
  { note: 'D#', type: 'black' },
  { note: 'E', type: 'white' },
  { note: 'F', type: 'white' },
  { note: 'F#', type: 'black' },
  { note: 'G', type: 'white' },
  { note: 'G#', type: 'black' },
  { note: 'A', type: 'white' },
  { note: 'A#', type: 'black' },
  { note: 'B', type: 'white' },
];

export interface ScaleMode {
  name: string;
  description: string;
  feeling: string;
}

export const MUSICAL_MODES: ScaleMode[] = [
  { name: 'Ionian (Major)', description: 'The standard major scale.', feeling: 'Happy, Bright, Stable' },
  { name: 'Dorian', description: 'Minor scale with a raised 6th.', feeling: 'Jazzy, Soulful, Melancholic but bright' },
  { name: 'Phrygian', description: 'Minor scale with a flat 2nd.', feeling: 'Exotic, Spanish, Tension, Metal' },
  { name: 'Lydian', description: 'Major scale with a raised 4th.', feeling: 'Dreamy, Floating, Sci-Fi, Magical' },
  { name: 'Mixolydian', description: 'Major scale with a flat 7th.', feeling: 'Bluesy, Rock, Positive but gritty' },
  { name: 'Aeolian (Natural Minor)', description: 'The standard minor scale.', feeling: 'Sad, Dark, Emotional' },
  { name: 'Locrian', description: 'Minor scale with flat 2nd and 5th.', feeling: 'Unstable, Dark, Dissonant, Horror' },
  { name: 'Phrygian Dominant', description: 'Phrygian with a major 3rd.', feeling: 'Middle Eastern, Epic, Neo-Classical' },
  { name: 'Lydian b7', description: 'Lydian with a flat 7th (Overtone scale).', feeling: 'Acoustic, Resonant, Simpson-esque' }
];

export const CHORD_EXTENSIONS = [
  { label: 'Major 7', value: 'maj7', desc: 'Jazzy, smooth' },
  { label: 'Minor 7', value: 'm7', desc: 'Mellow, soulful' },
  { label: 'Dominant 7', value: '7', desc: 'Bluesy, tension' },
  { label: 'Diminished 7', value: 'dim7', desc: 'Tense, horror, passing' },
  { label: 'Minor 9', value: 'm9', desc: 'Deep, emotional' },
  { label: 'Add 9', value: 'add9', desc: 'Pop, bright' },
  { label: 'Suspended 4', value: 'sus4', desc: 'Open, waiting' },
  { label: 'Augmented', value: 'aug', desc: 'Unsettling, dream sequence' }
];
