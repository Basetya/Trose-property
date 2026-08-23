# ==============================================================================
# Script: set-exact-button.ps1
# Deskripsi: Mengunci teks tombol menjadi "Listing Unit (klik cari + tampilkan)"
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

# 2. Bersihkan blok floating actions kiri secara menyeluruh
$patternsToRemove = @(
    '<!--\s*FLOATING ACTIONS[\s\S]*?<!--\s*END FLOATING ACTIONS\s*-->',
    '<!--\s*FLOATING ACTIONS[\s\S]*?</div>\s*</div>',
    '<!--\s*Floating Left Actions[\s\S]*?</div>\s*</div>',
    '<div id="floating-left-widget"[\s\S]*?</div>\s*</div>'
)

foreach ($pattern in $patternsToRemove) {
    $Html = [System.Text.RegularExpressions.Regex]::Replace($Html, $pattern, '', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
}

# 3. Struktur Baru dengan Teks Lengkap: "Listing Unit (klik cari + tampilkan)"
$ExactFloatingWidget = @"
    <!-- FLOATING ACTIONS KIRI BAWAH -->
    <div id="floating-left-widget" style="position: fixed; bottom: 24px; left: 24px; z-index: 99999; display: flex; flex-direction: column; align-items: flex-start; gap: 12px; font-family: system-ui, -apple-system, sans-serif;">
      
      <!-- Tombol Listing Unit Lengkap -->
      <a href="https://www.rumah123.com/agen-properti/independent-property-agent/kusuma-properti-4373821/?utm_source=organic&amp;utm_medium=share-collection&amp;collectionUuid=5be8d605-387f-4aa5-ab99-bbb19af20cad#collection-Semua-Properti-5be8d605-387f-4aa5-ab99-bbb19af20cad" 
         target="_blank" 
         rel="noopener noreferrer" 
         title="Buka Listing Unit di Rumah123"
         style="display: inline-flex; align-items: center; gap: 8px; background: #0d47a1; color: #ffffff !important; font-size: 13.5px; font-weight: 600; padding: 10px 18px; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 16px rgba(13,71,161,0.4); white-space: nowrap; transition: transform 0.2s ease;">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink: 0;">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
        <span>Listing Unit <span style="font-size: 12px; font-weight: 400; opacity: 0.9;">(klik cari + tampilkan)</span></span>
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
    <!-- END FLOATING ACTIONS -->
"@

# 4. Sisipkan tepat sebelum </body>
if ($Html -match "</body>") {
    $Html = $Html -replace "</body>", "$ExactFloatingWidget`n</body>"
} else {
    $Html += "`n" + $ExactFloatingWidget
}

# 5. Simpan file
[System.IO.File]::WriteAllText($HtmlPath, $Html, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "-> Teks tombol berhasil dipastikan: 'Listing Unit (klik cari + tampilkan)'" -ForegroundColor Green

# 6. Push ke Git & Vercel
git add .
git commit -m "fix(ui): ensure full text 'Listing Unit (klik cari + tampilkan)' on floating button"
git push origin main

Write-Host "`nSELESAI! Silakan refresh browser dengan Ctrl + Shift + R." -ForegroundColor Cyan