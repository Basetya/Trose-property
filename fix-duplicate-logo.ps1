# ==============================================================================
# Script: fix-duplicate-logo.ps1
# Deskripsi: Menghapus duplikat logo di pojok kiri atas (Navbar Header)
# ==============================================================================

$targetFiles = @("frontend/index.html", "index.html")
$HtmlPath = $null

foreach ($f in $targetFiles) {
    if (Test-Path $f) {
        $HtmlPath = $f
        break
    }
}

if (-not $HtmlPath) {
    Write-Host "File index.html tidak ditemukan!" -ForegroundColor Red
    Exit
}

Write-Host "Target file: $HtmlPath" -ForegroundColor Cyan

# 1. Baca file HTML
$Html = [System.IO.File]::ReadAllText($HtmlPath, [System.Text.Encoding]::UTF8)

# 2. Markup Bersih Tunggal untuk Navbar Brand di Kiri Atas
$cleanNavbarBrand = @"
<div class="nav-brand" style="display: flex; align-items: center; gap: 12px;">
        <div class="brand-logo" style="width: 40px; height: 40px; border-radius: 50%; background: #8c4a24; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.2rem; flex-shrink: 0;">K</div>
        <div class="brand-text" style="display: flex; flex-direction: column; justify-content: center;">
          <span style="font-weight: 800; font-size: 1.1rem; color: #111827; line-height: 1.2;">Kusuma Properti</span>
          <span style="font-size: 0.72rem; color: #8c4a24; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; line-height: 1.2;">KALIBATA CITY HAVEN</span>
        </div>
      </div>
"@

# 3. Targetkan dan bersihkan seluruh variasi logo duplikat di dalam header
if ($Html -match '(?is)<header\b[^>]*>[\s\S]*?</header>') {
    $headerBlock = [regex]::Match($Html, '(?is)<header\b[^>]*>[\s\S]*?</header>').Value
    
    # Hapus semua kemunculan nav-brand / logo kembar di dalam header
    $headerFixed = [regex]::Replace($headerBlock, '(?is)(?:<div[^>]*class="[^"]*(?:nav-brand|brand-logo)[^"]*"[^>]*>[\s\S]*?</div>\s*)+', "$cleanNavbarBrand`n      ", 1)
    
    # Bersihkan jika ada teks nama kembar beruntun
    $headerFixed = [regex]::Replace($headerFixed, '(?is)(<div class="nav-brand"[\s\S]*?</div>\s*</div>)\s*<div class="nav-brand"[\s\S]*?</div>\s*</div>', '$1')
    
    $Html = $Html.Replace($headerBlock, $headerFixed)
    Write-Host "-> Header navbar berhasil dibersihkan dari logo ganda!" -ForegroundColor Green
}

# 4. Tulis kembali file dengan UTF-8 No BOM
[System.IO.File]::WriteAllText($HtmlPath, $Html, (New-Object System.Text.UTF8Encoding($false)))

# 5. Git Commit & Push
git add .
git commit -m "fix(navbar): eliminate duplicate logo and streamline brand header"
git push origin main

Write-Host "`nSELESAI! Logo kiri atas sekarang sudah tunggal dan rapi." -ForegroundColor Cyan