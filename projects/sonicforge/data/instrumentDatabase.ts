
// This database provides structured options for the InstrumentDesigner component.

export const PRIMARY_INSTRUMENTS = [
  'Guitar', 'Bass', 'Drums', 'Piano', 'Synth', 'Strings', 'Brass'
];

export const INSTRUMENT_MODIFIERS: Record<string, string[]> = {
  'Guitar': ['Acoustic', 'Electric', 'Distorted', 'Clean', 'Jangly', 'Fuzz', 'Slide', 'Lead', 'Rhythm', 'Palm-muted'],
  'Bass': ['Electric Bass', 'Upright Bass', 'Sub Bass', 'Fretless Bass', 'Synth Bass', 'Slap Bass', 'Distorted Bass'],
  'Drums': ['Acoustic Drum Kit', 'Drum Machine', 'TR-808', 'TR-909', 'LinnDrum', 'Blast Beats', 'Breakbeats', 'Brushed Drums'],
  'Piano': ['Grand Piano', 'Upright Piano', 'Electric Piano', 'Rhodes', 'Wurlitzer', 'Harpsichord'],
  'Synth': ['Analog Synth', 'Digital Synth', 'Modular Synth', 'Synth Pad', 'Synth Lead', 'Arpeggiated Synth', 'Wobble Synth'],
  'Strings': ['Violin', 'Viola', 'Cello', 'Double Bass', 'String Section', 'Pizzicato Strings', 'Orchestral Strings'],
  'Brass': ['Trumpet', 'Trombone', 'Saxophone', 'Tuba', 'French Horn', 'Brass Section']
};

export const LESS_COMMON_INSTRUMENTS = [
    'Organ', 'Accordion', 'Mandolin', 'Banjo', 'Ukulele', 'Harp', 'Sitar', 'Koto', 'Erhu',
    'Bagpipes', 'Harmonica', 'Didgeridoo', 'Xylophone', 'Marimba', 'Vibraphone', 'Steel Drums',
    'Theremin', 'Oud', 'Lute', 'Dulcimer'
];
