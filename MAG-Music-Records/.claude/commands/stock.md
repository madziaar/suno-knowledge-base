# Find Stock Footage

**Command:** `/stock [TRACK_NUMBER]`
**Example:** `/stock 2` or `/stock 6`

---

## Purpose

Analyze track mood from prompt/lyrics and find matching royalty-free stock footage from Pexels and Pixabay APIs.

---

## Prerequisites

1. **Prompt file exists:** `01_prompts/track_[NN]_*_prompt.txt`
2. **Lyrics file exists:** `02_lyrics/track_[NN]_*_lyrics.txt`
3. **API keys configured (optional but recommended):**
   ```
   PEXELS_API_KEY=your_key_here   # Get free at pexels.com/api
   PIXABAY_API_KEY=your_key_here  # Get free at pixabay.com/api/docs
   ```
4. **Python dependencies:**
   ```bash
   pip install requests Pillow
   ```

---

## Workflow

### Step 1: Analyze Track Theme
```bash
python tools/stock_finder/analyze.py \
  --prompt "01_prompts/track_02_body_prompt.txt" \
  --lyrics "02_lyrics/track_02_body_lyrics.txt" \
  --output "09_video/stock/track_02/keywords.json"
```

### Step 2: Search Stock APIs
```bash
python tools/stock_finder/search.py \
  --queries "luxury lifestyle,city night,success,golden hour" \
  --count 5 \
  --output "09_video/stock/track_02/search_results.json"
```

### Step 3: Download Clips
```bash
python tools/stock_finder/download.py \
  --results "09_video/stock/track_02/search_results.json" \
  --output "09_video/stock/track_02/" \
  --max 10
```

---

## Output Files

```
09_video/stock/track_02/
├── keywords.json        # Extracted visual keywords
├── search_results.json  # API search results
├── metadata.json        # Downloaded clips metadata
├── clip_001_pexels_*.mp4
├── clip_002_pexels_*.mp4
├── clip_003_pixabay_*.mp4
└── ...
```

---

## Mood to Keyword Mappings

| Track Mood | Visual Keywords |
|------------|-----------------|
| Luxury/Boss | luxury lifestyle, expensive car, mansion, gold |
| Romance | romantic couple, sunset, candles, flowers |
| Party/Club | nightclub, dancing, DJ, club lights |
| Street/Urban | city night, urban street, graffiti |
| Island/Chill | beach sunset, tropical, palm trees |
| Cinematic | dramatic, epic, film scene |

---

## API Notes

### Pexels (Recommended)
- **Free tier:** Unlimited requests
- **License:** Royalty-free, no attribution required
- **Quality:** HD/4K available
- **Get key:** https://www.pexels.com/api/

### Pixabay
- **Free tier:** Unlimited requests
- **License:** CC0 / Royalty-free
- **Quality:** HD available
- **Get key:** https://pixabay.com/api/docs/

---

## Manual Stock Sources (No API)

If API keys not available, manually download from:
- **Pexels:** https://www.pexels.com/videos/
- **Pixabay:** https://pixabay.com/videos/
- **Coverr:** https://coverr.co/
- **Mixkit:** https://mixkit.co/free-stock-video/

Save clips to: `09_video/stock/track_[NN]/`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No API key | Download manually from Pexels/Pixabay websites |
| No results | Try broader keywords (e.g., "city" instead of "city night luxury") |
| Clips too short | Increase `--count` to get more options |
| Wrong mood | Edit `keywords.json` and re-run search |

---

## Next Steps

After stock footage is ready:
1. `/lrc [N]` - Ensure LRC file exists
2. `/lyric-video [N]` - Generate full video
