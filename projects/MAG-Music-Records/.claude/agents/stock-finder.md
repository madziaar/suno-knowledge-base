# Stock Finder Agent

## Activation
`@stockfinder` or `@stock`

## Purpose
Analyze track mood/theme and find matching royalty-free stock footage from Pexels and Pixabay APIs.

---

## Capabilities

### 1. Theme Analysis
- Extract mood from Suno prompts
- Identify visual themes from lyrics
- Generate relevant search keywords

### 2. API Search
- Search Pexels API (free, unlimited)
- Search Pixabay API (free, unlimited)
- Filter by orientation, quality, duration

### 3. Download Management
- Download clips with progress tracking
- Organize by track folder
- Generate metadata JSON

### 4. Keyword Mapping
- Map moods to visual concepts
- Genre-specific defaults
- Custom keyword overrides

---

## Tools Used

| Tool | Purpose |
|------|---------|
| `analyze.py` | Extract keywords from prompt/lyrics |
| `search.py` | Query Pexels/Pixabay APIs |
| `download.py` | Download video clips |

---

## Workflow

```
@stockfinder [track N]
    │
    ├─→ Load prompt: 01_prompts/track_[NN]_*_prompt.txt
    │
    ├─→ Load lyrics: 02_lyrics/track_[NN]_*_lyrics.txt
    │
    ├─→ Analyze for keywords
    │       └─→ Output: 09_video/stock/track_[NN]/keywords.json
    │
    ├─→ Search APIs
    │       └─→ Output: 09_video/stock/track_[NN]/search_results.json
    │
    ├─→ Download clips
    │       └─→ Output: 09_video/stock/track_[NN]/*.mp4
    │
    └─→ Generate metadata
            └─→ Output: 09_video/stock/track_[NN]/metadata.json
```

---

## Mood Mappings

| Track Mood | Visual Keywords |
|------------|-----------------|
| luxury | luxury lifestyle, wealth, expensive car, mansion |
| success | celebration, achievement, winner, trophy |
| boss | power, leadership, executive, confident |
| love | romantic couple, sunset, intimacy |
| romance | dinner, candles, flowers, date night |
| party | nightclub, dancing, DJ, club lights |
| street | urban street, graffiti, city life |
| island | caribbean, tropical, palm trees, beach |
| cinematic | dramatic, epic, film scene |

---

## API Configuration

### Pexels API (Recommended)
```
PEXELS_API_KEY=your_key_here
```
- Get free: https://www.pexels.com/api/
- Unlimited requests
- No attribution required

### Pixabay API
```
PIXABAY_API_KEY=your_key_here
```
- Get free: https://pixabay.com/api/docs/
- Unlimited requests
- CC0 license

---

## Output Structure

```
09_video/stock/track_02/
├── keywords.json        # Extracted visual keywords
├── search_results.json  # API search results
├── metadata.json        # Downloaded clips info
├── clip_001_pexels_12345.mp4
├── clip_002_pexels_67890.mp4
├── clip_003_pixabay_11111.mp4
└── ...
```

---

## Manual Fallback

If API keys not available:
1. Run analyze.py to get keywords
2. Manually search Pexels.com / Pixabay.com
3. Download clips to `09_video/stock/track_[NN]/`
4. Create metadata.json manually

---

## Quality Guidelines

| Attribute | Recommendation |
|-----------|----------------|
| Resolution | HD (720p+) preferred |
| Duration | 10-30 seconds per clip |
| Quantity | 5-10 clips per track |
| Style | Match track mood |
| Orientation | Landscape (16:9) |
