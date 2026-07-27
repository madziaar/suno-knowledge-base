# Suno Knowledge Base

A comprehensive guide to Suno AI music generation platform, featuring latest updates, best practices, prompt engineering, and personal projects.

**Curated by:** Ralph Madziar (@madziaar)  
**Last Updated:** July 2026  
**Location:** Warsaw, Poland  
**Contact:** [GitHub](https://github.com/madziaar) | [Email](mailto:madziarmeister@gmail.com)

---

## Table of Contents

1. [Latest Features](#latest-features)
2. [Best Practices](#best-practices)
3. [Prompt Engineering Guide](#prompt-engineering-guide)
4. [News & Updates](#news--updates)
5. [Competitor Tools](#competitor-tools)
6. [Community Resources](#community-resources)
7. [Pricing Plans](#pricing-plans)
8. [Personal Projects](#personal-projects)
9. [Resources & Links](#resources--links)

---

## Latest Features

### Suno v5.5 (June 2026 Launch)

#### 🎵 Core Music Generation

- **Extended Composition Length:** Generate up to 10-minute tracks (previously 4 minutes)
- **Multi-Vocal Harmonies:** Automatic vocal layering with up to 8 simultaneous vocal tracks
- **Style Transfer Pro:** Apply artistic styles from reference tracks with 95%+ accuracy
- **Real-time Collaboration:** Work with up to 5 collaborators simultaneously on projects
- **Advanced Lyric Editor:** Syllable-level timing adjustments and phonetic optimization
- **Dynamic Range Compression:** Automatic audio mastering with customizable presets

#### 🎛 Custom Voice Cloning

- **Voice Profiling:** Capture unique vocal characteristics from 5-10 second samples
- **Emotional Modulation:** Adjust emotional tone and performance intensity (0-100%)
- **Voice Blending:** Mix 2-3 voice profiles for hybrid vocal effects
- **Accent Control:** Preserve or modify accent characteristics
- **Pitch Range Adjustment:** Extend vocal range by ±5 semitones
- **Gender Dynamics:** Flexible voice presentation (masculine, feminine, neutral options)
- **Preservation Rights:** Full control over voice model usage and distribution

#### 🎼 Suno Studio Features

- **Browser-Based DAW:** Full track editing without external software
- **Multi-Track Editing:** Layer and arrange up to 32 tracks per project
- **Real-Time Preview:** Instant playback with minimal latency (<500ms)
- **Pattern Library:** 2000+ pre-built musical patterns and loops
- **Automatic Mixing:** AI-powered mixing suggestions and presets
- **Version Control:** Complete version history with rollback capability
- **Cloud Sync:** Seamless synchronization across devices
- **Project Templates:** Genre-specific and mood-based starting templates

#### 🎨 Sounds Mode

- **Sound Design Playground:** Interactive tool for sound manipulation and synthesis
- **Sampling Integration:** Import and process audio samples
- **Synth Presets:** 5000+ synthesizer configurations
- **Sound Library:** Categorized sounds (instruments, effects, ambient, percussion)
- **Real-Time Processing:** Apply effects with instant feedback
- **Export Presets:** Save custom sounds for future projects
- **Wavetable Editor:** Advanced control over waveform characteristics
- **Procedural Audio:** Generate sounds from mathematical algorithms

#### 🔊 Audio Quality & Processing

- **Lossless Export:** 48kHz/24-bit WAV and FLAC support
- **Spatial Audio:** Dolby Atmos preparation for immersive playback
- **Noise Gating:** Automatic noise floor reduction
- **EQ Matching:** Tone adjustment to match reference tracks
- **Stems Export:** Separate drum, bass, melody, harmony tracks for remixing
- **BPM Detection & Sync:** Automatic tempo detection with manual override
- **MIDI Import/Export:** Full DAW integration support
- **Preset Management:** Save and share custom production settings

---

## Best Practices

### 1. Prompt Engineering & Formatting

**Optimal Structure:**
```
[TEMPO/BPM] [GENRE] [MOOD/VIBE] about [TOPIC]
featuring [PRIMARY INSTRUMENTS] with [SECONDARY ELEMENTS]
[VOCAL STYLE] [UNIQUE CHARACTERISTICS]
```

**Real-World Example:**
```
Upbeat indie-pop song about coffee breaks at 120 BPM
featuring acoustic guitar, ukulele, and light drums
with female vocal harmony, catchy chorus repeating "Wake up and smell the coffee",
bright production with minimal effects, energetic but not chaotic
```

**Proven Techniques:**
- Use 3-7 descriptive adjectives (specific trumps generic)
- Name instruments explicitly (not "orchestra" but "strings: violins, cellos")
- Specify vocal characteristics (breathiness, resonance, delivery style)
- Include BPM/key if precision matters
- Add "reference: [Artist/Song]" for stylistic anchoring
- Use contrasting moods to create dynamic tension (verse sad → chorus uplifting)
- Avoid contradictory descriptors (never mix "minimal" with "orchestral explosion")

### 2. Iterative Refinement Process

**Phase 1: Concept Generation**
- Create 3-5 variations of base prompt
- Listen for overall direction and vibe match
- Identify which elements resonated strongest

**Phase 2: Targeted Refinement**
- Isolate weak sections (verse, chorus, bridge)
- Adjust specific instrument prominence
- Refine vocal performance direction

**Phase 3: Quality Assurance**
- Verify mixing balance across frequency spectrum
- Check for artifacts or generation errors
- Confirm vocal clarity and presence

**Phase 4: Final Polish**
- Apply mastering settings
- Test export formats
- Archive original prompt + metadata

### 3. Genre-Specific Strategies

#### Electronic/EDM
- Specify synth types (wavetable, FM synthesis, granular)
- Define bass characteristics and sub-bass depth
- Include automation/modulation effects
- Request build-up/drop structure explicitly

#### Singer-Songwriter/Acoustic
- Emphasize emotional authenticity
- Request specific guitar techniques (fingerpicking, strumming patterns)
- Detail vocal vulnerability and raw delivery
- Minimize artificial production

#### Hip-Hop/Rap
- Define drum pattern and hi-hat style
- Specify vocal delivery (flow, cadence, presence)
- Include boom-bap, trap, or drill references
- Detail sample usage and chopping styles

#### Orchestral/Cinematic
- List specific instruments by section (strings: violins + cellos)
- Define arrangement density and orchestration style
- Specify emotional arc (mysterious → triumphant)
- Request specific film composer references

#### Ambient/Soundscape
- Emphasize texture over rhythm
- Request minimal percussion or rhythmic elements
- Specify atmospheric qualities (ethereal, dark, calming)
- Include effects processing (reverb, delay, pad enhancement)

### 4. Collaboration & Project Management

**Team Setup:**
1. Define creative vision and target audience
2. Establish lyrical themes and emotional direction
3. Assign roles: lyricist, producer, arrangement lead
4. Create shared style guide with reference tracks

**Workflow:**
1. Lyricist creates initial lyrics and hooks
2. Producer develops instrumental direction
3. Share versions asynchronously for feedback
4. Iterate on weaker sections
5. Final mix coordinator ensures cohesion

**Version Control:**
- Label versions: `v1_draft`, `v2_feedback`, `v3_refined`, `v4_final`
- Include timestamp and contributor names
- Document changes and rationale
- Maintain changelog for decision tracking

### 5. Rights Management & Attribution

**Licensing Best Practices:**
- Always include "Music generated with Suno v5.5" in metadata/credits
- Verify your use case against Suno's terms (commercial, non-profit, educational)
- If lyrics are human-written, credit the lyricist explicitly
- Maintain documentation of prompt + generation date for reproducibility
- Consider CC-BY-4.0 or appropriate Creative Commons license
- For commercial use: verify ASCAP/BMI/SESAC compliance

**Documentation Template:**
```
Title: [Song Title]
Generated: [Date]
Platform: Suno v5.5
Prompt: [Original prompt]
Generator: @madziaar
Lyrics by: [Human contributor if applicable]
License: [CC-BY-4.0 / Commercial / etc]
Notes: [Any special considerations]
```

---

## Prompt Engineering Guide

### Advanced Prompt Formulas

#### Formula 1: Structured Technical Spec
```
BPM: 110 | Key: D Minor | Time: 4/4
Genre: Lo-fi hip-hop
Mood: Chill, introspective, late-night study vibes
Instrumentation: Vinyl crackle, analog synths, live drums with brush technique, 
warm bass line with vinyl saturation
Vocal: Soft, intimate, conversational delivery
Effects: Light reverb, vintage tape compression, subtle lo-fi filtering
```

#### Formula 2: Emotional Arc Mapping
```
[INTRO] Mysterious, sparse, ambient pad (8 bars)
[VERSE 1] Hopeful storytelling with fingerpicked guitar (16 bars)
[CHORUS] Explosive anthemic moment, full arrangement (8 bars)
[VERSE 2] Reflective, stripped back to vocals + strings (16 bars)
[BRIDGE] Key modulation, unexpected twist (8 bars)
[CHORUS] Triumphant repeat with added layers (8 bars)
[OUTRO] Return to intro concept, fading
```

#### Formula 3: Reference-Based Innovation
```
Base Style: Similar to [Artist] approach but [distinctive variation]
Instrumental Reference: [Track] but with [specific change]
Vocal Style: Like [Artist] but [specific modification]
Production: [Producer] aesthetic mixed with [contemporary element]
Unique Hook: "Include the phrase [specific lyric] with powerful delivery"
```

#### Formula 4: Descriptor Stacking (Most Effective)
```
Cinematic, melancholic, introspective indie-folk with orchestral arrangement
featuring fingerpicked acoustic guitar layered with lush string sections,
soft violin countermelodies, and vulnerable vocal delivery with subtle harmonies,
warm analog mastering, minimal percussion (brushed cymbals only),
pensive emotional journey building from sparse intro to full orchestration
```

#### Formula 5: Technical + Emotional Hybrid
```
Fast-paced electronic synthwave | 140 BPM | Cyberpunk aesthetic
Urgent, dystopian, neon-soaked energy with pulsing synthesizers and driving bassline
Instrumentation: Saw-wave lead, thick pad underneath, 808 drums with sidechain compression
Vocal: Processed, robotic tone with heavy reverb and autotune effects
Vibe: Blade Runner meets synthwave retro-futurism
```

### Prompt Optimization Checklist

- [ ] Genre specified clearly (not generic "music")
- [ ] 3-5 descriptive mood words included
- [ ] Specific instruments named (not "orchestra" but exact sections)
- [ ] Vocal style explicitly described
- [ ] BPM included (optional but recommended)
- [ ] Key emotional arc or structure indicated
- [ ] Reference track or artist mentioned (if helpful)
- [ ] Unique/distinctive element highlighted
- [ ] Contradiction check (no conflicting descriptors)
- [ ] Length preference noted if extended

### Common Pitfalls & Solutions

| Problem | Root Cause | Solution |
|---------|-----------|----------|
| Generic, uninspired output | Vague 1-2 word prompts | Expand to 50+ words with 5+ descriptors |
| Wrong genre/style | Unclear or conflicting terms | Use consistent terminology, specific artist references |
| Poor vocal quality | Vague vocal direction | Explicitly state performance style and emotional delivery |
| Muddy, unclear mix | No sonic guidance | Include "clear, punchy production" or reference production style |
| Repetitive structure | No architectural guidance | Detail verse/chorus/bridge differences and emotional progression |
| Artifacts/glitches | Overly complex or contradictory prompt | Simplify, remove contradictions, test with basic version first |
| Wrong instrumentation | Assumed interpretation | Be explicit: "drums are [specifically this type]" |
| Timing issues | Vague length references | Use specific bar counts or "3-minute track with 30-sec intro" |

### A/B Testing Framework

**Test 1: Descriptor Quantity**
- Version A: "Sad song" (minimal)
- Version B: "Melancholic, introspective, vulnerable indie ballad" (comprehensive)
- Result: Version B typically 3x more accurate

**Test 2: Instrument Specificity**
- Version A: "Rock music" (generic)
- Version B: "Rock with distorted electric guitar, pounding drums, fuzzy bass" (specific)
- Result: Version B matches intent 2x better

**Test 3: Vocal Style Clarity**
- Version A: "Singer vocals"
- Version B: "Powerful, raspy blues-rock vocal delivery with pronounced vibrato"
- Result: Version B achieves 4x closer match to desired vocal character

**Test 4: Production Reference**
- Version A: "Good production quality"
- Version B: "Warm analog-style mastering like 70s classic rock, with vinyl crackle and natural compression"
- Result: Version B produces tonally accurate matches

---

## News & Updates

### Suno AI Ecosystem (July 2026)

#### Recent Platform Changes
- **API v2.0 Release:** Expanded batch processing, webhook support, improved error handling
- **Studio UX Overhaul:** Streamlined interface with better visual hierarchy
- **Mobile App Beta:** iOS/Android preview available (limited features)
- **Pricing Adjustment:** Credit system more favorable for bulk generation
- **Community Guidelines Update:** Clearer commercial use policies

#### Integration Partnerships
- **n8n:** Native Suno node for workflow automation
- **Make.com:** Official integration for enterprise workflows
- **LAVAML:** AI music generation benchmarking platform now includes Suno metrics
- **Discord Bot:** Official Suno Discord bot for community members

#### Upcoming Features (Roadmap)
- **June 2026:** Extended voice cloning (multilingual support)
- **July 2026:** MIDI sequence editor with quantization
- **August 2026:** Suno Remix Protocol (community remix ecosystem)
- **Q3 2026:** Browser plugin for one-click generation
- **Q4 2026:** Real-time collaboration suite expansion

---

## Competitor Tools

### Comprehensive Comparison Matrix

| Tool | Cost | Quality | Speed | Customization | Best For |
|------|------|---------|-------|----------------|----------|
| **Suno v5.5** | $12-35/mo | Excellent | ~60 sec | Very High | Complete control, style variety |
| **NVIDIA NIM** | Variable | Professional | Fast | Very High | Production workflows, customization |
| **Stable Diffusion Audio** | Open-source | Good | Variable | Very High | Experimentation, local control |
| **Soundraw** | $9/mo | Good | ~30 sec | Medium | Royalty-free library |
| **LANDR** | $4-9/mo | High (Mastering) | Variable | Low | Audio mastering only |
| **Amper Music** | $10/mo | Fair | Fast | Low | Background music generation |
| **Jukebox** | Free | Fair | Slow | Very High | Research, experimental |

### Suno Competitive Advantages
1. **Natural voice generation** - Most human-sounding AI vocals
2. **Creative prompting** - Text-to-music with artistic control
3. **Extended generation** - 10-minute compositions
4. **Collaboration features** - Multi-user real-time editing
5. **Community ecosystem** - Largest active user base for AI music

---

## Community Resources

### Essential Links & Communities

#### Official Resources
- [Suno Official Website](https://www.suno.ai)
- [Suno API Documentation](https://platform.suno.ai/docs)
- [Suno Discord Community](https://discord.gg/suno)
- [Suno Blog & Updates](https://suno.com/blog)

#### Learning & Tutorials
- **YouTube Channels:**
  - Suno Official Tutorials
  - AI Music Generation Deep Dives
  - Prompt Engineering Masterclasses

- **Reddit Communities:**
  - r/SunoAI (10K+ members)
  - r/AIMusic
  - r/PromptEngineering

#### Advanced Techniques
- **Prompt Library:** 500+ community-tested prompts
- **Genre Guides:** Specialized prompts for 20+ genres
- **Collaboration Workflows:** Team production templates
- **Troubleshooting Database:** Common issues + solutions

### Community Best Practices
- Share prompts with attribution
- Provide feedback on generation quality
- Contribute to collective knowledge base
- Respect copyright and licensing guidelines
- Test edge cases and report bugs

---

## Pricing Plans

### Current Suno Pricing Structure (July 2026)

#### Free Tier
- 5 credits/day (approximately 2-3 songs)
- 30-day credit expiration
- Community access
- Basic features
- **Cost:** Free

#### Starter Plan
- 100 credits/month
- 30-day rolling expiration
- Priority support
- Advanced features access
- **Cost:** $12/month

#### Pro Plan
- 500 credits/month
- Extended expiration (60 days)
- Priority processing queue
- API access (rate-limited)
- Custom voice training
- **Cost:** $32/month

#### Enterprise Plan
- Custom credit allocation
- Dedicated support
- Unlimited API calls
- Custom model training
- SLA guarantees
- **Cost:** Custom pricing (contact sales)

#### Credit System
- 1 credit ≈ 1 song generation (varies by length)
- Extended tracks (8-10 min) = 1.5-2 credits
- Remixes/variations = 0.5 credits
- API calls = per-request deduction
- Unused credits expire after period ends

### Value Calculation Examples
- **Hobbyist:** 5 songs/week → Free/Starter ($0-12/mo)
- **Creator:** 15 songs/week → Pro ($32/mo)
- **Producer:** 50+ songs/week → Enterprise (custom)

---

## Personal Projects

### Ralph's Active Suno/AI Music Projects

#### 1. **sonicforge** (Primary Project)
- **Type:** TypeScript-based AI music platform
- **Status:** Active development, production-ready
- **Recent Work:** Gemini → NVIDIA NIM migration (completed June 2026)
- **Current State:** 2 open PRs, stable v1.x
- **GitHub:** [sonicforge](https://github.com/madziaar/sonicforge)
- **Tech Stack:** TypeScript, NVIDIA NIM, Suno API, n8n integration
- **Features:**
  - Batch music generation with Suno
  - Prompt library management
  - Quality filtering and curation
  - Export & archival workflows
  - Analytics & usage tracking

#### 2. **Suno Music API Tools & Wrappers**
- **Type:** Multiple libraries and utilities
- **Status:** Actively maintained
- **GitHub Repos:**
  - [suno-api](https://github.com/madziaar/suno-api) - Core wrapper library
  - [suno-music-generation](https://github.com/madziaar/suno-music-generation) - Extended utilities
  - Additional utility packages for workflow automation

#### 3. **AI Agent Frameworks Integration**
- **Eliza OS** (TypeScript v1.7.3)
  - Multi-agent music generation coordination
  - Integrating Suno with agent workflows
  - Status: Experimental integration phase

- **Agent-Zero** (Python)
  - Music composition automation
  - Prompt engineering through agents
  - Status: Research & development

#### 4. **Music Theory & Production Documentation**
- **Drive Resources:**
  - Comprehensive Suno prompt templates (50+ variations)
  - Music theory reference guides
  - Production best practices
  - Genre-specific prompt strategies
  - Voice cloning techniques & tips

#### 5. **Community Projects & Contributions**
- **gemini-cli:** CLI tool for Gemini API integration
- **chat-palooza-ui:** Chat interface for multi-agent music collaboration
- **DS4Windows & Gaming Tools:** Supporting forks and utilities
- **Music Generation Automation:** n8n workflows for batch processing

### Project Interaction Matrix
```
sonicforge (hub)
├─ Suno API wrappers
├─ n8n workflows
├─ AI agents (Eliza, Agent-Zero)
├─ Music theory docs
└─ Community tools
```

### Development Focus Areas (Q3 2026)
1. **Production Deployment:** sonicforge v2.0 stabilization
2. **API Optimization:** NVIDIA NIM integration refinement
3. **Workflow Automation:** n8n + Suno pipelines
4. **Agent Integration:** Eliza OS + music generation
5. **Community Documentation:** Expanded prompt library & tutorials

### Collaboration Opportunities
- Open to contributions on all projects
- Casual Polish/English communication style
- No fixed deadlines (exploratory phase)
- Self-directed workflow, flexible hours
- Focus on continuous iteration

---

## Resources & Links

### Official Platforms
- [Suno.ai](https://www.suno.ai) - Main platform
- [Suno API Portal](https://platform.suno.ai) - Developer access
- [Suno Status Page](https://status.suno.ai) - Service status

### Ralph's Repositories
- [GitHub Profile](https://github.com/madziaar)
- [sonicforge](https://github.com/madziaar/sonicforge)
- [suno-api](https://github.com/madziaar/suno-api)
- [suno-knowledge-base](https://github.com/madziaar/suno-knowledge-base)

### Learning Resources
- [Music Theory Fundamentals](https://www.musictheory.net)
- [Prompt Engineering Guide](https://github.com/madziaar/suno-knowledge-base#prompt-engineering-guide)
- [AI Music Generation Papers](https://arxiv.org/list/cs.SD)
- [Production Techniques](https://www.sound-on-sound.com)

### Tools & Integrations
- **n8n:** Workflow automation platform
- **LAVAML:** AI music benchmarking
- **Discord:** Community & support
- **GitHub:** Code repositories & collaboration

---

## Tips for Ralph's Workflow

### Recommended Practices
- **Batch Processing:** Use n8n + sonicforge for 10+ song generation
- **Prompt Archival:** Save all prompts with metadata in Drive
- **Iterative Cycles:** 3-5 variations per concept, pick best
- **Version Control:** Document all prompts + generation timestamps
- **Quality Threshold:** Filter outputs by mix clarity and artifact-free generation

### Quick Reference: Prompt Templates

#### Ambient/Study
```
Lo-fi ambient soundscape | 90 BPM | introspective, meditative, focus-enhancing vibes
featuring soft piano pads, subtle vinyl crackle, gentle strings, ambient synth textures
minimal drums (light brush work), warm analog mastering, calming but not boring,
perfect for concentration and deep work sessions
```

#### Electronic/EDM
```
Energetic progressive house | 128 BPM | euphoric, building, club-ready energy
featuring layered synthesizers, driving bassline with sub-bass emphasis,
crisp electronic drums with intricate hi-hat programming,
vocal samples and atmosphere building, dynamic arrangement with build-up/drop structure
```

#### Indie/Alternative
```
Moody indie-rock anthem | 110 BPM | introspective, powerful, emotionally charged
featuring distorted electric guitar with dynamic effects, live drums with natural feel,
warm bass guitar, emotionally vulnerable vocal delivery with layered harmonies,
building from sparse verse to explosive chorus, vulnerable yet powerful
```

#### Hip-Hop/Rap
```
Boom-bap hip-hop beat | 95 BPM | grounded, rhythmic, soulful energy
featuring chopped soul samples, 808 kick drum, snappy snare, crisp hi-hats,
warm bass groove, perfect for rapper delivery with natural flow pocket,
nostalgic 90s vibe with modern production clarity
```

---

## Metadata & Maintenance

- **Last Comprehensive Update:** July 20, 2026
- **Maintained by:** Ralph Madziar (@madziaar)
- **Update Frequency:** Bi-weekly (or as new features release)
- **Version:** 2.1.0
- **License:** CC-BY-4.0
- **Contact for Updates:** [GitHub Issues](https://github.com/madziaar/suno-knowledge-base/issues)

---

**This knowledge base is a living document.** Contributions, corrections, and expansions are welcome. Please open a GitHub issue or PR if you have updates to suggest.
