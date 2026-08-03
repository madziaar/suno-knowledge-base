
export type TagCategory =
  | 'genre'
  | 'subgenre'
  | 'vocals'
  | 'instruments'
  | 'tempo'
  | 'mood'
  | 'production'
  | 'technique'
  | 'cultural'
  | 'quality'
  | 'fx'
  | 'era'
  | 'structure'
  | 'transition'
  | 'sound_effect'
  | 'ending'
  | 'dynamic';

export interface SunoTag {
  id: string;
  name: string; // Strictly lowercase
  category: TagCategory;
  description: {
    en: string;
    pl: string;
  };
  bpmRange?: [number, number];
  compatibility?: string[]; // IDs of compatible tags
  impact: 'high' | 'medium' | 'low'; // How strongly this affects generation
  frequency: number; // 0-100 usage frequency score
}

// THE DATABASE
export const sunoMetaTags: SunoTag[] = [
  // --- 1. GENRE FOUNDATION ---
  { id: 'g_pop', name: 'pop', category: 'genre', description: { en: 'Popular music, catchy hooks', pl: 'Muzyka popularna, chwytliwe refreny' }, impact: 'high', frequency: 95 },
  { id: 'g_rock', name: 'rock', category: 'genre', description: { en: 'Guitar-driven, energetic', pl: 'Muzyka gitarowa, energiczna' }, impact: 'high', frequency: 90 },
  { id: 'g_hiphop', name: 'hip hop', category: 'genre', description: { en: 'Rhythmic vocal style, beats', pl: 'Rytmiczny styl wokalny, bity' }, impact: 'high', frequency: 90 },
  { id: 'g_edm', name: 'edm', category: 'genre', description: { en: 'Electronic dance music', pl: 'Elektroniczna muzyka taneczna' }, impact: 'high', frequency: 85 },
  { id: 'g_jazz', name: 'jazz', category: 'genre', description: { en: 'Improvisational, swing, complex harmony', pl: 'Improwizacja, swing, złożona harmonia' }, impact: 'high', frequency: 60 },
  { id: 'g_classical', name: 'classical', category: 'genre', description: { en: 'Orchestral, formal structure', pl: 'Orkiestrowa, formalna struktura' }, impact: 'high', frequency: 50 },
  { id: 'g_metal', name: 'metal', category: 'genre', description: { en: 'Heavy distortion, aggressive', pl: 'Ciężki przester, agresja' }, impact: 'high', frequency: 70 },
  { id: 'g_rnb', name: 'r&b', category: 'genre', description: { en: 'Rhythm and blues, soulful', pl: 'Rhythm and blues, z duszą' }, impact: 'high', frequency: 75 },
  { id: 'g_country', name: 'country', category: 'genre', description: { en: 'American folk origin, storytelling', pl: 'Amerykański folk, opowiadanie historii' }, impact: 'high', frequency: 65 },
  { id: 'g_reggae', name: 'reggae', category: 'genre', description: { en: 'Jamaican style, offbeat rhythm', pl: 'Styl jamajski, rytm na "i"' }, impact: 'high', frequency: 50 },
  { id: 'g_folk', name: 'folk', category: 'genre', description: { en: 'Traditional instruments, acoustic', pl: 'Tradycyjne instrumenty, akustyczne' }, impact: 'high', frequency: 55 },
  { id: 'g_blues', name: 'blues', category: 'genre', description: { en: 'Melancholic, 12-bar structure', pl: 'Melancholijny, struktura 12-taktowa' }, impact: 'high', frequency: 50 },
  { id: 'g_funk', name: 'funk', category: 'genre', description: { en: 'Groove-based, syncopated bass', pl: 'Oparty na groovie, synkopowany bas' }, impact: 'high', frequency: 60 },
  { id: 'g_ambient', name: 'ambient', category: 'genre', description: { en: 'Atmospheric, focusing on timbre', pl: 'Atmosferyczny, skupiony na barwie' }, impact: 'high', frequency: 45 },
  { id: 'g_cinematic', name: 'cinematic', category: 'genre', description: { en: 'Movie soundtrack style, epic', pl: 'Styl ścieżki dźwiękowej, epicki' }, impact: 'high', frequency: 60 },

  // --- 2. SUBGENRE / STYLE ---
  { id: 's_memphis', name: 'memphis trap', category: 'subgenre', description: { en: 'Dark, lo-fi, southern rap style', pl: 'Mroczny, lo-fi, południowy rap' }, impact: 'high', frequency: 80 },
  { id: 's_atlanta', name: 'atlanta trap', category: 'subgenre', description: { en: 'Fast hi-hats, auto-tune, southern', pl: 'Szybkie hi-haty, auto-tune, styl południowy' }, impact: 'high', frequency: 75 },
  { id: 's_westcoast', name: 'west coast gangsta rap', category: 'subgenre', description: { en: 'G-funk, laid back, LA style', pl: 'G-funk, wyluzowany, styl LA' }, impact: 'high', frequency: 70 },
  { id: 's_boom', name: 'boom bap', category: 'subgenre', description: { en: '90s NY style, heavy kick/snare', pl: 'Styl NY lat 90., ciężka stopa/werbel' }, impact: 'high', frequency: 75 },
  { id: 's_synthwave', name: 'synthwave', category: 'subgenre', description: { en: '80s retro-futuristic electronic', pl: 'Retro-futurystyczna elektronika lat 80.' }, impact: 'high', frequency: 80 },
  { id: 's_trap', name: 'trap', category: 'subgenre', description: { en: 'Southern hip hop, rolling hi-hats, 808s', pl: 'Południowy hip hop, szybkie hi-haty, 808' }, impact: 'high', frequency: 85 },
  { id: 's_lofi', name: 'lo-fi hip hop', category: 'subgenre', description: { en: 'Low fidelity, relaxing beats, vinyl crackle', pl: 'Niska wierność, relaksujące bity, trzaski winylu' }, impact: 'high', frequency: 85 },
  { id: 's_drill', name: 'drill', category: 'subgenre', description: { en: 'Dark, violent trap variant, sliding 808s', pl: 'Mroczny, agresywny wariant trapu, ślizgające się 808' }, impact: 'high', frequency: 70 },
  { id: 's_shoegaze', name: 'shoegaze', category: 'subgenre', description: { en: 'Ethereal, distorted guitars, wall of sound', pl: 'Eteryczne, przesterowane gitary, ściana dźwięku' }, impact: 'high', frequency: 50 },
  { id: 's_kpop', name: 'k-pop', category: 'subgenre', description: { en: 'Korean popular music, high production', pl: 'Koreański pop, wysoka produkcja' }, impact: 'high', frequency: 85 },
  { id: 's_reggaeton', name: 'reggaeton', category: 'subgenre', description: { en: 'Latin urban music, dembow beat', pl: 'Latynoska muzyka miejska, rytm dembow' }, impact: 'high', frequency: 80 },
  { id: 's_house', name: 'house', category: 'subgenre', description: { en: 'Four-on-the-floor electronic dance, soulful', pl: 'Muzyka taneczna 4/4, z duszą' }, impact: 'high', frequency: 75 },
  { id: 's_deep_house', name: 'deep house', category: 'subgenre', description: { en: 'Spacious, groovy, bass-focused house', pl: 'Przestrzenny, groovy, basowy house' }, impact: 'high', frequency: 70 },
  { id: 's_drum_and_bass', name: 'drum and bass', category: 'subgenre', description: { en: 'Fast breakbeats, heavy bassline', pl: 'Szybkie bity, ciężki bas' }, impact: 'high', frequency: 75 },
  { id: 's_dubstep', name: 'dubstep', category: 'subgenre', description: { en: 'Bass-heavy, wobble bass, half-time rhythm', pl: 'Ciężki bas, wobble bass, rytm half-time' }, impact: 'high', frequency: 65 },
  { id: 's_grunge', name: 'grunge', category: 'subgenre', description: { en: 'Sludge sound, distorted rock, angsty', pl: 'Brudne brzmienie, przesterowany rock, pełen niepokoju' }, impact: 'high', frequency: 60 },
  { id: 's_punk', name: 'punk rock', category: 'subgenre', description: { en: 'Fast, aggressive, anti-establishment', pl: 'Szybki, agresywny, anty-systemowy' }, impact: 'high', frequency: 65 },
  { id: 's_phonk', name: 'phonk', category: 'subgenre', description: { en: 'Gritty, cowbell-heavy hip hop, distorted', pl: 'Szorstki hip hop z cowbellami, przesterowany' }, impact: 'high', frequency: 60 },

  // --- 3. VOCAL CHARACTERISTICS (KB Expanded) ---
  { id: 'v_female', name: 'female vocal', category: 'vocals', description: { en: 'Sung by a woman', pl: 'Wokal żeński' }, impact: 'high', frequency: 95 },
  { id: 'v_male', name: 'male vocal', category: 'vocals', description: { en: 'Sung by a man', pl: 'Wokal męski' }, impact: 'high', frequency: 95 },
  { id: 'v_ethereal', name: 'ethereal female voice', category: 'vocals', description: { en: 'Otherworldly, light, reverberant', pl: 'Nieziemski, lekki głos' }, impact: 'high', frequency: 55 },
  { id: 'v_powerful', name: 'powerful male vocals', category: 'vocals', description: { en: 'Strong, energetic delivery', pl: 'Silny, energiczny wokal' }, impact: 'high', frequency: 60 },
  { id: 'v_whispered', name: 'whispered', category: 'vocals', description: { en: 'Very quiet, intimate delivery', pl: 'Szeptany, intymny' }, impact: 'medium', frequency: 30 },
  { id: 'v_scream', name: 'screaming', category: 'vocals', description: { en: 'Aggressive metal/hardcore vocals', pl: 'Krzyk, agresywny wokal' }, impact: 'high', frequency: 70 },
  { id: 'v_clean', name: 'clean vocals', category: 'vocals', description: { en: 'Non-distorted singing', pl: 'Czysty śpiew' }, impact: 'high', frequency: 60 },
  { id: 'v_harsh', name: 'harsh vocals', category: 'vocals', description: { en: 'Aggressive, distorted vocals', pl: 'Agresywny, przesterowany wokal' }, impact: 'high', frequency: 60 },
  { id: 'v_guttural', name: 'guttural vocals', category: 'vocals', description: { en: 'Deep, throaty death metal vocals', pl: 'Głęboki, gardłowy wokal' }, impact: 'high', frequency: 50 },
  { id: 'v_autotune', name: 'auto-tune', category: 'vocals', description: { en: 'Pitch-corrected, robotic effect', pl: 'Auto-tune, efekt robota' }, impact: 'high', frequency: 70 },
  { id: 'v_acappella', name: 'a cappella', category: 'vocals', description: { en: 'Vocals only, no instruments', pl: 'Tylko wokal, bez instrumentów' }, impact: 'high', frequency: 20 },
  { id: 'v_angelic', name: 'angelic voice', category: 'vocals', description: { en: 'Pure, heavenly vocals', pl: 'Czysty, niebiański głos' }, impact: 'medium', frequency: 40 },
  { id: 'v_southern', name: 'southern flow', category: 'vocals', description: { en: 'US Southern rap accent', pl: 'Południowy akcent rapu' }, impact: 'high', frequency: 50 },
  { id: 'v_westcoast_accent', name: 'west coast accent', category: 'vocals', description: { en: 'Laid back California rap style', pl: 'Wyluzowany styl kalifornijski' }, impact: 'medium', frequency: 40 },

  // --- 4. PRODUCTION & INSTRUMENTS (v4.5 Expanded) ---
  { id: 'p_fuller_mix', name: 'fuller mix', category: 'quality', description: { en: 'Rich, balanced frequency response', pl: 'Pełniejszy miks' }, impact: 'medium', frequency: 60 },
  { id: 'p_wide_dynamic', name: 'wide dynamic range', category: 'quality', description: { en: 'Greater difference between loud and soft', pl: 'Szeroki zakres dynamiki' }, impact: 'medium', frequency: 50 },
  { id: 'p_phonk', name: 'phonk drum', category: 'production', description: { en: 'Essential for modern trap/hiphop authenticity', pl: 'Kluczowe dla autentyczności trapu' }, impact: 'high', frequency: 80 },
  { id: 'p_gated', name: 'gated reverb', category: 'production', description: { en: '80s drum sound, sharp decay', pl: 'Brzmienie perkusji z lat 80.' }, impact: 'high', frequency: 70 },
  { id: 'p_tape', name: 'tape saturation', category: 'production', description: { en: 'Analog warmth, slight distortion', pl: 'Analogowe ciepło' }, impact: 'high', frequency: 80 },
  { id: 'p_vinyl', name: 'vinyl crackle', category: 'production', description: { en: 'Vintage texture, surface noise', pl: 'Tekstura vintage' }, impact: 'high', frequency: 85 },
  { id: 'p_wide', name: 'wide stereo field', category: 'production', description: { en: 'Spacious, panoramic soundstage', pl: 'Przestrzenna scena' }, impact: 'high', frequency: 75 },
  { id: 'i_808', name: '808 bass', category: 'instruments', description: { en: 'Deep sub bass from TR-808', pl: 'Głęboki bas 808' }, impact: 'high', frequency: 90 },
  { id: 'i_guitar_solo', name: 'guitar solo', category: 'instruments', description: { en: 'Electric guitar lead section', pl: 'Solo gitarowe' }, impact: 'high', frequency: 85 },
  { id: 'i_sax_solo', name: 'saxophone solo', category: 'instruments', description: { en: 'Saxophone lead section', pl: 'Solo saksofonowe' }, impact: 'high', frequency: 60 },
  { id: 'i_piano_solo', name: 'piano solo', category: 'instruments', description: { en: 'Piano lead section', pl: 'Solo fortepianowe' }, impact: 'high', frequency: 65 },
  { id: 'i_drum_break', name: 'drum break', category: 'instruments', description: { en: 'Solo drum section', pl: 'Przerwa perkusyjna' }, impact: 'high', frequency: 70 },
  { id: 'i_bass_drop', name: 'bass drop', category: 'instruments', description: { en: 'Heavy bass impact', pl: 'Bass drop' }, impact: 'high', frequency: 80 },
  { id: 'i_strings', name: 'string section', category: 'instruments', description: { en: 'Orchestral strings', pl: 'Sekcja smyczkowa' }, impact: 'medium', frequency: 70 },

  // --- 5. STRUCTURE & TRANSITIONS (KB Expanded) ---
  { id: 'st_intro', name: 'intro', category: 'structure', description: { en: 'Song introduction', pl: 'Wstęp' }, impact: 'high', frequency: 95 },
  { id: 'st_verse', name: 'verse', category: 'structure', description: { en: 'Storytelling section', pl: 'Zwrotka' }, impact: 'high', frequency: 100 },
  { id: 'st_chorus', name: 'chorus', category: 'structure', description: { en: 'Main hook/refrain', pl: 'Refren' }, impact: 'high', frequency: 100 },
  { id: 'st_bridge', name: 'bridge', category: 'structure', description: { en: 'Contrasting section', pl: 'Mostek' }, impact: 'high', frequency: 80 },
  { id: 'st_outro', name: 'outro', category: 'structure', description: { en: 'Song ending section', pl: 'Zakończenie' }, impact: 'high', frequency: 95 },
  { id: 'st_prechorus', name: 'pre-chorus', category: 'structure', description: { en: 'Build-up before chorus', pl: 'Pre-chorus' }, impact: 'medium', frequency: 70 },
  { id: 'st_instrumental', name: 'instrumental', category: 'structure', description: { en: 'No vocals', pl: 'Instrumental' }, impact: 'high', frequency: 60 },
  
  { id: 'tr_build_up', name: 'build-up', category: 'transition', description: { en: 'Increasing intensity', pl: 'Narastanie' }, impact: 'high', frequency: 85 },
  { id: 'tr_breakdown', name: 'breakdown', category: 'transition', description: { en: 'Stripped-back section', pl: 'Zwolnienie/Breakdown' }, impact: 'high', frequency: 75 },
  { id: 'tr_drop', name: 'drop', category: 'transition', description: { en: 'EDM climax', pl: 'Drop' }, impact: 'high', frequency: 80 },
  { id: 'tr_fade_out', name: 'fade out', category: 'ending', description: { en: 'Gradual volume decrease', pl: 'Wyciszenie' }, impact: 'high', frequency: 90 },
  { id: 'tr_end', name: 'end', category: 'ending', description: { en: 'Clear ending', pl: 'Koniec' }, impact: 'high', frequency: 90 },
  { id: 'tr_inst_fade', name: 'instrumental fade out', category: 'ending', description: { en: 'Music fades after vocals', pl: 'Wyciszenie instrumentalne' }, impact: 'high', frequency: 80 },
  { id: 'tr_transition', name: 'transition section', category: 'transition', description: { en: 'Smooth movement between parts', pl: 'Sekcja przejściowa' }, impact: 'medium', frequency: 50 },
  { id: 'tr_bridge_ostinato', name: 'bridge with ostinato', category: 'structure', description: { en: 'Repeating pattern bridge', pl: 'Mostek z ostinato' }, impact: 'medium', frequency: 40 },

  // --- 6. SOUND EFFECTS & DYNAMICS (KB Expanded) ---
  { id: 'fx_applause', name: 'applause', category: 'sound_effect', description: { en: 'Crowd clapping', pl: 'Oklaski' }, impact: 'medium', frequency: 30 },
  { id: 'fx_cheering', name: 'crowd cheering', category: 'sound_effect', description: { en: 'Crowd noise', pl: 'Wiwaty' }, impact: 'medium', frequency: 35 },
  { id: 'fx_birds', name: 'birds chirping', category: 'sound_effect', description: { en: 'Nature sounds', pl: 'Śpiew ptaków' }, impact: 'medium', frequency: 25 },
  { id: 'fx_phone', name: 'phone ringing', category: 'sound_effect', description: { en: 'Phone sound', pl: 'Dzwonek telefonu' }, impact: 'medium', frequency: 20 },
  { id: 'fx_barking', name: 'barking', category: 'sound_effect', description: { en: 'Dog sounds', pl: 'Szczekanie' }, impact: 'low', frequency: 15 },
  { id: 'fx_whistling', name: 'whistling', category: 'sound_effect', description: { en: 'Whistle sounds', pl: 'Gwiazdanie' }, impact: 'medium', frequency: 30 },
  
  { id: 'dyn_hook', name: 'catchy hook', category: 'dynamic', description: { en: 'Memorable part', pl: 'Chwytliwy fragment' }, impact: 'high', frequency: 60 },
  { id: 'dyn_emotional_bridge', name: 'emotional bridge', category: 'dynamic', description: { en: 'Emotional peak', pl: 'Emocjonalny mostek' }, impact: 'high', frequency: 50 },
  { id: 'dyn_scream_section', name: 'heavy female screaming section', category: 'dynamic', description: { en: 'Intense vocal section', pl: 'Ciężka sekcja krzyku' }, impact: 'high', frequency: 40 }
];

// Helper to format tags for Context Injection in Gemini
export const getHighImpactTagsString = (): string => {
  return sunoMetaTags
    .filter(t => t.impact === 'high')
    .map(t => `${t.category.toUpperCase()}: ${t.name} (${t.description.en})`)
    .join('\n');
};
