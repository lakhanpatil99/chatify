param (
    [string]$msg = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

Write-Host "Starting Automated Deployment..." -ForegroundColor Cyan

# 1. Git Push
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git add .
git commit -m "$msg"
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "Git push failed. Check errors above." -ForegroundColor Red
    exit
}

Write-Host "Done! Changes are live." -ForegroundColor Green
