# ==============================================================================
# Trose Property Manager - Vercel & GitHub Deployment Preparator
# ==============================================================================

Write-Host "Creating Vercel configuration and Git ignore files..." -ForegroundColor Cyan

$Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False

# 1. vercel.json (Memetakan root URL langsung ke folder frontend)
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

# 2. .gitignore
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

Write-Host "[SUCCESS] vercel.json and .gitignore successfully created!" -ForegroundColor Green