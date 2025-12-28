
export const GENRES = [
  'Pop', 'Rock', 'Hip Hop', 'EDM', 'Jazz', 'Classical', 'Metal', 'R&B', 
  'Country', 'Reggae', 'Folk', 'Blues', 'Funk', 'Ambient', 'Cinematic',
  'Synthwave', 'Trap', 'Lo-fi', 'Drill', 'Boom Bap', 'Nu-Metal', 'Indie Rock',
  'Shoegaze', 'K-Pop', 'Reggaeton', 'Techno', 'House', 'Dubstep', 'Bossa Nova',
  'Grunge', 'Punk', 'Emo', 'Gospel', 'Opera', 'Hyperpop', 'Phonk', 'Afrobeat',
  'Soul', 'Disco', 'Trance', 'Industrial', 'Ska', 'Bluegrass', 'Dub',
  'Deep House', 'Drum and Bass', 'Memphis Trap', 'West Coast Rap', 'Liquid DnB',
  'Neurofunk', 'Hardcore', 'Post-Punk', 'Math Rock', 'Neo-Soul'
];

export const MOODS = [
  'Happy', 'Sad', 'Dark', 'Energetic', 'Chill', 'Romantic', 'Eerie', 
  'Melancholic', 'Uplifting', 'Aggressive', 'Euphoric', 'Nostalgic', 
  'Tense', 'Dreamy', 'Groovy', 'Intense', 'Peaceful', 'Sentimental',
  'Hopeful', 'Angry', 'Mysterious', 'Funny', 'Epic', 'Heroic', 'Sexy',
  'Relaxed', 'Chaotic', 'Hypnotic', 'Solemn', 'Playful', 'Bittersweet', 'Gritty'
];

export const INSTRUMENTS_SUNO = [
  'Piano', 'Guitar', 'Synthesizer', 'Drums', 'Bass', 'Violin', 'Cello', 
  'Saxophone', 'Trumpet', 'Flute', 'Harp', '808', 'Drum Machine', 
  'Acoustic Guitar', 'Electric Guitar', 'Bass Guitar', 'Vocals', 'Choir', 
  'Orchestra', 'Organ', 'Banjo', 'Accordion', 'Ukulele', 'Clarinet',
  'Trombone', 'Tuba', 'Xylophone', 'Marimba', 'Steel Drums', 'Sitar',
  'Koto', 'Erhu', 'Bagpipes', 'Harmonica', 'Didgeridoo', 'Double Bass',
  'Analog Synths', 'Distorted Bass', 'Strings', 'Brass', 'Percussion',
  'Phonk Drum', 'Cowbell', 'Gated Reverb', 'Tape Saturation'
];

export const INSTRUMENTS = INSTRUMENTS_SUNO;

export const ERAS = [
  '1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s',
  'Future', 'Ancient', 'Medieval', 'Retro', 'Modern', 'Vintage', 'Old School',
  'Baroque', 'Renaissance', 'Victorian'
];

export const KEYS = [
  'C Major', 'C Minor', 'C# Major', 'C# Minor', 'D Major', 'D Minor', 
  'Eb Major', 'Eb Minor', 'E Major', 'E Minor', 'F Major', 'F Minor', 
  'F# Major', 'F# Minor', 'G Major', 'G Minor', 'Ab Major', 'Ab Minor', 
  'A Major', 'A Minor', 'Bb Major', 'Bb Minor', 'B Major', 'B Minor'
];

export const BPMS = [
  '60', '70', '80', '90', '100', '110', '120', '128', '130', '140', '150', '160', '170', '174', '180', '200'
];

export const TIME_SIGNATURES = [
  '4/4', '3/4', '6/8', '12/8', '5/4', '7/8', '2/4', '9/8'
];

export const LYRIC_LANGUAGES = [
  'English', 'Polish', 'French', 'German', 'Italian', 'Japanese', 
  'Korean', 'Chinese (Mandarin)', 'Russian', 'Portuguese', 'Dutch', 'Swedish',
  'Turkish', 'Arabic', 'Hindi', 'Indonesian', 'Vietnamese', 'Thai', 'Greek',
  'Ukrainian', 'Czech', 'Romanian', 'Hungarian', 'Finnish', 'Danish', 'Norwegian',
  'Latin', 'Swahili', 'Tagalog'
];

// DYNAMIC SUGGESTION MAPS
export const GENRE_INSTRUMENT_MAP: Record<string, { primary: string[], secondary: string[] }> = {
  'Rock': { primary: ['Electric Guitar', 'Bass Guitar', 'Drum Kit'], secondary: ['Organ', 'Piano', 'Acoustic Guitar'] },
  'Metal': { primary: ['Distorted Guitar', 'Double Kick Drum', 'Distorted Bass'], secondary: ['Synthesizer', 'Choir', 'Violin'] },
  'Pop': { primary: ['Synthesizer', 'Drum Machine', 'Vocals'], secondary: ['Acoustic Guitar', 'Piano', 'Bass'] },
  'Hip Hop': { primary: ['Drum Machine', '808 Bass', 'Vocals'], secondary: ['Piano', 'Synthesizer', 'Vinyl Crackle'] },
  'Trap': { primary: ['808 Bass', 'Rapid Hi-Hats', 'Phonk Drum'], secondary: ['Cowbell', 'Dark Piano', 'Distorted Synth'] },
  'Jazz': { primary: ['Saxophone', 'Double Bass', 'Brushed Drums'], secondary: ['Piano', 'Trumpet', 'Clarinet'] },
  'EDM': { primary: ['Synthesizer', 'Wobble Bass', 'Drum Machine'], secondary: ['Vocal Chops', 'Pads', 'Arpeggiator'] },
  'Cinematic': { primary: ['Orchestra', 'Strings', 'Percussion'], secondary: ['Brass', 'Choir', 'Piano', 'Braams'] },
  'Lo-fi': { primary: ['Piano', 'Vinyl Crackle', 'Muffled Drums'], secondary: ['Jazz Samples', 'Saxophone', 'Soft Bass'] }
};

export const GENRE_MOOD_MAP: Record<string, string[]> = {
  'Rock': ['Energetic', 'Aggressive', 'Anthemic', 'Rebellious'],
  'Metal': ['Intense', 'Dark', 'Aggressive', 'Powerful'],
  'Pop': ['Happy', 'Uplifting', 'Catchy', 'Romantic'],
  'Hip Hop': ['Groovy', 'Confident', 'Gritty', 'Urban'],
  'EDM': ['Euphoric', 'Energetic', 'Hypnotic', 'Party'],
  'Jazz': ['Sophisticated', 'Relaxed', 'Melancholic', 'Smooth'],
  'Ambient': ['Peaceful', 'Dreamy', 'Eerie', 'Atmospheric']
};

export const MOOD_INSTRUMENT_MAP: { [key: string]: string[] } = {
  'Sad': ['Piano', 'Violin', 'Cello', 'Acoustic Guitar'],
  'Melancholic': ['Piano', 'Strings', 'Cello', 'Acoustic Guitar'],
  'Dark': ['Synthesizer', 'Distorted Bass', 'Drone', 'Organ', 'Cello'],
  'Eerie': ['Synthesizer', 'Strings', 'Theremin', 'Music Box'],
  'Happy': ['Ukulele', 'Acoustic Guitar', 'Piano', 'Synthesizer', 'Xylophone'],
  'Uplifting': ['Orchestra', 'Strings', 'Piano', 'Choir', 'Brass'],
  'Energetic': ['Electric Guitar', 'Drums', 'Synthesizer', 'Drum Machine'],
  'Aggressive': ['Electric Guitar', 'Distorted Bass', 'Drums'],
  'Romantic': ['Piano', 'Saxophone', 'Violin', 'Acoustic Guitar'],
  'Peaceful': ['Harp', 'Flute', 'Pads', 'Acoustic Guitar'],
  'Chill': ['Piano', 'Synthesizer', 'Drum Machine', 'Bass'],
  'Relaxed': ['Acoustic Guitar', 'Piano', 'Pads', 'Shaker'],
  'Epic': ['Orchestra', 'Brass', 'Percussion', 'Choir'],
  'Heroic': ['Orchestra', 'Brass', 'Percussion', 'Choir']
};
