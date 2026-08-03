<#
.SYNOPSIS
    MAG Music Records - Daily Production Health Check
    Scans the current project and reports status of all tracks and files.

.DESCRIPTION
    Performs a comprehensive health check of the current music project:
    - Counts all production assets (prompts, lyrics, descriptions, artwork)
    - Validates naming conventions
    - Checks for misplaced or unclassified files
    - Identifies release blockers
    - Generates a colorful status report

.USAGE
    .\daily-check.ps1

.NOTES
    Author: MAG Music Records
    Version: 1.0
    Run this daily before starting production work.
#>

# ============================================================================
# CONFIGURATION
# ============================================================================

$ProjectRoot = "C:\Giquina-Projects\MAG Music Records"
$CurrentProject = "projects\mixtapes\MAG_Hardcore_Drill_Vol_1"
$ProjectPath = Join-Path $ProjectRoot $CurrentProject
$ScriptsPath = Join-Path $ProjectRoot "scripts"
$LogFile = Join-Path $ScriptsPath "daily-check-log.txt"

# Track numbering range (based on TRACKLIST.md)
$TrackNumbers = 1..7

# Expected folder structure
$Folders = @{
    Admin    = "00_admin"
    Prompts  = "01_prompts"
    Lyrics   = "02_lyrics"
    Audio    = "03_audio_exports"
    Artwork  = "04_artwork"
    Metadata = "05_metadata"
    Release  = "06_release"
}

# Naming pattern regex
$NamingPattern = "^track_(\d{2})_[a-z0-9_]+_(prompt|lyrics|description|cover|artwork|v\d+)?\.(txt|md|png|jpg|jpeg|wav|mp3|flac)$"

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "  $Title" -ForegroundColor Cyan
    Write-Host "  $('-' * $Title.Length)" -ForegroundColor DarkCyan
}

function Write-Status {
    param(
        [string]$Label,
        [int]$Count,
        [int]$Expected = 0,
        [string]$Suffix = ""
    )

    $color = if ($Expected -gt 0) {
        if ($Count -ge $Expected) { "Green" }
        elseif ($Count -gt 0) { "Yellow" }
        else { "Red" }
    } else {
        if ($Count -gt 0) { "Green" } else { "DarkGray" }
    }

    $statusIcon = switch ($color) {
        "Green" { "[OK]" }
        "Yellow" { "[--]" }
        "Red" { "[XX]" }
        "DarkGray" { "[  ]" }
    }

    Write-Host "    " -NoNewline
    Write-Host $statusIcon -NoNewline -ForegroundColor $color
    Write-Host " $Label`: " -NoNewline -ForegroundColor White
    Write-Host $Count -NoNewline -ForegroundColor $color

    if ($Expected -gt 0) {
        Write-Host "/$Expected" -NoNewline -ForegroundColor DarkGray
    }

    if ($Suffix) {
        Write-Host " $Suffix" -ForegroundColor DarkGray
    } else {
        Write-Host ""
    }
}

function Write-Issue {
    param(
        [string]$Type,
        [string]$Message
    )

    $icon = switch ($Type) {
        "ERROR" { "[XX]"; $color = "Red" }
        "WARNING" { "[!!]"; $color = "Yellow" }
        "INFO" { "[--]"; $color = "Cyan" }
        default { "[  ]"; $color = "Gray" }
    }

    Write-Host "    " -NoNewline
    Write-Host $icon -NoNewline -ForegroundColor $color
    Write-Host " $Message" -ForegroundColor $color
}

function Get-TrackFiles {
    param(
        [string]$FolderPath,
        [string]$Pattern
    )

    if (-not (Test-Path $FolderPath)) {
        return @()
    }

    return Get-ChildItem -Path $FolderPath -File | Where-Object { $_.Name -match $Pattern }
}

function Test-NamingConvention {
    param([string]$FileName)

    return $FileName -match $NamingPattern
}

function Get-TrackNumber {
    param([string]$FileName)

    if ($FileName -match "track_(\d{2})") {
        return [int]$Matches[1]
    }
    return $null
}

# ============================================================================
# MAIN CHECK FUNCTIONS
# ============================================================================

function Get-AssetCounts {
    $counts = @{
        Prompts = 0
        Lyrics = 0
        Descriptions = 0
        Artwork = 0
        Audio = 0
    }

    # Count prompts
    $promptFolder = Join-Path $ProjectPath $Folders.Prompts
    if (Test-Path $promptFolder) {
        $counts.Prompts = (Get-ChildItem -Path $promptFolder -File -Filter "*.txt" | Where-Object { $_.Name -match "prompt" }).Count
    }

    # Count lyrics
    $lyricsFolder = Join-Path $ProjectPath $Folders.Lyrics
    if (Test-Path $lyricsFolder) {
        $counts.Lyrics = (Get-ChildItem -Path $lyricsFolder -File | Where-Object { $_.Name -match "lyrics|\.lrc$" }).Count
    }

    # Count descriptions
    $metadataFolder = Join-Path $ProjectPath $Folders.Metadata
    if (Test-Path $metadataFolder) {
        $counts.Descriptions = (Get-ChildItem -Path $metadataFolder -File | Where-Object { $_.Name -match "description" }).Count
    }

    # Count artwork
    $artworkFolder = Join-Path $ProjectPath $Folders.Artwork
    if (Test-Path $artworkFolder) {
        $counts.Artwork = (Get-ChildItem -Path $artworkFolder -File -Include "*.png","*.jpg","*.jpeg","*.webp" -Recurse).Count
    }

    # Count audio (local only)
    $audioFolder = Join-Path $ProjectPath $Folders.Audio
    if (Test-Path $audioFolder) {
        $counts.Audio = (Get-ChildItem -Path $audioFolder -File -Include "*.wav","*.mp3","*.flac","*.m4a" -Recurse).Count
    }

    return $counts
}

function Get-NamingIssues {
    $issues = @()

    foreach ($folder in @($Folders.Prompts, $Folders.Lyrics, $Folders.Metadata)) {
        $folderPath = Join-Path $ProjectPath $folder

        if (Test-Path $folderPath) {
            $files = Get-ChildItem -Path $folderPath -File

            foreach ($file in $files) {
                # Skip special files
                if ($file.Name -match "^(release_tracker|\.gitkeep)") {
                    continue
                }

                if (-not (Test-NamingConvention -FileName $file.Name)) {
                    $issues += @{
                        Folder = $folder
                        File = $file.Name
                        Issue = "Does not match track_NN_name_type.ext pattern"
                    }
                }
            }
        }
    }

    return $issues
}

function Get-MisplacedFiles {
    $misplaced = @()

    # Check each folder for files that don't belong
    $folderChecks = @{
        $Folders.Prompts = @{ Expected = "prompt"; Extensions = @(".txt", ".md") }
        $Folders.Lyrics = @{ Expected = "lyrics|\.lrc"; Extensions = @(".txt", ".lrc", ".md") }
        $Folders.Artwork = @{ Expected = "."; Extensions = @(".png", ".jpg", ".jpeg", ".webp") }
        $Folders.Metadata = @{ Expected = "description|metadata|tracker"; Extensions = @(".txt", ".md") }
    }

    foreach ($folder in $folderChecks.Keys) {
        $folderPath = Join-Path $ProjectPath $folder
        $check = $folderChecks[$folder]

        if (Test-Path $folderPath) {
            $files = Get-ChildItem -Path $folderPath -File

            foreach ($file in $files) {
                if ($file.Name -eq ".gitkeep") { continue }

                $ext = $file.Extension.ToLower()

                # Check if extension is unexpected
                if ($ext -notin $check.Extensions) {
                    $misplaced += @{
                        Folder = $folder
                        File = $file.Name
                        Issue = "Unexpected file type: $ext"
                    }
                }

                # Check if content type is unexpected
                if ($file.Name -notmatch $check.Expected -and $file.Name -notmatch "track_\d+") {
                    $misplaced += @{
                        Folder = $folder
                        File = $file.Name
                        Issue = "Doesn't match expected content type"
                    }
                }
            }
        }
    }

    return $misplaced
}

function Get-ReleaseBlockers {
    $blockers = @()
    $totalTracks = $TrackNumbers.Count

    # Check for missing critical files per track
    foreach ($trackNum in $TrackNumbers) {
        $trackStr = "{0:D2}" -f $trackNum

        # Check prompt
        $promptFolder = Join-Path $ProjectPath $Folders.Prompts
        $hasPrompt = (Get-ChildItem -Path $promptFolder -File -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -match "track_$trackStr.*prompt" }).Count -gt 0

        # Check lyrics (not required for intro/outro)
        $lyricsFolder = Join-Path $ProjectPath $Folders.Lyrics
        $hasLyrics = (Get-ChildItem -Path $lyricsFolder -File -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -match "track_$trackStr.*lyrics" }).Count -gt 0

        # Check description
        $metadataFolder = Join-Path $ProjectPath $Folders.Metadata
        $hasDescription = (Get-ChildItem -Path $metadataFolder -File -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -match "track_$trackStr.*description" }).Count -gt 0

        # Track 1 and 7 are intro/outro - lyrics optional
        $lyricsRequired = $trackNum -notin @(1, 7)

        if (-not $hasPrompt) {
            $blockers += "Track ${trackStr}: Missing prompt"
        }

        if ($lyricsRequired -and -not $hasLyrics) {
            $blockers += "Track ${trackStr}: Missing lyrics"
        }

        if (-not $hasDescription) {
            $blockers += "Track ${trackStr}: Missing description"
        }
    }

    # Check for album artwork
    $artworkFolder = Join-Path $ProjectPath $Folders.Artwork
    $hasAlbumCover = (Get-ChildItem -Path $artworkFolder -File -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -match "album|cover" }).Count -gt 0

    if (-not $hasAlbumCover) {
        $blockers += "Missing album cover artwork"
    }

    return $blockers
}

function Get-TrackProgress {
    $progress = @()

    foreach ($trackNum in $TrackNumbers) {
        $trackStr = "{0:D2}" -f $trackNum

        $status = @{
            Track = $trackNum
            Prompt = $false
            Lyrics = $false
            Description = $false
            Audio = $false
        }

        # Check prompt
        $promptFolder = Join-Path $ProjectPath $Folders.Prompts
        $status.Prompt = (Get-ChildItem -Path $promptFolder -File -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -match "track_$trackStr" }).Count -gt 0

        # Check lyrics
        $lyricsFolder = Join-Path $ProjectPath $Folders.Lyrics
        $status.Lyrics = (Get-ChildItem -Path $lyricsFolder -File -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -match "track_$trackStr" }).Count -gt 0

        # Check description
        $metadataFolder = Join-Path $ProjectPath $Folders.Metadata
        $status.Description = (Get-ChildItem -Path $metadataFolder -File -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -match "track_$trackStr" }).Count -gt 0

        # Check audio
        $audioFolder = Join-Path $ProjectPath $Folders.Audio
        $status.Audio = (Get-ChildItem -Path $audioFolder -File -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -match "track_$trackStr" }).Count -gt 0

        $progress += $status
    }

    return $progress
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

$startTime = Get-Date

Clear-Host
Write-Host ""
Write-Host "  ================================================" -ForegroundColor Cyan
Write-Host "   MAG MUSIC RECORDS - DAILY PRODUCTION CHECK" -ForegroundColor White
Write-Host "  ================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Project: " -NoNewline -ForegroundColor Gray
Write-Host "MAG Hardcore Drill Vol. 1" -ForegroundColor White
Write-Host "  Date: " -NoNewline -ForegroundColor Gray
Write-Host (Get-Date -Format "yyyy-MM-dd HH:mm") -ForegroundColor White
Write-Host "  Path: " -NoNewline -ForegroundColor Gray
Write-Host $ProjectPath -ForegroundColor DarkGray

# Asset Counts
Write-Header "ASSET INVENTORY"
$counts = Get-AssetCounts
$totalTracks = $TrackNumbers.Count

Write-Status -Label "Prompts" -Count $counts.Prompts -Expected $totalTracks
Write-Status -Label "Lyrics" -Count $counts.Lyrics -Expected ($totalTracks - 2) -Suffix "(excl. intro/outro)"
Write-Status -Label "Descriptions" -Count $counts.Descriptions -Expected $totalTracks
Write-Status -Label "Artwork" -Count $counts.Artwork -Suffix "files"
Write-Status -Label "Audio (local)" -Count $counts.Audio -Suffix "files"

# Track Progress Grid
Write-Header "TRACK PROGRESS"
$progress = Get-TrackProgress

Write-Host ""
Write-Host "    Track  | Prompt | Lyrics | Desc | Audio" -ForegroundColor Gray
Write-Host "    -------+--------+--------+------+------" -ForegroundColor DarkGray

foreach ($track in $progress) {
    $promptIcon = if ($track.Prompt) { "[X]" } else { "[ ]" }
    $lyricsIcon = if ($track.Lyrics) { "[X]" } else { "[ ]" }
    $descIcon = if ($track.Description) { "[X]" } else { "[ ]" }
    $audioIcon = if ($track.Audio) { "[X]" } else { "[ ]" }

    $promptColor = if ($track.Prompt) { "Green" } else { "DarkGray" }
    $lyricsColor = if ($track.Lyrics) { "Green" } else { "DarkGray" }
    $descColor = if ($track.Description) { "Green" } else { "DarkGray" }
    $audioColor = if ($track.Audio) { "Green" } else { "DarkGray" }

    Write-Host "    Track $($track.Track) | " -NoNewline -ForegroundColor White
    Write-Host $promptIcon -NoNewline -ForegroundColor $promptColor
    Write-Host "   | " -NoNewline -ForegroundColor DarkGray
    Write-Host $lyricsIcon -NoNewline -ForegroundColor $lyricsColor
    Write-Host "   | " -NoNewline -ForegroundColor DarkGray
    Write-Host $descIcon -NoNewline -ForegroundColor $descColor
    Write-Host " | " -NoNewline -ForegroundColor DarkGray
    Write-Host $audioIcon -ForegroundColor $audioColor
}

# Naming Convention Issues
Write-Header "NAMING CONVENTION CHECK"
$namingIssues = Get-NamingIssues

if ($namingIssues.Count -eq 0) {
    Write-Issue -Type "INFO" -Message "All files follow naming conventions"
} else {
    foreach ($issue in $namingIssues) {
        Write-Issue -Type "WARNING" -Message "$($issue.Folder)/$($issue.File): $($issue.Issue)"
    }
}

# Misplaced Files
Write-Header "MISPLACED FILES CHECK"
$misplaced = Get-MisplacedFiles

if ($misplaced.Count -eq 0) {
    Write-Issue -Type "INFO" -Message "No misplaced files detected"
} else {
    foreach ($issue in $misplaced) {
        Write-Issue -Type "WARNING" -Message "$($issue.Folder)/$($issue.File): $($issue.Issue)"
    }
}

# Release Blockers
Write-Header "RELEASE BLOCKERS"
$blockers = Get-ReleaseBlockers

if ($blockers.Count -eq 0) {
    Write-Host ""
    Write-Host "    " -NoNewline
    Write-Host "[OK]" -NoNewline -ForegroundColor Green
    Write-Host " ALL TRACKS READY FOR RELEASE!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "    Found " -NoNewline -ForegroundColor Red
    Write-Host $blockers.Count -NoNewline -ForegroundColor White
    Write-Host " blocker(s):" -ForegroundColor Red
    Write-Host ""

    foreach ($blocker in $blockers) {
        Write-Issue -Type "ERROR" -Message $blocker
    }
}

# Summary
$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds

Write-Host ""
Write-Host "  ================================================" -ForegroundColor Cyan

# Calculate overall completion
$completedTasks = ($progress | ForEach-Object {
    $count = 0
    if ($_.Prompt) { $count++ }
    if ($_.Lyrics -or $_.Track -in @(1, 7)) { $count++ }  # Intro/outro don't need lyrics
    if ($_.Description) { $count++ }
    $count
} | Measure-Object -Sum).Sum

$totalTasks = ($totalTracks * 3) - 2  # All tracks need prompt/desc, non-intro/outro need lyrics

$completionPercent = [math]::Round(($completedTasks / $totalTasks) * 100)

Write-Host "   Overall Completion: " -NoNewline -ForegroundColor Gray
$completionColor = if ($completionPercent -ge 80) { "Green" } elseif ($completionPercent -ge 50) { "Yellow" } else { "Red" }
Write-Host "$completionPercent%" -ForegroundColor $completionColor

Write-Host "   Scan completed in $([math]::Round($duration, 2)) seconds" -ForegroundColor DarkGray
Write-Host "  ================================================" -ForegroundColor Cyan
Write-Host ""

# Log results to file
$logContent = @"
================================================================================
MAG MUSIC RECORDS - DAILY CHECK LOG
================================================================================
Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Project: MAG Hardcore Drill Vol. 1

ASSET COUNTS:
- Prompts: $($counts.Prompts)/$totalTracks
- Lyrics: $($counts.Lyrics)/$($totalTracks - 2)
- Descriptions: $($counts.Descriptions)/$totalTracks
- Artwork: $($counts.Artwork) files
- Audio: $($counts.Audio) files

ISSUES FOUND:
- Naming Issues: $($namingIssues.Count)
- Misplaced Files: $($misplaced.Count)
- Release Blockers: $($blockers.Count)

COMPLETION: $completionPercent%

BLOCKERS:
$($blockers -join "`n")

================================================================================
"@

Add-Content -Path $LogFile -Value $logContent
Write-Host "  Log saved to: daily-check-log.txt" -ForegroundColor DarkGray
Write-Host ""
