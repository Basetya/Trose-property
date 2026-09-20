Write-Host "🔍 Memeriksa status repositori Git..." -ForegroundColor Cyan
git status -s

$landingPath = "frontend/js/landing.js"
if (Test-Path $landingPath) {
    Copy-Item $landingPath "$landingPath.bak" -Force
    $code = Get-Content $landingPath -Raw -Encoding UTF8

    # Force bypass localStorage agar gambar default langsung tampil mutlak
    $code = $code -replace 'let units = defaultUnits;\s*const savedCMS = localStorage\.getItem\("KUSUMA_POPULAR_UNITS_CMS"\);[\s\S]*?units = defaultUnits;\s*\}', 'let units = defaultUnits;'

    # Perbarui versi header engine
    $code = $code -replace 'Version: v\d+\.\d+\.\d+', 'Version: v155.0.0 (Hard Cache Purge & Force Media Sync)'

    $code | Set-Content $landingPath -Encoding UTF8
    Write-Host "✅ frontend/js/landing.js: Cache bypass diterapkan!" -ForegroundColor Green
}

# Sinkronisasi ke Git
git add .
git commit -m "fix(sync): force clear local CMS cache & push media catalog (v155.0)"
git push origin main

Write-Host "`n🚀 DEPLOYMENT SELESAI!" -ForegroundColor Magenta
Write-Host "Langkah Terakhir pada Browser:" -ForegroundColor Yellow
Write-Host "1. Buka https://kusumaproperti.my.id" -ForegroundColor White
Write-Host "2. Buka DevTools (Tekan F12)" -ForegroundColor White
Write-Host "3. Klik kanan tombol Reload di browser -> Pilih 'Empty Cache and Hard Reload'" -ForegroundColor White
