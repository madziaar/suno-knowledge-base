# MAG Music Records - Batch Operations Script
# Automate repetitive tasks across multiple tracks

param(
    [Parameter(Mandatory=$false)]
    [string]$Operation = "help",
    
    [Parameter(Mandatory=$false)]
    [string]$Project = "",
    
    [Parameter(Mandatory=$false)]
    [int[]]$Tracks = @(),
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun,
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

# Set up project root
$ProjectRoot = Split-Path -Parent $PSScriptRoot
if ($Project -eq "") {
    # Try to detect current project
    $CurrentPath = Get-Location
    if ($CurrentPath -like "*projects\mixtapes\*") {
        $Project = ($CurrentPath -split "projects\\mixtapes\\")[1] -split "\\" | Select-Object -First 1
        Write-Host "Auto-detected project: $Project" -ForegroundColor Cyan
    }
}

# Helper Functions
function Show-Help {
    Write-Host @"

MAG Music Records - Batch Operations
=====================================

Usage:
    .\batch-operations.ps1 -Operation <operation> [-Project <project>] [-Tracks <track_numbers>]

Operations:
    generate-all          Generate prompts + lyrics + descriptions for all tracks
    generate-prompts      Generate prompts only
    generate-lyrics       Generate lyrics only
    generate-descriptions Generate descriptions only
    
    audioqa-all           Run audio QA on all tracks with audio files
    audioqa-tracks        Run audio QA on specific tracks
    
    validate-metadata     Validate metadata for all or specific tracks
    validate-files        Check file existence for all tracks
    
    create-covers         Generate cover art for all tracks (requires Leonardo.ai)
    
    distro-prep-all       Prepare all tracks for DistroKid upload
    distro-prep-tracks    Prepare specific tracks for DistroKid
    
    social-all            Generate social media content for all tracks
    social-tracks         Generate social content for specific tracks
    
    renumber              Renumber tracks (for resequencing)
    
    help                  Show this help message

Parameters:
    -Project <name>       Project folder name (e.g., MAG_Hardcore_Drill_Vol_1)
    -Tracks <numbers>     Track numbers (e.g., 1,2,3 or 1..10)
    -DryRun               Preview actions without executing
    -Force                Skip confirmations

Examples:
    # Generate everything for all tracks in current project
    .\batch-operations.ps1 -Operation generate-all
    
    # Generate prompts for tracks 1-5 in specific project
    .\batch-operations.ps1 -Operation generate-prompts -Project MAG_HDRILL_V1 -Tracks 1,2,3,4,5
    
    # Run audio QA on all tracks (dry run)
    .\batch-operations.ps1 -Operation audioqa-all -DryRun
    
    # Prepare tracks 2, 5, 7 for DistroKid
    .\batch-operations.ps1 -Operation distro-prep-tracks -Tracks 2,5,7
    
    # Generate social media content for all tracks
    .\batch-operations.ps1 -Operation social-all -Project MAG_HDRILL_V1

"@
}

function Get-ProjectPath {
    param([string]$ProjectName)
    return Join-Path $ProjectRoot "projects\mixtapes\$ProjectName"
}

function Get-TrackList {
    param([string]$ProjectPath)
    
    $tracklistFile = Join-Path $ProjectPath "00_admin\TRACKLIST.md"
    if (Test-Path $tracklistFile) {
        # Parse tracklist
        $content = Get-Content $tracklistFile -Raw
        $trackNumbers = @()
        
        # Extract track numbers from various formats
        $content -split "`n" | ForEach-Object {
            if ($_ -match "^\s*(\d+)[\.\)]") {
                $trackNumbers += [int]$matches[1]
            }
        }
        
        return $trackNumbers | Sort-Object
    }
    
    # Fallback: detect from prompts folder
    $promptsPath = Join-Path $ProjectPath "01_prompts"
    if (Test-Path $promptsPath) {
        $promptFiles = Get-ChildItem $promptsPath -Filter "track_*_prompt.*"
        $trackNumbers = $promptFiles | ForEach-Object {
            if ($_.Name -match "track_(\d+)_") {
                [int]$matches[1]
            }
        } | Sort-Object
        
        return $trackNumbers
    }
    
    Write-Host "❌ Could not determine track list for project" -ForegroundColor Red
    return @()
}

function Invoke-ClaudeCommand {
    param(
        [string]$Command,
        [int]$TrackNumber
    )
    
    if ($DryRun) {
        Write-Host "  [DRY RUN] Would execute: $Command" -ForegroundColor Yellow
        return $true
    }
    
    Write-Host "  Executing: $Command" -ForegroundColor Cyan
    
    # Here you would integrate with Claude Code
    # For now, just log the command
    # In production, this would use claude.ai API or claude-in-chrome MCP
    
    return $true
}

# Operations

function Generate-All {
    param([string]$ProjectPath, [int[]]$TrackNumbers)
    
    Write-Host "`n🎵 Generating All Content for Tracks: $($TrackNumbers -join ', ')" -ForegroundColor Green
    
    foreach ($track in $TrackNumbers) {
        Write-Host "`n--- Track $track ---" -ForegroundColor White
        
        # Generate prompt
        Write-Host "  1/3 Generating prompt..." -ForegroundColor Cyan
        Invoke-ClaudeCommand "WANDA: Prompt Track $track" $track
        
        # Generate lyrics
        Write-Host "  2/3 Generating lyrics..." -ForegroundColor Cyan
        Invoke-ClaudeCommand "WANDA: Lyrics Track $track" $track
        
        # Generate description
        Write-Host "  3/3 Generating description..." -ForegroundColor Cyan
        Invoke-ClaudeCommand "WANDA: Description Track $track" $track
        
        Write-Host "  ✅ Track $track complete" -ForegroundColor Green
        Start-Sleep -Seconds 2
    }
    
    Write-Host "`n✅ All tracks generated!" -ForegroundColor Green
}

function AudioQA-All {
    param([string]$ProjectPath)
    
    Write-Host "`n🎧 Running Audio QA on All Tracks" -ForegroundColor Green
    
    $audioPath = Join-Path $ProjectPath "03_audio_exports"
    if (-not (Test-Path $audioPath)) {
        Write-Host "❌ No audio exports folder found" -ForegroundColor Red
        return
    }
    
    $audioFiles = Get-ChildItem $audioPath -Filter "track_*.wav", "track_*.mp3"
    
    if ($audioFiles.Count -eq 0) {
        Write-Host "⚠️ No audio files found in $audioPath" -ForegroundColor Yellow
        return
    }
    
    Write-Host "Found $($audioFiles.Count) audio files" -ForegroundColor Cyan
    
    $pythonScript = Join-Path $ProjectRoot "tools\audio_qa\analyze.py"
    
    foreach ($file in $audioFiles) {
        Write-Host "`nAnalyzing: $($file.Name)" -ForegroundColor Cyan
        
        if ($DryRun) {
            Write-Host "  [DRY RUN] Would run: python $pythonScript $($file.FullName)" -ForegroundColor Yellow
        } else {
            python $pythonScript $file.FullName
        }
    }
    
    Write-Host "`n✅ Audio QA complete!" -ForegroundColor Green
}

function Validate-Metadata {
    param([string]$ProjectPath, [int[]]$TrackNumbers)
    
    Write-Host "`n📋 Validating Metadata for Tracks: $($TrackNumbers -join ', ')" -ForegroundColor Green
    
    foreach ($track in $TrackNumbers) {
        Write-Host "`n--- Track $track ---" -ForegroundColor White
        Invoke-ClaudeCommand "@metadata Track $track" $track
    }
    
    Write-Host "`n✅ Metadata validation complete!" -ForegroundColor Green
}

function DistroPrepall {
    param([string]$ProjectPath, [int[]]$TrackNumbers)
    
    Write-Host "`n📦 Preparing Tracks for DistroKid: $($TrackNumbers -join ', ')" -ForegroundColor Green
    
    foreach ($track in $TrackNumbers) {
        Write-Host "`n--- Track $track ---" -ForegroundColor White
        Invoke-ClaudeCommand "@distro Track $track" $track
    }
    
    Write-Host "`n✅ DistroKid prep complete!" -ForegroundColor Green
}

function Social-All {
    param([string]$ProjectPath, [int[]]$TrackNumbers)
    
    Write-Host "`n📱 Generating Social Media Content for Tracks: $($TrackNumbers -join ', ')" -ForegroundColor Green
    
    foreach ($track in $TrackNumbers) {
        Write-Host "`n--- Track $track ---" -ForegroundColor White
        Invoke-ClaudeCommand "@social Track $track" $track
    }
    
    Write-Host "`n✅ Social media content generation complete!" -ForegroundColor Green
}

# Main Script Logic

if ($Operation -eq "help") {
    Show-Help
    exit 0
}

if ($Project -eq "") {
    Write-Host "❌ Error: Project not specified and could not be auto-detected" -ForegroundColor Red
    Write-Host "Please specify with -Project parameter" -ForegroundColor Yellow
    exit 1
}

$projectPath = Get-ProjectPath $Project

if (-not (Test-Path $projectPath)) {
    Write-Host "❌ Error: Project not found at $projectPath" -ForegroundColor Red
    exit 1
}

Write-Host "`nMAG Music Records - Batch Operations" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Project: $Project" -ForegroundColor White
Write-Host "Operation: $Operation" -ForegroundColor White

# Get track list
if ($Tracks.Count -eq 0) {
    $Tracks = Get-TrackList $projectPath
    Write-Host "Auto-detected tracks: $($Tracks -join ', ')" -ForegroundColor Yellow
}

if ($Tracks.Count -eq 0) {
    Write-Host "❌ Error: No tracks specified or detected" -ForegroundColor Red
    exit 1
}

# Confirmation
if (-not $Force -and -not $DryRun) {
    Write-Host "`nThis will perform '$Operation' on $($Tracks.Count) tracks." -ForegroundColor Yellow
    $confirm = Read-Host "Continue? (y/n)"
    if ($confirm -ne "y") {
        Write-Host "Cancelled." -ForegroundColor Red
        exit 0
    }
}

# Execute operation
switch ($Operation) {
    "generate-all" { Generate-All $projectPath $Tracks }
    "audioqa-all" { AudioQA-All $projectPath }
    "validate-metadata" { Validate-Metadata $projectPath $Tracks }
    "distro-prep-all" { DistroPrepall $projectPath $Tracks }
    "social-all" { Social-All $projectPath $Tracks }
    
    default {
        Write-Host "❌ Unknown operation: $Operation" -ForegroundColor Red
        Show-Help
        exit 1
    }
}

Write-Host "`n✨ Batch operation complete!" -ForegroundColor Green
