# MAG Music Records - Git Hooks Setup Script
# Run this once to enable local pre-commit hooks

$ErrorActionPreference = "Stop"

Write-Host "`n=== MAG Music Records - Hooks Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "ERROR: Not a git repository." -ForegroundColor Red
    Write-Host "Run 'git init' first, then run this script again." -ForegroundColor Yellow
    exit 1
}

# Check if hooks directory exists
$hooksDir = "scripts/hooks"
if (-not (Test-Path $hooksDir)) {
    Write-Host "ERROR: Hooks directory not found: $hooksDir" -ForegroundColor Red
    exit 1
}

# Configure git to use our hooks directory
Write-Host "Configuring git hooks path..." -ForegroundColor White
git config core.hooksPath scripts/hooks

# Verify the configuration
$configuredPath = git config core.hooksPath
if ($configuredPath -eq "scripts/hooks") {
    Write-Host "  OK: core.hooksPath set to 'scripts/hooks'" -ForegroundColor Green
} else {
    Write-Host "  ERROR: Failed to configure hooks path" -ForegroundColor Red
    exit 1
}

# Check if hook files exist
Write-Host "`nVerifying hook files..." -ForegroundColor White

$hookFiles = @(
    "scripts/hooks/pre-commit",
    "scripts/hooks/pre-commit.ps1"
)

$allPresent = $true
foreach ($file in $hookFiles) {
    if (Test-Path $file) {
        Write-Host "  OK: $file" -ForegroundColor Green
    } else {
        Write-Host "  MISSING: $file" -ForegroundColor Red
        $allPresent = $false
    }
}

if (-not $allPresent) {
    Write-Host "`nERROR: Some hook files are missing." -ForegroundColor Red
    exit 1
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Setup COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "Active hooks:" -ForegroundColor White
Write-Host "  - pre-commit: Blocks audio files, secrets, validates naming" -ForegroundColor Gray
Write-Host ""
Write-Host "The following will be blocked from commits:" -ForegroundColor Yellow
Write-Host "  - Audio files (.wav, .mp3, .flac, etc.)" -ForegroundColor Gray
Write-Host "  - Secret files (.env, credentials, tokens)" -ForegroundColor Gray
Write-Host ""
Write-Host "To test the hooks, try committing a .wav file (it should fail)." -ForegroundColor Cyan
Write-Host ""
