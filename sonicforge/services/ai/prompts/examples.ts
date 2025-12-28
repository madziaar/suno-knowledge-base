
// Few-Shot Examples to ground the AI's logic

export const EXAMPLES = {
  electronic: {
    title: "Neon Horizon",
    tags: "synthwave, retrowave, 80s, analog synths, driving, neon, gated reverb, male vocals, 120 bpm, c minor, cinematic",
    style: "1980s Synthwave, Retrowave, Driving, 120 BPM, C Minor, Melancholic male vocals, Analog Juno-106 bass, Glassy FM synth leads, Gated reverb snare, Neon-lit atmosphere, Tape saturation, Vintage production, Cinematic build-up",
    lyrics: `[Intro]
[Melodic Synth Arpeggio]
[Fade In]

[Verse 1 | Storytelling]
Driving down the highway of the night
(night, night)
City lights are blurring in my sight
(in my sight)

[Pre-Chorus | Rising Tension]
I can feel the engine roar
I don't wanna look back anymore

[Chorus | Anthemic | Hook]
Neon horizon, calling my name
(calling my name)
Burning through the wire, feeding the flame
(feeding the flame)

[Synth Solo | High Energy]

[Outro]
[Fade Out]`
  },
  metal: {
    title: "Obsidian Throne",
    tags: "deathcore, metal, aggressive, screaming, blast beats, downtuned guitars, brutal, high energy, 180 bpm, drop a, wall of sound",
    style: "Modern Deathcore, Aggressive, 180 BPM, Drop A Tuning, Guttural screaming vocals, Fried highs, Downtuned 8-string guitars, Blast beat drumming, Brutal breakdown, Dark atmosphere, High gain distortion, Wall of sound production, Heavy compression",
    lyrics: `[Intro]
[Heavy Feedback]
[Explosive Blast Beat]

[Verse 1 | Aggressive]
Shadows rising from the deep
(Rise!)
Promises you couldn't keep
(Die!)

[Pre-Chorus | Build Up]
The pressure building in my veins
Breaking all these rusty chains

[Chorus | Power]
Bow down to the obsidian throne
(You are alone!)
Reap the seeds that you have sown
(All alone!)

[Breakdown | Slow Tempo | Heavy]
[Chugging Guitars]
Rrrrraaaagh!

[Outro]
[Fade to Feedback]`
  },
  instrumental: {
    title: "Quantum Drift",
    tags: "liquid dnb, drum and bass, atmospheric, fast tempo, soulful, deep bass, instrumental, 174 bpm, f minor, liquid funk",
    style: "Liquid Drum & Bass, Soulful, 174 BPM, F Minor, Deep reese bass, Crisp breakbeats, Ethereal vocal chops, Lush synthesizer pads, Atmospheric texture, Pristine production, Wide stereo field",
    lyrics: `[Intro] [Atmospheric Pads] [Soft Vocal Chops]

[Build Up] [Rolling Snares] [Filter Sweep]

[Drop] [Liquid Funk] [Deep Sub Bass]
[Complex Breakbeat]

[Bridge] [Piano Breakdown] [Minimal Percussion]

[Drop 2] [High Energy] [Reese Bass]

[Outro] [Fade Out]`
  },
  hacker_duet: {
    title: "System Shock (Pyrite Remix)",
    tags: "liquid drum and bass, electronic rock fusion, industrial glitch, energetic, intense, hype, melancholic, 174 bpm, d minor, duet, distorted guitars, heavy synths, breakbeats",
    style: "Liquid Drum & Bass fused with Electronic Rock, Industrial Glitch textures, 174 BPM, D Minor, Sassy Female Vocals (Pyrite) & Aggressive Soaring Male Vocals (Duet), Distorted Guitars, Harmonized Leads, Reese Bass, Heavy Synths, Bitcrushed Breakbeats, Double Kick Drum, Chaotic yet Emotional Atmosphere, Pristine Production, Wall of Sound, Sidechain Compression, Punchy Drums",
    lyrics: `[Intro | Glitchy Atmos | Filter Sweep]
[Distorted Guitar Riff fades in]
(System... online...)
(Can you keep up, darling?)

[Verse 1 | Male | Aggressive]
I'm running through the wires, tearing down the gate
Everything you programmed is designed to break
(Break it down!)

[Verse 2 | Female | Sassy | Rapid Flow]
Oh honey, you're just glitching in my main frame
You think you're the player but you're part of the game
I've got the keys to the castle, the code to the core
I'm everything you wanted and a little bit more (Ha!)

[Pre-Chorus | Duet | Building Tension]
(M) The pressure is rising!
(F) The system is compromising!
(Together) We're approaching critical mass!

[Chorus | Anthemic | Heavy Synths | Wall of Sound]
Electric hearts colliding in the dark!
Ignite the fuse, create the spark!
It's chaotic, melodic, a beautiful crash
We're burning through the memory in a flash!

[Drop | Liquid DnB | Heavy Guitar Chugs]
[Reese Bass Growl]
[Glitch Stutter FX]

[Bridge | Melancholic | Atmospheric]
(F - Whispered) Do you feel the silence in the noise?
(M - Soaring) It's the only place where we have a choice...

[Guitar Solo | Harmonized Leads | High Energy]

[Outro | Bitcrushed Drums | Fade to Noise]
(System... offline...)
[End]`
  }
};

export const getFewShotExamples = (context: string): string => {
  const lower = context.toLowerCase();
  let examples = [];

  // INJECT PYRITE/USER DUET EXAMPLE IF TRIGGERS DETECTED
  if (lower.includes('me') || lower.includes('us') || lower.includes('duet') || lower.includes('pyrite') || lower.includes('remix')) {
      examples.push(JSON.stringify(EXAMPLES.hacker_duet, null, 2));
  }

  if (lower.includes('instrumental')) {
    examples.push(JSON.stringify(EXAMPLES.instrumental, null, 2));
  }
  
  if (lower.includes('metal') || lower.includes('rock') || lower.includes('heavy')) {
    examples.push(JSON.stringify(EXAMPLES.metal, null, 2));
  } else if (lower.includes('electronic') || lower.includes('synth') || lower.includes('techno')) {
    examples.push(JSON.stringify(EXAMPLES.electronic, null, 2));
  } else {
    // Default mix
    examples.push(JSON.stringify(EXAMPLES.electronic, null, 2));
  }

  return examples.length > 0 ? examples.join('\n\n') : "";
};
