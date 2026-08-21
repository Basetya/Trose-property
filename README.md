# Trose-property â€” Kalibata City Edition v5.9

Sistem manajemen properti sewa apartemen, CRM, dan portal landing page publik berbasis **Google Sheets Engine**, **Google Apps Script (GAS)**, **Gemini 1.5 Flash AI**, dan antarmuka modern **Tailwind CSS Glassmorphism**.

## ðŸš€ Panduan Deployment Cepat

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
5. Buka **Project Settings (âš™ï¸)** -> **Script Properties**, tambahkan:
   - `ADMIN_PASSCODE`: `trose288`
   - `GEMINI_API_KEY`: API Key dari Google AI Studio
   - `LANDING_WA_NUMBER`: `+6281221559000`
6. Klik **Deploy** -> **New deployment** -> Type: **Web app** (Execute as: *Me*, Who has access: *Anyone*).
7. Salin Web App URL.

### 2. Frontend Configuration
1. Buka file `frontend/js/config.js`.
2. Tempel Web App URL pada variabel `GAS_API_URL`.
3. Buka `frontend/index.html` via Live Server atau push ke GitHub/Vercel.