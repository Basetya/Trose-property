# =======================================================
# Script: merge-button.ps1
# Deskripsi: Menyatukan teks petunjuk langsung ke tombol Listing Unit
# =======================================================

$HtmlPath = "frontend/index.html"
if (-not (Test-Path $HtmlPath)) {
    if (Test-Path "index.html") {
        $HtmlPath = "index.html"
    } else {
        Write-Host "File index.html tidak ditemukan!" -ForegroundColor Red
        Exit
    }
}

# 1. Baca isi file HTML
$Html = [System.IO.File]::ReadAllText($HtmlPath, [System.Text.Encoding]::UTF8)

# 2. Hapus widget lama
$Html = [System.Text.RegularExpressions.Regex]::Replace($Html, '<!-- FLOATING ACTIONS KIRI BAWAH[\s\S]*?</div>\s*</div>', '', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
$Html = [System.Text.RegularExpressions.Regex]::Replace($Html, '<div id="floating-left-widget"[\s\S]*?</div>\s*</div>', '', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)

# 3. Komponen Floating Buttons Baru (Teks Panduan di dalam tombol)
$NewFloatingWidget = @"
    <!-- FLOATING ACTIONS KIRI BAWAH -->
    <div id="floating-left-widget" style="position: fixed; bottom: 24px; left: 24px; z-index: 99999; display: flex; flex-direction: column; align-items: flex-start; gap: 12px; font-family: system-ui, -apple-system, sans-serif;">
      
      <!-- Tombol Listing Unit (Gabung Petunjuk) -->
      <a href="https://www.rumah123.com/agen-properti/independent-property-agent/kusuma-properti-4373821/?utm_source=organic&amp;utm_medium=share-collection&amp;collectionUuid=5be8d605-387f-4aa5-ab99-bbb19af20cad#collection-Semua-Properti-5be8d605-387f-4aa5-ab99-bbb19af20cad" 
         target="_blank" 
         rel="noopener noreferrer" 
         style="display: inline-flex; align-items: center; gap: 8px; background: #0d47a1; color: #ffffff !important; font-size: 13.5px; font-weight: 600; padding: 10px 18px; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 15px rgba(13,71,161,0.38); transition: all 0.2s ease;">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink: 0;">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
        <span>Listing Unit <span style="font-size: 11.5px; opacity: 0.88; font-weight: 400;">(klik cari + tampilkan)</span></span>
      </a>

      <!-- Tombol Instagram -->
      <a href="https://www.instagram.com/kalibatacitybykusuma" 
         target="_blank" 
         rel="noopener noreferrer" 
         aria-label="Instagram Kusuma Properti"
         title="Instagram @kalibatacitybykusuma"
         style="display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; background: radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%); color: #ffffff !important; border-radius: 50%; text-decoration: none; box-shadow: 0 4px 15px rgba(220,39,67,0.35); transition: transform 0.2s ease;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink: 0;">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      </a>

    </div>
"@

# 4. Sisipkan tepat sebelum </body>
if ($Html -match "</body>") {
    $Html = $Html -replace "</body>", "$NewFloatingWidget`n</body>"
} else {
    $Html += "`n" + $NewFloatingWidget
}

# 5. Tulis kembali ke file
[System.IO.File]::WriteAllText($HtmlPath, $Html, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "-> Tombol Listing Unit dan IG berhasil disatukan & dirapikan!" -ForegroundColor Green

# 6. Git Push
git add .
git commit -m "style: merge hint text directly inside Listing Unit pill button"
git push origin main

Write-Host "`nSELESAI! Update sudah live." -ForegroundColor Cyan