# Organize Stems Script
# Automatically organize downloaded Lalal.ai stems into proper folder structure

param(
    [Parameter(Mandatory=$true)]
    [int]$TrackNumber,
    
    [Parameter(Mandatory=$false)]
    [string]$Project = "",
    
    [Parameter(Mandatory=$false)]
    [string]$DownloadsFolder = "$env:USERPROFILE\Downloads"
)

# Set up paths
$ProjectRoot = Split-Path -Parent $PSScriptRoot

if ($Project -eq "") {
    # Auto-detect project
    $CurrentPath = Get-Location
    if ($CurrentPath -like "*projects\mixtapes\*") {
        $Project = ($CurrentPath -split "projects\\mixtapes\\")[1] -split "\\" | Select-Object -First 1
        Write-Host "Auto-detected project: $Project" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Error: Could not detect project. Please specify with -Project parameter" -ForegroundColor Red
        exit 1
    }
}

$ProjectPath = Join-Path $ProjectRoot "projects\mixtapes\$Project"
$AudioPath = Join-Path $ProjectPath "03_audio_exports"

Write-Host "`n🎵 MAG Music Records - Stem Organization" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Project: $Project" -ForegroundColor White
Write-Host "Track: $TrackNumber" -ForegroundColor White

# Find Lalal.ai download (ZIP or extracted files)
Write-Host "`nSearching for Lalal.ai stems in Downloads..." -ForegroundColor Yellow

$zipFile = Get-ChildItem $DownloadsFolder -Filter "lalal.ai_*.zip" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
$stemFiles = Get-ChildItem $DownloadsFolder -Filter "*_(vocals|drums|bass|other).wav" | Sort-Object LastWriteTime -Descending | Select-Object -First 4

if ($zipFile) {
    Write-Host "Found ZIP: $($zipFile.Name)" -ForegroundColor Green
    
    # Extract ZIP
    $extractPath = Join-Path $DownloadsFolder "lalal_temp"
    Expand-Archive -Path $zipFile.FullName -DestinationPath $extractPath -Force
    
    $stemFiles = Get-ChildItem $extractPath -Filter "*.wav"
    Write-Host "Extracted $($stemFiles.Count) files" -ForegroundColor Cyan
}

if ($stemFiles.Count -eq 0) {
    Write-Host "❌ No stem files found in Downloads folder" -ForegroundColor Red
    Write-Host "Please ensure Lalal.ai stems are downloaded" -ForegroundColor Yellow
    exit 1
}

# Create stems folder
$stemsFolder = Join-Path $AudioPath "track_$('{0:D2}' -f $TrackNumber)_stems"
if (-not (Test-Path $stemsFolder)) {
    New-Item -Path $stemsFolder -ItemType Directory | Out-Null
    Write-Host "Created folder: $stemsFolder" -ForegroundColor Green
}

# Determine track name from existing files
$promptFile = Get-ChildItem (Join-Path $ProjectPath "01_prompts") -Filter "track_$('{0:D2}' -f $TrackNumber)_*_prompt.*" | Select-Object -First 1
$trackName = "unknown"

if ($promptFile) {
    if ($promptFile.Name -match "track_\d+_(.+)_prompt") {
        $trackName = $matches[1]
    }
}

Write-Host "`nOrganizing stems for track: $trackName" -ForegroundColor Cyan

# Copy and rename stems
$stemTypes = @("vocals", "drums", "bass", "other")
$organizedCount = 0

foreach ($type in $stemTypes) {
    $stemFile = $stemFiles | Where-Object { $_.Name -like "*$type*" } | Select-Object -First 1
    
    if ($stemFile) {
        $newName = "track_$('{0:D2}' -f $TrackNumber)_${trackName}_${type}.wav"
        $destination = Join-Path $stemsFolder $newName
        
        Copy-Item -Path $stemFile.FullName -Destination $destination -Force
        Write-Host "  ✅ Copied: $newName" -ForegroundColor Green
        $organizedCount++
    } else {
        Write-Host "  ⚠️ Missing: $type stem" -ForegroundColor Yellow
    }
}

# Cleanup temp files
if ($zipFile -and (Test-Path $extractPath)) {
    Remove-Item $extractPath -Recurse -Force
    Write-Host "`nCleaned up temporary extraction folder" -ForegroundColor Cyan
}

# Update project state
$stateFile = Join-Path $ProjectPath "project_state.json"
if (Test-Path $stateFile) {
    $state = Get-Content $stateFile -Raw | ConvertFrom-Json
    $trackKey = "track_$('{0:D2}' -f $TrackNumber)"
    
    if ($state.tracks.$trackKey) {
        $state.tracks.$trackKey.stems_separated = $true
        $state.tracks.$trackKey.stems_location = $stemsFolder
        
        $state | ConvertTo-Json -Depth 10 | Set-Content $stateFile
        Write-Host "Updated project_state.json" -ForegroundColor Cyan
    }
}

Write-Host "`n✨ Stem organization complete!" -ForegroundColor Green
Write-Host "Location: $stemsFolder" -ForegroundColor White
Write-Host "Organized: $organizedCount/4 stems" -ForegroundColor White

# Show next steps
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Import stems to Ableton Live" -ForegroundColor White
Write-Host "2. Mix and polish individual elements" -ForegroundColor White
Write-Host "3. Export final mix" -ForegroundColor White
Write-Host "4. Run: .\scripts\audio-qa.ps1 -Track $TrackNumber" -ForegroundColor White
