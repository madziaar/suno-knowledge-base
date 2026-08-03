<#
.SYNOPSIS
    MAG Music Records - Track Validation Script
    Validates all required assets for a specific track number.

.DESCRIPTION
    Performs comprehensive validation on a single track:
    - Checks if prompt file exists
    - Checks if lyrics file exists
    - Checks if description exists and is within 1000 character limit
    - Validates naming conventions for all related files
    - Returns detailed pass/fail status

.PARAMETER TrackNumber
    The track number to validate (1-7)

.USAGE
    .\validate-track.ps1 -TrackNumber 2
    .\validate-track.ps1 2

.NOTES
    Author: MAG Music Records
    Version: 1.0
    Exit codes:
    0 = All validations passed
    1 = One or more validations failed
#>

param(
    [Parameter(Mandatory=$true, Position=0)]
    [ValidateRange(1, 7)]
    [int]$TrackNumber
)

# ============================================================================
# CONFIGURATION
# ============================================================================

$ProjectRoot = "C:\Giquina-Projects\MAG Music Records"
$CurrentProject = "projects\mixtapes\MAG_Hardcore_Drill_Vol_1"
$ProjectPath = Join-Path $ProjectRoot $CurrentProject

$Folders = @{
    Prompts  = Join-Path $ProjectPath "01_prompts"
    Lyrics   = Join-Path $ProjectPath "02_lyrics"
    Metadata = Join-Path $ProjectPath "05_metadata"
    Audio    = Join-Path $ProjectPath "03_audio_exports"
}

# Tracks 1 and 7 are intro/outro - lyrics optional
$LyricsRequired = $TrackNumber -notin @(1, 7)

# Naming pattern regex
$NamingPattern = "^track_\d{2}_[a-z0-9_]+_(prompt|lyrics|description)\.(txt|md)$"

$DescriptionMaxChars = 1000

# ============================================================================
# VALIDATION RESULTS TRACKING
# ============================================================================

$ValidationResults = @{
    Prompt = @{ Passed = $false; Message = ""; Details = @() }
    Lyrics = @{ Passed = $false; Message = ""; Details = @() }
    Description = @{ Passed = $false; Message = ""; Details = @() }
    Naming = @{ Passed = $false; Message = ""; Details = @() }
    Overall = $false
}

$TrackStr = "{0:D2}" -f $TrackNumber

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

function Write-ValidationHeader {
    param([string]$Title)
    Write-Host ""
    Write-Host "  $Title" -ForegroundColor Cyan
    Write-Host "  $('-' * $Title.Length)" -ForegroundColor DarkCyan
}

function Write-ValidationResult {
    param(
        [string]$Check,
        [bool]$Passed,
        [string]$Message,
        [array]$Details = @()
    )

    $icon = if ($Passed) { "[PASS]" } else { "[FAIL]" }
    $color = if ($Passed) { "Green" } else { "Red" }

    Write-Host "    " -NoNewline
    Write-Host $icon -NoNewline -ForegroundColor $color
    Write-Host " $Check`: " -NoNewline -ForegroundColor White
    Write-Host $Message -ForegroundColor $color

    foreach ($detail in $Details) {
        Write-Host "         " -NoNewline
        Write-Host "- $detail" -ForegroundColor Gray
    }
}

function Find-TrackFiles {
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
    return $FileName.ToLower() -match $NamingPattern
}

# ============================================================================
# VALIDATION CHECKS
# ============================================================================

function Test-PromptExists {
    $promptFiles = Find-TrackFiles -FolderPath $Folders.Prompts -Pattern "track_$TrackStr.*prompt"

    if ($promptFiles.Count -gt 0) {
        $file = $promptFiles[0]
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue

        if ([string]::IsNullOrWhiteSpace($content)) {
            return @{
                Passed = $false
                Message = "File exists but is empty"
                Details = @("File: $($file.Name)")
            }
        }

        $lineCount = ($content -split "`n").Count
        return @{
            Passed = $true
            Message = "Found: $($file.Name)"
            Details = @("$lineCount lines", "$($content.Length) characters")
        }
    }

    return @{
        Passed = $false
        Message = "No prompt file found"
        Details = @("Expected pattern: track_${TrackStr}_*_prompt.txt")
    }
}

function Test-LyricsExists {
    # For intro/outro tracks, lyrics are optional
    if (-not $LyricsRequired) {
        return @{
            Passed = $true
            Message = "Lyrics optional (intro/outro track)"
            Details = @()
        }
    }

    $lyricsFiles = Find-TrackFiles -FolderPath $Folders.Lyrics -Pattern "track_$TrackStr.*(lyrics|\.lrc)"

    if ($lyricsFiles.Count -gt 0) {
        $file = $lyricsFiles[0]
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue

        if ([string]::IsNullOrWhiteSpace($content)) {
            return @{
                Passed = $false
                Message = "File exists but is empty"
                Details = @("File: $($file.Name)")
            }
        }

        # Check for section markers
        $hasSections = $content -match "\[(Verse|Chorus|Hook|Bridge|Intro|Outro)"
        $lineCount = ($content -split "`n").Count

        $details = @("$lineCount lines", "$($content.Length) characters")
        if ($hasSections) {
            $details += "Section markers found"
        } else {
            $details += "WARNING: No section markers (e.g., [Verse], [Chorus])"
        }

        return @{
            Passed = $true
            Message = "Found: $($file.Name)"
            Details = $details
        }
    }

    return @{
        Passed = $false
        Message = "No lyrics file found"
        Details = @("Expected pattern: track_${TrackStr}_*_lyrics.txt or .lrc")
    }
}

function Test-DescriptionExists {
    $descFiles = Find-TrackFiles -FolderPath $Folders.Metadata -Pattern "track_$TrackStr.*description"

    if ($descFiles.Count -gt 0) {
        $file = $descFiles[0]
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue

        if ([string]::IsNullOrWhiteSpace($content)) {
            return @{
                Passed = $false
                Message = "File exists but is empty"
                Details = @("File: $($file.Name)")
            }
        }

        $charCount = $content.Length
        $withinLimit = $charCount -le $DescriptionMaxChars

        if ($withinLimit) {
            return @{
                Passed = $true
                Message = "Found: $($file.Name)"
                Details = @("$charCount/$DescriptionMaxChars characters")
            }
        } else {
            return @{
                Passed = $false
                Message = "EXCEEDS CHARACTER LIMIT"
                Details = @(
                    "File: $($file.Name)",
                    "$charCount characters (limit: $DescriptionMaxChars)",
                    "Over by $($charCount - $DescriptionMaxChars) characters"
                )
            }
        }
    }

    return @{
        Passed = $false
        Message = "No description file found"
        Details = @("Expected pattern: track_${TrackStr}_*_description.txt")
    }
}

function Test-NamingConventions {
    $allFiles = @()
    $issues = @()

    # Gather all track-related files
    foreach ($folder in @($Folders.Prompts, $Folders.Lyrics, $Folders.Metadata)) {
        if (Test-Path $folder) {
            $files = Find-TrackFiles -FolderPath $folder -Pattern "track_$TrackStr"
            $allFiles += $files
        }
    }

    if ($allFiles.Count -eq 0) {
        return @{
            Passed = $false
            Message = "No files found to validate"
            Details = @()
        }
    }

    foreach ($file in $allFiles) {
        if (-not (Test-NamingConvention -FileName $file.Name)) {
            $issues += "Invalid: $($file.Name)"
        }
    }

    if ($issues.Count -eq 0) {
        return @{
            Passed = $true
            Message = "All $($allFiles.Count) files follow conventions"
            Details = $allFiles | ForEach-Object { $_.Name }
        }
    }

    return @{
        Passed = $false
        Message = "$($issues.Count) naming issues found"
        Details = $issues + @("Expected: track_NN_name_type.txt")
    }
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

Clear-Host
Write-Host ""
Write-Host "  ================================================" -ForegroundColor Cyan
Write-Host "   MAG MUSIC RECORDS - TRACK VALIDATION" -ForegroundColor White
Write-Host "  ================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Validating Track: " -NoNewline -ForegroundColor Gray
Write-Host $TrackNumber -ForegroundColor White
Write-Host "  Project: " -NoNewline -ForegroundColor Gray
Write-Host "MAG Hardcore Drill Vol. 1" -ForegroundColor White

# Determine track type
$trackType = switch ($TrackNumber) {
    1 { "Intro" }
    7 { "Outro" }
    2 { "Lead Single" }
    default { "Full Track" }
}
Write-Host "  Type: " -NoNewline -ForegroundColor Gray
Write-Host $trackType -ForegroundColor Yellow

# Run validations
Write-ValidationHeader "PROMPT CHECK"
$ValidationResults.Prompt = Test-PromptExists
Write-ValidationResult -Check "Prompt" -Passed $ValidationResults.Prompt.Passed -Message $ValidationResults.Prompt.Message -Details $ValidationResults.Prompt.Details

Write-ValidationHeader "LYRICS CHECK"
$ValidationResults.Lyrics = Test-LyricsExists
Write-ValidationResult -Check "Lyrics" -Passed $ValidationResults.Lyrics.Passed -Message $ValidationResults.Lyrics.Message -Details $ValidationResults.Lyrics.Details

Write-ValidationHeader "DESCRIPTION CHECK"
$ValidationResults.Description = Test-DescriptionExists
Write-ValidationResult -Check "Description" -Passed $ValidationResults.Description.Passed -Message $ValidationResults.Description.Message -Details $ValidationResults.Description.Details

Write-ValidationHeader "NAMING CONVENTION CHECK"
$ValidationResults.Naming = Test-NamingConventions
Write-ValidationResult -Check "Naming" -Passed $ValidationResults.Naming.Passed -Message $ValidationResults.Naming.Message -Details $ValidationResults.Naming.Details

# Overall result
$allPassed = $ValidationResults.Prompt.Passed -and
             $ValidationResults.Lyrics.Passed -and
             $ValidationResults.Description.Passed -and
             $ValidationResults.Naming.Passed

Write-Host ""
Write-Host "  ================================================" -ForegroundColor Cyan

if ($allPassed) {
    Write-Host ""
    Write-Host "    " -NoNewline
    Write-Host "[PASS]" -NoNewline -ForegroundColor Green
    Write-Host " TRACK $TrackNumber VALIDATION " -NoNewline -ForegroundColor White
    Write-Host "PASSED" -ForegroundColor Green
    Write-Host ""
    Write-Host "    All checks completed successfully." -ForegroundColor Gray
    Write-Host "    Track $TrackNumber is ready for production." -ForegroundColor Gray
    Write-Host ""
    Write-Host "  ================================================" -ForegroundColor Cyan
    Write-Host ""
    exit 0
} else {
    $failCount = @(
        $ValidationResults.Prompt.Passed,
        $ValidationResults.Lyrics.Passed,
        $ValidationResults.Description.Passed,
        $ValidationResults.Naming.Passed
    ) | Where-Object { -not $_ } | Measure-Object | Select-Object -ExpandProperty Count

    Write-Host ""
    Write-Host "    " -NoNewline
    Write-Host "[FAIL]" -NoNewline -ForegroundColor Red
    Write-Host " TRACK $TrackNumber VALIDATION " -NoNewline -ForegroundColor White
    Write-Host "FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "    $failCount check(s) failed." -ForegroundColor Gray
    Write-Host "    Review issues above and fix before release." -ForegroundColor Gray
    Write-Host ""
    Write-Host "  ================================================" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}
