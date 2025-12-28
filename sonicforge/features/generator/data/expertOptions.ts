import { ModifierCategory } from '../../../types';

export const SECTION_TYPES = [
  'Intro',
  'Verse',
  'Pre-Chorus',
  'Chorus',
  'Post-Chorus',
  'Bridge',
  'Bridge with Ostinato',
  'Solo',
  'Instrumental',
  'Instrumental Fade Out',
  'Drop',
  'Build-up',
  'Breakdown',
  'Outro',
  'Silence',
  'Heavy Female Screaming Section',
  'Transition Section',
  'Vocalize',
  'End'
];

export const MODIFIER_CATEGORIES: ModifierCategory[] = [
  {
    id: 'energy',
    name: 'Energy',
    options: ['High Energy', 'Low Energy', 'Build-up', 'Explosive', 'Minimal', 'Acambiano', 'Anthemic', 'Driving', 'Aggressive', 'Frenzied', 'Subdued', 'Restrained']
  },
  {
    id: 'instrumentation',
    name: 'Instrumentation',
    options: ['Instrumental', 'Acoustic', 'Synthesized', 'Heavy', 'Stripped Back', 'Orchestral', 'Drum Fill', 'Bass Solo', 'Guitar Solo', 'Distorted Guitar', 'Synth Solo', 'Phonk Drum', '808 Bass', 'Double Kick', 'Blast Beats', 'Walking Bass']
  },
  {
    id: 'vocals',
    name: 'Vocals',
    options: ['Spoken Word', 'Whisper', 'Scream', 'Choir', 'Gang Vocals', 'Autotune', 'Harmonies', 'Ad-libs', 'Microtonal', 'Vibrato', 'Guttural', 'Falsetto', 'Belted', 'Call & Response', 'Vocoder']
  },
  {
    id: 'mood',
    name: 'Mood',
    options: ['Melancholic', 'Eerie', 'Euphoric', 'Dark', 'Bright', 'Aggressive', 'Emotional', 'Hopeful', 'Haunting', 'Dreamy', 'Triumphant', 'Nostalgic', 'Sentimental']
  },
  {
    id: 'tech',
    name: 'Advanced Audio / Tech',
    options: [
      'Wide Stereo', 'Tape Saturation', 'Pristine', 'Lo-Fi', 'Bitcrushed', 'Gated Reverb', 
      'Atmospheric', 'Dry Mix', 'Wet Mix', 'Sidechain Compression', 'Multiband Compression',
      'Granular Synthesis', 'Comb Filtering', 'Reverse Reverb', 'Tape Stop', 'Glitch',
      'Ping-Pong Delay', 'Haas Effect', 'Brickwall Limiter', 'Analog Warmth'
    ]
  }
];

// Flattened list for backward compatibility if needed, though we should prefer categories
export const SECTION_MODIFIERS = MODIFIER_CATEGORIES.flatMap(c => c.options);
