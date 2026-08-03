<#
.SYNOPSIS
    MAG Music Records - Metadata Generation Helper
    Generates pre-filled metadata templates from TRACKLIST.md data.

.DESCRIPTION
    Reads track information from TRACKLIST.md and generates a pre-filled
    metadata template for the specified track number. The template is
    saved to 05_metadata/ and can be edited before release.

.PARAMETER TrackNumber
    The track number to generate metadata for (1-7)

.PARAMETER OutputName
    Optional short name for the output file (default: uses "track" placeholder)

.USAGE
    .\generate-metadata.ps1 -TrackNumber 2
    .\generate-metadata.ps1 -TrackNumber 2 -OutputName "body"
    .\generate-metadata.ps1 2 body

.NOTES
    Author: MAG Music Records
    Version: 1.0
#>

param(
    [Parameter(Mandatory=$true, Position=0)]
    [ValidateRange(1, 7)]
    [int]$TrackNumber,

    [Parameter(Mandatory=$false, Position=1)]
    [string]$OutputName = ""
)

# ============================================================================
# CONFIGURATION
# ============================================================================

$ProjectRoot = "C:\Giquina-Projects\MAG Music Records"
$CurrentProject = "projects\mixtapes\MAG_Hardcore_Drill_Vol_1"
$ProjectPath = Join-Path $ProjectRoot $CurrentProject

$TracklistPath = Join-Path $ProjectPath "00_admin\TRACKLIST.md"
$MetadataFolder = Join-Path $ProjectPath "05_metadata"
$TemplateFolder = Join-Path $ProjectRoot "templates\distro-kid"

$TrackStr = "{0:D2}" -f $TrackNumber

# Album info (from TRACKLIST.md)
$AlbumInfo = @{
    Title = "MAG Hardcore Drill Vol. 1"
    Artist = "MAG Music Records"
    Genre = "Hardcore Drill / UK Drill / Trap"
    Explicit = $true
    Year = (Get-Date).Year
    Copyright = "MAG Music Records"
}

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

function Write-ColorMessage {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )

    $timestamp = Get-Date -Format "HH:mm:ss"

    switch ($Level) {
        "SUCCESS" {
            Write-Host "[$timestamp] " -NoNewline -ForegroundColor Gray
            Write-Host "[OK] " -NoNewline -ForegroundColor Green
            Write-Host $Message -ForegroundColor White
        }
        "ERROR" {
            Write-Host "[$timestamp] " -NoNewline -ForegroundColor Gray
            Write-Host "[XX] " -NoNewline -ForegroundColor Red
            Write-Host $Message -ForegroundColor Red
        }
        "INFO" {
            Write-Host "[$timestamp] " -NoNewline -ForegroundColor Gray
            Write-Host "[--] " -NoNewline -ForegroundColor Cyan
            Write-Host $Message -ForegroundColor White
        }
        "WARN" {
            Write-Host "[$timestamp] " -NoNewline -ForegroundColor Gray
            Write-Host "[!!] " -NoNewline -ForegroundColor Yellow
            Write-Host $Message -ForegroundColor Yellow
        }
    }
}

function Get-TrackInfoFromTracklist {
    param([int]$TrackNum)

    if (-not (Test-Path $TracklistPath)) {
        return $null
    }

    $content = Get-Content -Path $TracklistPath -Raw

    # Default track info
    $trackInfo = @{
        Number = $TrackNum
        Title = "Track $TrackNum"
        Type = "Full Track"
        Length = "3:00"
        BPM = "140"
        Mood = "High Energy"
        Voice = "Male"
        ChorusLang = "EN"
        VerseLang = "EN"
        ClubTags = @()
        Notes = ""
    }

    # Parse track details section
    $trackSection = [regex]::Match($content, "### Track $TrackNum[:\s].*?(?=### Track \d|$)", [System.Text.RegularExpressions.RegexOptions]::Singleline)

    if ($trackSection.Success) {
        $section = $trackSection.Value

        # Extract title
        if ($section -match "### Track $TrackNum[:\s]*(.+?)(?:\s*[--]|`n)") {
            $title = $Matches[1].Trim()
            if ($title -notmatch "^\[" -and $title -ne "TBD") {
                $trackInfo.Title = $title
            }
        }

        # Extract Type
        if ($section -match "\*\*Type:\*\*\s*(.+)") {
            $trackInfo.Type = $Matches[1].Trim()
        }

        # Extract Length
        if ($section -match "\*\*Length:\*\*\s*(.+)") {
            $trackInfo.Length = $Matches[1].Trim()
        }

        # Extract BPM
        if ($section -match "\*\*BPM:\*\*\s*(.+)") {
            $trackInfo.BPM = $Matches[1].Trim()
        }

        # Extract Mood
        if ($section -match "\*\*Mood:\*\*\s*(.+)") {
            $trackInfo.Mood = $Matches[1].Trim()
        }

        # Extract Notes
        if ($section -match "\*\*Notes:\*\*\s*(.+)") {
            $trackInfo.Notes = $Matches[1].Trim()
        }
    }

    # Parse track map table for voice and language
    $tableMatch = [regex]::Match($content, "\| $TrackNum \|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|")

    if ($tableMatch.Success) {
        $groups = $tableMatch.Groups
        $trackInfo.Title = $groups[1].Value.Trim() -replace "\*|\[|\]", ""
        if ($trackInfo.Title -eq "TBD") { $trackInfo.Title = "Track $TrackNum" }

        $trackInfo.ChorusLang = $groups[2].Value.Trim()
        $trackInfo.VerseLang = $groups[3].Value.Trim()
        $trackInfo.Voice = $groups[4].Value.Trim()
        $trackInfo.ClubTags = ($groups[5].Value.Trim() -split ",\s*")
    }

    return $trackInfo
}

function Format-Filename {
    param([string]$Name)
    # Convert to lowercase, replace spaces with underscores, remove special chars
    $clean = $Name.ToLower() -replace "\s+", "_" -replace "[^a-z0-9_]", "" -replace "__+", "_"
    return $clean.Trim("_")
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

Clear-Host
Write-Host ""
Write-Host "  ================================================" -ForegroundColor Cyan
Write-Host "   MAG MUSIC RECORDS - METADATA GENERATOR" -ForegroundColor White
Write-Host "  ================================================" -ForegroundColor Cyan
Write-Host ""

Write-ColorMessage -Message "Generating metadata for Track $TrackNumber" -Level "INFO"

# Check if TRACKLIST.md exists
if (-not (Test-Path $TracklistPath)) {
    Write-ColorMessage -Message "TRACKLIST.md not found at: $TracklistPath" -Level "ERROR"
    exit 1
}

# Get track info from TRACKLIST.md
Write-ColorMessage -Message "Reading track info from TRACKLIST.md..." -Level "INFO"
$trackInfo = Get-TrackInfoFromTracklist -TrackNum $TrackNumber

if ($null -eq $trackInfo) {
    Write-ColorMessage -Message "Could not parse track info for Track $TrackNumber" -Level "ERROR"
    exit 1
}

# Determine output filename
if ([string]::IsNullOrWhiteSpace($OutputName)) {
    $OutputName = Format-Filename -Name $trackInfo.Title
    if ($OutputName -eq "track_$TrackNumber" -or [string]::IsNullOrWhiteSpace($OutputName)) {
        $OutputName = "track"
    }
}

$outputFilename = "track_${TrackStr}_${OutputName}_metadata.md"
$outputPath = Join-Path $MetadataFolder $outputFilename

# Display parsed info
Write-Host ""
Write-Host "  Track Information:" -ForegroundColor Yellow
Write-Host "  ------------------" -ForegroundColor DarkYellow
Write-Host "    Number:     " -NoNewline -ForegroundColor Gray
Write-Host $trackInfo.Number -ForegroundColor White
Write-Host "    Title:      " -NoNewline -ForegroundColor Gray
Write-Host $trackInfo.Title -ForegroundColor White
Write-Host "    Type:       " -NoNewline -ForegroundColor Gray
Write-Host $trackInfo.Type -ForegroundColor White
Write-Host "    BPM:        " -NoNewline -ForegroundColor Gray
Write-Host $trackInfo.BPM -ForegroundColor White
Write-Host "    Mood:       " -NoNewline -ForegroundColor Gray
Write-Host $trackInfo.Mood -ForegroundColor White
Write-Host "    Voice:      " -NoNewline -ForegroundColor Gray
Write-Host $trackInfo.Voice -ForegroundColor White
Write-Host "    Languages:  " -NoNewline -ForegroundColor Gray
Write-Host "Chorus: $($trackInfo.ChorusLang), Verse: $($trackInfo.VerseLang)" -ForegroundColor White
Write-Host "    Club Tags:  " -NoNewline -ForegroundColor Gray
Write-Host ($trackInfo.ClubTags -join ", ") -ForegroundColor White
Write-Host ""

# Generate metadata content
$isExplicit = if ($AlbumInfo.Explicit) { "Yes" } else { "No" }
$currentDate = Get-Date -Format "yyyy-MM-dd"

# Determine ISRC placeholder
$isrcPlaceholder = "US-XXX-YY-NNNNN"

# Build genre string based on track type
$genreString = switch ($trackInfo.Type) {
    { $_ -match "Intro|Outro" } { "Instrumental, Ambient, Drill" }
    { $trackInfo.Mood -match "Sensual|Grind" } { "Hardcore Drill, R&B, UK Drill" }
    default { "Hardcore Drill, UK Drill, Trap" }
}

$metadataContent = @"
# Track $TrackStr Metadata — $($trackInfo.Title)

## Distribution Information

| Field | Value |
|-------|-------|
| **Track Number** | $TrackNumber |
| **Track Title** | $($trackInfo.Title) |
| **Artist** | $($AlbumInfo.Artist) |
| **Album** | $($AlbumInfo.Title) |
| **Genre** | $genreString |
| **BPM** | $($trackInfo.BPM) |
| **Duration** | $($trackInfo.Length) |
| **Explicit** | $isExplicit |
| **Language** | English |
| **Year** | $($AlbumInfo.Year) |
| **Copyright** | $($AlbumInfo.Copyright) |
| **ISRC** | $isrcPlaceholder |

## Platform-Specific

### Spotify
- **Canvas Video:** [ ] Yes [ ] No
- **Storyline:** [ ] Yes [ ] No

### Apple Music
- **Animated Cover:** [ ] Yes [ ] No
- **Spatial Audio:** [ ] Yes [ ] No

### YouTube Music
- **Music Video:** [ ] Yes [ ] No

## Credits

| Role | Name |
|------|------|
| Producer | MAG Music Records |
| Songwriter | MAG Music Records |
| Vocals | [AI Generated via Suno] |
| Mixing | MAG Music Records |
| Mastering | MAG Music Records |
| Cover Art | MAG Music Records |

## Description

> [COPY FROM: 05_metadata/track_${TrackStr}_*_description.txt]
>
> Paste track description here (max 1000 characters)

## Tags/Keywords

``````
$($trackInfo.Mood.ToLower() -replace ",\s*", ", ")
$($trackInfo.ClubTags -join ", ").ToLower()
drill, uk drill, trap, hardcore, bass, club music
``````

## Social Media Copy

### Short (Twitter/X - 280 chars max)
> [Write short social media post here]

### Medium (Instagram/Facebook)
> [Write medium-length social media post here]

## Release Checklist

- [ ] Track title finalized
- [ ] Audio file exported (WAV, 44.1kHz, 24-bit)
- [ ] Description written (under 1000 chars)
- [ ] Cover art prepared (3000x3000px minimum)
- [ ] ISRC code assigned
- [ ] Credits verified
- [ ] Explicit content flagged correctly
- [ ] Social media copy prepared
- [ ] Pre-save link created
- [ ] Release date scheduled

## Notes

$($trackInfo.Notes)

---
*Generated: $currentDate*
*Script: generate-metadata.ps1*
"@

# Ensure metadata folder exists
if (-not (Test-Path $MetadataFolder)) {
    New-Item -ItemType Directory -Path $MetadataFolder -Force | Out-Null
    Write-ColorMessage -Message "Created metadata folder: $MetadataFolder" -Level "INFO"
}

# Check if file already exists
if (Test-Path $outputPath) {
    Write-Host ""
    Write-ColorMessage -Message "File already exists: $outputFilename" -Level "WARN"
    Write-Host ""

    $response = Read-Host "    Overwrite? (y/N)"

    if ($response -ne "y" -and $response -ne "Y") {
        Write-ColorMessage -Message "Aborted. File not modified." -Level "INFO"
        exit 0
    }
}

# Write the metadata file
try {
    Set-Content -Path $outputPath -Value $metadataContent -Encoding UTF8
    Write-Host ""
    Write-ColorMessage -Message "Metadata file generated successfully!" -Level "SUCCESS"
    Write-Host ""
    Write-Host "  Output: " -NoNewline -ForegroundColor Gray
    Write-Host $outputPath -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  ================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Review and edit the generated file" -ForegroundColor Gray
    Write-Host "  2. Copy description from track_${TrackStr}_*_description.txt" -ForegroundColor Gray
    Write-Host "  3. Add ISRC code when assigned" -ForegroundColor Gray
    Write-Host "  4. Write social media copy" -ForegroundColor Gray
    Write-Host "  5. Complete release checklist" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  ================================================" -ForegroundColor Cyan
    Write-Host ""
}
catch {
    Write-ColorMessage -Message "Failed to write file: $($_.Exception.Message)" -Level "ERROR"
    exit 1
}
