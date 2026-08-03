<#
.SYNOPSIS
    MAG Music Records - Automatic File Router
    Routes downloaded files to appropriate project folders based on naming patterns.

.DESCRIPTION
    Uses FileSystemWatcher to monitor Downloads and Desktop folders.
    Automatically moves files matching specific patterns to the correct
    MAG Music Records project folders.

.SETUP INSTRUCTIONS
    1. Open PowerShell as Administrator
    2. Navigate to the MAG Music Records scripts folder:
       cd "C:\Giquina-Projects\MAG Music Records\scripts"
    3. If needed, allow script execution:
       Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
    4. Run the script:
       .\file-router.ps1
    5. To run on startup, create a shortcut in:
       shell:startup
       Target: powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File "C:\Giquina-Projects\MAG Music Records\scripts\file-router.ps1"

.NOTES
    Author: MAG Music Records
    Version: 1.0
    The script runs continuously until closed.
    Logs all file movements to file-router-log.csv
#>

# ============================================================================
# CONFIGURATION
# ============================================================================

# Base paths
$ProjectRoot = "C:\Giquina-Projects\MAG Music Records"
$CurrentProject = "projects\mixtapes\MAG_Hardcore_Drill_Vol_1"
$ScriptsPath = Join-Path $ProjectRoot "scripts"
$LogFile = Join-Path $ScriptsPath "file-router-log.csv"

# Folders to monitor
$WatchFolders = @(
    [Environment]::GetFolderPath("UserProfile") + "\Downloads",
    [Environment]::GetFolderPath("Desktop")
)

# Target folders (relative to current project)
$TargetFolders = @{
    Prompts   = Join-Path $ProjectRoot "$CurrentProject\01_prompts"
    Lyrics    = Join-Path $ProjectRoot "$CurrentProject\02_lyrics"
    Audio     = Join-Path $ProjectRoot "$CurrentProject\03_audio_exports"
    Artwork   = Join-Path $ProjectRoot "$CurrentProject\04_artwork"
    Metadata  = Join-Path $ProjectRoot "$CurrentProject\05_metadata"
    Release   = Join-Path $ProjectRoot "$CurrentProject\06_release"
}

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

function Write-ColorLog {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

    switch ($Level) {
        "SUCCESS" {
            Write-Host "[$timestamp] " -NoNewline -ForegroundColor Gray
            Write-Host "[OK] " -NoNewline -ForegroundColor Green
            Write-Host $Message -ForegroundColor White
        }
        "WARNING" {
            Write-Host "[$timestamp] " -NoNewline -ForegroundColor Gray
            Write-Host "[!!] " -NoNewline -ForegroundColor Yellow
            Write-Host $Message -ForegroundColor Yellow
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
        "ROUTE" {
            Write-Host "[$timestamp] " -NoNewline -ForegroundColor Gray
            Write-Host "[>>] " -NoNewline -ForegroundColor Magenta
            Write-Host $Message -ForegroundColor Magenta
        }
    }
}

function Write-CsvLog {
    param(
        [string]$SourcePath,
        [string]$DestPath,
        [string]$Action,
        [string]$Status
    )

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = [PSCustomObject]@{
        Timestamp   = $timestamp
        SourcePath  = $SourcePath
        DestPath    = $DestPath
        Action      = $Action
        Status      = $Status
    }

    # Create log file with headers if it doesn't exist
    if (-not (Test-Path $LogFile)) {
        $logEntry | Export-Csv -Path $LogFile -NoTypeInformation
    } else {
        $logEntry | Export-Csv -Path $LogFile -NoTypeInformation -Append
    }
}

function Get-FileDestination {
    param([string]$FileName)

    $lowerName = $FileName.ToLower()
    $extension = [System.IO.Path]::GetExtension($lowerName)

    # Check for audio files - WARNING only, should stay local
    if ($extension -in @(".wav", ".mp3", ".flac", ".aiff", ".m4a")) {
        return @{
            Destination = $null
            Category = "AUDIO_WARNING"
            Message = "Audio files should be manually placed in 03_audio_exports"
        }
    }

    # Route based on patterns
    # Prompts
    if ($lowerName -match "prompt") {
        return @{
            Destination = $TargetFolders.Prompts
            Category = "Prompts"
            Message = "Routed to 01_prompts"
        }
    }

    # Lyrics
    if ($lowerName -match "lyrics?" -or $extension -eq ".lrc") {
        return @{
            Destination = $TargetFolders.Lyrics
            Category = "Lyrics"
            Message = "Routed to 02_lyrics"
        }
    }

    # Artwork
    if ($lowerName -match "cover|artwork|art_" -or
        ($extension -in @(".png", ".jpg", ".jpeg", ".webp") -and $lowerName -match "track_\d+")) {
        return @{
            Destination = $TargetFolders.Artwork
            Category = "Artwork"
            Message = "Routed to 04_artwork"
        }
    }

    # Metadata
    if ($lowerName -match "metadata|description") {
        return @{
            Destination = $TargetFolders.Metadata
            Category = "Metadata"
            Message = "Routed to 05_metadata"
        }
    }

    # Release files
    if ($lowerName -match "distrokid|release|distribution") {
        return @{
            Destination = $TargetFolders.Release
            Category = "Release"
            Message = "Routed to 06_release"
        }
    }

    # No match
    return $null
}

function Move-TrackedFile {
    param(
        [string]$SourcePath,
        [string]$DestFolder
    )

    try {
        $fileName = [System.IO.Path]::GetFileName($SourcePath)
        $destPath = Join-Path $DestFolder $fileName

        # Handle duplicate filenames
        $counter = 1
        $baseName = [System.IO.Path]::GetFileNameWithoutExtension($fileName)
        $extension = [System.IO.Path]::GetExtension($fileName)

        while (Test-Path $destPath) {
            $newName = "${baseName}_${counter}${extension}"
            $destPath = Join-Path $DestFolder $newName
            $counter++
        }

        # Ensure destination folder exists
        if (-not (Test-Path $DestFolder)) {
            New-Item -ItemType Directory -Path $DestFolder -Force | Out-Null
        }

        # Move the file
        Move-Item -Path $SourcePath -Destination $destPath -Force

        return @{
            Success = $true
            DestPath = $destPath
        }
    }
    catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

# ============================================================================
# FILE SYSTEM WATCHER EVENT HANDLER
# ============================================================================

$FileCreatedAction = {
    param($source, $eventArgs)

    # Wait briefly for file to be fully written
    Start-Sleep -Milliseconds 500

    $filePath = $eventArgs.FullPath
    $fileName = $eventArgs.Name

    # Skip temporary files and partial downloads
    if ($fileName -match "\.(tmp|crdownload|partial)$") {
        return
    }

    # Get routing destination
    $routing = Get-FileDestination -FileName $fileName

    if ($null -eq $routing) {
        # No match, ignore
        return
    }

    if ($routing.Category -eq "AUDIO_WARNING") {
        Write-ColorLog "AUDIO FILE DETECTED: $fileName" -Level "WARNING"
        Write-ColorLog $routing.Message -Level "WARNING"
        Write-CsvLog -SourcePath $filePath -DestPath "" -Action "WARNING" -Status "Audio file should be manually moved"
        return
    }

    # Route the file
    Write-ColorLog "Detected: $fileName [$($routing.Category)]" -Level "ROUTE"

    $result = Move-TrackedFile -SourcePath $filePath -DestFolder $routing.Destination

    if ($result.Success) {
        Write-ColorLog "Moved to: $($result.DestPath)" -Level "SUCCESS"
        Write-CsvLog -SourcePath $filePath -DestPath $result.DestPath -Action "MOVED" -Status "Success"
    } else {
        Write-ColorLog "Failed to move: $($result.Error)" -Level "ERROR"
        Write-CsvLog -SourcePath $filePath -DestPath $routing.Destination -Action "MOVE_FAILED" -Status $result.Error
    }
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

Clear-Host
Write-Host ""
Write-Host "  =========================================" -ForegroundColor Cyan
Write-Host "   MAG MUSIC RECORDS - FILE ROUTER" -ForegroundColor White
Write-Host "  =========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Monitoring for music project files..." -ForegroundColor Gray
Write-Host ""

# Display configuration
Write-ColorLog "Project Root: $ProjectRoot" -Level "INFO"
Write-ColorLog "Current Project: $CurrentProject" -Level "INFO"
Write-Host ""

# Display routing rules
Write-Host "  ROUTING RULES:" -ForegroundColor Yellow
Write-Host "  ---------------" -ForegroundColor Yellow
Write-Host "  *prompt*           -> 01_prompts/" -ForegroundColor Gray
Write-Host "  *lyrics*, *.lrc    -> 02_lyrics/" -ForegroundColor Gray
Write-Host "  *.wav, *.mp3       -> WARNING (manual)" -ForegroundColor DarkYellow
Write-Host "  *cover*, *artwork* -> 04_artwork/" -ForegroundColor Gray
Write-Host "  *metadata*, *desc* -> 05_metadata/" -ForegroundColor Gray
Write-Host "  *distrokid*        -> 06_release/" -ForegroundColor Gray
Write-Host ""

# Initialize file system watchers
$watchers = @()

foreach ($folder in $WatchFolders) {
    if (Test-Path $folder) {
        $watcher = New-Object System.IO.FileSystemWatcher
        $watcher.Path = $folder
        $watcher.Filter = "*.*"
        $watcher.IncludeSubdirectories = $false
        $watcher.EnableRaisingEvents = $true

        # Register event handlers
        $null = Register-ObjectEvent -InputObject $watcher -EventName Created -Action $FileCreatedAction

        $watchers += $watcher
        Write-ColorLog "Watching: $folder" -Level "SUCCESS"
    } else {
        Write-ColorLog "Folder not found: $folder" -Level "WARNING"
    }
}

Write-Host ""
Write-Host "  Press Ctrl+C to stop..." -ForegroundColor DarkGray
Write-Host ""
Write-Host "  ==========================================" -ForegroundColor Cyan
Write-Host ""

# Keep script running
try {
    while ($true) {
        Wait-Event -Timeout 1
    }
}
finally {
    # Cleanup
    foreach ($watcher in $watchers) {
        $watcher.EnableRaisingEvents = $false
        $watcher.Dispose()
    }
    Write-ColorLog "File router stopped." -Level "INFO"
}
