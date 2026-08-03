# Suno AI App Implementation Prompts for Code Assistant

## 🔥 LATEST UPDATES - December 2024

**Suno v4.5+ is now live with major new features:**
- **Add Vocals**: Upload instrumentals and add AI vocals with lyrics
- **Add Instrumentals**: Upload vocals and generate backing tracks
- **Inspire**: Generate songs from your playlists
- **8-minute songs**: Extended from 4 minutes
- **Prompt Enhancement Helper**: Built-in creative boost
- **1,200+ genres**: Expanded genre support
- **Improved genre mashups**: Better blending (e.g., midwest emo + neosoul)
- **Enhanced vocals**: Vibrato, whisper-soft to powerful delivery
- **Better audio quality**: Reduced degradation and shimmer
- **Faster generation**: 2x speed improvement
- **v4.5-All**: Free tier now uses v4.5 (replacing v3.5)

**v5 is coming soon** (expected late 2024/early 2025)

---

## Prompt 1: Core Data Structures & Constants

```
I'm building a Suno AI music prompt generator app. Create the core data structures and constants needed.

Requirements:
1. Genre taxonomy with categories (Rock, Pop, Electronic, Hip Hop, Metal, Jazz, Folk, Country, R&B/Soul)
2. Each genre should have: name, sub-genres, typical BPM range, common keys, characteristic instruments
3. Meta tags list (structural, vocal, instrumental, sound effects)
4. Vocal styles (clean, aggressive, ethereal, whispered, etc.)
5. Mood descriptors (dark, upbeat, melancholic, energetic, etc.)
6. Production quality keywords
7. Song structure templates (Pop/Rock, Hip Hop, Electronic, Ballad)

Export as TypeScript interfaces and constants that can be easily imported.
Include at least 50+ genres total across all categories.

Example structure:
```typescript
interface Genre {
  name: string;
  category: string;
  subGenres: string[];
  bpmRange: [number, number];
  commonKeys: string[];
  instruments: string[];
  vocalsStyle: string[];
  characteristics: string[];
}
```

Make it comprehensive and production-ready.
```

---

## Prompt 2: Style Prompt Builder Function

```
Create a function that builds optimized Suno AI style prompts from user inputs.

Function requirements:
- Input: genre, mood, vocals, tempo, key (optional), instruments, production style
- Output: Comma-separated style prompt string optimized for Suno AI
- Should handle multiple genres (blend them intelligently)
- Should order elements optimally: Genre → Sub-genre → Mood → Tempo → Key → Vocals → Instruments → Atmosphere → Production
- Include validation for conflicting styles
- Add optional "enhance" parameter that adds rich descriptors

Example usage:
```javascript
buildStylePrompt({
  genre: ['Heavy Metal', 'Alternative'],
  mood: 'dark',
  vocals: 'ethereal female',
  tempo: 120,
  key: 'B minor',
  instruments: ['guitar', 'piano'],
  enhance: true
})
// Output: "Heavy Metal, Alternative Metal influences, Dark atmosphere, 120 BPM, B minor, Ethereal female vocals with haunting delivery, Distorted guitar riffs, Atmospheric piano melodies, Brooding soundscape, High production value"
```

Use the data structures from Prompt 1.
```

---

## Prompt 3: Meta Tag Formatter & Lyrics Structurer

```
Create functions to format lyrics with proper Suno AI meta tags.

Required functions:

1. `structureLyrics(lyrics: string, structure: StructureType)` 
   - Takes raw lyrics and applies proper song structure
   - Structure types: 'pop', 'hiphop', 'electronic', 'ballad', 'custom'
   - Auto-divides lyrics into sections (verse, chorus, bridge)
   - Adds appropriate meta tags

2. `addMetaTags(section: string, tags: string[])`
   - Adds meta tags to a specific section
   - Validates tag syntax (brackets, capitalization)
   - Returns formatted string

3. `validateMetaTags(lyrics: string)`
   - Checks for proper meta tag formatting
   - Returns errors/warnings
   - Suggests fixes

4. `generateStructure(genre: string, duration: number)`
   - Returns recommended song structure for genre and duration
   - Includes section lengths in bars/lines

Example:
```javascript
const structure = generateStructure('pop', 210); // 3:30 song
// Returns: { intro: 8, verse1: 8, preChorus: 4, chorus: 8, ... }

const formatted = structureLyrics(rawLyrics, 'pop');
// Returns properly tagged lyrics with [Intro], [Verse 1], etc.
```

Include common meta tags list:
- Structural: [Intro], [Verse], [Chorus], [Bridge], [Outro], [Pre-Chorus]
- Instrumental: [Guitar Solo], [Piano Break], [Instrumental]
- Vocal: [Female Vocal], [Male Vocal], [Whispered], [Screaming]
```

---

## Prompt 4: Prompt Enhancement Engine

```
Create a prompt enhancement system that emulates Suno V4.5's "Creative Boost" feature.

Requirements:

1. `enhancePrompt(basicPrompt: string, level: 'light' | 'medium' | 'heavy')`
   - Takes basic prompt and enhances it with rich descriptors
   - Light: Add 2-3 descriptors
   - Medium: Add 5-7 descriptors
   - Heavy: Fully detailed professional prompt

2. Enhancement layers to add:
   - Genre precision (rock → alternative indie rock)
   - Mood expansion (happy → euphoric, uplifting, sun-soaked)
   - Instrumentation details (guitar → jangly clean guitar with chorus effect)
   - Vocal character (vocals → breathy, ethereal delivery with subtle vibrato)
   - Production quality (add: clear mix, mastered, studio quality)
   - Atmospheric texture (warm, intimate, spacious, etc.)

3. `getDescriptorBank(category: string)`
   - Returns appropriate descriptors for: mood, tempo, texture, energy
   - Each category should have 20+ descriptors

4. `analyzePrompt(prompt: string)`
   - Parses existing prompt
   - Returns structured object with detected elements
   - Suggests missing elements

Example:
```javascript
enhancePrompt("sad pop song", "heavy")
// Output: "Melancholic pop ballad, Emotional depth, Heartfelt piano melodies, Subtle string arrangements, Gentle drum patterns, Vulnerable female vocals with slight reverb, Intimate atmosphere, Bittersweet nostalgia, Studio-quality production, Clear emotional delivery, Modern pop production, Warm analog mixing"
```

Create a rich descriptor database organized by categories.
```

---

## Prompt 5: Genre-Specific Template System

```
Build a genre template system with pre-configured prompts for popular genres.

Create templates for at least 20 genres including:
- Heavy Metal
- Indie Rock  
- Synthwave
- Lo-fi Hip Hop
- Deep House
- Trap
- Jazz Fusion
- Acoustic Ballad
- K-pop
- Drum and Bass
- Country Rock
- R&B Soul
- Punk Rock
- Ambient Electronic
- Reggae

Each template should include:
```typescript
interface GenreTemplate {
  name: string;
  stylePrompt: string;
  bpmRange: [number, number];
  recommendedKeys: string[];
  commonStructure: string;
  metaTags: string[];
  tips: string[];
  variations: { name: string; modifications: string }[];
  exampleOutput: string;
}
```

Functions needed:
1. `getGenreTemplate(genre: string)` - Returns full template
2. `customizeTemplate(template, customizations)` - Modify template with user preferences
3. `blendGenres(genre1, genre2)` - Intelligently combine two genre templates
4. `getAllTemplates()` - Returns all available templates for browsing

Example template:
```javascript
{
  name: "Synthwave",
  stylePrompt: "Synthwave, Retro-futuristic, 110 BPM, A minor, Vintage synthesizers, Heavy bass, Robotic vocals, Neon-noir atmosphere, Analog warmth, 80s influence",
  bpmRange: [100, 120],
  recommendedKeys: ["A minor", "D minor", "E minor"],
  commonStructure: "intro-verse-chorus-verse-chorus-bridge-chorus-outro",
  metaTags: ["[Synth Solo]", "[Build-up]", "[Drop]"],
  tips: [
    "Use vintage synth sounds",
    "Add subtle arpeggios",
    "Include retro drum machines"
  ],
  variations: [
    { name: "Dark Synthwave", modifications: "Add darker mood, minor keys, ominous atmosphere" },
    { name: "Dreamwave", modifications: "Softer, more ambient, ethereal vocals" }
  ]
}
```
```

---

## Prompt 6: UI Component Structure

```
Design the React component structure for the Suno AI prompt generator app.

Required components:

1. **PromptBuilder** (main component)
   - Genre selector (multi-select with categories)
   - Mood selector (tags/chips)
   - Vocal style selector
   - Tempo slider (60-200 BPM)
   - Key selector (dropdown)
   - Instrument multi-select
   - Enhancement level toggle
   - Generate button

2. **LyricEditor**
   - Text area for lyrics input
   - Structure selector (pop, hip hop, ballad, etc.)
   - Meta tag insertion buttons
   - Live preview with syntax highlighting
   - Auto-format button
   - Validation warnings

3. **OutputPreview**
   - Style prompt display (copyable)
   - Formatted lyrics display
   - Copy to clipboard button
   - Download as .txt button
   - Variations generator (show 3 alternatives)

4. **GenreExplorer**
   - Browse all genre templates
   - Genre cards with quick preview
   - Filter by category
   - Search functionality

5. **TemplateLibrary**
   - Saved prompts
   - Community templates (optional)
   - Import/Export functionality

Provide component hierarchy and props interfaces:
```typescript
interface PromptBuilderProps {
  onGenerate: (prompt: Prompt) => void;
  initialValues?: Partial<Prompt>;
}
```

Use modern React patterns (hooks, context for global state).
Include Tailwind CSS class suggestions for styling.
```

---

## Prompt 7: Smart Suggestion & Autocomplete System

```
Create an intelligent suggestion system that helps users build better prompts.

Features needed:

1. **Genre Autocomplete**
   - Fuzzy search through 100+ genres
   - Show sub-genres when main genre selected
   - Suggest compatible genre combinations
   - Warn about incompatible combinations

2. **Context-Aware Suggestions**
   - When user selects "Heavy Metal", suggest: aggressive vocals, distorted guitars, 120-160 BPM
   - When user selects "Lo-fi", suggest: chill mood, 80-90 BPM, jazzy elements
   - Dynamic suggestions based on current selections

3. **Meta Tag Autocomplete**
   - Suggest meta tags as user types in lyrics
   - Detect section keywords (verse, chorus) and offer to add tags
   - Template-based suggestions

4. **Instrument Compatibility**
   - Suggest instruments that fit the selected genre
   - Mark unusual combinations (e.g., banjo in techno)
   - Allow override with warning

5. **Mood Combinations**
   - Suggest mood combos that work well together
   - Prevent contradictory moods (euphoric + melancholic)

Functions:
```javascript
suggestGenres(partial: string) // Autocomplete
suggestInstruments(genre: string) // Context-aware
validateCombination(genre: string, mood: string, vocals: string) // Validation
getSmartSuggestions(currentPrompt: PartialPrompt) // AI-like suggestions
```

Create a comprehensive suggestion database.
```

---

## Prompt 8: Prompt Parser & Analyzer

```
Build a system to parse and analyze existing Suno AI prompts.

Create functions:

1. `parseStylePrompt(prompt: string)`
   - Extract genre, mood, tempo, key, instruments, vocals
   - Return structured object
   - Handle various formatting styles

2. `analyzeLyrics(lyrics: string)`
   - Detect existing meta tags
   - Count sections (verses, choruses)
   - Check structure balance
   - Estimate song duration
   - Return statistics

3. `scorePrompt(prompt: string)`
   - Rate prompt quality (1-100)
   - Check for completeness
   - Identify missing elements
   - Suggest improvements

4. `comparePrompts(prompt1: string, prompt2: string)`
   - Highlight differences
   - Show what changed
   - Useful for A/B testing

5. `extractTemplate(prompt: string)`
   - Convert existing prompt to reusable template
   - Identify variable parts
   - Create parameterized version

Example:
```javascript
const parsed = parseStylePrompt("Heavy Metal, Dark, 140 BPM, Distorted guitars, Aggressive vocals");
// Returns: { genre: ['Heavy Metal'], mood: ['Dark'], tempo: 140, instruments: ['guitar'], vocals: 'aggressive' }

const score = scorePrompt(prompt);
// Returns: { score: 85, missing: ['key signature'], suggestions: ['Add instrumentation details'] }
```

Use regex and NLP techniques for robust parsing.
```

---

## Prompt 9: Export & Integration Features

```
Create export and integration features for generated prompts.

Requirements:

1. **Export Formats**
   - Plain text (.txt)
   - JSON (structured data)
   - Markdown (.md with formatting)
   - Copy to clipboard (formatted for Suno)

2. **Batch Generation**
   - Generate multiple variations at once
   - Parameter randomization within constraints
   - Save all variations to zip file

3. **Prompt History**
   - Save last 50 generated prompts
   - LocalStorage/IndexedDB persistence
   - Search through history
   - Favorite/star system
   - Tags for organization

4. **Share Features**
   - Generate shareable link (encode prompt in URL)
   - QR code for mobile transfer
   - Export to social media formats

5. **API Integration** (optional)
   - Direct Suno API integration
   - One-click send to Suno
   - Track generated songs

Functions:
```javascript
exportPrompt(prompt: Prompt, format: 'txt' | 'json' | 'md')
generateVariations(prompt: Prompt, count: number, variationLevel: number)
saveToHistory(prompt: Prompt)
createShareLink(prompt: Prompt)
```

Include file download utilities and clipboard API usage.
```

---

## Prompt 10: Complete App State Management

```
Set up complete state management for the Suno AI prompt generator app.

Using React Context + Hooks, create:

1. **PromptContext**
   - Current prompt being built
   - Generated prompts list
   - Selected template
   - Enhancement level

2. **HistoryContext**
   - Prompt history
   - Favorites
   - Recent generations

3. **SettingsContext**
   - User preferences
   - Default values
   - Theme settings

4. **UIContext**
   - Current view/tab
   - Modal states
   - Loading states

Provide:
- Context definitions
- Custom hooks for each context
- Action types (TypeScript)
- Reducers where needed

Structure:
```typescript
interface PromptState {
  genre: string[];
  mood: string[];
  vocals: string;
  tempo?: number;
  key?: string;
  instruments: string[];
  enhancementLevel: 'none' | 'light' | 'medium' | 'heavy';
  lyrics?: string;
  structure?: string;
}

// Custom hooks
usePromptBuilder()
useHistory()
useSettings()
```

Include localStorage persistence for settings and history.
Implement undo/redo functionality for prompt building.
```

---

## Prompt 11: Validation & Error Handling

```
Create comprehensive validation and error handling for the prompt generator.

Build validation system:

1. **Prompt Validation**
   ```javascript
   validatePrompt(prompt: Prompt): ValidationResult
   ```
   - Check required fields
   - Validate BPM range for genre
   - Check instrument compatibility
   - Warn about unusual combinations
   - Return errors and warnings separately

2. **Lyrics Validation**
   ```javascript
   validateLyrics(lyrics: string): LyricValidation
   ```
   - Check meta tag formatting
   - Validate bracket syntax
   - Check for unclosed tags
   - Warn about very long/short sections
   - Detect common mistakes

3. **Real-time Validation**
   - As-you-type validation for text inputs
   - Immediate feedback on selections
   - Visual indicators (red/yellow/green)

4. **Error Messages**
   - User-friendly error descriptions
   - Suggestion for fixes
   - Link to documentation/help

5. **Edge Cases**
   - Empty inputs
   - Special characters
   - Very long prompts (Suno limits)
   - Invalid combinations

Return structure:
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}
```

Include helpful, educational error messages.
```

---

## Prompt 12: Complete App Assembly

```
Assemble all components into a complete working Suno AI prompt generator app.

Requirements:

1. **App Structure**
   - Main layout with navigation
   - Responsive design (mobile, tablet, desktop)
   - Dark/light theme toggle
   - Header with logo and actions
   - Footer with credits/links

2. **User Flow**
   - Landing page with quick start
   - Main prompt builder interface
   - Template browser
   - History/library view
   - Settings page

3. **Integration**
   - Connect all components from previous prompts
   - Wire up state management
   - Implement all features
   - Add error boundaries

4. **Polish**
   - Loading states
   - Animations/transitions
   - Toast notifications
   - Keyboard shortcuts
   - Accessibility (ARIA labels)

5. **Performance**
   - Lazy loading for heavy components
   - Memoization for expensive operations
   - Debounced search/autocomplete
   - Virtual scrolling for long lists

Tech stack:
- React 18+
- TypeScript
- Tailwind CSS
- React Router (if multi-page)
- Framer Motion (animations)

Provide complete file structure:
```
src/
  components/
  contexts/
  hooks/
  utils/
  data/
  types/
  App.tsx
  main.tsx
```

Include package.json with all dependencies.
```

---

---

## Prompt 13: Advanced Vocal Styling System

```
Create an advanced vocal styling system with detailed vocal descriptors for Suno AI.

Requirements:

1. **Vocal Descriptor Database**
   Organize by multiple dimensions:
   
   **Gender/Voice Type:**
   - Male: masculine, deep male, tenor, baritone, bass
   - Female: feminine, ethereal female, soprano, alto
   - Neutral: androgynous, gender-neutral
   - Age: boy, girl, youthful, mature, aged

   **Vocal Quality:**
   - Texture: airy, breathy, gritty, raspy, smooth, silky, rough, gravelly
   - Resonance: deep, low, high, bright, dark, warm, cold
   - Intensity: powerful, gentle, soft, aggressive, delicate, forceful

   **Delivery Style:**
   - gospel vocal, operatic, theatrical
   - whispered, spoken word, shouting, screaming
   - clean vocals, harsh vocals, growling
   - auto-tuned, vocoder, robotic

   **Regional/Cultural:**
   - UK accent, American Southern, New York, West Coast
   - British rock vocal, Atlanta rap, Memphis style
   - K-pop style, J-pop inflection

   **Emotional:**
   - vulnerable, confident, melancholic, joyful
   - haunting, uplifting, dark, angelic

2. **Combination Generator**
   ```javascript
   generateVocalStyle(base, modifiers) 
   // Example: generateVocalStyle('female', ['ethereal', 'breathy', 'high'])
   // Output: "ethereal female vocals, breathy delivery, high register"
   ```

3. **Genre-Appropriate Suggestions**
   ```javascript
   suggestVocalsForGenre(genre)
   // For "Heavy Metal" → ['aggressive male', 'guttural', 'screaming']
   // For "R&B" → ['smooth male', 'soulful', 'melismatic']
   ```

4. **Vocal Layer System**
   Support for multi-vocal arrangements:
   - Lead vocal
   - Background vocals (harmonies, ad-libs)
   - Call and response patterns
   - Doubling/layering effects

5. **Examples Database**
   At least 50 pre-built vocal style combinations:
   ```javascript
   {
     name: "Gospel Power Vocal",
     tags: "masculine low gospel vocal, powerful delivery, emotional depth",
     genres: ["Gospel", "Soul", "R&B"],
     example: "[Powerful Male Gospel Vocal]"
   }
   ```

Include format validator that ensures vocal descriptors are in correct syntax for Suno.
```

---

## Prompt 14: Advanced Lyric Techniques & Special Effects

```
Implement advanced lyric formatting techniques discovered by Suno community.

Features to implement:

1. **Vowel Extension Technique**
   ```javascript
   extendVowels(word, syllables)
   // extendVowels("goodbye", 3) → "goo-o-o-odbye"
   // extendVowels("love", 2) → "lo-o-ove"
   ```
   - Auto-detect which syllable to extend
   - Slider for extension length (1-5 syllables)
   - Preview how it will sound

2. **Background Vocal Notation**
   ```javascript
   addBackgroundVocals(line, backgroundPart)
   // "E la cha-cha-cha" + "cha" → "E la cha-cha-cha (cha)"
   ```
   - Parentheses for automatic second/third vocal layer
   - Visual editor to add background parts
   - Support for "(oh)", "(yeah)", "(cha)", etc.

3. **Chord Annotation System**
   ```javascript
   addChords(lyrics, chordProgression)
   // Input: "Walking down the street"
   // Chords: ["Em", "G", "D", "C"]
   // Output: "(Em) Walking down the (G) street"
   ```
   - Chord placement assistant
   - Common progressions library
   - Key transposition tool

4. **Musical Notation per Syllable**
   ```javascript
   addNotes(line, notes)
   // "Beat of the heart" → "(G)Beat (G)of (A)the (B)heart"
   ```
   - Visual note selector (piano keyboard UI)
   - MIDI import support
   - Scale/key helper

5. **Special Meta Tags Library**
   
   **Ending Tags:**
   - `[end]` - Clear ending
   - `[fade out]` - Gradual fade
   - `[outro]` - Outro section
   - `[instrumental fade out]` - Instrumental ending
   
   **Transition Tags:**
   - `[bridge with ostinato]` - Repeating pattern
   - `[transition section]` - Smooth transition
   - `[build-up]` - Increasing intensity
   - `[breakdown]` - Stripping back
   - `[drop]` - EDM/Electronic drop
   
   **Instrumental Tags:**
   - `[sax]`, `[saxophone]`, `[solo]` - Instrument solos
   - Use repeated tags: `[sax][saxophone][solo]` for better results
   - Keep tags lowercase and concise
   
   **Vocal Effect Tags:**
   - `[angelic voice]` - Heavenly vocals
   - `[heavy female screaming section]` - Intense vocals
   - `[catchy hook]` - Memorable part
   - `[emotional bridge]` - Emotional peak

6. **Tag Optimizer**
   ```javascript
   optimizeTags(userTags)
   // "Beautiful saxophone solo" → "[sax][saxophone][solo]"
   // Converts verbose descriptions to concise, effective tags
   ```
   - Use ChatGPT/AI to refine tags
   - Suggest lowercase, short alternatives
   - Warn about overly complex tags

7. **Structure Template Builder**
   ```javascript
   buildStructureTemplate(sections)
   // Allow up to 3k character templates in custom mode
   ```
   Example template:
   ```
   [Bridge with Ostinato]
   [Transition Section]
   [Heavy Female Screaming Section]
   [Bridge Section]
   [Chorus with Drop]
   ```

Create visual editor for adding these advanced techniques with preview.
```

---

## Prompt 15: Genre-Specific Optimization Database

```
Create comprehensive genre-specific optimization rules based on Suno community best practices.

Build database with special handling for problematic genres:

1. **Hip Hop / Rap / Trap Optimization**
   
   **Problem:** Suno often produces wrong accents, British-sounding vocals
   
   **Solutions:**
   ```javascript
   const hiphopOptimizer = {
     regionalization: {
       southern: ["Memphis trap", "Atlanta trap", "Houston rap"],
       westCoast: ["west coast gangsta rap", "Compton hip-hop beat", "LA rap"],
       eastCoast: ["New York boom bap", "Brooklyn drill", "East Coast hip hop"]
     },
     
     techniques: [
       "Use 'Phonk Drum' tag for proper hip-hop sound",
       "Write lyrics in the desired accent/slang",
       "Combine with soul/blues for R&B vocals",
       "Specify regional style explicitly"
     ],
     
     effectiveTags: [
       "Memphis trap, dark, 808 bass, hi-hat rolls",
       "Atlanta trap, auto-tune, ad-libs, southern flow",
       "Boom bap, 90s hip hop, jazzy samples, vinyl crackle"
     ]
   }
   ```

2. **Electronic Music Specifics**
   ```javascript
   const electronicOptimizer = {
     structure: ["intro", "build-up", "drop", "breakdown", "build-up", "drop", "outro"],
     
     keyTags: {
       deepHouse: "[groovy bassline][4/4 beat][sub bass][atmospheric pads]",
       drumAndBass: "[fast breakbeats][heavy bassline][160-180 BPM]",
       synthwave: "[vintage synthesizers][analog warmth][retro drums]"
     },
     
     transitionTips: [
       "Use [build-up] before drops",
       "Use [breakdown] for calm sections",
       "Specify bar count: [8 bar build]"
     ]
   }
   ```

3. **Rock/Metal Vocal Tips**
   ```javascript
   const rockMetalOptimizer = {
     vocals: {
       clean: "powerful clean vocals, soaring melody",
       harsh: "guttural aggressive vocals, screaming",
       mixed: "clean vocals in verse, screaming in chorus"
     },
     
     guitars: [
       "heavy riffs",
       "distorted guitars", 
       "palm-muted chugging",
       "guitar solo with wah pedal"
     ]
   }
   ```

4. **Acoustic/Singer-Songwriter**
   ```javascript
   const acousticOptimizer = {
     keepSimple: true,
     avoidOverproduction: [
       "Don't overload with instruments",
       "Focus on vocals + 1-2 instruments",
       "Use 'intimate' and 'stripped back' descriptors"
     ],
     
     effectiveCombos: [
       "fingerpicked acoustic guitar, intimate vocals",
       "piano ballad, emotional delivery, minimalist"
     ]
   }
   ```

5. **Common Issues Database**
   ```javascript
   const commonIssues = {
     abruptEndings: {
       problem: "Song cuts off suddenly",
       solutions: ["[fade out]", "[outro]", "[instrumental fade out][end]"]
     },
     
     wrongInstrument: {
       problem: "Suno ignores instrument requests",
       solutions: [
         "Use repeated tags: [sax][saxophone][solo]",
         "Keep tags short and lowercase",
         "Try instrument name variations"
       ]
     },
     
     randomNoises: {
       problem: "TV static or weird sounds",
       solutions: [
         "Provide specific feedback",
         "Use cleaner style prompts",
         "Avoid conflicting descriptors"
       ]
     },
     
     loopingLyrics: {
       problem: "Same lyrics repeat endlessly",
       solutions: [
         "Use clear section markers",
         "Add [end] or [outro]",
         "Vary lyric structure"
       ]
     }
   }
   ```

6. **Best Practice Rules**
   ```javascript
   const bestPractices = {
     tagFormatting: {
       brackets: "Use [Square Brackets] for meta tags",
       parentheses: "Use (Parentheses) for inline styles or background vocals",
       capitalization: "Capitalize section names: [Verse], not [verse]",
       conciseness: "Short tags work better: [drop] not [epic drop section]"
     },
     
     layering: {
       styleThenTags: "Style prompt first, then lyrics with tags",
       dontMix: "Don't put lyrics in style prompt field",
       structure: "Plan structure before writing lyrics"
     },
     
     iteration: {
       multipleAttempts: "Generate 3-5 versions, pick best",
       tweakIncrementally: "Make small changes between attempts",
       saveSuccesses: "Document what works for reuse"
     }
   }
   ```

Create function that analyzes user's genre selection and automatically applies optimization rules:
```javascript
applyGenreOptimizations(genre, currentPrompt)
// Returns optimized prompt with genre-specific best practices
```
```

---

## Prompt 16: Intelligent Prompt Validation & Quality Scoring

```
Build an intelligent validation system that scores prompt quality and suggests improvements.

1. **Prompt Quality Scorer**
   ```javascript
   scorePrompt(prompt: PromptObject): QualityScore
   ```
   
   Score based on:
   - **Completeness (0-30 points)**
     - Has genre? +10
     - Has mood? +5
     - Has vocals specified? +5
     - Has tempo/BPM? +5
     - Has instrumentation? +5
   
   - **Specificity (0-30 points)**
     - Generic (pop, rock) = 10 points
     - Specific sub-genre (synthwave, death metal) = 20 points
     - Highly specific (Memphis trap, UK drill) = 30 points
   
   - **Balance (0-20 points)**
     - Not too short (< 5 elements) = -10
     - Not too long (> 20 elements) = -10
     - Well balanced (8-15 elements) = +20
   
   - **Coherence (0-20 points)**
     - Compatible combinations = +20
     - Conflicting elements (happy + melancholic) = -10
     - Genre/vocal mismatch = -5

   Return:
   ```javascript
   {
     totalScore: 85,
     breakdown: {
       completeness: 25,
       specificity: 28,
       balance: 20,
       coherence: 12
     },
     grade: "B+",
     suggestions: [...]
   }
   ```

2. **Smart Suggestions Engine**
   ```javascript
   generateSuggestions(prompt, score)
   ```
   
   Based on score, suggest:
   - **Missing elements**: "Add tempo (BPM) for better results"
   - **Specificity**: "Change 'rock' to 'indie rock' or 'hard rock'"
   - **Coherence**: "⚠️ 'aggressive' and 'gentle' conflict - choose one"
   - **Genre tips**: "For trap music, consider adding '808 bass' and 'hi-hat rolls'"
   - **Enhancement**: "Add production quality keywords like 'mastered' or 'studio quality'"

3. **Conflict Detector**
   ```javascript
   detectConflicts(prompt): Conflict[]
   ```
   
   Check for:
   - Mood conflicts (happy + sad, energetic + calm)
   - Genre incompatibilities (classical + trap)
   - Vocal mismatches (screaming + lullaby)
   - Tempo conflicts (fast BPM + slow genre)
   
   Return warnings with explanations:
   ```javascript
   {
     type: "mood_conflict",
     elements: ["euphoric", "melancholic"],
     severity: "high",
     suggestion: "Choose one primary mood or use 'bittersweet' to combine"
   }
   ```

4. **Completeness Checker**
   ```javascript
   checkCompleteness(prompt): CompletionSuggestion[]
   ```
   
   Essential elements:
   - ✅ Genre (required)
   - ⚠️ Mood (recommended)
   - ⚠️ Vocals (recommended)
   - ℹ️ Tempo (optional but helpful)
   - ℹ️ Key (optional)
   - ℹ️ Instruments (optional but recommended)

5. **Lyrics Structure Validator**
   ```javascript
   validateLyricStructure(lyrics): ValidationResult
   ```
   
   Check:
   - ✅ Proper meta tag syntax `[Tag]`
   - ✅ Balanced sections (not too long/short)
   - ✅ Closing brackets
   - ⚠️ Section variety (not all verses)
   - ⚠️ Appropriate song length
   - ❌ Invalid tags or typos
   
   Return:
   ```javascript
   {
     isValid: true,
     errors: [],
     warnings: [
       "Verse 1 is very long (16 lines) - consider splitting"
     ],
     stats: {
       totalSections: 7,
       verses: 2,
       choruses: 3,
       estimatedDuration: "3:45"
     }
   }
   ```

6. **Real-time Validation UI**
   - Green checkmark for valid elements
   - Yellow warning triangle for improvements
   - Red X for conflicts/errors
   - Score badge showing current quality (0-100)
   - Progress bar showing completeness

7. **Comparison Tool**
   ```javascript
   comparePrompts(prompt1, prompt2)
   ```
   
   Show side-by-side:
   - Score differences
   - Element changes
   - Quality improvements/regressions
   - Helpful for A/B testing

Create visual dashboard showing prompt health at a glance.
```

---

## Prompt 17: Template System with Community Presets

```
Build a comprehensive template library system with sharable community presets.

1. **Template Structure**
   ```typescript
   interface SunoTemplate {
     id: string;
     name: string;
     description: string;
     author: string;
     category: string;
     tags: string[];
     
     // Prompt data
     stylePrompt: string;
     lyricsTemplate?: string;
     structure: string;
     
     // Metadata
     genre: string[];
     mood: string[];
     vocals: string;
     bpm?: number;
     key?: string;
     
     // Stats
     uses: number;
     rating: number;
     created: Date;
     
     // Examples
     exampleOutputs?: string[]; // URLs to Suno songs
     tips?: string[];
   }
   ```

2. **Pre-built Template Categories**
   
   **By Genre (50+ templates):**
   - Rock (Heavy Metal, Indie Rock, Punk, etc.)
   - Electronic (House, Techno, Synthwave, etc.)
   - Hip Hop (Trap, Boom Bap, Drill, etc.)
   - Pop (Synth-pop, K-pop, Indie Pop, etc.)
   - And more...

   **By Mood:**
   - Energetic workout tracks
   - Relaxing chill music
   - Dark atmospheric
   - Happy uplifting
   - Sad emotional

   **By Use Case:**
   - Video game music
   - Film soundtrack
   - Commercial/ad music
   - Podcast intro
   - Wedding song

3. **Template Browser Component**
   ```javascript
   <TemplateBrowser>
     - Grid/List view toggle
     - Filter by: category, genre, mood, rating
     - Search functionality
     - Sort by: popular, recent, highest rated
     - Preview card with:
       * Template name
       * Genre tags
       * Rating stars
       * Use count
       * Quick preview button
   </TemplateBrowser>
   ```

4. **Template Customization**
   ```javascript
   customizeTemplate(template, modifications)
   ```
   - Load template into builder
   - Allow editing all fields
   - "Save as new template" option
   - Fork/remix functionality

5. **Community Features**
   ```javascript
   shareTemplate(template): string // Returns shareable URL
   importTemplate(url): Template
   rateTemplate(id, rating)
   reportTemplate(id, reason)
   ```

6. **Template Export/Import**
   - JSON format for data portability
   - URL encoding for sharing
   - QR code generation
   - Copy to clipboard

7. **Featured Templates**
   Create at least 20 high-quality starter templates:

   ```javascript
   const featuredTemplates = [
     {
       name: "Epic Synthwave Night Drive",
       stylePrompt: "Synthwave, Retro-futuristic, Dark, 112 BPM, A minor, Vintage synthesizers, Heavy bass, Robotic vocals, Neon-noir atmosphere, Analog warmth, 80s influence, Reverb-drenched, Cinematic",
       structure: "intro-verse-chorus-verse-chorus-bridge-chorus-outro",
       genre: ["Synthwave", "Electronic"],
       mood: ["Dark", "Atmospheric", "Retro"],
       rating: 4.8,
       tips: [
         "Use dark, neon-related imagery in lyrics",
         "Add [Synth Solo] for best results"
       ]
     },
     
     {
       name: "Memphis Trap Banger",
       stylePrompt: "Memphis trap, Dark, Southern flow, 808 bass, Hi-hat rolls, Snappy snares, Auto-tuned vocals, Phonk Drum, Aggressive delivery, Street atmosphere",
       structure: "intro-verse-hook-verse-hook-bridge-hook-outro",
       genre: ["Trap", "Hip Hop"],
       mood: ["Dark", "Aggressive", "Street"],
       tips: [
         "Use southern slang in lyrics",
         "Add [Ad-libs] sections",
         "Keep verses 16 bars"
       ]
     },
     
     // ... 18 more
   ]
   ```

8. **Template Analytics**
   Track which templates are most popular, successful, etc.
   Show trending templates on homepage.

Implement search with fuzzy matching and tag-based filtering.
```

---

## Prompt 18: Batch Generation & Variation System

```
Create a batch generation system that creates multiple prompt variations automatically.

1. **Variation Generator**
   ```javascript
   generateVariations(basePrompt, count, variationLevel)
   ```
   
   **Variation Levels:**
   - **Light (10-20% change)**
     - Swap 1-2 mood descriptors
     - Adjust BPM by ±5-10
     - Add/remove one instrument
   
   - **Medium (30-50% change)**
     - Change sub-genre
     - Modify vocal style
     - Swap 3-4 descriptors
     - Different key
   
   - **Heavy (60-80% change)**
     - Different approach to same theme
     - Major changes to instrumentation
     - Different vocal gender/style
     - Genre-blend variations

2. **Smart Variation Algorithm**
   ```javascript
   createVariation(prompt, level) {
     const variation = {...prompt};
     
     switch(level) {
       case 'light':
         variation.mood = getRelatedMood(prompt.mood);
         variation.bpm += randomInt(-10, 10);
         break;
         
       case 'medium':
         variation.genre = getRelatedGenre(prompt.genre);
         variation.vocals = getAlternativeVocal(prompt.vocals);
         variation.instruments = swapInstruments(prompt.instruments, 0.4);
         break;
         
       case 'heavy':
         variation.genre = getContrastingGenre(prompt.genre);
         variation.mood = getContrastingMood(prompt.mood);
         // Rebuild most elements
         break;
     }
     
     return variation;
   }
   ```

3. **Related Element Database**
   ```javascript
   const relationships = {
     moods: {
       dark: ['mysterious', 'ominous', 'brooding', 'noir'],
       happy: ['joyful', 'euphoric', 'uplifting', 'cheerful'],
       // ...
     },
     
     genres: {
       synthwave: ['darkwave', 'vaporwave', 'outrun', 'cyberpunk'],
       trap: ['drill', 'phonk', 'cloud rap', 'rage'],
       // ...
     },
     
     vocals: {
       'ethereal female': ['airy female', 'angelic voice', 'breathy female'],
       'aggressive male': ['guttural', 'harsh vocals', 'screaming'],
       // ...
     }
   }
   ```

4. **Batch UI Component**
   ```javascript
   <BatchGenerator>
     - Base prompt input
     - Variation count slider (1-10)
     - Variation level selector
     - "Generate Variations" button
     - Results grid showing all variations
     - Side-by-side comparison
     - Checkbox selection for export
   </BatchGenerator>
   ```

5. **Batch Export**
   ```javascript
   exportBatch(variations, format)
   ```
   
   Formats:
   - ZIP file with individual .txt files
   - Single .txt with numbered sections
   - JSON array
   - CSV spreadsheet
   - Markdown document

6. **A/B Testing Tools**
   ```javascript
   compareVariations(variations)
   ```
   
   Show table comparing:
   - Style prompts (highlighted differences)
   - Quality scores
   - Element differences
   - Suggestions for each

7. **Parameter Randomization**
   ```javascript
   randomizeWithConstraints(prompt, constraints)
   ```
   
   Example:
   ```javascript
   randomizeWithConstraints(basePrompt, {
     keepGenre: true,  // Don't change genre
     keepStructure: true,  // Keep song structure
     randomizeMood: true,  // Try different moods
     randomizeVocals: true,  // Try different vocals
     bpmRange: [100, 140]  // Constrain BPM
   })
   ```

8. **Batch History**
   - Save all generated batches
   - Recall and regenerate
   - Mark favorites
   - Notes/comments on batches

Create intuitive UI for managing large numbers of variations.
```

---

## Usage Instructions (Updated)

**Recommended Build Order:**

**Phase 1 - Foundation (Day 1):**
1. Prompt 1: Core Data Structures
2. Prompt 2: Style Prompt Builder
3. Prompt 3: Meta Tag Formatter

**Phase 2 - Core Features (Day 2-3):**
4. Prompt 4: Enhancement Engine
5. Prompt 5: Genre Templates
6. Prompt 13: Vocal Styling System
7. Prompt 14: Advanced Lyric Techniques
8. Prompt 15: Genre Optimization

**Phase 3 - UI (Day 4-5):**
9. Prompt 6: Component Structure
10. Prompt 7: Suggestion System
11. Prompt 10: State Management

**Phase 4 - Quality & Features (Day 6-7):**
12. Prompt 11: Validation
13. Prompt 16: Quality Scoring
14. Prompt 8: Parser & Analyzer
15. Prompt 17: Template System

**Phase 5 - Advanced (Day 8-9):**
16. Prompt 18: Batch Generation
17. Prompt 9: Export Features
18. Prompt 12: Final Assembly

**Phase 6 - Polish (Day 10):**
- Testing
- Bug fixes
- UI/UX improvements
- Performance optimization

**Pro Tips for Implementation:**
- Build and test each prompt before moving to next
- Create a git commit after each major prompt
- Keep a notes file documenting what works
- Screenshot successful generated outputs
- Test with real Suno AI to validate accuracy

This gives you a production-ready Suno AI prompt generator! 🎵
# Suno AI App Implementation Prompts for Code Assistant

## 🔥 LATEST UPDATES - December 2024

**Suno v4.5+ is now live with major new features:**
- **Add Vocals**: Upload instrumentals and add AI vocals with lyrics
- **Add Instrumentals**: Upload vocals and generate backing tracks
- **Inspire**: Generate songs from your playlists
- **8-minute songs**: Extended from 4 minutes
- **Prompt Enhancement Helper**: Built-in creative boost
- **1,200+ genres**: Expanded genre support
- **Improved genre mashups**: Better blending (e.g., midwest emo + neosoul)
- **Enhanced vocals**: Vibrato, whisper-soft to powerful delivery
- **Better audio quality**: Reduced degradation and shimmer
- **Faster generation**: 2x speed improvement
- **v4.5-All**: Free tier now uses v4.5 (replacing v3.5)

**v5 is coming soon** (expected late 2024/early 2025)

---

## Prompt 19: v4.5+ New Features Integration

```
Implement Suno v4.5+ exclusive features that were released in 2024.

**CRITICAL: These are real, production features from v4.5+**

1. **Add Vocals Feature**
   ```javascript
   interface AddVocalsConfig {
     instrumentalTrack: File | string; // Upload or Suno-generated
     lyrics: string;
     vocalStyle?: string; // e.g., "powerful female", "smooth male"
     genre?: string;
   }
   
   function addVocalsToTrack(config: AddVocalsConfig)
   ```
   
   - Allow users to upload instrumental tracks (MP3, WAV)
   - Or use Suno-generated instrumentals
   - Input lyrics to generate vocals
   - Choose vocal style/gender
   - Generate complete song with AI vocals layered on instrumental

2. **Add Instrumentals Feature**
   ```javascript
   interface AddInstrumentalsConfig {
     vocalTrack: File | string; // Upload or record
     genre: string;
     mood?: string;
     instruments?: string[];
   }
   
   function addInstrumentalsToVocals(config: AddInstrumentalsConfig)
   ```
   
   - Upload vocal recordings or stems
   - Or record vocals directly
   - Specify genre for backing track
   - AI generates instrumentals matching vocals
   - Creates full production from voice memo

3. **Inspire Feature**
   ```javascript
   interface InspireConfig {
     playlistSongs: string[]; // URLs or IDs
     similarityLevel: 'loose' | 'moderate' | 'strict';
   }
   
   function inspireFromPlaylist(config: InspireConfig)
   ```
   
   - User curates playlist of favorite songs
   - AI analyzes musical patterns, moods, styles
   - Generates new songs inspired by playlist
   - Maintains user's musical preferences
   - Creates personalized recommendations

4. **Prompt Enhancement Helper**
   ```javascript
   function enhancePromptV45(basicPrompt: string): EnhancedPrompt
   ```
   
   - Built-in "creative boost" feature
   - Transforms simple prompts into detailed descriptions
   - Available via UI button (sparkle icon)
   - Makes evocative, descriptive suggestions
   - Example: "rock song" → "driving alternative rock, powerful guitar riffs, energetic drums, anthemic vocals, stadium-ready production"

5. **Extended Song Length (8 minutes)**
   ```javascript
   interface SongConfig {
     maxDuration: 60 | 120 | 240 | 480; // v4.5+ supports up to 480 seconds
     maintainQuality: boolean; // v4.5+ maintains quality throughout
   }
   ```
   
   - Update UI to allow 8-minute maximum
   - Previous limit was 4 minutes
   - Quality maintained throughout entire length
   - No degradation in longer songs

6. **Enhanced Genre Mashups**
   ```javascript
   interface GenreMashup {
     primaryGenre: string;
     secondaryGenre: string;
     blendRatio?: number; // 0-100, how much secondary influence
   }
   
   const popularMashups = [
     "midwest emo + neosoul",
     "EDM + folk",
     "jazz + house",
     "punk + classical",
     "trap + country"
   ];
   ```
   
   - Support 1,200+ genre combinations
   - Better blending algorithm in v4.5+
   - Suggest compatible mashups
   - Validate unusual combinations

7. **Improved Vocal Expressions**
   ```javascript
   const vocalExpressions = {
     delicate: "intimate, whisper-soft performance",
     powerful: "strong delivery with vibrato",
     emotional: "expressive, nuanced, dynamic range",
     controlled: "precise, steady, professional"
   };
   ```
   
   - Microtonal pitch variation
   - Formant shifting
   - Emotional range control
   - Vibrato intensity
   - Better non-English support

8. **Remaster Feature (for v4.5)**
   ```javascript
   function remasterToV45(oldTrackId: string): Promise<Track>
   ```
   
   - Upgrade old tracks (v3, v3.5, v4) to v4.5 quality
   - One-click enhancement
   - Preserves original but improves audio
   - Available for all past creations

9. **ReMi Lyrics Model**
   ```javascript
   interface ReMiConfig {
     theme: string;
     style: 'creative' | 'standard';
     mood?: string;
   }
   
   function generateLyricsWithReMi(config: ReMiConfig)
   ```
   
   - More creative than standard lyrics AI
   - "Unhinged" and artistic
   - Access via "Write with Suno" in Custom Mode
   - Choose between ReMi (creative) or standard

10. **Enhanced Personas (v4.5)**
   ```javascript
   interface Persona {
     id: string;
     name: string;
     sourceTrackId: string;
     vocalCharacteristics: string;
     style: string;
     vibe: string;
   }
   
   function createPersonaFromTrack(trackId: string): Persona
   function applyPersona(persona: Persona, newLyrics: string): Track
   ```
   
   - Capture vocal style from any generated track
   - Save as reusable "persona"
   - Apply to new songs for consistency
   - Better quality in v4.5 than v4

11. **Enhanced Covers (v4.5)**
   ```javascript
   interface CoverConfig {
     originalTrack: File | string;
     newGenre: string;
     keepMelody?: boolean; // v4.5 better at preserving melody
     intensity?: number;
   }
   
   function createCover(config: CoverConfig)
   ```
   
   - Upload audio to reimagine in different genre
   - Better melody preservation in v4.5
   - Example: rock song → house remix
   - AI interprets and transforms

12. **Version Selector**
   ```javascript
   interface VersionSelector {
     availableVersions: SunoVersion[];
     currentTier: 'free' | 'pro' | 'premier';
   }
   
   // Free tier: v4.5-all (released Oct 2024)
   // Pro/Premier: v4.5+ with all features
   ```

UI Requirements:
- Add toggle for v4.5+ features
- Show which features require Pro/Premier
- Display version selector (free users get v4.5-all)
- "Enhance Prompt" button with sparkle icon
- Upload zones for Add Vocals/Instrumentals
- Playlist input for Inspire feature
- Persona library management
- 8-minute duration slider

Implementation Notes:
- These are actual Suno features, not hypothetical
- Launched between May-July 2024 (v4.5) and later (v4.5+)
- Free users have v4.5-all (limited features)
- Pro ($8/mo) and Premier ($30/mo) get full access
- Your app should mirror actual Suno capabilities
```

---

## Prompt 20: Comprehensive Knowledge Base & Help System

```
Create a comprehensive knowledge base and help system documenting all Suno AI best practices.

Build an interactive help/documentation system with:

1. **Getting Started Guide**
   - What is Suno AI
   - How prompts work
   - Understanding meta tags
   - Your first song walkthrough

2. **Version Comparison Chart**
   ```javascript
   const versionComparison = {
     'v3.5': {
       released: '2023',
       maxDuration: 240,
       features: ['Basic generation', 'Simple lyrics'],
       deprecated: true
     },
     'v4': {
       released: 'November 2024',
       maxDuration: 240,
       features: ['Cleaner audio', 'Sharper lyrics', 'Dynamic structures', 'ReMi lyrics', 'Personas', 'Covers', 'Remaster']
     },
     'v4.5': {
       released: 'May 2024',
       maxDuration: 480,
       features: ['8-min songs', 'Better vocals', 'Expanded genres', 'Prompt helper', 'Enhanced mashups']
     },
     'v4.5+': {
       released: 'July 2024',
       maxDuration: 480,
       features: ['Add Vocals', 'Add Instrumentals', 'Inspire', 'WavTool integration', 'Stem separation']
     },
     'v4.5-all': {
       released: 'October 2024',
       tier: 'FREE',
       maxDuration: 480,
       features: ['Free version of v4.5', 'Most features', 'Limited generations']
     }
   }
   ```

3. **Feature Documentation**
   Each feature with:
   - Description
   - How to use
   - Tips & tricks
   - Common issues
   - Examples
   - Video tutorials (links)

4. **Best Practices Library**
   Organized by category:
   
   **Genre-Specific Tips:**
   - Hip Hop/Rap/Trap optimization
   - Rock/Metal vocal techniques
   - Electronic music structure
   - Acoustic production tips
   - Jazz and complex harmony
   
   **Vocal Styling:**
   - How to get specific accents
   - Regional variations
   - Gender and age specification
   - Emotional delivery
   
   **Lyric Techniques:**
   - Vowel extension
   - Background vocals
   - Chord annotations
   - Musical notation
   
   **Meta Tag Mastery:**
   - Complete tag reference
   - Song structure templates
   - Transition techniques
   - Ending strategies

5. **Troubleshooting Guide**
   Common problems and solutions:
   
   ```javascript
   const troubleshooting = [
     {
       problem: "Abrupt song endings",
       solutions: ["Add [fade out]", "Use [outro]", "[instrumental fade out][end]"],
       relatedDocs: ['meta-tags', 'song-endings']
     },
     {
       problem: "Wrong instrument generated",
       solutions: ["Use repeated tags: [sax][saxophone][solo]", "Try lowercase", "Use variations"],
       relatedDocs: ['meta-tags', 'instruments']
     },
     {
       problem: "Wrong accent in hip hop",
       solutions: ["Specify region: 'Memphis trap'", "Use 'Phonk Drum' tag", "Write lyrics in accent"],
       relatedDocs: ['genre-optimization', 'hip-hop-guide']
     },
     {
       problem: "Voice sounds robotic",
       solutions: ["Upgrade to v4.5+", "Add vocal descriptors", "Use ReMi for lyrics"],
       relatedDocs: ['vocal-styling', 'versions']
     },
     {
       problem: "Song quality degrades after 2 minutes",
       solutions: ["Use v4.5+ (fixed)", "Use Remaster feature", "Keep under 4 min"],
       relatedDocs: ['audio-quality', 'remaster']
     }
   ]
   ```

6. **Interactive Examples**
   - Before/After comparisons
   - Listen to sample tracks
   - See prompt → result
   - Genre showcase
   - Technique demonstrations

7. **Search Functionality**
   - Full-text search
   - Tag-based filtering
   - Related articles
   - Popular searches
   - Smart suggestions

8. **FAQ System**
   Top questions:
   - How long can songs be?
   - What's the difference between versions?
   - Can I use my songs commercially?
   - How do I improve vocal quality?
   - What's the best way to end a song?
   - How to avoid copyright issues?
   - What genres work best?

9. **Community Tips**
   - User-submitted techniques
   - Success stories
   - Creative experiments
   - Genre discoveries
   - Rating/voting system

10. **Updates & Changelog**
    Track Suno updates:
    - November 2024: v4 launched
    - May 2024: v4.5 with 8-min songs
    - July 2024: v4.5+ with Add Vocals/Instrumentals
    - October 2024: v4.5-all for free tier
    - Coming: v5 teased

11. **Video Tutorials**
    Link to or embed:
    - Basic song creation
    - Advanced meta tags
    - Genre mashups
    - Vocal techniques
    - Feature walkthroughs

12. **Glossary**
    Define all terms:
    - Meta tags
    - Personas
    - Covers
    - ReMi
    - Remaster
    - Stems
    - BPM
    - Genre terms
    - Musical notation

Implementation:
```javascript
interface HelpArticle {
  id: string;
  title: string;
  category: string;
  tags: string[];
  content: string; // Markdown
  relatedArticles: string[];
  examples?: Example[];
  lastUpdated: Date;
  views: number;
  helpful: number;
}

function searchHelp(query: string): HelpArticle[]
function getArticleByCategory(category: string): HelpArticle[]
function getPopularArticles(): HelpArticle[]
```

UI Components:
- Searchable documentation
- Category browser
- Breadcrumb navigation
- Related articles sidebar
- "Was this helpful?" feedback
- Copy code buttons
- Expandable sections
- Dark/light mode
- Print-friendly version

This creates a complete knowledge resource rivaling Suno's official docs!
```

---

## Prompt 1: Core Data Structures & Constants

```
I'm building a Suno AI music prompt generator app. Create the core data structures and constants needed.

Requirements:
1. Genre taxonomy with categories (Rock, Pop, Electronic, Hip Hop, Metal, Jazz, Folk, Country, R&B/Soul)
2. Each genre should have: name, sub-genres, typical BPM range, common keys, characteristic instruments
3. Meta tags list (structural, vocal, instrumental, sound effects)
4. Vocal styles (clean, aggressive, ethereal, whispered, etc.)
5. Mood descriptors (dark, upbeat, melancholic, energetic, etc.)
6. Production quality keywords
7. Song structure templates (Pop/Rock, Hip Hop, Electronic, Ballad)

Export as TypeScript interfaces and constants that can be easily imported.
Include at least 50+ genres total across all categories.

Example structure:
```typescript
interface Genre {
  name: string;
  category: string;
  subGenres: string[];
  bpmRange: [number, number];
  commonKeys: string[];
  instruments: string[];
  vocalsStyle: string[];
  characteristics: string[];
}
```

Make it comprehensive and production-ready.
```

---

## Prompt 2: Style Prompt Builder Function

```
Create a function that builds optimized Suno AI style prompts from user inputs.

Function requirements:
- Input: genre, mood, vocals, tempo, key (optional), instruments, production style
- Output: Comma-separated style prompt string optimized for Suno AI
- Should handle multiple genres (blend them intelligently)
- Should order elements optimally: Genre → Sub-genre → Mood → Tempo → Key → Vocals → Instruments → Atmosphere → Production
- Include validation for conflicting styles
- Add optional "enhance" parameter that adds rich descriptors

Example usage:
```javascript
buildStylePrompt({
  genre: ['Heavy Metal', 'Alternative'],
  mood: 'dark',
  vocals: 'ethereal female',
  tempo: 120,
  key: 'B minor',
  instruments: ['guitar', 'piano'],
  enhance: true
})
// Output: "Heavy Metal, Alternative Metal influences, Dark atmosphere, 120 BPM, B minor, Ethereal female vocals with haunting delivery, Distorted guitar riffs, Atmospheric piano melodies, Brooding soundscape, High production value"
```

Use the data structures from Prompt 1.
```

---

## Prompt 3: Meta Tag Formatter & Lyrics Structurer

```
Create functions to format lyrics with proper Suno AI meta tags.

Required functions:

1. `structureLyrics(lyrics: string, structure: StructureType)` 
   - Takes raw lyrics and applies proper song structure
   - Structure types: 'pop', 'hiphop', 'electronic', 'ballad', 'custom'
   - Auto-divides lyrics into sections (verse, chorus, bridge)
   - Adds appropriate meta tags

2. `addMetaTags(section: string, tags: string[])`
   - Adds meta tags to a specific section
   - Validates tag syntax (brackets, capitalization)
   - Returns formatted string

3. `validateMetaTags(lyrics: string)`
   - Checks for proper meta tag formatting
   - Returns errors/warnings
   - Suggests fixes

4. `generateStructure(genre: string, duration: number)`
   - Returns recommended song structure for genre and duration
   - Includes section lengths in bars/lines

Example:
```javascript
const structure = generateStructure('pop', 210); // 3:30 song
// Returns: { intro: 8, verse1: 8, preChorus: 4, chorus: 8, ... }

const formatted = structureLyrics(rawLyrics, 'pop');
// Returns properly tagged lyrics with [Intro], [Verse 1], etc.
```

Include common meta tags list:
- Structural: [Intro], [Verse], [Chorus], [Bridge], [Outro], [Pre-Chorus]
- Instrumental: [Guitar Solo], [Piano Break], [Instrumental]
- Vocal: [Female Vocal], [Male Vocal], [Whispered], [Screaming]
```

---

## Prompt 4: Prompt Enhancement Engine

```
Create a prompt enhancement system that emulates Suno V4.5's "Creative Boost" feature.

Requirements:

1. `enhancePrompt(basicPrompt: string, level: 'light' | 'medium' | 'heavy')`
   - Takes basic prompt and enhances it with rich descriptors
   - Light: Add 2-3 descriptors
   - Medium: Add 5-7 descriptors
   - Heavy: Fully detailed professional prompt

2. Enhancement layers to add:
   - Genre precision (rock → alternative indie rock)
   - Mood expansion (happy → euphoric, uplifting, sun-soaked)
   - Instrumentation details (guitar → jangly clean guitar with chorus effect)
   - Vocal character (vocals → breathy, ethereal delivery with subtle vibrato)
   - Production quality (add: clear mix, mastered, studio quality)
   - Atmospheric texture (warm, intimate, spacious, etc.)

3. `getDescriptorBank(category: string)`
   - Returns appropriate descriptors for: mood, tempo, texture, energy
   - Each category should have 20+ descriptors

4. `analyzePrompt(prompt: string)`
   - Parses existing prompt
   - Returns structured object with detected elements
   - Suggests missing elements

Example:
```javascript
enhancePrompt("sad pop song", "heavy")
// Output: "Melancholic pop ballad, Emotional depth, Heartfelt piano melodies, Subtle string arrangements, Gentle drum patterns, Vulnerable female vocals with slight reverb, Intimate atmosphere, Bittersweet nostalgia, Studio-quality production, Clear emotional delivery, Modern pop production, Warm analog mixing"
```

Create a rich descriptor database organized by categories.
```

---

## Prompt 5: Genre-Specific Template System

```
Build a genre template system with pre-configured prompts for popular genres.

Create templates for at least 20 genres including:
- Heavy Metal
- Indie Rock  
- Synthwave
- Lo-fi Hip Hop
- Deep House
- Trap
- Jazz Fusion
- Acoustic Ballad
- K-pop
- Drum and Bass
- Country Rock
- R&B Soul
- Punk Rock
- Ambient Electronic
- Reggae

Each template should include:
```typescript
interface GenreTemplate {
  name: string;
  stylePrompt: string;
  bpmRange: [number, number];
  recommendedKeys: string[];
  commonStructure: string;
  metaTags: string[];
  tips: string[];
  variations: { name: string; modifications: string }[];
  exampleOutput: string;
}
```

Functions needed:
1. `getGenreTemplate(genre: string)` - Returns full template
2. `customizeTemplate(template, customizations)` - Modify template with user preferences
3. `blendGenres(genre1, genre2)` - Intelligently combine two genre templates
4. `getAllTemplates()` - Returns all available templates for browsing

Example template:
```javascript
{
  name: "Synthwave",
  stylePrompt: "Synthwave, Retro-futuristic, 110 BPM, A minor, Vintage synthesizers, Heavy bass, Robotic vocals, Neon-noir atmosphere, Analog warmth, 80s influence",
  bpmRange: [100, 120],
  recommendedKeys: ["A minor", "D minor", "E minor"],
  commonStructure: "intro-verse-chorus-verse-chorus-bridge-chorus-outro",
  metaTags: ["[Synth Solo]", "[Build-up]", "[Drop]"],
  tips: [
    "Use vintage synth sounds",
    "Add subtle arpeggios",
    "Include retro drum machines"
  ],
  variations: [
    { name: "Dark Synthwave", modifications: "Add darker mood, minor keys, ominous atmosphere" },
    { name: "Dreamwave", modifications: "Softer, more ambient, ethereal vocals" }
  ]
}
```
```

---

## Prompt 6: UI Component Structure

```
Design the React component structure for the Suno AI prompt generator app.

Required components:

1. **PromptBuilder** (main component)
   - Genre selector (multi-select with categories)
   - Mood selector (tags/chips)
   - Vocal style selector
   - Tempo slider (60-200 BPM)
   - Key selector (dropdown)
   - Instrument multi-select
   - Enhancement level toggle
   - Generate button

2. **LyricEditor**
   - Text area for lyrics input
   - Structure selector (pop, hip hop, ballad, etc.)
   - Meta tag insertion buttons
   - Live preview with syntax highlighting
   - Auto-format button
   - Validation warnings

3. **OutputPreview**
   - Style prompt display (copyable)
   - Formatted lyrics display
   - Copy to clipboard button
   - Download as .txt button
   - Variations generator (show 3 alternatives)

4. **GenreExplorer**
   - Browse all genre templates
   - Genre cards with quick preview
   - Filter by category
   - Search functionality

5. **TemplateLibrary**
   - Saved prompts
   - Community templates (optional)
   - Import/Export functionality

Provide component hierarchy and props interfaces:
```typescript
interface PromptBuilderProps {
  onGenerate: (prompt: Prompt) => void;
  initialValues?: Partial<Prompt>;
}
```

Use modern React patterns (hooks, context for global state).
Include Tailwind CSS class suggestions for styling.
```

---

## Prompt 7: Smart Suggestion & Autocomplete System

```
Create an intelligent suggestion system that helps users build better prompts.

Features needed:

1. **Genre Autocomplete**
   - Fuzzy search through 100+ genres
   - Show sub-genres when main genre selected
   - Suggest compatible genre combinations
   - Warn about incompatible combinations

2. **Context-Aware Suggestions**
   - When user selects "Heavy Metal", suggest: aggressive vocals, distorted guitars, 120-160 BPM
   - When user selects "Lo-fi", suggest: chill mood, 80-90 BPM, jazzy elements
   - Dynamic suggestions based on current selections

3. **Meta Tag Autocomplete**
   - Suggest meta tags as user types in lyrics
   - Detect section keywords (verse, chorus) and offer to add tags
   - Template-based suggestions

4. **Instrument Compatibility**
   - Suggest instruments that fit the selected genre
   - Mark unusual combinations (e.g., banjo in techno)
   - Allow override with warning

5. **Mood Combinations**
   - Suggest mood combos that work well together
   - Prevent contradictory moods (euphoric + melancholic)

Functions:
```javascript
suggestGenres(partial: string) // Autocomplete
suggestInstruments(genre: string) // Context-aware
validateCombination(genre: string, mood: string, vocals: string) // Validation
getSmartSuggestions(currentPrompt: PartialPrompt) // AI-like suggestions
```

Create a comprehensive suggestion database.
```

---

## Prompt 8: Prompt Parser & Analyzer

```
Build a system to parse and analyze existing Suno AI prompts.

Create functions:

1. `parseStylePrompt(prompt: string)`
   - Extract genre, mood, tempo, key, instruments, vocals
   - Return structured object
   - Handle various formatting styles

2. `analyzeLyrics(lyrics: string)`
   - Detect existing meta tags
   - Count sections (verses, choruses)
   - Check structure balance
   - Estimate song duration
   - Return statistics

3. `scorePrompt(prompt: string)`
   - Rate prompt quality (1-100)
   - Check for completeness
   - Identify missing elements
   - Suggest improvements

4. `comparePrompts(prompt1: string, prompt2: string)`
   - Highlight differences
   - Show what changed
   - Useful for A/B testing

5. `extractTemplate(prompt: string)`
   - Convert existing prompt to reusable template
   - Identify variable parts
   - Create parameterized version

Example:
```javascript
const parsed = parseStylePrompt("Heavy Metal, Dark, 140 BPM, Distorted guitars, Aggressive vocals");
// Returns: { genre: ['Heavy Metal'], mood: ['Dark'], tempo: 140, instruments: ['guitar'], vocals: 'aggressive' }

const score = scorePrompt(prompt);
// Returns: { score: 85, missing: ['key signature'], suggestions: ['Add instrumentation details'] }
```

Use regex and NLP techniques for robust parsing.
```

---

## Prompt 9: Export & Integration Features

```
Create export and integration features for generated prompts.

Requirements:

1. **Export Formats**
   - Plain text (.txt)
   - JSON (structured data)
   - Markdown (.md with formatting)
   - Copy to clipboard (formatted for Suno)

2. **Batch Generation**
   - Generate multiple variations at once
   - Parameter randomization within constraints
   - Save all variations to zip file

3. **Prompt History**
   - Save last 50 generated prompts
   - LocalStorage/IndexedDB persistence
   - Search through history
   - Favorite/star system
   - Tags for organization

4. **Share Features**
   - Generate shareable link (encode prompt in URL)
   - QR code for mobile transfer
   - Export to social media formats

5. **API Integration** (optional)
   - Direct Suno API integration
   - One-click send to Suno
   - Track generated songs

Functions:
```javascript
exportPrompt(prompt: Prompt, format: 'txt' | 'json' | 'md')
generateVariations(prompt: Prompt, count: number, variationLevel: number)
saveToHistory(prompt: Prompt)
createShareLink(prompt: Prompt)
```

Include file download utilities and clipboard API usage.
```

---

## Prompt 10: Complete App State Management

```
Set up complete state management for the Suno AI prompt generator app.

Using React Context + Hooks, create:

1. **PromptContext**
   - Current prompt being built
   - Generated prompts list
   - Selected template
   - Enhancement level

2. **HistoryContext**
   - Prompt history
   - Favorites
   - Recent generations

3. **SettingsContext**
   - User preferences
   - Default values
   - Theme settings

4. **UIContext**
   - Current view/tab
   - Modal states
   - Loading states

Provide:
- Context definitions
- Custom hooks for each context
- Action types (TypeScript)
- Reducers where needed

Structure:
```typescript
interface PromptState {
  genre: string[];
  mood: string[];
  vocals: string;
  tempo?: number;
  key?: string;
  instruments: string[];
  enhancementLevel: 'none' | 'light' | 'medium' | 'heavy';
  lyrics?: string;
  structure?: string;
}

// Custom hooks
usePromptBuilder()
useHistory()
useSettings()
```

Include localStorage persistence for settings and history.
Implement undo/redo functionality for prompt building.
```

---

## Prompt 11: Validation & Error Handling

```
Create comprehensive validation and error handling for the prompt generator.

Build validation system:

1. **Prompt Validation**
   ```javascript
   validatePrompt(prompt: Prompt): ValidationResult
   ```
   - Check required fields
   - Validate BPM range for genre
   - Check instrument compatibility
   - Warn about unusual combinations
   - Return errors and warnings separately

2. **Lyrics Validation**
   ```javascript
   validateLyrics(lyrics: string): LyricValidation
   ```
   - Check meta tag formatting
   - Validate bracket syntax
   - Check for unclosed tags
   - Warn about very long/short sections
   - Detect common mistakes

3. **Real-time Validation**
   - As-you-type validation for text inputs
   - Immediate feedback on selections
   - Visual indicators (red/yellow/green)

4. **Error Messages**
   - User-friendly error descriptions
   - Suggestion for fixes
   - Link to documentation/help

5. **Edge Cases**
   - Empty inputs
   - Special characters
   - Very long prompts (Suno limits)
   - Invalid combinations

Return structure:
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}
```

Include helpful, educational error messages.
```

---

## Prompt 12: Complete App Assembly

```
Assemble all components into a complete working Suno AI prompt generator app.

Requirements:

1. **App Structure**
   - Main layout with navigation
   - Responsive design (mobile, tablet, desktop)
   - Dark/light theme toggle
   - Header with logo and actions
   - Footer with credits/links

2. **User Flow**
   - Landing page with quick start
   - Main prompt builder interface
   - Template browser
   - History/library view
   - Settings page

3. **Integration**
   - Connect all components from previous prompts
   - Wire up state management
   - Implement all features
   - Add error boundaries

4. **Polish**
   - Loading states
   - Animations/transitions
   - Toast notifications
   - Keyboard shortcuts
   - Accessibility (ARIA labels)

5. **Performance**
   - Lazy loading for heavy components
   - Memoization for expensive operations
   - Debounced search/autocomplete
   - Virtual scrolling for long lists

Tech stack:
- React 18+
- TypeScript
- Tailwind CSS
- React Router (if multi-page)
- Framer Motion (animations)

Provide complete file structure:
```
src/
  components/
  contexts/
  hooks/
  utils/
  data/
  types/
  App.tsx
  main.tsx
```

Include package.json with all dependencies.
```

---

---

## Prompt 13: Advanced Vocal Styling System

```
Create an advanced vocal styling system with detailed vocal descriptors for Suno AI.

Requirements:

1. **Vocal Descriptor Database**
   Organize by multiple dimensions:
   
   **Gender/Voice Type:**
   - Male: masculine, deep male, tenor, baritone, bass
   - Female: feminine, ethereal female, soprano, alto
   - Neutral: androgynous, gender-neutral
   - Age: boy, girl, youthful, mature, aged

   **Vocal Quality:**
   - Texture: airy, breathy, gritty, raspy, smooth, silky, rough, gravelly
   - Resonance: deep, low, high, bright, dark, warm, cold
   - Intensity: powerful, gentle, soft, aggressive, delicate, forceful

   **Delivery Style:**
   - gospel vocal, operatic, theatrical
   - whispered, spoken word, shouting, screaming
   - clean vocals, harsh vocals, growling
   - auto-tuned, vocoder, robotic

   **Regional/Cultural:**
   - UK accent, American Southern, New York, West Coast
   - British rock vocal, Atlanta rap, Memphis style
   - K-pop style, J-pop inflection

   **Emotional:**
   - vulnerable, confident, melancholic, joyful
   - haunting, uplifting, dark, angelic

2. **Combination Generator**
   ```javascript
   generateVocalStyle(base, modifiers) 
   // Example: generateVocalStyle('female', ['ethereal', 'breathy', 'high'])
   // Output: "ethereal female vocals, breathy delivery, high register"
   ```

3. **Genre-Appropriate Suggestions**
   ```javascript
   suggestVocalsForGenre(genre)
   // For "Heavy Metal" → ['aggressive male', 'guttural', 'screaming']
   // For "R&B" → ['smooth male', 'soulful', 'melismatic']
   ```

4. **Vocal Layer System**
   Support for multi-vocal arrangements:
   - Lead vocal
   - Background vocals (harmonies, ad-libs)
   - Call and response patterns
   - Doubling/layering effects

5. **Examples Database**
   At least 50 pre-built vocal style combinations:
   ```javascript
   {
     name: "Gospel Power Vocal",
     tags: "masculine low gospel vocal, powerful delivery, emotional depth",
     genres: ["Gospel", "Soul", "R&B"],
     example: "[Powerful Male Gospel Vocal]"
   }
   ```

Include format validator that ensures vocal descriptors are in correct syntax for Suno.
```

---

## Prompt 14: Advanced Lyric Techniques & Special Effects

```
Implement advanced lyric formatting techniques discovered by Suno community.

Features to implement:

1. **Vowel Extension Technique**
   ```javascript
   extendVowels(word, syllables)
   // extendVowels("goodbye", 3) → "goo-o-o-odbye"
   // extendVowels("love", 2) → "lo-o-ove"
   ```
   - Auto-detect which syllable to extend
   - Slider for extension length (1-5 syllables)
   - Preview how it will sound

2. **Background Vocal Notation**
   ```javascript
   addBackgroundVocals(line, backgroundPart)
   // "E la cha-cha-cha" + "cha" → "E la cha-cha-cha (cha)"
   ```
   - Parentheses for automatic second/third vocal layer
   - Visual editor to add background parts
   - Support for "(oh)", "(yeah)", "(cha)", etc.

3. **Chord Annotation System**
   ```javascript
   addChords(lyrics, chordProgression)
   // Input: "Walking down the street"
   // Chords: ["Em", "G", "D", "C"]
   // Output: "(Em) Walking down the (G) street"
   ```
   - Chord placement assistant
   - Common progressions library
   - Key transposition tool

4. **Musical Notation per Syllable**
   ```javascript
   addNotes(line, notes)
   // "Beat of the heart" → "(G)Beat (G)of (A)the (B)heart"
   ```
   - Visual note selector (piano keyboard UI)
   - MIDI import support
   - Scale/key helper

5. **Special Meta Tags Library**
   
   **Ending Tags:**
   - `[end]` - Clear ending
   - `[fade out]` - Gradual fade
   - `[outro]` - Outro section
   - `[instrumental fade out]` - Instrumental ending
   
   **Transition Tags:**
   - `[bridge with ostinato]` - Repeating pattern
   - `[transition section]` - Smooth transition
   - `[build-up]` - Increasing intensity
   - `[breakdown]` - Stripping back
   - `[drop]` - EDM/Electronic drop
   
   **Instrumental Tags:**
   - `[sax]`, `[saxophone]`, `[solo]` - Instrument solos
   - Use repeated tags: `[sax][saxophone][solo]` for better results
   - Keep tags lowercase and concise
   
   **Vocal Effect Tags:**
   - `[angelic voice]` - Heavenly vocals
   - `[heavy female screaming section]` - Intense vocals
   - `[catchy hook]` - Memorable part
   - `[emotional bridge]` - Emotional peak

6. **Tag Optimizer**
   ```javascript
   optimizeTags(userTags)
   // "Beautiful saxophone solo" → "[sax][saxophone][solo]"
   // Converts verbose descriptions to concise, effective tags
   ```
   - Use ChatGPT/AI to refine tags
   - Suggest lowercase, short alternatives
   - Warn about overly complex tags

7. **Structure Template Builder**
   ```javascript
   buildStructureTemplate(sections)
   // Allow up to 3k character templates in custom mode
   ```
   Example template:
   ```
   [Bridge with Ostinato]
   [Transition Section]
   [Heavy Female Screaming Section]
   [Bridge Section]
   [Chorus with Drop]
   ```

Create visual editor for adding these advanced techniques with preview.
```

---

## Prompt 15: Genre-Specific Optimization Database

```
Create comprehensive genre-specific optimization rules based on Suno community best practices.

Build database with special handling for problematic genres:

1. **Hip Hop / Rap / Trap Optimization**
   
   **Problem:** Suno often produces wrong accents, British-sounding vocals
   
   **Solutions:**
   ```javascript
   const hiphopOptimizer = {
     regionalization: {
       southern: ["Memphis trap", "Atlanta trap", "Houston rap"],
       westCoast: ["west coast gangsta rap", "Compton hip-hop beat", "LA rap"],
       eastCoast: ["New York boom bap", "Brooklyn drill", "East Coast hip hop"]
     },
     
     techniques: [
       "Use 'Phonk Drum' tag for proper hip-hop sound",
       "Write lyrics in the desired accent/slang",
       "Combine with soul/blues for R&B vocals",
       "Specify regional style explicitly"
     ],
     
     effectiveTags: [
       "Memphis trap, dark, 808 bass, hi-hat rolls",
       "Atlanta trap, auto-tune, ad-libs, southern flow",
       "Boom bap, 90s hip hop, jazzy samples, vinyl crackle"
     ]
   }
   ```

2. **Electronic Music Specifics**
   ```javascript
   const electronicOptimizer = {
     structure: ["intro", "build-up", "drop", "breakdown", "build-up", "drop", "outro"],
     
     keyTags: {
       deepHouse: "[groovy bassline][4/4 beat][sub bass][atmospheric pads]",
       drumAndBass: "[fast breakbeats][heavy bassline][160-180 BPM]",
       synthwave: "[vintage synthesizers][analog warmth][retro drums]"
     },
     
     transitionTips: [
       "Use [build-up] before drops",
       "Use [breakdown] for calm sections",
       "Specify bar count: [8 bar build]"
     ]
   }
   ```

3. **Rock/Metal Vocal Tips**
   ```javascript
   const rockMetalOptimizer = {
     vocals: {
       clean: "powerful clean vocals, soaring melody",
       harsh: "guttural aggressive vocals, screaming",
       mixed: "clean vocals in verse, screaming in chorus"
     },
     
     guitars: [
       "heavy riffs",
       "distorted guitars", 
       "palm-muted chugging",
       "guitar solo with wah pedal"
     ]
   }
   ```

4. **Acoustic/Singer-Songwriter**
   ```javascript
   const acousticOptimizer = {
     keepSimple: true,
     avoidOverproduction: [
       "Don't overload with instruments",
       "Focus on vocals + 1-2 instruments",
       "Use 'intimate' and 'stripped back' descriptors"
     ],
     
     effectiveCombos: [
       "fingerpicked acoustic guitar, intimate vocals",
       "piano ballad, emotional delivery, minimalist"
     ]
   }
   ```

5. **Common Issues Database**
   ```javascript
   const commonIssues = {
     abruptEndings: {
       problem: "Song cuts off suddenly",
       solutions: ["[fade out]", "[outro]", "[instrumental fade out][end]"]
     },
     
     wrongInstrument: {
       problem: "Suno ignores instrument requests",
       solutions: [
         "Use repeated tags: [sax][saxophone][solo]",
         "Keep tags short and lowercase",
         "Try instrument name variations"
       ]
     },
     
     randomNoises: {
       problem: "TV static or weird sounds",
       solutions: [
         "Provide specific feedback",
         "Use cleaner style prompts",
         "Avoid conflicting descriptors"
       ]
     },
     
     loopingLyrics: {
       problem: "Same lyrics repeat endlessly",
       solutions: [
         "Use clear section markers",
         "Add [end] or [outro]",
         "Vary lyric structure"
       ]
     }
   }
   ```

6. **Best Practice Rules**
   ```javascript
   const bestPractices = {
     tagFormatting: {
       brackets: "Use [Square Brackets] for meta tags",
       parentheses: "Use (Parentheses) for inline styles or background vocals",
       capitalization: "Capitalize section names: [Verse], not [verse]",
       conciseness: "Short tags work better: [drop] not [epic drop section]"
     },
     
     layering: {
       styleThenTags: "Style prompt first, then lyrics with tags",
       dontMix: "Don't put lyrics in style prompt field",
       structure: "Plan structure before writing lyrics"
     },
     
     iteration: {
       multipleAttempts: "Generate 3-5 versions, pick best",
       tweakIncrementally: "Make small changes between attempts",
       saveSuccesses: "Document what works for reuse"
     }
   }
   ```

Create function that analyzes user's genre selection and automatically applies optimization rules:
```javascript
applyGenreOptimizations(genre, currentPrompt)
// Returns optimized prompt with genre-specific best practices
```
```

---

## Prompt 16: Intelligent Prompt Validation & Quality Scoring

```
Build an intelligent validation system that scores prompt quality and suggests improvements.

1. **Prompt Quality Scorer**
   ```javascript
   scorePrompt(prompt: PromptObject): QualityScore
   ```
   
   Score based on:
   - **Completeness (0-30 points)**
     - Has genre? +10
     - Has mood? +5
     - Has vocals specified? +5
     - Has tempo/BPM? +5
     - Has instrumentation? +5
   
   - **Specificity (0-30 points)**
     - Generic (pop, rock) = 10 points
     - Specific sub-genre (synthwave, death metal) = 20 points
     - Highly specific (Memphis trap, UK drill) = 30 points
   
   - **Balance (0-20 points)**
     - Not too short (< 5 elements) = -10
     - Not too long (> 20 elements) = -10
     - Well balanced (8-15 elements) = +20
   
   - **Coherence (0-20 points)**
     - Compatible combinations = +20
     - Conflicting elements (happy + melancholic) = -10
     - Genre/vocal mismatch = -5

   Return:
   ```javascript
   {
     totalScore: 85,
     breakdown: {
       completeness: 25,
       specificity: 28,
       balance: 20,
       coherence: 12
     },
     grade: "B+",
     suggestions: [...]
   }
   ```

2. **Smart Suggestions Engine**
   ```javascript
   generateSuggestions(prompt, score)
   ```
   
   Based on score, suggest:
   - **Missing elements**: "Add tempo (BPM) for better results"
   - **Specificity**: "Change 'rock' to 'indie rock' or 'hard rock'"
   - **Coherence**: "⚠️ 'aggressive' and 'gentle' conflict - choose one"
   - **Genre tips**: "For trap music, consider adding '808 bass' and 'hi-hat rolls'"
   - **Enhancement**: "Add production quality keywords like 'mastered' or 'studio quality'"

3. **Conflict Detector**
   ```javascript
   detectConflicts(prompt): Conflict[]
   ```
   
   Check for:
   - Mood conflicts (happy + sad, energetic + calm)
   - Genre incompatibilities (classical + trap)
   - Vocal mismatches (screaming + lullaby)
   - Tempo conflicts (fast BPM + slow genre)
   
   Return warnings with explanations:
   ```javascript
   {
     type: "mood_conflict",
     elements: ["euphoric", "melancholic"],
     severity: "high",
     suggestion: "Choose one primary mood or use 'bittersweet' to combine"
   }
   ```

4. **Completeness Checker**
   ```javascript
   checkCompleteness(prompt): CompletionSuggestion[]
   ```
   
   Essential elements:
   - ✅ Genre (required)
   - ⚠️ Mood (recommended)
   - ⚠️ Vocals (recommended)
   - ℹ️ Tempo (optional but helpful)
   - ℹ️ Key (optional)
   - ℹ️ Instruments (optional but recommended)

5. **Lyrics Structure Validator**
   ```javascript
   validateLyricStructure(lyrics): ValidationResult
   ```
   
   Check:
   - ✅ Proper meta tag syntax `[Tag]`
   - ✅ Balanced sections (not too long/short)
   - ✅ Closing brackets
   - ⚠️ Section variety (not all verses)
   - ⚠️ Appropriate song length
   - ❌ Invalid tags or typos
   
   Return:
   ```javascript
   {
     isValid: true,
     errors: [],
     warnings: [
       "Verse 1 is very long (16 lines) - consider splitting"
     ],
     stats: {
       totalSections: 7,
       verses: 2,
       choruses: 3,
       estimatedDuration: "3:45"
     }
   }
   ```

6. **Real-time Validation UI**
   - Green checkmark for valid elements
   - Yellow warning triangle for improvements
   - Red X for conflicts/errors
   - Score badge showing current quality (0-100)
   - Progress bar showing completeness

7. **Comparison Tool**
   ```javascript
   comparePrompts(prompt1, prompt2)
   ```
   
   Show side-by-side:
   - Score differences
   - Element changes
   - Quality improvements/regressions
   - Helpful for A/B testing

Create visual dashboard showing prompt health at a glance.
```

---

## Prompt 17: Template System with Community Presets

```
Build a comprehensive template library system with sharable community presets.

1. **Template Structure**
   ```typescript
   interface SunoTemplate {
     id: string;
     name: string;
     description: string;
     author: string;
     category: string;
     tags: string[];
     
     // Prompt data
     stylePrompt: string;
     lyricsTemplate?: string;
     structure: string;
     
     // Metadata
     genre: string[];
     mood: string[];
     vocals: string;
     bpm?: number;
     key?: string;
     
     // Stats
     uses: number;
     rating: number;
     created: Date;
     
     // Examples
     exampleOutputs?: string[]; // URLs to Suno songs
     tips?: string[];
   }
   ```

2. **Pre-built Template Categories**
   
   **By Genre (50+ templates):**
   - Rock (Heavy Metal, Indie Rock, Punk, etc.)
   - Electronic (House, Techno, Synthwave, etc.)
   - Hip Hop (Trap, Boom Bap, Drill, etc.)
   - Pop (Synth-pop, K-pop, Indie Pop, etc.)
   - And more...

   **By Mood:**
   - Energetic workout tracks
   - Relaxing chill music
   - Dark atmospheric
   - Happy uplifting
   - Sad emotional

   **By Use Case:**
   - Video game music
   - Film soundtrack
   - Commercial/ad music
   - Podcast intro
   - Wedding song

3. **Template Browser Component**
   ```javascript
   <TemplateBrowser>
     - Grid/List view toggle
     - Filter by: category, genre, mood, rating
     - Search functionality
     - Sort by: popular, recent, highest rated
     - Preview card with:
       * Template name
       * Genre tags
       * Rating stars
       * Use count
       * Quick preview button
   </TemplateBrowser>
   ```

4. **Template Customization**
   ```javascript
   customizeTemplate(template, modifications)
   ```
   - Load template into builder
   - Allow editing all fields
   - "Save as new template" option
   - Fork/remix functionality

5. **Community Features**
   ```javascript
   shareTemplate(template): string // Returns shareable URL
   importTemplate(url): Template
   rateTemplate(id, rating)
   reportTemplate(id, reason)
   ```

6. **Template Export/Import**
   - JSON format for data portability
   - URL encoding for sharing
   - QR code generation
   - Copy to clipboard

7. **Featured Templates**
   Create at least 20 high-quality starter templates:

   ```javascript
   const featuredTemplates = [
     {
       name: "Epic Synthwave Night Drive",
       stylePrompt: "Synthwave, Retro-futuristic, Dark, 112 BPM, A minor, Vintage synthesizers, Heavy bass, Robotic vocals, Neon-noir atmosphere, Analog warmth, 80s influence, Reverb-drenched, Cinematic",
       structure: "intro-verse-chorus-verse-chorus-bridge-chorus-outro",
       genre: ["Synthwave", "Electronic"],
       mood: ["Dark", "Atmospheric", "Retro"],
       rating: 4.8,
       tips: [
         "Use dark, neon-related imagery in lyrics",
         "Add [Synth Solo] for best results"
       ]
     },
     
     {
       name: "Memphis Trap Banger",
       stylePrompt: "Memphis trap, Dark, Southern flow, 808 bass, Hi-hat rolls, Snappy snares, Auto-tuned vocals, Phonk Drum, Aggressive delivery, Street atmosphere",
       structure: "intro-verse-hook-verse-hook-bridge-hook-outro",
       genre: ["Trap", "Hip Hop"],
       mood: ["Dark", "Aggressive", "Street"],
       tips: [
         "Use southern slang in lyrics",
         "Add [Ad-libs] sections",
         "Keep verses 16 bars"
       ]
     },
     
     // ... 18 more
   ]
   ```

8. **Template Analytics**
   Track which templates are most popular, successful, etc.
   Show trending templates on homepage.

Implement search with fuzzy matching and tag-based filtering.
```

---

## Prompt 18: Batch Generation & Variation System

```
Create a batch generation system that creates multiple prompt variations automatically.

1. **Variation Generator**
   ```javascript
   generateVariations(basePrompt, count, variationLevel)
   ```
   
   **Variation Levels:**
   - **Light (10-20% change)**
     - Swap 1-2 mood descriptors
     - Adjust BPM by ±5-10
     - Add/remove one instrument
   
   - **Medium (30-50% change)**
     - Change sub-genre
     - Modify vocal style
     - Swap 3-4 descriptors
     - Different key
   
   - **Heavy (60-80% change)**
     - Different approach to same theme
     - Major changes to instrumentation
     - Different vocal gender/style
     - Genre-blend variations

2. **Smart Variation Algorithm**
   ```javascript
   createVariation(prompt, level) {
     const variation = {...prompt};
     
     switch(level) {
       case 'light':
         variation.mood = getRelatedMood(prompt.mood);
         variation.bpm += randomInt(-10, 10);
         break;
         
       case 'medium':
         variation.genre = getRelatedGenre(prompt.genre);
         variation.vocals = getAlternativeVocal(prompt.vocals);
         variation.instruments = swapInstruments(prompt.instruments, 0.4);
         break;
         
       case 'heavy':
         variation.genre = getContrastingGenre(prompt.genre);
         variation.mood = getContrastingMood(prompt.mood);
         // Rebuild most elements
         break;
     }
     
     return variation;
   }
   ```

3. **Related Element Database**
   ```javascript
   const relationships = {
     moods: {
       dark: ['mysterious', 'ominous', 'brooding', 'noir'],
       happy: ['joyful', 'euphoric', 'uplifting', 'cheerful'],
       // ...
     },
     
     genres: {
       synthwave: ['darkwave', 'vaporwave', 'outrun', 'cyberpunk'],
       trap: ['drill', 'phonk', 'cloud rap', 'rage'],
       // ...
     },
     
     vocals: {
       'ethereal female': ['airy female', 'angelic voice', 'breathy female'],
       'aggressive male': ['guttural', 'harsh vocals', 'screaming'],
       // ...
     }
   }
   ```

4. **Batch UI Component**
   ```javascript
   <BatchGenerator>
     - Base prompt input
     - Variation count slider (1-10)
     - Variation level selector
     - "Generate Variations" button
     - Results grid showing all variations
     - Side-by-side comparison
     - Checkbox selection for export
   </BatchGenerator>
   ```

5. **Batch Export**
   ```javascript
   exportBatch(variations, format)
   ```
   
   Formats:
   - ZIP file with individual .txt files
   - Single .txt with numbered sections
   - JSON array
   - CSV spreadsheet
   - Markdown document

6. **A/B Testing Tools**
   ```javascript
   compareVariations(variations)
   ```
   
   Show table comparing:
   - Style prompts (highlighted differences)
   - Quality scores
   - Element differences
   - Suggestions for each

7. **Parameter Randomization**
   ```javascript
   randomizeWithConstraints(prompt, constraints)
   ```
   
   Example:
   ```javascript
   randomizeWithConstraints(basePrompt, {
     keepGenre: true,  // Don't change genre
     keepStructure: true,  // Keep song structure
     randomizeMood: true,  // Try different moods
     randomizeVocals: true,  // Try different vocals
     bpmRange: [100, 140]  // Constrain BPM
   })
   ```

8. **Batch History**
   - Save all generated batches
   - Recall and regenerate
   - Mark favorites
   - Notes/comments on batches

Create intuitive UI for managing large numbers of variations.
```

---

## Usage Instructions (Updated)

**Recommended Build Order:**

**Phase 1 - Foundation (Day 1):**
1. Prompt 1: Core Data Structures
2. Prompt 2: Style Prompt Builder
3. Prompt 3: Meta Tag Formatter

**Phase 2 - Core Features (Day 2-3):**
4. Prompt 4: Enhancement Engine
5. Prompt 5: Genre Templates
6. Prompt 13: Vocal Styling System
7. Prompt 14: Advanced Lyric Techniques
8. Prompt 15: Genre Optimization

**Phase 3 - UI (Day 4-5):**
9. Prompt 6: Component Structure
10. Prompt 7: Suggestion System
11. Prompt 10: State Management

**Phase 4 - Quality & Features (Day 6-7):**
12. Prompt 11: Validation
13. Prompt 16: Quality Scoring
14. Prompt 8: Parser & Analyzer
15. Prompt 17: Template System

**Phase 5 - Advanced (Day 8-9):**
16. Prompt 18: Batch Generation
17. Prompt 9: Export Features
18. Prompt 12: Final Assembly

**Phase 6 - Polish (Day 10):**
- Testing
- Bug fixes
- UI/UX improvements
- Performance optimization

**Pro Tips for Implementation:**
- Build and test each prompt before moving to next
- Create a git commit after each major prompt
- Keep a notes file documenting what works
- Screenshot successful generated outputs
- Test with real Suno AI to validate accuracy

This gives you a production-ready Suno AI prompt generator! 🎵