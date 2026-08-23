# ==========================================
# Script: fix-r123-ig.ps1
# Deskripsi: Merapikan section Rumah123, menghilangkan karakter rusak, & menambahkan Link IG
# ==========================================

$HtmlPath = "frontend/index.html"
$CssPath  = "frontend/style.css"

if (-not (Test-Path $HtmlPath)) {
    Write-Host "File $HtmlPath tidak ditemukan! Pastikan Anda berada di root project." -ForegroundColor Red
    Exit
}

# 1. CSS Bersih & Rapi untuk Container Eksternal Links
$CssClean = @"

/* === EXTERNAL CHANNELS & R123 COMPONENT === */
.channels-section {
  padding: 40px 20px;
  background: #fdfbf7;
  border-top: 1px solid #eee8df;
  border-bottom: 1px solid #eee8df;
}
.channels-container {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.channel-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
}
.channel-header h3 {
  margin: 0 0 6px 0;
  font-size: 1.15rem;
  color: #1e293b;
  font-weight: 700;
}
.channel-header p {
  margin: 0 0 16px 0;
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.5;
}
.channel-btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.btn-channel {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11px 22px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}
.btn-r123 {
  background-color: #0d47a1;
  color: #ffffff !important;
}
.btn-r123:hover {
  background-color: #082d68;
  transform: translateY(-2px);
}
.btn-instagram {
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
  color: #ffffff !important;
}
.btn-instagram:hover {
  opacity: 0.92;
  transform: translateY(-2px);
}
.guide-box {
  margin-top: 16px;
  padding: 12px 14px;
  background: #f8fafc;
  border-left: 4px solid #0d47a1;
  border-radius: 6px;
  font-size: 0.84rem;
  color: #475569;
  line-height: 1.5;
}
.guide-box strong {
  color: #0f172a;
}
"@

# Update CSS
if (Test-Path $CssPath) {
    $ExistingCss = [System.IO.File]::ReadAllText($CssPath, [System.Text.Encoding]::UTF8)
    if ($ExistingCss -match "EXTERNAL CHANNELS") {
        # Replace jika sudah ada
        $ExistingCss = $ExistingCss -replace "/\* === EXTERNAL CHANNELS[\s\S]*?guide-box strong \{[^}]*\}", $CssClean.Trim()
    } else {
        $ExistingCss += "`n" + $CssClean
    }
    [System.IO.File]::WriteAllText($CssPath, $ExistingCss, [System.Text.Encoding]::UTF8)
    Write-Host "-> CSS berhasil diperbarui secara bersih." -ForegroundColor Green
}

# 2. HTML Bersih (Menggantikan section yang bermasalah karakter asing)
$HtmlSnippet = @"
      <!-- Official Channels & Directory Section -->
      <section class="channels-section" id="saluran-resmi">
        <div class="channels-container">
          
          <!-- Card Rumah123 -->
          <div class="channel-card">
            <div class="channel-header">
              <h3>Listing Lengkap di Rumah123</h3>
              <p>Jelajahi seluruh inventaris unit apartemen terverifikasi kami langsung di platform Rumah123.</p>
            </div>
            <div class="channel-btn-group">
              <a id="rumah123LinkBtn" 
                 href="https://www.rumah123.com/agen-properti/independent-property-agent/kusuma-properti-4373821/#agen-listing" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 class="btn-channel btn-r123">
                Buka Listingan Rumah123 &rarr;
              </a>
              <a href="https://www.instagram.com/kalibatacitybykusuma" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 class="btn-channel btn-instagram">
                Instagram @kalibatacitybykusuma &rarr;
              </a>
            </div>
            
            <div class="guide-box">
              <strong>Panduan Tampilan:</strong> Jika unit listing belum otomatis muncul di Rumah123, klik tombol <strong>Filter / Cari</strong> lalu tekan tombol <strong>"Tampilkan"</strong> untuk memuat katalog properti.
            </div>
          </div>

        </div>
      </section>
"@

# Baca dan replace bagian r123 lama
$HtmlRaw = [System.IO.File]::ReadAllText($HtmlPath, [System.Text.Encoding]::UTF8)

# Hapus injeksi lama jika ada
$HtmlRaw = [System.Text.RegularExpressions.Regex]::Replace($HtmlRaw, '<!-- Rumah123 Listing Section -->[\s\S]*?</section>', '')
$HtmlRaw = [System.Text.RegularExpressions.Regex]::Replace($HtmlRaw, '<!-- Official Channels & Directory Section -->[\s\S]*?</section>', '')

# Sisipkan sebelum footer atau main
if ($HtmlRaw -match "<footer") {
    $HtmlRaw = $HtmlRaw -replace "<footer", "$HtmlSnippet`n<footer"
} elseif ($HtmlRaw -match "</main>") {
    $HtmlRaw = $HtmlRaw -replace "</main>", "$HtmlSnippet`n</main>"
} else {
    $HtmlRaw = $HtmlRaw -replace "</body>", "$HtmlSnippet`n</body>"
}

# Simpan HTML dengan UTF-8 murni tanpa BOM issue
[System.IO.File]::WriteAllText($HtmlPath, $HtmlRaw, [System.Text.Encoding]::UTF8)
Write-Host "-> HTML berhasil dibersihkan & link Instagram ditambahkan." -ForegroundColor Green

# 3. Git Push
git add .
git commit -m "fix: clean encoding artifacts, polish listing card, and add official Instagram link"
git push origin main

Write-Host "`nSelesai! Tampilan sudah rapi tanpa karakter aneh dan siap diakses." -ForegroundColor Cyan