# ==========================================
# Script: update-r123.ps1
# Deskripsi: Menambahkan tombol & panduan Rumah123
# ==========================================

$HtmlPath = "frontend/index.html"
$CssPath  = "frontend/style.css"
$JsPath   = "frontend/script.js"

# 1. Pastikan file target ada
if (-not (Test-Path $HtmlPath)) {
    Write-Host "File $HtmlPath tidak ditemukan! Pastikan Anda berada di root project." -ForegroundColor Red
    Exit
}

# 2. Tambahkan CSS Card Rumah123 jika belum ada
$CssContent = @"

/* === RUMAH123 LISTING COMPONENT === */
.r123-cta-card {
  max-width: 580px;
  margin: 32px auto;
  padding: 24px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  text-align: center;
  font-family: inherit;
}
.r123-header h3 {
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  color: #0f172a;
}
.r123-header p {
  margin: 0 0 20px 0;
  font-size: 0.92rem;
  color: #64748b;
  line-height: 1.5;
}
.btn-rumah123 {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #0d47a1;
  color: #ffffff !important;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 12px 28px;
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(13, 71, 161, 0.2);
}
.btn-rumah123:hover {
  background-color: #082d68;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(13, 71, 161, 0.3);
}
.r123-guide-note {
  margin-top: 18px;
  padding: 12px 16px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  text-align: left;
}
.guide-icon {
  font-size: 1.2rem;
  line-height: 1;
}
.guide-text {
  font-size: 0.85rem;
  color: #475569;
  line-height: 1.45;
}
.guide-text strong {
  color: #1e293b;
}
.badge-inline {
  display: inline-block;
  background: #e2e8f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
}
"@

if (Test-Path $CssPath) {
    $ExistingCss = Get-Content $CssPath -Raw
    if ($ExistingCss -notmatch "r123-cta-card") {
        Add-Content -Path $CssPath -Value $CssContent
        Write-Host "-> CSS Rumah123 berhasil ditambahkan ke $CssPath" -ForegroundColor Green
    }
}

# 3. Tambahkan Handler Script JS jika belum ada
$JsContent = @"

// Sync Rumah123 Link
document.addEventListener("DOMContentLoaded", () => {
  const defaultUrl = "https://www.rumah123.com/agen-properti/independent-property-agent/kusuma-properti-4373821/#agen-listing";
  const savedUrl = localStorage.getItem("kusuma_rumah123_url") || defaultUrl;
  const linkEl = document.getElementById("rumah123LinkBtn");
  if (linkEl) {
    linkEl.href = savedUrl;
  }
});
"@

if (Test-Path $JsPath) {
    $ExistingJs = Get-Content $JsPath -Raw
    if ($ExistingJs -notmatch "rumah123LinkBtn") {
        Add-Content -Path $JsPath -Value $JsContent
        Write-Host "-> Script JS Rumah123 berhasil ditambahkan ke $JsPath" -ForegroundColor Green
    }
}

# 4. Tambahkan HTML Card ke Halaman Utama (Sebelum footer atau penutup main)
$HtmlSnippet = @"
      <!-- Rumah123 Listing Section -->
      <section class="r123-section" style="padding: 20px;">
        <div class="r123-cta-card">
          <div class="r123-header">
            <h3>Katalog Lengkap di Rumah123</h3>
            <p>Jelajahi seluruh listingan unit terverifikasi kami langsung di platform Rumah123.</p>
          </div>
          <div class="r123-action">
            <a id="rumah123LinkBtn" 
               href="https://www.rumah123.com/agen-properti/independent-property-agent/kusuma-properti-4373821/#agen-listing" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="btn-rumah123">
              Buka Listingan Rumah123 ↗
            </a>
          </div>
          <div class="r123-guide-note">
            <div class="guide-icon">💡</div>
            <div class="guide-text">
              <strong>Catatan Tampilan:</strong> Jika listing properti belum muncul saat halaman Rumah123 terbuka, klik tombol <strong>Search / Filter</strong> (<span class="badge-inline">⚙️</span>) lalu klik <strong>"Tampilkan"</strong> untuk memuat daftar unit.
            </div>
          </div>
        </div>
      </section>
"@

$HtmlRaw = Get-Content $HtmlPath -Raw
if ($HtmlRaw -notmatch "r123-cta-card") {
    if ($HtmlRaw -match "</main>") {
        $HtmlRaw = $HtmlRaw -replace "</main>", "$HtmlSnippet`n</main>"
    } elseif ($HtmlRaw -match "<footer") {
        $HtmlRaw = $HtmlRaw -replace "<footer", "$HtmlSnippet`n<footer"
    } else {
        $HtmlRaw = $HtmlRaw -replace "</body>", "$HtmlSnippet`n</body>"
    }
    Set-Content -Path $HtmlPath -Value $HtmlRaw -Encoding UTF8
    Write-Host "-> Komponen HTML Rumah123 berhasil disisipkan ke $HtmlPath" -ForegroundColor Green
}

# 5. Eksekusi Git Commit & Push
git add .
git commit -m "feat: add Rumah123 listing card with search hint and dynamic storage link"
git push origin main

Write-Host "`nProses Selesai! Update telah terkirim ke repository." -ForegroundColor Cyan