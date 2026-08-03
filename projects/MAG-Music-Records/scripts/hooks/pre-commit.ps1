# MAG Music Records - Pre-commit Hook
# Blocks commits that violate repository policies

$ErrorActionPreference = "Stop"
$exitCode = 0

Write-Host "`n=== MAG Music Records Pre-commit Check ===" -ForegroundColor Cyan

# Get list of staged files
$stagedFiles = git diff --cached --name-only --diff-filter=ACM

if (-not $stagedFiles) {
    Write-Host "No files staged for commit." -ForegroundColor Yellow
    exit 0
}

# ================================================
# CHECK 1: Block audio files
# ================================================
Write-Host "`n[1/4] Checking for audio files..." -ForegroundColor White

$audioExtensions = @('.wav', '.mp3', '.flac', '.aiff', '.aif', '.m4a', '.ogg', '.wma', '.aac', '.opus')
$blockedAudio = @()

foreach ($file in $stagedFiles) {
    $ext = [System.IO.Path]::GetExtension($file).ToLower()
    if ($audioExtensions -contains $ext) {
        $blockedAudio += $file
    }
}

if ($blockedAudio.Count -gt 0) {
    Write-Host "  BLOCKED: Audio files detected!" -ForegroundColor Red
    foreach ($file in $blockedAudio) {
        Write-Host "    - $file" -ForegroundColor Red
    }
    Write-Host "  Audio files should NOT be committed. Store locally only." -ForegroundColor Yellow
    $exitCode = 1
} else {
    Write-Host "  OK: No audio files" -ForegroundColor Green
}

# ================================================
# CHECK 2: Block secrets
# ================================================
Write-Host "`n[2/4] Checking for secrets..." -ForegroundColor White

$secretPatterns = @('.env', '.secrets', 'credentials', 'tokens.txt', 'api_key', '.pem', '.key')
$blockedSecrets = @()

foreach ($file in $stagedFiles) {
    $fileName = [System.IO.Path]::GetFileName($file).ToLower()
    foreach ($pattern in $secretPatterns) {
        if ($fileName -like "*$pattern*") {
            $blockedSecrets += $file
            break
        }
    }
}

if ($blockedSecrets.Count -gt 0) {
    Write-Host "  BLOCKED: Potential secrets detected!" -ForegroundColor Red
    foreach ($file in $blockedSecrets) {
        Write-Host "    - $file" -ForegroundColor Red
    }
    Write-Host "  Never commit secrets or credentials." -ForegroundColor Yellow
    $exitCode = 1
} else {
    Write-Host "  OK: No secrets detected" -ForegroundColor Green
}

# ================================================
# CHECK 3: Required files exist
# ================================================
Write-Host "`n[3/4] Checking required files..." -ForegroundColor White

$requiredFiles = @(
    'README.md',
    'CLAUDE.md',
    'projects/mixtapes/MAG_Hardcore_Drill_Vol_1/00_admin/TRACKLIST.md'
)

$missingRequired = @()

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingRequired += $file
    }
}

if ($missingRequired.Count -gt 0) {
    Write-Host "  WARNING: Required files missing:" -ForegroundColor Yellow
    foreach ($file in $missingRequired) {
        Write-Host "    - $file" -ForegroundColor Yellow
    }
    # Warning only, don't block
} else {
    Write-Host "  OK: All required files present" -ForegroundColor Green
}

# ================================================
# CHECK 4: Track file naming convention
# ================================================
Write-Host "`n[4/4] Checking naming conventions..." -ForegroundColor White

$trackFiles = $stagedFiles | Where-Object {
    $_ -match '(01_prompts|02_lyrics|05_metadata)' -and
    $_ -match '\.(txt|md)$'
}

$namingIssues = @()

foreach ($file in $trackFiles) {
    $fileName = [System.IO.Path]::GetFileName($file)
    # Check if it follows track_NN_ pattern
    if ($fileName -notmatch '^track_\d{2}_') {
        $namingIssues += $file
    }
}

if ($namingIssues.Count -gt 0) {
    Write-Host "  WARNING: Files not following naming convention:" -ForegroundColor Yellow
    foreach ($file in $namingIssues) {
        Write-Host "    - $file" -ForegroundColor Yellow
    }
    Write-Host "  Expected format: track_NN_name_type.ext" -ForegroundColor Yellow
    # Warning only, don't block
} else {
    Write-Host "  OK: Naming conventions followed" -ForegroundColor Green
}

# ================================================
# Final result
# ================================================
Write-Host "`n========================================" -ForegroundColor Cyan

if ($exitCode -eq 0) {
    Write-Host "Pre-commit checks PASSED" -ForegroundColor Green
} else {
    Write-Host "Pre-commit checks FAILED" -ForegroundColor Red
    Write-Host "Fix the issues above and try again." -ForegroundColor Yellow
    Write-Host "`nTo bypass (NOT RECOMMENDED):" -ForegroundColor DarkGray
    Write-Host "  git commit --no-verify" -ForegroundColor DarkGray
}

Write-Host ""
exit $exitCode
