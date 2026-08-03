# Lalal.ai Integration Guide
> Automated stem separation for MAG Music Records

## Overview

Lalal.ai separates your Suno AI tracks into:
- **Vocals** (lead vocals)
- **Instrumental** (everything else)
- **Drums** (optional, premium)
- **Bass** (optional, premium)
- **Piano** (optional, premium)
- **Other** (optional, premium)

**Why You Need This:**
- Edit vocals separately from instrumentals
- Create instrumental versions for licensing
- Remix tracks with isolated stems
- Fix vocal issues without affecting music
- Create acapellas for mashups

---

## Setup

### 1. Create Account

**Free Tier:**
- 10 minutes of audio per month
- 2-stem separation (vocals + instrumental)
- Good for testing

**Link:** https://www.lalal.ai

### 2. Choose Plan

**Lite Plan ($15/month):**
- 300 minutes per month (5 hours)
- Perfect for 10-track album (30 min album = 60 min processing)
- 4-stem separation (vocals, drums, bass, other)
- API access

**Plus Plan ($25/month):**
- 750 minutes per month (12.5 hours)
- 8-stem separation (vocals, drums, bass, piano, guitar, synth, wind, other)
- Priority processing

**For MAG Music Records:** Start with **Lite ($15/month)**

### 3. API Key Setup (Optional - For Automation)

1. Go to https://www.lalal.ai/api/
2. Generate API key
3. Save it securely

**Store API key:**
```powershell
# Windows (PowerShell)
[System.Environment]::SetEnvironmentVariable('LALAL_API_KEY', 'your-key-here', 'User')
```

---

## Manual Workflow (Simple)

### Step 1: Upload Track
1. Go to https://www.lalal.ai
2. Drag and drop your Suno track (WAV or MP3)
3. Select stem type:
   - **Vocal and Instrumental** (recommended for most tracks)
   - **Drums and Other** (if you want to isolate drums)
   - **Bass and Other** (if you want isolated bass)

### Step 2: Process
- Processing takes 1-2 minutes per track
- You'll see progress bar

### Step 3: Download Stems
- Download vocals.wav
- Download instrumental.wav
- Save to: `03_audio_exports/track_[NN]_stems/`

### Step 4: Organize
```
03_audio_exports/
├── track_01_ascensao.wav           (full mix)
└── track_01_ascensao_stems/
    ├── vocals.wav
    ├── instrumental.wav
    ├── drums.wav (if separated)
    └── bass.wav (if separated)
```

---

## Automated Workflow (Advanced)

### Python Script for Batch Processing

**Requirements:**
```bash
pip install requests
```

**Script:** `tools/stem_separation/lalal_batch.py`

```python
import os
import requests
import time
import json

API_KEY = os.getenv('LALAL_API_KEY')
API_URL = 'https://www.lalal.ai/api/'

def upload_file(file_path, stem_type='vocals'):
    """
    Upload audio file to Lalal.ai
    stem_type options: 'vocals', 'drums', 'bass', 'piano'
    """
    headers = {
        'Authorization': f'Bearer {API_KEY}'
    }
    
    files = {
        'file': open(file_path, 'rb')
    }
    
    data = {
        'stem': stem_type,
        'filter': 0  # 0 = mild, 1 = normal, 2 = aggressive
    }
    
    response = requests.post(
        f'{API_URL}upload/',
        headers=headers,
        files=files,
        data=data
    )
    
    return response.json()

def check_status(task_id):
    """Check processing status"""
    headers = {
        'Authorization': f'Bearer {API_KEY}'
    }
    
    response = requests.get(
        f'{API_URL}check/',
        headers=headers,
        params={'id': task_id}
    )
    
    return response.json()

def download_stems(task_id, output_dir):
    """Download processed stems"""
    headers = {
        'Authorization': f'Bearer {API_KEY}'
    }
    
    # Get download URLs
    status = check_status(task_id)
    
    if status['status'] == 'success':
        # Download vocal stem
        vocal_url = status['split']['vocal_path']
        vocal_response = requests.get(vocal_url)
        
        with open(os.path.join(output_dir, 'vocals.wav'), 'wb') as f:
            f.write(vocal_response.content)
        
        # Download instrumental stem
        inst_url = status['split']['instrumental_path']
        inst_response = requests.get(inst_url)
        
        with open(os.path.join(output_dir, 'instrumental.wav'), 'wb') as f:
            f.write(inst_response.content)
        
        print(f"✅ Stems saved to {output_dir}")
        return True
    
    return False

def process_track(audio_file, output_dir):
    """Complete workflow: upload → wait → download"""
    
    print(f"📤 Uploading: {os.path.basename(audio_file)}")
    result = upload_file(audio_file)
    
    if 'id' not in result:
        print(f"❌ Upload failed: {result}")
        return False
    
    task_id = result['id']
    print(f"⏳ Processing (Task ID: {task_id})...")
    
    # Poll for completion
    while True:
        status = check_status(task_id)
        
        if status['status'] == 'success':
            print("✅ Processing complete!")
            break
        elif status['status'] == 'error':
            print(f"❌ Error: {status['error']}")
            return False
        
        print(f"⏳ Status: {status['status']} ({status.get('progress', 0)}%)")
        time.sleep(10)  # Check every 10 seconds
    
    # Download stems
    os.makedirs(output_dir, exist_ok=True)
    return download_stems(task_id, output_dir)

# Batch process all tracks in a project
def batch_process_project(project_path):
    """Process all audio files in project"""
    
    audio_dir = os.path.join(project_path, '03_audio_exports')
    
    if not os.path.exists(audio_dir):
        print(f"❌ Audio directory not found: {audio_dir}")
        return
    
    # Find all audio files
    audio_files = []
    for file in os.listdir(audio_dir):
        if file.endswith(('.wav', '.mp3')) and not file.startswith('.'):
            # Skip if stems folder already exists
            stem_dir = os.path.join(audio_dir, f"{os.path.splitext(file)[0]}_stems")
            if not os.path.exists(stem_dir):
                audio_files.append(os.path.join(audio_dir, file))
    
    if not audio_files:
        print("✅ All tracks already processed!")
        return
    
    print(f"Found {len(audio_files)} tracks to process\n")
    
    for i, audio_file in enumerate(audio_files, 1):
        print(f"\n--- Track {i}/{len(audio_files)} ---")
        
        # Create output directory
        output_dir = os.path.join(
            audio_dir,
            f"{os.path.splitext(os.path.basename(audio_file))[0]}_stems"
        )
        
        # Process
        success = process_track(audio_file, output_dir)
        
        if success:
            print(f"✅ Track {i} complete: {os.path.basename(audio_file)}")
        else:
            print(f"❌ Track {i} failed: {os.path.basename(audio_file)}")
        
        # Rate limit: wait 5 seconds between tracks
        if i < len(audio_files):
            time.sleep(5)
    
    print("\n✨ Batch processing complete!")

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python lalal_batch.py <project_path>")
        print("Example: python lalal_batch.py 'C:\\Giquina-Projects\\MAG Music Records\\projects\\mixtapes\\MAG_Hardcore_Drill_Vol_1'")
        sys.exit(1)
    
    project_path = sys.argv[1]
    batch_process_project(project_path)
```

**Save this as:** `tools/stem_separation/lalal_batch.py`

### Usage

**Process entire project:**
```bash
python tools/stem_separation/lalal_batch.py "C:\Giquina-Projects\MAG Music Records\projects\mixtapes\MAG_Hardcore_Drill_Vol_1"
```

**Process single track:**
```python
from lalal_batch import process_track

process_track(
    "C:/path/to/track.wav",
    "C:/path/to/output_stems/"
)
```

---

## PowerShell Integration

Add to `batch-operations.ps1`:

```powershell
function Separate-Stems {
    param([string]$ProjectPath)
    
    Write-Host "`n🎵 Separating stems for all tracks" -ForegroundColor Green
    
    $pythonScript = Join-Path $ProjectRoot "tools\stem_separation\lalal_batch.py"
    
    python $pythonScript $ProjectPath
}
```

**Usage:**
```powershell
.\batch-operations.ps1 -Operation separate-stems -Project MAG_HDRILL_V1
```

---

## File Naming Convention

After separation, files are organized:

```
03_audio_exports/
├── track_01_ascensao.wav
├── track_01_ascensao_stems/
│   ├── vocals.wav
│   └── instrumental.wav
├── track_02_desert_rose.wav
└── track_02_desert_rose_stems/
    ├── vocals.wav
    └── instrumental.wav
```

---

## Use Cases

### 1. Create Instrumental Version
- Upload full mix
- Download instrumental.wav
- Rename to `track_[NN]_[name]_instrumental.wav`
- Use for licensing, karaoke, remixes

### 2. Fix Vocal Issues
- Separate vocals
- Edit vocals in DAW (remove artifacts, adjust timing)
- Re-export
- Mix back with instrumental

### 3. Create Remixes
- Separate all stems
- Import into DAW
- Rearrange, add new elements
- Export new version

### 4. Acapella Extraction
- Separate vocals
- Clean up using iZotope RX (remove bleed)
- Export as acapella for mashups

---

## Quality Settings

### Filter Aggressiveness
- **Mild (0):** More original audio, some bleed
- **Normal (1):** Balanced (recommended)
- **Aggressive (2):** Cleanest separation, may affect quality

**Recommendation:** Use **Normal** for most tracks

---

## Troubleshooting

### Issue: "API key invalid"
**Solution:** Regenerate key at https://www.lalal.ai/api/

### Issue: "Insufficient balance"
**Solution:** Upgrade plan or wait for monthly reset

### Issue: "Poor separation quality"
**Solution:**
- Try different filter setting (mild vs aggressive)
- Ensure source audio is high quality (WAV preferred over MP3)
- Some AI-generated tracks separate better than others

### Issue: "Stems have artifacts"
**Solution:**
- Use **Aggressive** filter
- Post-process with iZotope RX (spectral repair)
- Re-export from Suno at higher quality

---

## Cost Tracking

**Lite Plan ($15/month = 300 minutes):**
- 10 tracks × 3 minutes each = 30 minutes
- 30 minutes × 2 stems = 60 minutes used
- **Remaining:** 240 minutes

**You can process ~40 tracks per month on Lite plan**

---

## Integration with Workflow

### Updated Production Workflow

```
SUNO GENERATION
    ↓
DOWNLOAD AUDIO (full mix)
    ↓
LALAL.AI STEM SEPARATION
    ↓
    ├── vocals.wav
    └── instrumental.wav
    ↓
EDIT STEMS (optional)
    ↓
MIX & MASTER
    ↓
FINAL EXPORT
```

---

## Advanced: Local Stem Separation (Free Alternative)

If you want to avoid monthly costs, use **Spleeter** (Deezer's open-source tool):

**Install:**
```bash
pip install spleeter
```

**Usage:**
```bash
spleeter separate -p spleeter:2stems -o output/ track.wav
```

**Pros:** Free, unlimited
**Cons:** Lower quality than Lalal.ai, slower processing

---

## Recommendation

**Start with Lalal.ai Lite ($15/month):**
- Test quality on 5-10 tracks
- If satisfied, continue
- If not, try Spleeter or upgrade to Plus

**Expected Result:**
- 90-95% clean vocal isolation
- 5-10% bleed/artifacts (fixable with RX)
- Professional-grade stems for remixing

---

## Next Steps

1. ✅ Sign up at https://www.lalal.ai
2. ✅ Test with 1 track (free tier)
3. ✅ If satisfied, upgrade to Lite ($15/month)
4. ✅ Process entire album (MAG Hardcore Drill Vol. 1)
5. ✅ Use stems for remixing, fixing, licensing

**Want me to create the Python script now?** Let me know and I'll set it up!
