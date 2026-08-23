# ==========================================
# Script: update-floating-left.ps1
# Deskripsi: Floating buttons di kiri bawah (Listing Unit + IG)
# ==========================================

$HtmlPath = "frontend/index.html"
$CssPath  = "frontend/style.css"

if (-not (Test-Path $HtmlPath)) {
    Write-Host "File $HtmlPath tidak ditemukan! Pastikan Anda berada di root project." -ForegroundColor Red
    Exit
}

# 1. Tambahkan CSS untuk Floating Widget di Pojok Kiri Bawah
$FloatingCss = @"

/* === FLOATING ACTION BUTTONS KIRI BAWAH === */
.floating-left-group {
  position: fixed;
  bottom: 24px;
  left: 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  z-index: 9999;
  font-family: inherit;
}

.floating-btn-wrap {
  position: relative;
  display: inline-block;
}

/* Tombol Listing Unit Rumah123 */
.btn-float-listing {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: #0d47a1;
  color: #ffffff !important;
  font-weight: 600;
  font-size: 0.88rem;
  padding: 10px 18px;
  border-radius: 50px;
  text-decoration: none;
  box-shadow: 0 4px 16px rgba(13, 71, 161, 0.35);
  transition: all 0.25s ease;
}

.btn-float-listing:hover {
  background-color: #082d68;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(13, 71, 161, 0.45);
}

/* Tombol Floating Instagram Bulat */
.btn-float-ig {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%);
  color: #ffffff !important;
  border-radius: 50%;
  text-decoration: none;
  box-shadow: 0 4px 16px rgba(214, 36, 159, 0.35);
  transition: all 0.25s ease;
}

.btn-float-ig:hover {
  transform: scale(1.08) translateY(-2px);
  box-shadow: 0 6px 20px rgba(214, 36, 159, 0.45);
}

.btn-float-ig svg {
  width: 22px;
  height: 22px;
  fill: currentColor;
}

/* Panduan Hint Box di Bawah Tombol Listing */
.listing-hint-tooltip {
  display: block;
  margin-top: 5px;
  background: rgba(15, 23, 42, 0.9);
  color: #f8fafc;
  font-size: 0.72rem;
  padding: 4px 10px;
  border-radius: 6px;
  max-width: 220px;
  line-height: 1.35;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  backdrop-filter: blur(4px);
}

.listing-hint-tooltip span {
  color: #38bdf8;
  font-weight: 600;
}

@media (max-width: 600px) {
  .floating-left-group {
    bottom: 16px;
    left: 16px;
    gap: 8px;
  }
}
"@

if (Test-Path $CssPath) {
    $ExistingCss = [System.IO.File]::ReadAllText($CssPath, [System.Text.Encoding]::UTF8)
    if ($ExistingCss -match "FLOATING ACTION BUTTONS KIRI BAWAH") {
        $ExistingCss = [System.Text.RegularExpressions.Regex]::Replace($ExistingCss, '/\* === FLOATING ACTION BUTTONS KIRI BAWAH[\s\S]*?@media[^}]*\}\s*\}', '')
    }
    $ExistingCss += "`n" + $FloatingCss
    [System.IO.File]::WriteAllText($CssPath,$ExistingCss, [System.Text.Encoding]::UTF8)
    Write-Host "-> CSS floating buttons kiri bawah berhasil ditambahkan." -ForegroundColor Green
}

# 2. Tambahkan HTML Floating Widget
$FloatingHtml = @"
    <!-- Floating Action Buttons (Kiri Bawah) -->
    <div class="floating-left-group">
      <!-- Tombol Listing Unit + Catatan -->
      <div class="floating-btn-wrap">
        <a href="https://www.rumah123.com/agen-properti/independent-property-agent/kusuma-properti-4373821/?utm_source=organic&utm_medium=share-collection&collectionUuid=5be8d605-387f-4aa5-ab99-bbb19af20cad#collection-Semua-Properti-5be8d605-387f-4aa5-ab99-bbb19af20cad" 
           target="_blank" 
           rel="noopener noreferrer" 
           class="btn-float-listing">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9Berikut skrip 1-klik PowerShell (`add-bottom-left-buttons.ps1`) untuk memasang dua tombol *floating widget* di **kiri bawah** (posisi simetris dengan tombol WA & Kusuma AI di kanan bawah) lengkap dengan tooltip panduan klik dan logo Instagram resmi:

```powershell
# ==========================================
# Script: add-bottom-left-buttons.ps1
# Deskripsi: Floating Buttons (Listing Unit + IG) di Kiri Bawah
# ==========================================

$HtmlPath = "frontend/index.html"
$CssPath  = "frontend/style.css"

if (-not (Test-Path $HtmlPath)) {
    Write-Host "File $HtmlPath tidak ditemukan! Pastikan Anda berada di root project." -ForegroundColor Red
    Exit
}

# 1. CSS Floating Bottom-Left
$CssFloating = @"

/* === FLOATING WIDGET KIRI BAWAH === */
.floating-left-container {
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
  font-family: inherit;
}

/* Tombol Listing Unit Rumah123 */
.float-btn-listing {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #0d47a1;
  color: #ffffff !important;
  font-size: 0.88rem;
  font-weight: 600;
  padding: 10px 18px;
  border-radius: 50px;
  text-decoration: none;
  box-shadow: 0 4px 16px rgba(13, 71, 161, 0.35);
  transition: all 0.25s ease;
}

.float-btn-listing:hover {
  background: #082d68;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(13, 71, 161, 0.45);
}

/* Tooltip / Catatan di atas tombol Listing */
.listing-hint-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  background: #1e293b;
  color: #f8fafc;
  font-size: 0.75rem;
  font-weight: 400;
  padding: 6px 12px;
  border-radius: 8px;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  pointer-events: none;
  display: flex;
  align-items: center;
  gap: 4px;
}

.listing-hint-tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 24px;
  border-width: 5px;
  border-style: solid;
  border-color: #1e293b transparent transparent transparent;
}

/* Tombol Instagram */
.float-btn-instagram {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
  color: #ffffff !important;
  border-radius: 50%;
  box-shadow: 0 4px 14px rgba(220, 39, 67, 0.35);
  text-decoration: none;
  transition: all 0.25s ease;
}

.float-btn-instagram:hover {
  transform: scale(1.08) translateY(-2px);
  box-shadow: 0 6px 18px rgba(220, 39, 67, 0.5);
}

@media (max-width: 640px) {
  .floating-left-container {
    bottom: 16px;
    left: 16px;
    gap: 10px;
  }
  .float-btn-listing {
    font-size: 0.8rem;
    padding: 8px 14px;
  }
  .float-btn-instagram {
    width: 38px;
    height: 38px;
  }
}
"@

# Update CSS
if (Test-Path $CssPath) {
    $ExistingCss = [System.IO.File]::ReadAllText($CssPath, [System.Text.Encoding]::UTF8)
    if ($ExistingCss -match "FLOATING WIDGET KIRI BAWAH") {
        $ExistingCss = [System.Text.RegularExpressions.Regex]::Replace($ExistingCss, '/\* === FLOATING WIDGET KIRI BAWAH[\s\S]*?@media[^{]*\{[\s\S]*?\}\s*\}', $CssFloating.Trim())
    } else {
        $ExistingCss += "`n" + $CssFloating
    }
    [System.IO.File]::WriteAllText($CssPath, $ExistingCss, [System.Text.Encoding]::UTF8)
    Write-Host "-> CSS Floating Buttons berhasil diperbarui." -ForegroundColor Green
}

# 2. HTML Markup Floating Widget Kiri Bawah
$HtmlSnippet = @"
    <!-- Floating Left Actions: Listing Unit & Instagram -->
    <div class="floating-left-container">
      
      <!-- Tombol Listing Unit Rumah123 -->
      <a href="[https://www.rumah123.com/agen-properti/independent-property-agent/kusuma-properti-4373821/?utm_source=organic&utm_medium=share-collection&collectionUuid=5be8d605-387f-4aa5-ab99-bbb19af20cad#collection-Semua-Properti-5be8d605-387f-4aa5-ab99-bbb19af20cad](https://www.rumah123.com/agen-properti/independent-property-agent/kusuma-properti-4373821/?utm_source=organic&utm_medium=share-collection&collectionUuid=5be8d605-387f-4aa5-ab99-bbb19af20cad#collection-Semua-Properti-5be8d605-387f-4aa5-ab99-bbb19af20cad)" 
         target="_blank" 
         rel="noopener noreferrer" 
         class="float-btn-listing"
         title="Buka Koleksi Listing Unit di Rumah123">
        <!-- Tooltip Catatan -->
        <span class="listing-hint-tooltip">
          💡 Klik Cari + Klik Tampilkan
        </span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
        <span>Listing Unit</span>
      </a>

      <!-- Tombol Instagram -->
      <a href="[https://www.instagram.com/kalibatacitybykusuma](https://www.instagram.com/kalibatacitybykusuma)" 
         target="_blank" 
         rel="noopener noreferrer" 
         class="float-btn-instagram" 
         aria-label="Instagram Kusuma Properti"
         title="Ikuti Instagram @kalibatacitybykusuma">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      </a>

    </div>
"@

$HtmlRaw = [System.IO.File]::ReadAllText($HtmlPath, [System.Text.Encoding]::UTF8)

# Hapus widget kiri lama jika ada
$HtmlRaw = [System.Text.RegularExpressions.Regex]::Replace($HtmlRaw, '<!-- Floating Left Actions[\s\S]*?</div>\s*</div>', '')

# Sisipkan sebelum tag penutup </body>
$HtmlRaw = $HtmlRaw -replace "</body>", "$HtmlSnippet`n</body>"

[System.IO.File]::WriteAllText($HtmlPath, $HtmlRaw, [System.Text.Encoding]::UTF8)
Write-Host "-> HTML Floating Left Buttons berhasil disisipkan." -ForegroundColor Green

# 3. Commit & Push
git add .
git commit -m "feat: add bottom-left floating buttons for Listing Unit (Rumah123) and Instagram"
git push origin main

Write-Host "`nSelesai! 2 Tombol Floating Kiri Bawah sudah live di web." -ForegroundColor Cyan