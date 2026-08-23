# ==============================================================================
# Script: force-update-hero.ps1
# Deskripsi: Mengganti teks Hero langsung tanpa risiko regex miss
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

Write-Host "Mengedit file: $HtmlPath" -ForegroundColor Cyan

# 1. Baca isi HTML
$content = [System.IO.File]::ReadAllText($HtmlPath, [System.Text.Encoding]::UTF8)

# 2. Template Hero Title Baru (Coklat Tua Kapital + Hitam Tegak)
$replacement = @"
<h1 class="hero-title" style="font-weight: 700; line-height: 1.25; margin-bottom: 20px;">
            <span style="color: #7a3e1d !important; text-transform: uppercase !important; display: block; font-size: 0.9em; letter-spacing: 0.5px; font-style: normal !important;">HARMONI HUNIAN SIAP PAKAI, LEBIH PRAKTIS DI</span>
            <span style="color: #111827 !important; font-style: normal !important; font-weight: 800 !important; display: block; margin-top: 8px;">Apartemen Kalibata City</span>
          </h1>
"@

# 3. Cari dan Ganti secara fleksibel
$regex = [regex]'(?is)<h1\b[^>]*>.*?</h1>'

if ($regex.IsMatch($content)) {
    $content = $regex.Replace($content, $replacement, 1)
    Write-Host "-> Tag <h1> utama berhasil diganti dengan format baru!" -ForegroundColor Green
} else {
    Write-Host "-> Mencoba pencarian berbasis teks langsung..." -ForegroundColor Yellow
    $content = $content -replace 'Harmoni Hunian Siap Pakai, Lebih Praktis di', 'HARMONI HUNIAN SIAP PAKAI, LEBIH PRAKTIS DI'
}

# 4. Tulis ulang file dengan UTF-8 murni
[System.IO.File]::WriteAllText($HtmlPath, $content, (New-Object System.Text.UTF8Encoding($false)))

# 5. Git Commit dan Push
git add .
git commit -m "style(hero): force uppercase dark brown text and normal black apartment text"
git push origin main

Write-Host "`nSELESAI! Update sudah terkirim ke GitHub & Vercel." -ForegroundColor Cyan