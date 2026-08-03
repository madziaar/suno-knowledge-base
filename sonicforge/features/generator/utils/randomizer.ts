
import { GENRES, MOODS, INSTRUMENTS } from '../data/autocompleteData';

const CONCEPTS = [
  "A cyberpunk detective falls in love with a hologram glitch.",
  "An epic battle between a dragon and a starship in orbit.",
  "The quiet melancholy of a coffee shop at 3 AM in Tokyo.",
  "A folk song about a ghost who haunts a broken jukebox.",
  "Industrial revolution workers revolt using steam-powered mechs.",
  "A vampire struggling to adapt to modern influencer culture.",
  "The feeling of driving through a neon city while crying.",
  "An AI realizing it has a soul during a system update.",
  "A diss track directed at the concept of time itself.",
  "A love letter written in binary code found in an old server.",
  "Space pirates singing a shanty about black holes.",
  "A medieval bard who accidentally travels to the year 3000."
];

export const generateRandomConcept = () => {
  const genre = GENRES[Math.floor(Math.random() * GENRES.length)];
  const mood = MOODS[Math.floor(Math.random() * MOODS.length)];
  
  // Pick 3 random instruments
  const shuffledInstruments = [...INSTRUMENTS].sort(() => 0.5 - Math.random());
  const selectedInstruments = shuffledInstruments.slice(0, 3).join(', ');
  
  const concept = CONCEPTS[Math.floor(Math.random() * CONCEPTS.length)];

  return {
    genre,
    mood,
    instruments: selectedInstruments,
    intent: concept
  };
};
