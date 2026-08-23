# ==============================================================================
# Script: repair-navbar-clean.ps1
# Deskripsi: Full Replacement Navbar Header (Rapih, Sejajar, Logo Tunggal)
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

# 1. Baca seluruh file HTML
$Html = [System.IO.File]::ReadAllText($HtmlPath, [System.Text.Encoding]::UTF8)

# 2. Blok Header Baru yang Utuh, Bersih, dan Terisolasi Rapi
$CleanHeader = @"
    <!-- HEADER NAVBAR CLEAN -->
    <header class="main-header" style="position: sticky; top: 0; left: 0; right: 0; z-index: 1000; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-bottom: 1px solid #eef2f6; padding: 12px 24px;">
      <div style="max-width: 1240px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 20px;">
        
        <!-- Logo & Brand Tunggal -->
        <a href="#" style="display: flex; align-items: center; gap: 12px; text-decoration: none;">
          <div style="width: 42px; height: 42px; border-radius: 50%; background: #8c4a24; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.25rem; flex-shrink: 0; box-shadow: 0 2px 8px rgba(140, 74, 36, 0.25);">K</div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-weight: 800; font-size: 1.12rem; color: #111827; line-height: 1.2;">Kusuma Properti</span>
            <span style="font-size: 0.72rem; color: #8c4a24; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; line-height: 1.2;">KALIBATA CITY HAVEN</span>
          </div>
        </a>

        <!-- Menu Navigasi Tengah -->
        <nav class="nav-links" style="display: flex; align-items: center; gap: 24px;">
          <a href="#keunggulan" style="color: #475569; text-decoration: none; font-size: 0.86rem; font-weight: 600; transition: color 0.2s;">HARMONI &amp; AKSES</a>
          <a href="#katalog" style="color: #475569; text-decoration: none; font-size: 0.86rem; font-weight: 600; transition: color 0.2s;">KATALOG UNIT</a>
          <a href="#fasilitas" style="color: #475569; text-decoration: none; font-size: 0.86rem; font-weight: 600; transition: color 0.2s;">FASILITAS KAWASAN</a>
          <a href="#lokasi" style="color: #475569; text-decoration: none; font-size: 0.86rem; font-weight: 600; transition: color 0.2s;">LOKASI</a>
          <a href="https://wa.me/6281221559000" target="_blank" rel="noopener noreferrer" style="color: #16a34a; text-decoration: none; font-size: 0.86rem; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #16a34a; display: inline-block;"></span>
            WhatsApp Admin
          </a>
        </nav>

        <!-- Tombol Admin Cockpit Kanan -->
        <div style="display: flex; align-items: center;">
          <a href="admin.html" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: 50px; border: 1px solid #e2e8f0; background: #ffffff; color: #1e293b; font-size: 0.85rem; font-weight: 600; text-decoration: none; box-shadow: 0 2px 6px rgba(0,0,0,0.04); transition: all 0.2s ease;">
            Admin Cockpit &rarr;
          </a>
        </div>

      </div>
    </header>
"@

# 3. Ganti total seluruh blok header yang berantakan
$headerPattern = '(?is)<header\b[^>]*>[\s\S]*?</header>'

if ($Html -match $headerPattern) {
    $Html = [regex]::Replace($Html, $headerPattern, $CleanHeader)
    Write-Host "-> Blok Header berhasil diganti penuh dengan navbar bersih & presisi!" -ForegroundColor Green
} else {
    Write-Host "Peringatan: Tag <header> tidak ditemukan secara utuh. Memeriksa body..." -ForegroundColor Yellow
}

# 4. Tulis kembali file dengan UTF-8 No BOM
[System.IO.File]::WriteAllText($HtmlPath, $Html, (New-Object System.Text.UTF8Encoding($false)))

# 5. Push ke GitHub / Vercel
git add .
git commit -m "fix(header): clean full replacement for navbar brand and navigation links"
git push origin main

Write-Host "`nSELESAI! Navbar atas sudah rapi dan sejajar sempurna." -ForegroundColor Cyan