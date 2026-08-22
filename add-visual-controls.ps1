$Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False

# 1. Update frontend/css/custom.css (Mendukung Dynamic Filter & Opacity Variables)
$customCss = @'
/* Kusuma Properti - Japandi Design System with Dynamic Visual Controller (v11.0) */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

:root {
  --japandi-bg: #FAF7F2;
  --japandi-surface: #FFFFFF;
  --japandi-panel: #F4EFE6;
  --japandi-wood: #8C5835;
  --japandi-wood-light: #C28E5C;
  --japandi-clay: #B35436;
  --japandi-moss: #3A5A40;
  --japandi-charcoal: #2C2C2A;
  --japandi-muted: #737370;
  --japandi-border: #E8DFD3;
  
  /* Dynamic Background Controls */
  --bg-overlay-opacity: 0.90;
  --bg-brightness: 100%;
  --bg-contrast: 100%;
}

* {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

h1, h2, h3, .font-display {
  font-family: 'Playfair Display', Georgia, serif;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--japandi-bg);
  color: var(--japandi-charcoal);
  letter-spacing: -0.01em;
}

.bg-japandi-canvas, .bg-kalibata {
  position: relative;
  background-color: #FAF7F2;
  min-height: 100vh;
}

.bg-japandi-canvas::before, .bg-kalibata::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  background-image: url('../img/bg-kalibata.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: brightness(var(--bg-brightness)) contrast(var(--bg-contrast));
}

.bg-japandi-canvas::after, .bg-kalibata::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  background: linear-gradient(to bottom, rgba(250, 247, 242, var(--bg-overlay-opacity)), rgba(244, 239, 230, var(--bg-overlay-opacity)));
}

.japandi-card {
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--japandi-border);
  box-shadow: 0 4px 24px -2px rgba(44, 44, 42, 0.05);
}

.japandi-card-warm {
  background: rgba(244, 239, 230, 0.96);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid #D4A373;
}

.japandi-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--japandi-border);
}

.japandi-btn-wood {
  background-color: #8C5835;
  color: #FFFFFF;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.japandi-btn-wood:hover {
  background-color: #704326;
  box-shadow: 0 4px 14px rgba(140, 88, 53, 0.25);
}

.japandi-btn-moss {
  background-color: #3A5A40;
  color: #FFFFFF;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.japandi-btn-moss:hover {
  background-color: #2D4732;
  box-shadow: 0 4px 14px rgba(58, 90, 64, 0.25);
}

.japandi-btn-clay {
  background-color: #B35436;
  color: #FFFFFF;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.japandi-btn-clay:hover {
  background-color: #944026;
  box-shadow: 0 4px 14px rgba(179, 84, 54, 0.25);
}

/* Scrollbars */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #FAF7F2;
}
::-webkit-scrollbar-thumb {
  background: #D8CEBE;
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: #BFAFA0;
}
'@
[System.IO.File]::WriteAllText("$PWD/frontend/css/custom.css", $customCss, $Utf8NoBomEncoding)

# 2. Update frontend/dashboard.html (Menambahkan Panel Kontrol Visual Slider)
$dashboardHtml = @'
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Kusuma Properti Manager - Admin Cockpit</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/custom.css">
</head>
<body class="bg-slate-950 text-slate-100 bg-kalibata min-h-screen pb-20 md:pb-0">
  
  <!-- Mobile Header Bar -->
  <header class="md:hidden sticky top-0 z-40 glass-panel border-b border-slate-800 px-4 py-3 flex items-center justify-between">
    <div class="flex items-center gap-2.5">
      <button onclick="toggleMobileDrawer()" class="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white focus:outline-none">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      </button>
      <div class="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center font-black text-sm text-white shadow">K</div>
      <div>
        <h1 class="font-extrabold text-xs text-white leading-tight">Kusuma Admin</h1>
        <p class="text-[10px] text-rose-400 font-medium">Kalibata City Cockpit</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <a href="index.html" target="_blank" class="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">Landing &rarr;</a>
      <button onclick="fetchDashboard()" class="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300" title="Refresh">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
      </button>
    </div>
  </header>

  <!-- Mobile Slide-Over Drawer -->
  <div id="mobile-drawer" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md hidden transition-opacity duration-300">
    <div class="fixed inset-y-0 left-0 max-w-[280px] w-full bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between shadow-2xl overflow-y-auto">
      <div>
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center font-black text-sm text-white shadow">K</div>
            <h2 class="font-bold text-sm text-white">Menu Navigasi</h2>
          </div>
          <button onclick="toggleMobileDrawer()" class="p-1.5 rounded-lg text-slate-400 hover:text-white">&times;</button>
        </div>
        <nav class="space-y-1 text-xs font-semibold">
          <a href="dashboard.html" class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-rose-600 text-white shadow">
            <span>Dashboard Cockpit</span>
          </a>
          <a href="index.html" target="_blank" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800">
            <span>Lihat Landing Page &rarr;</span>
          </a>
          <a href="crm.html" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800">
            <span>CRM & Acquisition</span>
          </a>
          <a href="units.html" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800">
            <span>Unit Inventory</span>
          </a>
          <a href="leases.html" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800">
            <span>Lease & Tenants</span>
          </a>
          <a href="billing.html" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800">
            <span>Billing & Invoices</span>
          </a>
          <a href="finance.html" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800">
            <span>Laporan Keuangan</span>
          </a>
          <a href="inspections.html" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800">
            <span>Inspeksi Unit</span>
          </a>
          <a href="maintenance.html" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800">
            <span>Maintenance</span>
          </a>
          <a href="concierge.html" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800">
            <span>Fullscreen Kusuma AI</span>
          </a>
        </nav>
      </div>
      <div class="pt-4 border-t border-slate-800 space-y-2">
        <button onclick="logoutAdminSession()" class="w-full text-xs text-rose-400 p-2 text-center rounded-lg bg-rose-950/40 border border-rose-900/60 font-semibold">
          Keluar Sesi Admin
        </button>
      </div>
    </div>
  </div>

  <div class="flex h-screen overflow-hidden">
    <!-- Desktop Sidebar -->
    <aside class="w-64 glass-panel border-r border-slate-800/80 p-5 flex flex-col justify-between hidden md:flex">
      <div>
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-rose-500/30">K</div>
          <div>
            <h1 class="font-bold text-base text-white leading-tight">Kusuma</h1>
            <p class="text-xs text-rose-400 font-medium">Kalibata City Admin</p>
          </div>
        </div>
        <nav class="space-y-1 text-sm font-medium">
          <a href="dashboard.html" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-rose-600 text-white font-semibold shadow-md shadow-rose-600/20">
            <span>Dashboard Cockpit</span>
          </a>
          <a href="index.html" target="_blank" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition">
            <span>Landing Page &rarr;</span>
          </a>
          <a href="inspections.html" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition">
            <span>Inspeksi Unit</span>
          </a>
          <a href="finance.html" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition">
            <span>Laporan Keuangan</span>
          </a>
          <a href="units.html" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition">
            <span>Unit Inventory</span>
          </a>
          <a href="leases.html" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition">
            <span>Lease & Tenants</span>
          </a>
          <a href="billing.html" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition">
            <span>Billing & Invoices</span>
          </a>
          <a href="maintenance.html" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition">
            <span>Maintenance</span>
          </a>
          <a href="crm.html" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition">
            <span>CRM & Acquisition</span>
          </a>
        </nav>
      </div>
      <div class="space-y-2">
        <button onclick="logoutAdminSession()" class="w-full text-xs text-slate-400 hover:text-rose-400 p-2 text-center rounded-lg hover:bg-slate-900 transition flex items-center justify-center gap-1.5 font-semibold">
          Clear Passcode Session
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-8">
      <div class="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-xl md:text-2xl font-black text-white">Kalibata City Cockpit</h2>
            <p class="text-xs md:text-sm text-slate-300">Portofolio & Operasional Apartemen Kusuma Properti</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button onclick="handleWipeDatabase()" class="px-3 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 text-xs font-bold rounded-xl transition shadow">
              Wipe Mockup Data
            </button>
            <button onclick="fetchDashboard()" class="px-3 py-2 glass-card hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl transition">
              Refresh
            </button>
            <a href="crm.html" class="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg transition">
              + New Lead
            </a>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div class="glass-card p-4 md:p-5 rounded-2xl md:rounded-3xl">
            <span class="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Occupancy</span>
            <h3 id="stat-occupancy" class="text-xl md:text-3xl font-extrabold text-white mt-1">0%</h3>
            <p id="stat-units" class="text-[10px] md:text-xs text-rose-400 mt-1 font-medium">0 Units</p>
          </div>
          <div class="glass-card p-4 md:p-5 rounded-2xl md:rounded-3xl">
            <span class="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Rent Due</span>
            <h3 id="stat-due" class="text-lg md:text-3xl font-extrabold text-white mt-1">Rp 0</h3>
            <p id="stat-breakdown" class="text-[10px] md:text-xs text-slate-400 mt-1 truncate">Direct vs Mgmt</p>
          </div>
          <div class="glass-card p-4 md:p-5 rounded-2xl md:rounded-3xl">
            <span class="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Outstanding</span>
            <h3 id="stat-outstanding" class="text-lg md:text-3xl font-extrabold text-amber-400 mt-1">Rp 0</h3>
            <p class="text-[10px] md:text-xs text-amber-500/80 mt-1">Menunggu Verifikasi</p>
          </div>
          <div class="glass-card p-4 md:p-5 rounded-2xl md:rounded-3xl">
            <span class="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Active Pipeline</span>
            <h3 id="stat-leads" class="text-xl md:text-3xl font-extrabold text-emerald-400 mt-1">0</h3>
            <p id="stat-maintenance" class="text-[10px] md:text-xs text-slate-400 mt-1">0 Open Tickets</p>
          </div>
        </div>

        <!-- PANEL PENGATUR BACKGROUND VISUAL (Kontras, Brightness, & Opacity) -->
        <div class="glass-panel p-4 md:p-6 rounded-2xl md:rounded-3xl space-y-4 border border-amber-500/30">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 class="font-extrabold text-sm md:text-base text-white flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                Kustomisasi Visual Latar Belakang (Japandi Theme)
              </h3>
              <p class="text-[11px] text-slate-400">Atur transparansi lapisan kanvas, tingkat kecerahan, dan kontras foto gedung.</p>
            </div>
            <button onclick="resetVisualSettings()" class="text-xs text-amber-400 hover:underline font-bold self-start sm:self-auto">Reset Default</button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div class="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div class="flex justify-between text-xs font-bold text-slate-300">
                <span>Kepekatan Lapisan (Layer Opacity)</span>
                <span id="val-opacity" class="text-amber-400 font-mono">90%</span>
              </div>
              <input type="range" id="slider-opacity" min="50" max="98" value="90" oninput="updateVisualSetting('opacity', this.value)" class="w-full accent-amber-500 cursor-pointer">
              <p class="text-[10px] text-slate-500">Makin kecil %, foto gedung makin terlihat tajam.</p>
            </div>

            <div class="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div class="flex justify-between text-xs font-bold text-slate-300">
                <span>Kecerahan Foto (Brightness)</span>
                <span id="val-brightness" class="text-amber-400 font-mono">100%</span>
              </div>
              <input type="range" id="slider-brightness" min="60" max="140" value="100" oninput="updateVisualSetting('brightness', this.value)" class="w-full accent-amber-500 cursor-pointer">
              <p class="text-[10px] text-slate-500">Menyesuaikan pencahayaan gambar arsitektur.</p>
            </div>

            <div class="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div class="flex justify-between text-xs font-bold text-slate-300">
                <span>Kontras Foto (Contrast)</span>
                <span id="val-contrast" class="text-amber-400 font-mono">100%</span>
              </div>
              <input type="range" id="slider-contrast" min="70" max="150" value="100" oninput="updateVisualSetting('contrast', this.value)" class="w-full accent-amber-500 cursor-pointer">
              <p class="text-[10px] text-slate-500">Mempertegas detail garis arsitektur gedung.</p>
            </div>
          </div>
        </div>

        <!-- PANEL AI STUDIO -->
        <div class="glass-panel p-4 md:p-8 rounded-2xl md:rounded-3xl space-y-4 border border-rose-500/30">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 class="font-extrabold text-base md:text-xl text-white flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                Kusuma AI Knowledge Base & Guardrails Studio
              </h3>
              <p class="text-[11px] md:text-xs text-slate-400">Kelola informasi unit & batasan operasional AI secara real-time.</p>
            </div>
            <div class="flex gap-2">
              <label class="cursor-pointer px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition">
                <span>Unggah File (.txt)</span>
                <input type="file" id="ai-file-upload" accept=".txt,.md,.json" onchange="handleAiFileUpload(event)" class="hidden">
              </label>
              <button type="button" onclick="handleClearAiConfig()" class="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-bold rounded-xl border border-rose-800/80 transition">
                Clear
              </button>
            </div>
          </div>

          <form id="form-ai-config" onsubmit="handleSaveAiConfig(event)" class="space-y-4">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="block text-[11px] font-bold text-slate-300 uppercase">Knowledge Base</label>
                <textarea id="ai-kb-text" rows="5" class="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none"></textarea>
              </div>
              <div class="space-y-1.5">
                <label class="block text-[11px] font-bold text-rose-400 uppercase">Guardrails (Aturan)</label>
                <textarea id="ai-guardrail-text" rows="5" class="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none"></textarea>
              </div>
            </div>
            <div class="flex justify-between items-center pt-1">
              <button type="button" onclick="resetToStandardDefaults()" class="text-xs text-amber-400 hover:underline font-bold">Template Default</button>
              <button type="submit" id="btn-save-ai" class="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg transition">Simpan Knowledge</button>
            </div>
          </form>
        </div>

        <!-- Tagihan Terkini -->
        <div class="bg-white text-slate-900 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl">
          <h3 class="font-extrabold text-base md:text-lg text-slate-900 mb-4">Tagihan & Rekonsiliasi Terkini</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs md:text-sm">
              <thead class="text-[11px] text-slate-400 uppercase border-b border-slate-200">
                <tr>
                  <th class="py-2.5 px-3">Invoice ID</th>
                  <th class="py-2.5 px-3">Unit</th>
                  <th class="py-2.5 px-3">Nominal</th>
                  <th class="py-2.5 px-3">Status</th>
                  <th class="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody id="table-invoices-body">
                <tr>
                  <td colspan="5" class="py-6 text-center text-slate-400 font-medium">Belum ada tagihan sewa.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  </div>

  <script src="js/config.js"></script>
  <script src="js/auth.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
'@
[System.IO.File]::WriteAllText("$PWD/frontend/dashboard.html", $dashboardHtml, $Utf8NoBomEncoding)

# 3. Update frontend/js/app.js (Logika Sinkronisasi Slider Visual)
$appJsContent = [System.IO.File]::ReadAllText("$PWD/frontend/js/app.js")
$visualJsSnippet = @'

// ==========================================
// DYNAMIC VISUAL SETTINGS (Opacity, Light, Contrast)
// ==========================================
function initVisualSettings() {
  const op = localStorage.getItem("kusuma_bg_opacity") || "90";
  const br = localStorage.getItem("kusuma_bg_brightness") || "100";
  const ct = localStorage.getItem("kusuma_bg_contrast") || "100";

  applyVisualTheme(op, br, ct);

  const sliderOp = document.getElementById("slider-opacity");
  const sliderBr = document.getElementById("slider-brightness");
  const sliderCt = document.getElementById("slider-contrast");

  if (sliderOp) { sliderOp.value = op; document.getElementById("val-opacity").innerText = op + "%"; }
  if (sliderBr) { sliderBr.value = br; document.getElementById("val-brightness").innerText = br + "%"; }
  if (sliderCt) { sliderCt.value = ct; document.getElementById("val-contrast").innerText = ct + "%"; }
}

function updateVisualSetting(type, value) {
  if (type === 'opacity') {
    localStorage.setItem("kusuma_bg_opacity", value);
    document.getElementById("val-opacity").innerText = value + "%";
  } else if (type === 'brightness') {
    localStorage.setItem("kusuma_bg_brightness", value);
    document.getElementById("val-brightness").innerText = value + "%";
  } else if (type === 'contrast') {
    localStorage.setItem("kusuma_bg_contrast", value);
    document.getElementById("val-contrast").innerText = value + "%";
  }

  const op = localStorage.getItem("kusuma_bg_opacity") || "90";
  const br = localStorage.getItem("kusuma_bg_brightness") || "100";
  const ct = localStorage.getItem("kusuma_bg_contrast") || "100";
  applyVisualTheme(op, br, ct);
}

function applyVisualTheme(op, br, ct) {
  const root = document.documentElement;
  root.style.setProperty("--bg-overlay-opacity", (Number(op) / 100).toString());
  root.style.setProperty("--bg-brightness", br + "%");
  root.style.setProperty("--bg-contrast", ct + "%");
}

function resetVisualSettings() {
  localStorage.setItem("kusuma_bg_opacity", "90");
  localStorage.setItem("kusuma_bg_brightness", "100");
  localStorage.setItem("kusuma_bg_contrast", "100");
  initVisualSettings();
  showToast("Pengaturan visual latar belakang berhasil direset!");
}

document.addEventListener("DOMContentLoaded", () => {
  initVisualSettings();
});
'@

if (-not $appJsContent.Contains("initVisualSettings")) {
    [System.IO.File]::AppendAllText("$PWD/frontend/js/app.js", $visualJsSnippet, $Utf8NoBomEncoding)
}

# 4. Tambahkan pembacaan visual settings pada frontend/js/landing.js
$landingJsContent = [System.IO.File]::ReadAllText("$PWD/frontend/js/landing.js")
$landingVisualSnippet = @'

// Load Dynamic Japandi Visual Background Settings
document.addEventListener("DOMContentLoaded", () => {
  const op = localStorage.getItem("kusuma_bg_opacity") || "90";
  const br = localStorage.getItem("kusuma_bg_brightness") || "100";
  const ct = localStorage.getItem("kusuma_bg_contrast") || "100";
  const root = document.documentElement;
  root.style.setProperty("--bg-overlay-opacity", (Number(op) / 100).toString());
  root.style.setProperty("--bg-brightness", br + "%");
  root.style.setProperty("--bg-contrast", ct + "%");
});
'@

if (-not $landingJsContent.Contains("Load Dynamic Japandi Visual")) {
    [System.IO.File]::AppendAllText("$PWD/frontend/js/landing.js", $landingVisualSnippet, $Utf8NoBomEncoding)
}

git add .
git commit -m "feat: add dynamic visual contrast, brightness and opacity controllers in admin cockpit (v11.0)"
git push origin main
Write-Host "`n[BERHASIL] Fitur slider Kontras, Brightness, dan Opacity aktif dan ter-deploy ke Vercel!" -ForegroundColor Green