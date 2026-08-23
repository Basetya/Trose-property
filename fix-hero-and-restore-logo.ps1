# ==============================================================================
# Script: fix-hero-and-restore-logo.ps1
# Deskripsi: Kembalikan Logo kiri atas & ubah judul di card tengah halaman
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

# 1. Baca isi HTML
$content = [System.IO.File]::ReadAllText($HtmlPath, [System.Text.Encoding]::UTF8)

# 2. Pulihkan Navbar Brand di kiri atas jika sebelumnya sempat tertimpa
$NavbarBrand = @"
<div class="nav-brand" style="display: flex; align-items: center; gap: 12px;">
          <div class="brand-logo" style="width: 40px; height: 40px; border-radius: 50%; background: #8c4a24; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.2rem;">K</div>
          <div class="brand-text">
            <span style="font-weight: 800; font-size: 1.1rem; color: #111827; display: block; line-height: 1.2;">Kusuma Properti</span>
            <span style="font-size: 0.75rem; color: #8c4a24; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">KALIBATA CITY HAVEN</span>
          </div>
        </div>
"@

# Jika di area header ada teks HARMONI HUNIAN, kembalikan ke logo Kusuma Properti
if ($content -match '(?is)<header\b[^>]*>.*?</header>') {
    $headerBlock = [regex]::Match($content, '(?is)<header\b[^>]*>.*?</header>').Value
    if ($headerBlock -match 'HARMONI HUNIAN') {
        $headerClean = [regex]::Replace($headerBlock, '(?is)<h1\b[^>]*>.*?</h1>', $NavbarBrand)
        $content = $content.Replace($headerBlock, $headerClean)
        Write-Host "-> Logo Kusuma Properti di navbar kiri atas berhasil dipulihkan!" -ForegroundColor Green
    }
}

# 3. Markup Judul di TENGAH HALAMAN (Hero Card)
$NewCenterTitle = @"
<h1 class="hero-main-title" style="font-size: 2.4rem; font-weight: 800; line-height: 1.2; margin: 20px 0 16px 0; text-align: center;">
            <span style="color: #7a3e1d !important; text-transform: uppercase !important; display: block; font-size: 0.82em; letter-spacing: 0.5px; font-style: normal !important;">HARMONI HUNIAN SIAP PAKAI, LEBIH PRAKTIS DI</span>
            <span style="color: #111827 !important; font-style: normal !important; font-weight: 800 !important; display: block; margin-top: 8px;">Apartemen Kalibata City</span>
          </h1>
"@

# 4. Ganti judul di dalam Hero Card (di bawah label "KETENANGAN & KEMUDAHAN HIDUP")
$heroPattern = '(?is)(KETENANGAN & KEMUDAHAN HIDUP[^<]*</div>\s*)(?:<h[1-3][^>]*>[\s\S]*?</h[1-3]>|Harmoni Hunian[\s\S]*?Kalibata City)'

if ($content -match $heroPattern) {
    $content = [regex]::Replace($content, $heroPattern, "`$1`n          $NewCenterTitle")
    Write-Host "-> Judul di tengah halaman (Hero Card) berhasil diubah!" -ForegroundColor Green
} else {
    # Pola alternatif jika label berbeda
    $fallbackPattern = '(?is)<h[1-2][^>]*class="[^"]*hero[^"]*"[^>]*>[\s\S]*?</h[1-2]>'
    if ($content -match $fallbackPattern) {
        $content = [regex]::Replace($content, $fallbackPattern, $NewCenterTitle)
        Write-Host "-> Judul tengah berhasil diperbarui via pola class hero." -ForegroundColor Green
    }
}

# 5. Tulis kembali ke file HTML (UTF-8 No BOM)
[System.IO.File]::WriteAllText($HtmlPath, $content, (New-Object System.Text.UTF8Encoding($false)))

# 6. Commit & Push
git add .
git commit -m "fix(layout): restore top-left navbar logo & correctly style center hero card title"
git push origin main

Write-Host "`nSELESAI! Logo kiri atas kembali normal dan judul tengah sudah pas." -ForegroundColor Cyan