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

```
Design the complete React UI for the Style + Lyrics generator focused on Suno's two main fields.

**Core Interface: Two-Panel Generator**

```typescript
<SunoPromptGenerator>
  <LeftPanel>
    {/* User Input Controls */}
    <StyleBuilder />
    <LyricsEditor />
  </LeftPanel>
  
  <RightPanel>
    {/* Live Output Preview */}
    <OutputPreview>
      <StylePromptOutput />
      <LyricsOutput />
    </OutputPreview>
  </RightPanel>
</SunoPromptGenerator>
```

**Component Requirements:**

**1. StyleBuilder Component**
```typescript
interface StyleBuilderProps {
  onChange: (stylePrompt: string) => void;
}

<StyleBuilder>
  {/* Primary Controls */}
  <GenreSelector 
    placeholder="Select genre..."
    searchable
    categories={genreCategories}
  />
  
  <MoodSelector
    multiSelect
    max={3}
    suggestions={moodSuggestions}
  />
  
  <VocalStyleSelector
    options={vocalStyles}
    grouped
  />
  
  {/* Optional Controls - Collapsible */}
  <AdvancedOptions collapsed>
    <BPMSlider range={[60, 200]} />
    <KeySelector options={musicalKeys} />
    <InstrumentMultiSelect max={5} />
    <ProductionSelector />
  </AdvancedOptions>
  
  {/* Quick Actions */}
  <ActionButtons>
    <EnhanceButton onClick={enhancePrompt} />
    <LoadTemplateButton onClick={showTemplates} />
    <RandomizeButton onClick={randomize} />
    <ClearButton onClick={clear} />
  </ActionButtons>
</StyleBuilder>
```

**2. LyricsEditor Component**
```typescript
<LyricsEditor>
  {/* Main Text Area */}
  <TextArea
    placeholder="Write your lyrics here or let AI generate..."
    rows={20}
    syntaxHighlight // Highlights meta tags
    autoComplete // Suggests meta tags as you type
    value={lyrics}
    onChange={handleLyricsChange}
  />
  
  {/* Meta Tag Toolbar */}
  <MetaTagToolbar>
    <TagGroup label="Structure">
      <TagButton tag="[Intro]" />
      <TagButton tag="[Verse]" />
      <TagButton tag="[Pre-Chorus]" />
      <TagButton tag="[Chorus]" />
      <TagButton tag="[Bridge]" />
      <TagButton tag="[Outro]" />
    </TagGroup>
    
    <TagGroup label="Vocals">
      <TagButton tag="[Female Vocal]" />
      <TagButton tag="[Male Vocal]" />
      <TagButton tag="[Whispered]" />
    </TagGroup>
    
    <TagGroup label="Instruments">
      <TagButton tag="[Guitar Solo]" />
      <TagButton tag="[Instrumental]" />
    </TagGroup>
    
    <TagGroup label="Endings">
      <TagButton tag="[Fade out]" />
      <TagButton tag="[End]" />
    </TagGroup>
  </MetaTagToolbar>
  
  {/* Structure Tools */}
  <StructureTools>
    <ApplyStructureButton
      templates={['Pop', 'Hip Hop', 'Electronic', 'Ballad']}
      onClick={applyStructure}
    />
    <AdvancedToolsDropdown>
      <AddVowelExtension />
      <AddBackgroundVocals />
      <AddChordAnnotations />
    </AdvancedToolsDropdown>
  </StructureTools>
  
  {/* Validation Display */}
  <ValidationBar>
    <SectionCount sections={7} />
    <EstimatedDuration duration="3:45" />
    <ErrorCount errors={0} />
    <WarningCount warnings={2} />
  </ValidationBar>
</LyricsEditor>
```

**3. OutputPreview Component**
```typescript
<OutputPreview>
  {/* Style Prompt Output */}
  <OutputSection title="Style of Music">
    <CopyableTextBox
      value={stylePrompt}
      label="Ready to paste into Suno"
      actions={
        <>
          <CopyButton />
          <EditButton onClick={goBackToEdit} />
          <SaveButton onClick={saveToHistory} />
        </>
      }
    />
    
    {/* Quality Score */}
    <QualityScore score={85} grade="B+" />
    
    {/* Suggestions */}
    <SuggestionsList suggestions={[
      "Add BPM for better results",
      "Consider specifying key"
    ]} />
  </OutputSection>
  
  {/* Lyrics Output */}
  <OutputSection title="Lyrics">
    <CopyableTextBox
      value={formattedLyrics}
      label="Ready to paste into Suno"
      syntaxHighlighted
      actions={
        <>
          <CopyButton />
          <DownloadButton format=".txt" />
          <EditButton onClick={goBackToLyrics} />
        </>
      }
    />
    
    {/* Structure Visualization */}
    <StructureViz sections={parsedSections} />
    
    {/* Validation Results */}
    <ValidationResults
      errors={validationErrors}
      warnings={validationWarnings}
    />
  </OutputSection>
  
  {/* Combined Actions */}
  <GlobalActions>
    <CopyBothButton label="Copy Both Fields" />
    <GenerateVariationsButton onClick={createVariations} />
    <ExportButton formats={['txt', 'json']} />
  </GlobalActions>
</OutputPreview>
```

**4. TemplateLibrary Component**
```typescript
<TemplateLibrary>
  <FilterBar>
    <CategoryFilter options={['All', 'Electronic', 'Rock', 'Hip Hop', ...]} />
    <SearchBar placeholder="Search templates..." />
    <SortDropdown options={['Popular', 'Recent', 'Alphabetical']} />
  </FilterBar>
  
  <TemplateGrid>
    {templates.map(template => (
      <TemplateCard
        title={template.name}
        category={template.category}
        preview={template.stylePrompt.substring(0, 100)}
        tags={template.tags}
        rating={template.rating}
        uses={template.uses}
        actions={
          <>
            <LoadButton onClick={() => loadTemplate(template)} />
            <PreviewButton onClick={() => showPreview(template)} />
            <FavoriteButton onClick={() => favorite(template)} />
          </>
        }
      />
    ))}
  </TemplateGrid>
</TemplateLibrary>
```

**5. History Component**
```typescript
<History>
  <HistoryList>
    {history.map(entry => (
      <HistoryItem
        date={entry.date}
        stylePreview={entry.style.substring(0, 50)}
        lyricsPreview={entry.lyrics.substring(0, 50)}
        actions={
          <>
            <LoadButton onClick={() => loadFromHistory(entry)} />
            <DeleteButton onClick={() => deleteEntry(entry.id)} />
            <StarButton starred={entry.starred} />
          </>
        }
      />
    ))}
  </HistoryList>
</History>
```

**Key Features:**

**Real-time Validation:**
- Meta tag syntax checking
- Bracket matching
- Invalid tag detection
- Section balance warnings

**Smart Suggestions:**
- As-you-type autocomplete for meta tags
- Genre-appropriate instrument suggestions
- Mood compatibility checking
- Conflict detection

**Visual Feedback:**
- Green checkmarks for valid elements
- Yellow warnings for improvements
- Red errors for conflicts
- Score badge (0-100)

**Keyboard Shortcuts:**
- Ctrl/Cmd + B: Insert [Verse]
- Ctrl/Cmd + H: Insert [Chorus]
- Ctrl/Cmd + Enter: Generate/Enhance
- Ctrl/Cmd + C: Copy output
- Ctrl/Cmd + S: Save to history

**Mobile Responsive:**
- Stack panels vertically on mobile
- Touch-friendly controls
- Swipe between input/output
- Bottom sheet for templates

**Dark/Light Theme:**
- Toggle in header
- Syntax highlighting adapts
- Comfortable for long sessions

Create with:
- React 18+ with hooks
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- React Hook Form (form handling)
- Zustand or Context (state)
```

---

## Prompt 7: Batch Generation & Variations System

```
Create a system to generate multiple style + lyrics variations from a single concept.

**Purpose**: Help users explore different approaches to their song idea

Requirements:

1. **Batch Generation Interface**
   ```javascript
   interface BatchConfig {
     baseStylePrompt: string;
     baseLyrics?: string;
     variationCount: number; // 1-10
     variationType: 'light' | 'medium' | 'heavy';
     varyStyle: boolean; // Vary style prompt
     varyLyrics: boolean; // Vary lyrics
   }
   
   function generateBatch(config: BatchConfig): Variation[]
   ```

2. **Variation Types**
   
   **Light Variations** (10-20% change):
   ```javascript
   // Original: "Indie Rock, Energetic, 128 BPM"
   // Variations:
   "Indie Rock, Upbeat, 128 BPM" // Mood swap
   "Indie Rock, Energetic, 132 BPM" // BPM adjust
   "Indie Rock, Energetic, Driving tempo" // Remove BPM
   ```
   
   **Medium Variations** (30-50% change):
   ```javascript
   // Original: "Indie Rock, Energetic, Jangly guitars, Male vocals"
   // Variations:
   "Alternative Rock, Energetic, Clean guitars, Male vocals" // Sub-genre
   "Indie Rock, Energetic, Jangly guitars, Female vocals" // Vocal gender
   "Indie Rock, Raw energy, Distorted guitars, Male vocals" // Instruments
   ```
   
   **Heavy Variations** (60-80% change):
   ```javascript
   // Original: "Indie Rock, Energetic, Jangly guitars, Male vocals"
   // Variations:
   "Post-Punk, Dark, Angular guitars, Baritone vocals" // Major rethink
   "Dream Pop, Ethereal, Shimmering guitars, Soft vocals" // Genre shift
   "Garage Rock, Raw, Fuzzy guitars, Shouted vocals" // Energy shift
   ```

3. **Style Variation Algorithm**
   ```javascript
   function varyStyle(original, level) {
     const components = parseStylePrompt(original);
     
     switch(level) {
       case 'light':
         return {
           ...components,
           mood: getRelatedMood(components.mood),
           bpm: adjustBPM(components.bpm, 5)
         };
       
       case 'medium':
         return {
           ...components,
           genre: getRelatedGenre(components.genre),
           vocals: getAlternativeVocal(components.vocals),
           instruments: swapInstruments(components.instruments, 0.4)
         };
       
       case 'heavy':
         return {
           genre: getContrastingGenre(components.genre),
           mood: getContrastingMood(components.mood),
           // Rebuild most components
         };
     }
   }
   ```

4. **Lyrics Variation System**
   ```javascript
   function varyLyrics(original, level) {
     // Light: Keep structure, vary specific words
     // Medium: Keep theme, rewrite sections
     // Heavy: New interpretation of theme
   }
   ```

5. **Batch UI**
   ```typescript
   <BatchGenerator>
     <ConfigPanel>
       <VariationCount slider={[1, 10]} />
       <VariationType select={['light', 'medium', 'heavy']} />
       <VaryToggles>
         <Toggle label="Vary Style" />
         <Toggle label="Vary Lyrics" />
       </VaryToggles>
       <GenerateButton onClick={generateBatch} />
     </ConfigPanel>
     
     <ResultsGrid>
       {variations.map((variation, index) => (
         <VariationCard
           number={index + 1}
           style={variation.stylePrompt}
           lyrics={variation.lyrics}
           differences={highlightDifferences(original, variation)}
           actions={
             <>
               <SelectButton onClick={() => selectVariation(variation)} />
               <CompareButton onClick={() => compareToOriginal(variation)} />
               <CopyButton />
             </>
           }
         />
       ))}
     </ResultsGrid>
     
     <BatchActions>
       <ExportAllButton onClick={exportBatch} />
       <CompareSelectedButton onClick={compareSelected} />
       <RegenerateButton onClick={regenerateBatch} />
     </BatchActions>
   </BatchGenerator>
   ```

6. **Comparison View**
   ```typescript
   <ComparisonView>
     <SideBySide>
       <Panel title="Original">
         <StylePrompt value={original.style} />
         <Lyrics value={original.lyrics} />
       </Panel>
       
       <Panel title="Variation">
         <StylePrompt 
           value={variation.style}
           highlightDifferences={true}
         />
         <Lyrics 
           value={variation.lyrics}
           highlightDifferences={true}
         />
       </Panel>
     </SideBySide>
     
     <DifferencesSummary>
       <Change>Genre: Indie Rock → Alternative Rock</Change>
       <Change>Mood: Energetic → Raw energy</Change>
       <Change>Added: Distortion pedal</Change>
     </DifferencesSummary>
   </ComparisonView>
   ```

7. **Export Batch**
   ```javascript
   function exportBatch(variations, format) {
     // Format: 'zip' | 'txt' | 'json'
     // Creates numbered files: variation_1.txt, variation_2.txt, etc.
     // Or single file with sections
   }
   ```

Create variation strategies:
- Genre relationships map
- Mood synonyms/contrasts
- Instrument substitutions
- Vocal alternatives
- Production style variations
```

---

## Prompt 8: Quality Scoring & Validation System

```
Build an intelligent system that scores prompt quality and validates lyrics structure.

**Two Scoring Systems:**
1. Style Prompt Quality (0-100)
2. Lyrics Structure Quality (0-100)

Requirements:

1. **Style Prompt Scoring**
   ```javascript
   function scoreStylePrompt(prompt) {
     let score = 0;
     const components = parsePrompt(prompt);
     
     // Completeness (0-30 points)
     if (components.genre) score += 10;
     if (components.mood) score += 5;
     if (components.vocals) score += 5;
     if (components.tempo) score += 5;
     if (components.instruments) score += 5;
     
     // Specificity (0-30 points)
     if (isSpecificGenre(components.genre)) score += 15;
     if (hasMultipleMoods(components.mood)) score += 5;
     if (hasDetailedVocals(components.vocals)) score += 5;
     if (hasSpecificInstruments(components.instruments)) score += 5;
     
     // Balance (0-20 points)
     const elementCount = countElements(prompt);
     if (elementCount >= 8 && elementCount <= 15) score += 20;
     else if (elementCount < 5 || elementCount > 20) score -= 10;
     
     // Coherence (0-20 points)
     if (!hasConflicts(components)) score += 20;
     else score -= detectConflicts(components).length * 5;
     
     return {
       totalScore: Math.max(0, Math.min(100, score)),
       grade: getGrade(score), // A+, A, B+, etc.
       breakdown: {
         completeness: ...,
         specificity: ...,
         balance: ...,
         coherence: ...
       }
     };
   }
   ```

2. **Lyrics Structure Scoring**
   ```javascript
   function scoreLyrics(lyrics) {
     let score = 0;
     
     // Meta Tag Usage (0-30 points)
     if (hasStructuralTags(lyrics)) score += 15;
     if (hasEndingTag(lyrics)) score += 10;
     if (hasVocalTags(lyrics)) score += 5;
     
     // Structure Balance (0-30 points)
     const sections = parseSections(lyrics);
     if (hasRepeatedChorus(sections)) score += 10;
     if (hasVariety(sections)) score += 10;
     if (sectionsAppropriateLength(sections)) score += 10;
     
     // Formatting (0-20 points)
     if (allTagsClosed(lyrics)) score += 10;
     if (properLineBreaks(lyrics)) score += 5;
     if (noSyntaxErrors(lyrics)) score += 5;
     
     // Completeness (0-20 points)
     if (hasIntro(sections)) score += 5;
     if (hasVerse(sections)) score += 5;
     if (hasChorus(sections)) score += 5;
     if (hasEnding(sections)) score += 5;
     
     return {
       totalScore: Math.max(0, Math.min(100, score)),
       grade: getGrade(score),
       breakdown: {...}
     };
   }
   ```

3. **Validation System**
   ```javascript
   interface ValidationResult {
     isValid: boolean;
     errors: ValidationError[];
     warnings: ValidationWarning[];
     suggestions: string[];
   }
   
   function validateComplete(style, lyrics) {
     return {
       styleValidation: validateStyle(style),
       lyricsValidation: validateLyrics(lyrics),
       overallScore: (styleScore + lyricsScore) / 2,
       readyForSuno: isValid && score >= 60
     };
   }
   ```

4. **Real-time Feedback UI**
   ```typescript
   <QualityDashboard>
     <ScoreCard title="Style Prompt Quality">
       <CircularProgress value={styleScore} color={getColor(styleScore)} />
       <Grade>{styleGrade}</Grade>
       <Breakdown>
         <Item label="Completeness" value={25} max={30} />
         <Item label="Specificity" value={20} max={30} />
         <Item label="Balance" value={18} max={20} />
         <Item label="Coherence" value={15} max={20} />
       </Breakdown>
     </ScoreCard>
     
     <ScoreCard title="Lyrics Quality">
       <CircularProgress value={lyricsScore} color={getColor(lyricsScore)} />
       <Grade>{lyricsGrade}</Grade>
       <Breakdown>
         <Item label="Structure" value={28} max={30} />
         <Item label="Meta Tags" value={25} max={30} />
         <Item label="Formatting" value={18} max={20} />
         <Item label="Completeness" value={17} max={20} />
       </Breakdown>
     </ScoreCard>
     
     <ActionItems>
       <Errors count={errors.length}>
         {errors.map(error => (
           <ErrorItem
             message={error.message}
             fix={error.suggestedFix}
             onClick={applyFix}
           />
         ))}
       </Errors>
       
       <Warnings count={warnings.length}>
         {warnings.map(warning => (
           <WarningItem
             message={warning.message}
             suggestion={warning.suggestion}
           />
         ))}
       </Warnings>
       
       <Suggestions>
         {suggestions.map(suggestion => (
           <SuggestionItem
             text={suggestion.text}
             impact={suggestion.scoreImpact}
             onClick={applySuggestion}
           />
         ))}
       </Suggestions>
     </ActionItems>
   </QualityDashboard>
   ```

5. **Conflict Detection**
   ```javascript
   function detectConflicts(components) {
     const conflicts = [];
     
     // Mood conflicts
     if (hasMood(components, 'energetic') && hasMood(components, 'calm')) {
       conflicts.push({
         type: 'mood',
         elements: ['energetic', 'calm'],
         severity: 'high',
         suggestion: 'Choose one primary mood'
       });
     }
     
     // Genre/BPM mismatch
     if (components.genre === 'Ambient' && components.bpm > 120) {
       conflicts.push({
         type: 'tempo',
         suggestion: 'Ambient typically 60-90 BPM'
       });
     }
     
     // Vocal/genre mismatch
     if (components.genre.includes('Metal') && 
         components.vocals === 'whispered') {
       conflicts.push({
         type: 'vocal',
         suggestion: 'Metal usually has powerful/harsh vocals'
       });
     }
     
     return conflicts;
   }
   ```

Create visual scoring system with:
- Real-time score updates
- Color-coded feedback (red/yellow/green)
- Actionable suggestions
- One-click fixes for common issues
```

---

## Usage Instructions

### Build Order (Streamlined for Style + Lyrics Focus)

**Week 1 - Foundation:**
- Day 1-2: Prompt 1 (Data Structures)
- Day 3-4: Prompt 2 (Style Builder)
- Day 5: Prompt 3 (Lyrics Formatter)

**Week 2 - Core Features:**
- Day 1-2: Prompt 4 (Genre Templates)
- Day 3-4: Prompt 5 (Enhancement Engine)
- Day 5: Prompt 6 (UI Implementation)

**Week 3 - Advanced Features:**
- Day 1-2: Prompt 7 (Batch Generation)
- Day 3-4: Prompt 8 (Quality Scoring)
- Day 5: Testing & Polish

**Week 4 - Launch:**
- Integration testing
- User feedback
- Bug fixes
- Documentation

### Key Implementation Tips:

1. **Start Simple**: Build basic style + lyrics generator first
2. **Test with Real Suno**: Validate outputs actually work in Suno
3. **User-First Design**: Make it faster than manual writing
4. **Mobile Responsive**: Many users will be on mobile
5. **Save Everything**: History is crucial for iterations
6. **Copy-Paste Focus**: One-click copy to Suno is essential

### Success Metrics:

- ✅ Generates valid Suno prompts 95%+ of time
- ✅ Faster than manual writing (< 2 minutes)
- ✅ High quality scores (80+ average)
- ✅ Zero syntax errors in output
- ✅ Users generate 3+ variations per session

---

## Complete Feature Checklist

### Must-Have Features ✅

**Style Prompt Generation:**
- [x] Genre selector (searchable, categorized)
- [x] Mood selector (multi-select)
- [x] Vocal style selector
- [x] BPM slider (optional)
- [x] Key selector (optional)
- [x] Instrument multi-select
- [x] One-click enhancement
- [x] Genre templates (30+)
- [x] Real-time validation
- [x] Quality scoring

**Lyrics Formatting:**
- [x] Syntax-highlighted editor
- [x] Meta tag toolbar (click to insert)
- [x] Structure templates (Pop, Hip Hop, etc.)
- [x] Auto-complete meta tags
- [x] Bracket matching
- [x] Validation warnings
- [x] Vowel extension tool
- [x] Background vocal notation
- [x] Ending tag generator

**Output & Export:**
- [x] Live preview
- [x] One-click copy (both fields)
- [x] Download as .txt
- [x] Save to history
- [x] Generate variations
- [x] Quality scores displayed

**User Experience:**
- [x] Mobile responsive
- [x] Dark/light theme
- [x] Keyboard shortcuts
- [x] Undo/redo
- [x] History browsing
- [x] Template library
- [x] Search & filter

### Nice-to-Have Features 🌟
- [ ] AI lyric generation
- [ ] Rhyme suggestions
- [ ] Melody hints
- [ ] Collaboration features
- [ ] Community templates
- [ ] Social sharing
- [ ] Analytics dashboard

---

## Quick Reference

### Perfect Style Prompt Formula:
```
[PRIMARY GENRE], [MOOD(S)], [BPM], [VOCALS], 
[KEY INSTRUMENTS], [ATMOSPHERE], [PRODUCTION]
```

### Essential Meta Tags:
```
[Intro] [Verse] [Pre-Chorus] [Chorus] 
[Bridge] [Outro] [Fade out] [End]
```

### Quality Checklist:
- ✅ Has genre (required)
- ✅ Has mood (recommended)
- ✅ Has vocals (recommended)
- ✅ 8-15 elements total (optimal)
- ✅ No conflicting descriptors
- ✅ Genre-appropriate choices

This focused implementation gives you everything needed to build a professional Suno prompt generator! 🎵

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

# Suno AI Style & Lyrics Generator - Implementation Prompts

## 🎯 FOCUS: Style Prompt + Lyrics Generation (Suno WebUI Core)

**This guide focuses on the two main input fields in Suno's Custom Mode:**
1. **Style of Music** field (genre, mood, instruments, vocals)
2. **Lyrics** field (with meta tags and structure)

We're building a prompt generator that creates optimized content for these two fields.

---

## Prompt 1: Core Data Structures for Style & Lyrics

```
Create comprehensive data structures for Suno AI style prompts and lyrics formatting.

**FOCUS: Two main outputs**
1. Style Prompt (comma-separated string)
2. Formatted Lyrics (with meta tags)

Requirements:

1. **Genre Database** (1,200+ genres)
   ```typescript
   interface Genre {
     name: string;
     category: string;
     subGenres: string[];
     bpmRange: [number, number];
     commonKeys: string[];
     typicalInstruments: string[];
     vocalsStyle: string[];
     stylePromptTemplate: string; // Pre-built style prompt
     keywords: string[]; // Common descriptors
   }
   ```

2. **Style Component Library**
   ```typescript
   interface StyleComponents {
     moods: string[]; // dark, upbeat, melancholic, energetic, etc.
     tempoDescriptors: string[]; // driving, laid-back, frenetic, etc.
     vocalQualities: string[]; // ethereal, powerful, gritty, smooth, etc.
     instruments: string[]; // guitar, synth, 808, piano, etc.
     production: string[]; // studio-quality, lo-fi, mastered, etc.
     atmosphere: string[]; // intimate, spacious, warm, cold, etc.
   }
   ```

3. **Meta Tags Reference**
   ```typescript
   interface MetaTag {
     tag: string; // e.g., "[Verse]"
     category: 'structure' | 'vocal' | 'instrumental' | 'transition' | 'effect';
     description: string;
     usage: string;
     examples: string[];
   }
   
   const metaTags = {
     structure: ['[Intro]', '[Verse]', '[Pre-Chorus]', '[Chorus]', '[Bridge]', '[Outro]'],
     vocal: ['[Female Vocal]', '[Whispered]', '[Screaming]', '[Clean vocals]'],
     instrumental: ['[Guitar Solo]', '[Piano Break]', '[Instrumental]'],
     transition: ['[Build-up]', '[Drop]', '[Fade out]', '[Break]'],
     ending: ['[End]', '[Fade out]', '[Outro][Instrumental Fade out][End]']
   }
   ```

4. **Lyrics Structure Templates**
   ```typescript
   interface LyricsTemplate {
     name: string; // "Pop/Rock Standard", "Hip Hop", "Electronic"
     structure: string[]; // ['[Intro]', '[Verse 1]', '[Chorus]', ...]
     sectionGuidelines: {
       section: string;
       lineCount: number;
       notes: string;
     }[];
   }
   ```

5. **Style Prompt Formula**
   ```typescript
   interface StylePromptFormula {
     order: string[]; // ['genre', 'mood', 'tempo', 'vocals', 'instruments', 'production']
     required: string[]; // ['genre']
     recommended: string[]; // ['mood', 'vocals']
     optional: string[]; // ['tempo', 'key', 'production']
   }
   ```

Export all as TypeScript constants and types. Include at least:
- 100+ genres across 10+ categories
- 50+ mood descriptors
- 40+ vocal styles
- 60+ instruments
- 30+ production keywords
- 50+ meta tags

Make everything easily searchable and filterable.
```

---

## Prompt 2: Style Prompt Builder Engine

```
Create the core style prompt builder that generates optimized "Style of Music" field content.

**INPUT**: User selections (genre, mood, vocals, instruments, etc.)
**OUTPUT**: Comma-separated style prompt string optimized for Suno

Requirements:

1. **Main Builder Function**
   ```javascript
   function buildStylePrompt(config) {
     const {
       primaryGenre,      // Required
       secondaryGenre,    // Optional
       mood,              // Array of moods
       bpm,               // Number or null
       key,               // String or null
       vocalStyle,        // String
       instruments,       // Array
       production,        // Array
       atmosphere         // Array
     } = config;
     
     // Returns: "Genre, Sub-genre, Mood, BPM, Key, Vocals, Instruments, Production"
   }
   ```

2. **Smart Ordering**
   Always follow this priority order:
   - Genre (most important)
   - Sub-genre/secondary genre
   - Mood descriptors (2-3 max)
   - Tempo (BPM or descriptors)
   - Key (if specified)
   - Vocal style (detailed)
   - Instruments (3-5 key ones)
   - Atmospheric elements (2-3)
   - Production quality (1-2 keywords)

3. **Genre Combination Logic**
   ```javascript
   function combineGenres(primary, secondary) {
     // Examples:
     // ("Synthwave", "House") → "Synthwave, House influences"
     // ("Heavy Metal", "Jazz") → "Heavy Metal, Jazz fusion elements"
     // ("Trap", "Soul") → "Trap, Soulful elements"
   }
   ```

4. **Validation & Warnings**
   ```javascript
   function validateStylePrompt(prompt) {
     // Check:
     // - Has genre (required)
     // - Not too short (< 3 elements)
     // - Not too long (> 20 elements)
     // - No conflicting descriptors
     // - No redundant keywords
     
     return {
       valid: boolean,
       warnings: string[],
       suggestions: string[]
     }
   }
   ```

5. **Pre-built Templates**
   ```javascript
   const styleTemplates = {
     'epic-synthwave': "Synthwave, Dark, Retro-futuristic, 112 BPM, A minor, Robotic vocals, Vintage synthesizers, Heavy bass, Neon-noir atmosphere, Analog warmth",
     'memphis-trap': "Memphis trap, Dark, Southern flow, 140 BPM, 808 bass, Hi-hat rolls, Auto-tuned vocals, Phonk Drum, Street atmosphere",
     'indie-rock': "Indie Rock, Alternative, Energetic, 128 BPM, Jangly guitars, Driving drums, Male vocals, Raw energy, Lo-fi production",
     // ... 20+ more
   }
   ```

6. **Enhancement System**
   ```javascript
   function enhanceBasicPrompt(basic) {
     // "rock song" → 
     // "Alternative Rock, Energetic, 128 BPM, Powerful guitar riffs, Driving drums, Clean male vocals, Anthemic, Stadium-ready production"
   }
   ```

Example outputs:
```javascript
// Input: {primaryGenre: "Heavy Metal", mood: ["dark"], vocals: "aggressive"}
// Output: "Heavy Metal, Dark atmosphere, Aggressive vocals, Distorted guitars, Double bass drums, Powerful riffs, 140 BPM, Minor key"

// Input: {primaryGenre: "Lo-fi Hip Hop", mood: ["chill", "relaxed"]}  
// Output: "Lo-fi Hip Hop, Chill vibes, Relaxed tempo, 85 BPM, Jazzy samples, Vinyl crackle, Smooth beats, Mellow bass, Nostalgic atmosphere"
```

Include helper functions:
- getGenreDefaults(genre) → default BPM, common moods, typical instruments
- suggestInstruments(genre) → compatible instruments
- suggestVocals(genre) → appropriate vocal styles
```

---

## Prompt 3: Lyrics Formatter & Meta Tag System

```
Create a comprehensive lyrics formatting system with meta tag insertion and validation.

**FOCUS: Generating content for the Lyrics field in Suno**

Requirements:

1. **Meta Tag Insertion**
   ```javascript
   function insertMetaTag(lyrics, position, tag) {
     // Inserts tag at correct position
     // Handles line breaks, spacing
     // Returns formatted string
   }
   ```

2. **Structure Applier**
   ```javascript
   function applyStructure(rawLyrics, structureType) {
     // structureType: 'pop', 'hiphop', 'electronic', 'ballad'
     // Divides lyrics into sections
     // Adds appropriate meta tags
     // Returns fully formatted lyrics
   }
   
   // Example:
   applyStructure(userLyrics, 'pop')
   // Returns:
   `[Intro]
   [Instrumental]
   
   [Verse 1]
   First verse lyrics here
   
   [Pre-Chorus]
   Build up lyrics
   
   [Chorus]
   Catchy hook here
   
   [Verse 2]
   Second verse lyrics
   
   [Chorus]
   Catchy hook here
   
   [Bridge]
   Emotional peak
   
   [Chorus]
   Final hook
   
   [Outro]
   [Fade out]`
   ```

3. **Smart Section Detection**
   ```javascript
   function detectSections(lyrics) {
     // Auto-detect verse, chorus, bridge from lyrics
     // Look for repetition patterns
     // Identify hook lines
     // Suggest meta tag placement
   }
   ```

4. **Advanced Lyric Techniques**
   ```javascript
   // Vowel Extension
   function addVowelExtension(word, syllables = 3) {
     // "goodbye" → "goo-o-o-odbye"
     // "love" → "lo-o-ove"
   }
   
   // Background Vocals
   function addBackgroundVocals(line, backgroundText) {
     // "Dancing tonight" + "tonight" → "Dancing tonight (tonight)"
   }
   
   // Chord Annotations
   function addChords(lyrics, chords) {
     // Input: "Walking down the street", ["Em", "G", "D"]
     // Output: "(Em) Walking down the (G) street (D)"
   }
   ```

5. **Ending Tag Generator**
   ```javascript
   function generateEnding(style = 'natural') {
     // 'natural' → "[Outro]\n[Instrumental Fade out][End]"
     // 'abrupt' → "[End]"
     // 'fade' → "[Fade out]"
   }
   ```

6. **Validation System**
   ```javascript
   function validateLyrics(lyrics) {
     return {
       valid: boolean,
       errors: [
         {type: 'unclosed_bracket', line: 5, message: "Bracket not closed"},
         {type: 'invalid_tag', line: 8, suggestion: "Did you mean [Chorus]?"}
       ],
       warnings: [
         {type: 'long_section', section: 'Verse 1', lineCount: 16},
         {type: 'no_ending', suggestion: "Add [Outro] or [End] tag"}
       ],
       stats: {
         sections: 7,
         verses: 2,
         choruses: 3,
         estimatedDuration: "3:30"
       }
     }
   }
   ```

7. **Structure Templates**
   ```javascript
   const lyricsTemplates = {
     'pop-standard': {
       structure: ['[Intro]', '[Verse 1]', '[Pre-Chorus]', '[Chorus]', '[Verse 2]', '[Pre-Chorus]', '[Chorus]', '[Bridge]', '[Chorus]', '[Outro]'],
       lineGuides: {
         'Verse': '8 lines, storytelling',
         'Pre-Chorus': '4 lines, building tension',
         'Chorus': '6-8 lines, main hook',
         'Bridge': '6 lines, emotional shift'
       }
     },
     
     'hiphop-standard': {
       structure: ['[Intro]', '[Verse 1]', '[Hook]', '[Verse 2]', '[Hook]', '[Bridge]', '[Hook]', '[Outro]'],
       lineGuides: {
         'Verse': '16 bars',
         'Hook': '8 bars',
         'Bridge': '8 bars (optional)'
       }
     },
     
     'electronic-standard': {
       structure: ['[Intro]', '[Build-up]', '[Drop]', '[Verse]', '[Build-up]', '[Drop]', '[Breakdown]', '[Build-up]', '[Drop]', '[Outro]'],
       lineGuides: {
         'Intro': 'Minimal or atmospheric',
         'Build-up': 'Increasing tension',
         'Drop': 'Main energy section',
         'Breakdown': 'Calm interlude'
       }
     }
   }
   ```

8. **Real-time Preview**
   ```javascript
   function previewFormatted(lyrics) {
     // Returns HTML with:
     // - Meta tags highlighted
     // - Syntax errors marked
     // - Section lengths indicated
     // - Suggestions overlaid
   }
   ```

Create visual helpers:
- Meta tag palette (click to insert)
- Structure visualizer
- Syntax checker
- Line counter per section
```

---

## Prompt 4: Genre-Specific Style Prompt Templates

```
Create pre-built, optimized style prompts for 30+ popular genres.

Each template should be battle-tested and highly effective for Suno.

**Format:**
```typescript
interface GenreStyleTemplate {
  name: string;
  category: string;
  stylePrompt: string; // Ready-to-use prompt
  variations: string[]; // 3-5 alternative approaches
  tips: string[];
  commonLyricThemes: string[];
  exampleStructure: string;
}
```

**Required Templates** (minimum 30):

**ELECTRONIC:**
1. Synthwave
2. Deep House
3. Drum and Bass
4. Techno
5. Dubstep
6. Future Bass
7. Lo-fi Electronic

**ROCK:**
8. Indie Rock
9. Alternative Rock
10. Hard Rock
11. Post-Rock
12. Punk Rock
13. Garage Rock

**METAL:**
14. Heavy Metal
15. Death Metal
16. Black Metal
17. Progressive Metal
18. Metalcore

**HIP HOP:**
19. Trap
20. Boom Bap
21. Memphis Trap
22. Drill
23. Lo-fi Hip Hop
24. Cloud Rap

**POP:**
25. Synth-pop
26. Indie Pop
27. K-pop Style
28. Electropop
29. Dream Pop

**OTHER:**
30. Jazz Fusion
31. Acoustic Singer-Songwriter
32. Country Rock
33. R&B Soul
34. Reggae
35. Folk Indie

**Example Template Format:**
```javascript
{
  name: "Memphis Trap",
  category: "Hip Hop",
  
  stylePrompt: "Memphis trap, Dark atmosphere, Southern flow, 140 BPM, 808 bass, Hi-hat rolls, Rapid hi-hats, Auto-tuned vocals, Phonk Drum, Aggressive delivery, Street vibes, Hard-hitting snares",
  
  variations: [
    "Memphis trap, Eerie, Underground sound, 130 BPM, Heavy 808s, Distorted bass, Chopped samples, Haunting melody, Raw vocals",
    "Memphis trap, Dark, Atmospheric, 145 BPM, Deep sub-bass, Crisp hi-hats, Haunted house samples, Menacing vocals, Lo-fi aesthetic",
    "Memphis trap, Three 6 Mafia style, Horrorcore elements, 136 BPM, Evil melody, Church bells, Southern accent, Crunk energy"
  ],
  
  tips: [
    "Use 'Phonk Drum' for authentic Memphis sound",
    "Specify 'Southern flow' or 'Southern accent' in vocals",
    "BPM typically 130-150",
    "Include '808 bass' and 'hi-hat rolls'",
    "Add 'horrorcore' or 'eerie' for darker sound"
  ],
  
  commonLyricThemes: [
    "Street life",
    "Hustle and grind",
    "Success and wealth",
    "Memphis culture",
    "Dark/horror imagery"
  ],
  
  exampleStructure: `[Intro]
[Ad-libs]

[Verse 1]
16 bars

[Hook]
8 bars

[Verse 2]
16 bars

[Hook]
8 bars

[Outro]
[Ad-libs][Fade out]`
}
```

Include function to customize templates:
```javascript
function customizeTemplate(template, modifications) {
  // Allow user to adjust BPM, swap instruments, change mood
  // Keep genre core intact
  // Return modified style prompt
}
```
```

---

## Prompt 5: Smart Prompt Enhancement Engine

```
Build an AI-powered prompt enhancement system (like Suno's built-in "Creative Boost").

**Takes**: Simple user input
**Returns**: Professional, detailed style prompt

Requirements:

1. **Enhancement Levels**
   ```javascript
   function enhancePrompt(basicPrompt, level = 'medium') {
     // level: 'light' | 'medium' | 'heavy'
   }
   ```

   **Light Enhancement** (add 2-3 descriptors):
   - "rock song" → "Rock, Energetic, Guitar-driven, Powerful drums"
   
   **Medium Enhancement** (add 5-7 descriptors):
   - "rock song" → "Alternative Rock, Energetic, Driving tempo, 128 BPM, Powerful guitar riffs, Dynamic drums, Clear male vocals, Anthemic feel"
   
   **Heavy Enhancement** (full professional prompt):
   - "rock song" → "Alternative Rock, Indie influences, Energetic atmosphere, Driving tempo, 128 BPM, E major, Powerful guitar riffs with reverb, Dynamic drum patterns, Punchy bass, Clear male vocals with emotional delivery, Anthemic choruses, Stadium-ready production, Modern mix, Raw energy"

2. **Descriptor Database**
   ```javascript
   const descriptorBank = {
     mood: {
       positive: ['uplifting', 'euphoric', 'joyful', 'cheerful', 'optimistic', 'bright', 'sunny'],
       negative: ['dark', 'melancholic', 'somber', 'gloomy', 'brooding', 'moody', 'ominous'],
       neutral: ['atmospheric', 'ambient', 'dreamy', 'ethereal', 'mysterious', 'contemplative']
     },
     
     energy: {
       high: ['energetic', 'driving', 'powerful', 'explosive', 'frenetic', 'intense'],
       medium: ['steady', 'groovy', 'flowing', 'rhythmic', 'bouncy'],
       low: ['calm', 'relaxed', 'chill', 'mellow', 'gentle', 'soft']
     },
     
     texture: {
       dense: ['layered', 'lush', 'thick', 'full', 'rich', 'dense'],
       sparse: ['minimal', 'stripped-back', 'intimate', 'bare', 'clean', 'simple'],
       atmospheric: ['spacious', 'reverb-drenched', 'ambient', 'airy', 'expansive']
     },
     
     production: {
       modern: ['polished', 'clean mix', 'mastered', 'studio-quality', 'hi-fi', 'pristine'],
       vintage: ['analog warmth', 'lo-fi', 'retro', 'vintage', 'tape saturation'],
       raw: ['raw', 'unpolished', 'gritty', 'garage', 'DIY', 'underground']
     }
   }
   ```

3. **Context-Aware Enhancement**
   ```javascript
   function enhanceWithContext(basicPrompt) {
     // Detect genre from input
     // Add genre-appropriate descriptors
     // Include typical instruments
     // Suggest appropriate BPM range
     // Add matching mood descriptors
   }
   ```

   Examples:
   ```javascript
   // "trap beat" →
   "Trap, Dark, 140 BPM, Heavy 808 bass, Hi-hat rolls, Snappy snares, Atmospheric pads, Hard-hitting, Modern production"
   
   // "acoustic ballad" →
   "Acoustic Ballad, Intimate, Emotional, 70 BPM, G major, Fingerpicked acoustic guitar, Gentle vocals, Vulnerable delivery, Minimalist, Heartfelt, Warm recording"
   
   // "synthwave" →
   "Synthwave, Retro-futuristic, Dark, 110 BPM, A minor, Vintage synthesizers, Analog bass, Drum machines, Robotic vocals, Neon atmosphere, 80s nostalgia, Cinematic"
   ```

4. **Smart Layering System**
   Add descriptors in logical layers:
   
   Layer 1: Genre precision
   - "rock" → "alternative rock"
   - "electronic" → "deep house"
   
   Layer 2: Mood expansion  
   - "sad" → "melancholic, somber, introspective"
   
   Layer 3: Instrumentation
   - Add 3-5 key instruments for genre
   
   Layer 4: Vocal character
   - Add vocal style description
   
   Layer 5: Production
   - Add production quality keywords
   
   Layer 6: Atmosphere
   - Add textural/environmental descriptors

5. **Conflict Avoidance**
   ```javascript
   function removeConflicts(descriptors) {
     // Don't combine: "energetic" + "calm"
     // Don't combine: "minimal" + "layered"
     // Don't combine: "dark" + "bright"
     // Returns cleaned array
   }
   ```

6. **Examples Library**
   Store 100+ before/after examples for pattern learning
   ```javascript
   const enhancements = [
     {
       before: "happy pop",
       after: "Upbeat Pop, Cheerful, Bright synths, Catchy melodies, 120 BPM, Major key, Clear vocals, Infectious energy, Radio-ready"
     },
     {
       before: "dark techno",
       after: "Dark Techno, Industrial, Hypnotic, 130 BPM, Heavy kick drum, Distorted bass, Metallic percussion, Minimal melody, Underground rave atmosphere"
     }
     // ... 98 more
   ]
   ```

Create UI with:
- "Enhance" button
- Slider for enhancement level
- Before/After preview
- Regenerate option
```

---

## Prompt 6: Complete UI/UX Implementation

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