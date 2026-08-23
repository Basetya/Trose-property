# ==============================================================================
# Script: update-hero-title.ps1
# Deskripsi: Update styling judul hero utama (Coklat Tua Kapital + Hitam Tegak)
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

# 1. Baca isi file HTML
$Html = [System.IO.File]::ReadAllText($HtmlPath, [System.Text.Encoding]::UTF8)

# 2. Template Judul Hero Baru yang Diinginkan
$NewTitleMarkup = @"
<h1 style="font-weight: 700; line-height: 1.2; margin-bottom: 20px;">
            <span style="color: #8c4a24; text-transform: uppercase; display: block; font-size: 0.95em; letter-spacing: 0.5px;">HARMONI HUNIAN SIAP PAKAI, LEBIH PRAKTIS DI</span>
            <span style="color: #111827; font-style: normal; font-weight: 800; display: block; margin-top: 6px;">Apartemen Kalibata City</span>
          </h1>
"@

# 3. Replace tag <h1> lama yang ada di Hero Section
$patternH1 = '(?s)<h1[^>]*>.*?Harmoni Hunian.*?Kalibata City.*?</h1>'

if ($Html -match $patternH1) {
    $Html = [System.Text.RegularExpressions.Regex]::Replace($Html, $patternH1, $NewTitleMarkup.Trim())
    Write-Host "-> Berhasil menemukan dan memperbarui tag <h1> hero." -ForegroundColor Green
} else {
    # Fallback jika teks terpisah tag span
    $patternFallback = '(?s)<h1[^>]*>[\s\S]*?Kalibata City[\s\S]*?</h1>'
    if ($Html -match $patternFallback) {
        $Html = [System.Text.RegularExpressions.Regex]::Replace($Html, $patternFallback, $NewTitleMarkup.Trim())
        Write-Host "-> Berhasil memperbarui dengan pattern fallback." -ForegroundColor Green
    } else {
        Write-Host "Peringatan: Pola H1 tidak terdeteksi otomatis. Silakan cek struktur tag <h1> di index.html." -ForegroundColor Yellow
    }
}

# 4. Simpan kembali file HTML (UTF-8 No BOM)
[System.IO.File]::WriteAllText($HtmlPath, $Html, (New-Object System.Text.UTF8Encoding($false)))

# 5. Git Commit & Push
git add .
git commit -m "style: update hero headline to uppercase deep brown with upright black subtext"
git push origin main

Write-Host "`nSELESAI! Judul hero telah diperbarui dan di-push ke GitHub & Vercel." -ForegroundColor Cyan