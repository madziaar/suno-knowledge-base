# Install Recommended VS Code Extensions for MAG Music Records
# Run this script once to install all recommended extensions

Write-Host "Installing MAG Music Records VS Code Extensions..." -ForegroundColor Cyan

$extensions = @(
    "alefragnani.project-manager",
    "wayou.vscode-todo-highlight",
    "streetsidesoftware.code-spell-checker-portuguese",
    "mechatroner.rainbow-csv",
    "bierner.markdown-preview-github-styles",
    "yzhang.markdown-emoji",
    "davidanson.vscode-markdownlint",
    "ms-vscode.live-server",
    "donjayamanne.githistory",
    "sleistner.vscode-fileutils",
    "wmaurer.change-case",
    "zainchen.json",
    "quicktype.quicktype",
    "github.vscode-github-actions"
)

foreach ($ext in $extensions) {
    Write-Host "Installing $ext..." -ForegroundColor Yellow
    code --install-extension $ext
}

Write-Host "`n✅ All extensions installed!" -ForegroundColor Green
Write-Host "Restart VS Code to activate them." -ForegroundColor Cyan
