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

# 2. Vercel Deploy
Write-Host "Deploying to Vercel..." -ForegroundColor Yellow
# uses npx to ensure vercel is available without global install
# --prod triggers a production deployment
cmd /c "npx vercel --prod"

Write-Host "Done! Changes are live." -ForegroundColor Green
