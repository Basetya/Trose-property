# ==============================================================================
# Trose-property - 1-Click Setup (Project Renaming to Trose-property v5.9)
# ==============================================================================

Write-Host "Scaffolding project directories for Trose-property..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "backend", "frontend/css", "frontend/js", "frontend/img", "scripts" | Out-Null

$Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False

# 1. README.md
Write-Host "Writing README.md..." -ForegroundColor Yellow
$readmeContent = @'
# Trose-property — Kalibata City Edition v5.9

Sistem manajemen properti sewa apartemen, CRM, dan portal landing page publik berbasis **Google Sheets Engine**, **Google Apps Script (GAS)**, **Gemini 1.5 Flash AI**, dan antarmuka modern **Tailwind CSS Glassmorphism**.

## 🚀 Panduan Deployment Cepat

### 1. Backend (Google Apps Script)
1. Buka spreadsheet baru di [Google Sheets](https://sheets.new).
2. Buka menu **Extensions** -> **Apps Script**.
3. Buat file `.gs` berikut dan salin isinya dari folder `backend/`:
   - `Code.gs`
   - `SheetSchema.gs`
   - `FinanceEngine.gs`
   - `DunningEngine.gs`
   - `GeminiCRM.gs`
   - `WhatsAppGateway.gs`
4. Jalankan fungsi `initializeAllSheets()` di file `SheetSchema.gs`.
5. Buka **Project Settings (⚙️)** -> **Script Properties**, tambahkan:
   - `ADMIN_PASSCODE`: `trose288`
   - `GEMINI_API_KEY`: API Key dari Google AI Studio
   - `LANDING_WA_NUMBER`: `+6281221559000`
6. Klik **Deploy** -> **New deployment** -> Type: **Web app** (Execute as: *Me*, Who has access: *Anyone*).
7. Salin Web App URL.

### 2. Frontend Configuration
1. Buka file `frontend/js/config.js`.
2. Tempel Web App URL pada variabel `GAS_API_URL`.
3. Buka `frontend/index.html` via Live Server atau push ke GitHub/Vercel.
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/README.md", $readmeContent, $Utf8NoBomEncoding)

# 2. .env.example
Write-Host "Writing .env.example..." -ForegroundColor Yellow
$envContent = @'
# Google Apps Script Web App Deployment URL
VITE_GAS_API_URL="https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"

# Admin Passcode for Protected Operations (Default: trose288)
ADMIN_PASSCODE="trose288"

# Default Official WhatsApp Number
LANDING_WA_NUMBER="+6281221559000"

# Google Gemini API Key
GEMINI_API_KEY="AIzaSyYourGeminiAPIKeyHere"
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/.env.example", $envContent, $Utf8NoBomEncoding)

# 3. vercel.json
Write-Host "Writing vercel.json..." -ForegroundColor Yellow
$vercelJson = @'
{
  "version": 2,
  "public": false,
  "routes": [
    {
      "src": "/img/(.*)",
      "dest": "/frontend/img/$1"
    },
    {
      "src": "/css/(.*)",
      "dest": "/frontend/css/$1"
    },
    {
      "src": "/js/(.*)",
      "dest": "/frontend/js/$1"
    },
    {
      "src": "/(.*).html",
      "dest": "/frontend/$1.html"
    },
    {
      "src": "/",
      "dest": "/frontend/index.html"
    }
  ]
}
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/vercel.json", $vercelJson, $Utf8NoBomEncoding)

# 4. .gitignore
Write-Host "Writing .gitignore..." -ForegroundColor Yellow
$gitIgnore = @'
.DS_Store
Thumbs.db
node_modules/
.env
.env.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/.gitignore", $gitIgnore, $Utf8NoBomEncoding)

# 5. scripts/deploy.ps1
Write-Host "Writing scripts/deploy.ps1..." -ForegroundColor Yellow
$deployScript = @'
# ==============================================================================
# Trose-property - Git & Vercel Push Helper
# ==============================================================================
Write-Host "Preparing Git repository for Trose-property..." -ForegroundColor Cyan

git init
git add .
git commit -m "feat: release Trose-property v5.9 Kalibata City Edition"
git branch -M main

Write-Host "Git ready! Hubungkan ke remote repository dengan perintah:" -ForegroundColor Green
Write-Host "git remote add origin https://github.com/USERNAME_ANDA/Trose-property.git" -ForegroundColor Yellow
Write-Host "git push -u origin main" -ForegroundColor Yellow
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/scripts/deploy.ps1", $deployScript, $Utf8NoBomEncoding)

Write-Host "`n[SUCCESS] Project Trose-property configured successfully!" -ForegroundColor Green