# ==============================================================================
# Trose-property - Git & Vercel Push Helper
# ==============================================================================
Write-Host "Preparing Git repository for Trose-property..." -ForegroundColor Cyan

git init
git add .
git commit -m "feat: release Trose-property v5.9 Kalibata City Edition"
git branch -M main

Write-Host "Git ready! Hubungkan ke remote repository dengan perintah:" -ForegroundColor Green
Write-Host "git remote add origin https://github.com/USERNAME_ANDA/Trose-property.git" -ForegroundColor Yellow
Write-Host "git push -u origin main" -ForegroundColor Yellow