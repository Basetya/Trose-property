# ==============================================================================
# Kusuma Properti - Japandi Minimalist UI Design System Overhaul (v10.0)
# ==============================================================================

Write-Host "Menerapkan Estetika Japandi (Japanese-Scandinavian) pada Kusuma Properti..." -ForegroundColor Cyan

New-Item -ItemType Directory -Force -Path "frontend/css", "frontend/js", "frontend/img" | Out-Null
$Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False

# ==============================================================================
# 1. FRONTEND STYLING (frontend/css/custom.css)
# ==============================================================================
Write-Host "Memperbarui frontend/css/custom.css (Japandi Warm Earthy Palette)..." -ForegroundColor Yellow
$customCss = @'
/* Kusuma Properti - Japandi Design System (v10.0) */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

:root {
  --japandi-bg: #FAF7F2;
  --japandi-surface: #FFFFFF;
  --japandi-panel: #F4EFE6;
  --japandi-wood: #C28E5C;
  --japandi-wood-dark: #8C5835;
  --japandi-clay: #B35436;
  --japandi-moss: #3A5A40;
  --japandi-charcoal: #2C2C2A;
  --japandi-muted: #737370;
  --japandi-border: #E8DFD3;
}

* {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

h1, h2, .font-display {
  font-family: 'Playfair Display', Georgia, serif;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--japandi-bg);
  color: var(--japandi-charcoal);
  letter-spacing: -0.01em;
}

.bg-japandi-canvas {
  background-color: #FAF7F2;
  background-image: 
    radial-gradient(at 100% 0%, rgba(212, 163, 115, 0.08) 0px, transparent 50%),
    radial-gradient(at 0% 100%, rgba(58, 90, 64, 0.05) 0px, transparent 50%);
  background-attachment: fixed;
}

.japandi-card {
  background: #FFFFFF;
  border: 1px solid var(--japandi-border);
  box-shadow: 0 4px 20px -2px rgba(44, 44, 42, 0.04);
}

.japandi-card-warm {
  background: var(--japandi-panel);
  border: 1px solid #E2D7C8;
}

.japandi-panel {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--japandi-border);
}

.japandi-btn-wood {
  background-color: #8C5835;
  color: #FFFFFF;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.japandi-btn-wood:hover {
  background-color: #704326;
  box-shadow: 0 4px 12px rgba(140, 88, 53, 0.25);
}

.japandi-btn-moss {
  background-color: #3A5A40;
  color: #FFFFFF;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.japandi-btn-moss:hover {
  background-color: #2D4732;
  box-shadow: 0 4px 12px rgba(58, 90, 64, 0.25);
}

.japandi-btn-clay {
  background-color: #B35436;
  color: #FFFFFF;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.japandi-btn-clay:hover {
  background-color: #944026;
  box-shadow: 0 4px 12px rgba(179, 84, 54, 0.25);
}

/* Scrollbar Minimalis Organik */
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
[System.IO.File]::WriteAllText("$PSScriptRoot/frontend/css/custom.css", $customCss, $Utf8NoBomEncoding)


# ==============================================================================
# 2. FRONTEND LANDING PAGE (frontend/index.html)
# ==============================================================================
Write-Host "Memperbarui frontend/index.html (Japandi Warm Aesthetic)..." -ForegroundColor Yellow
$indexHtml = @'
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Kusuma Properti - Hunian Nyaman & Alami di Kalibata City</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/custom.css">
</head>
<body class="bg-japandi-canvas text-[#2C2C2A] min-h-screen selection:bg-[#E8DFD3]">
  
  <!-- Navbar -->
  <header class="sticky top-0 z-40 japandi-panel px-4 md:px-8 py-3.5 border-b border-[#E8DFD3]">
    <div class="max-w-7xl mx-auto flex justify-between items-center">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-[#8C5835] text-white flex items-center justify-center font-serif text-xl font-bold shadow-sm">K</div>
        <div>
          <h1 class="text-base font-extrabold tracking-tight text-[#2C2C2A] leading-tight font-sans">Kusuma Properti</h1>
          <p class="text-[10px] text-[#8C5835] font-semibold tracking-wider uppercase">Kalibata City Haven</p>
        </div>
      </div>

      <nav class="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-[#737370]">
        <a href="#keunggulan" class="hover:text-[#8C5835] transition">Harmoni & Akses</a>
        <a href="#tipe-unit" class="hover:text-[#8C5835] transition">Katalog Unit</a>
        <a href="#fasilitas" class="hover:text-[#8C5835] transition">Fasilitas Kawasan</a>
        <a href="#lokasi" class="hover:text-[#8C5835] transition">Lokasi</a>
        <button onclick="openWhatsAppDirect()" class="text-[#3A5A40] hover:text-[#2D4732] flex items-center gap-1.5 font-bold transition">
          <span class="w-2 h-2 rounded-full bg-[#3A5A40] animate-pulse"></span>
          WhatsApp Admin
        </button>
      </nav>

      <div class="flex items-center gap-2">
        <button onclick="openWhatsAppDirect()" class="md:hidden px-3.5 py-2 japandi-btn-moss font-bold text-xs rounded-xl shadow-sm">
          Chat WA
        </button>
        <a href="dashboard.html" class="px-4 py-2 bg-white hover:bg-[#F4EFE6] text-[#2C2C2A] border border-[#E8DFD3] text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5">
          <span>Admin Cockpit</span>
          <svg class="w-3.5 h-3.5 text-[#8C5835]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="max-w-6xl mx-auto px-4 md:px-8 pt-16 pb-20 md:pt-28 md:pb-32 text-center space-y-6">
    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFE8DC] border border-[#DDD3C2] text-[#8C5835] text-xs font-bold tracking-widest uppercase">
      Ketenangan & Kemudahan Hidup di Jakarta Selatan
    </div>
    
    <h2 class="text-3xl md:text-6xl font-normal tracking-tight text-[#2C2C2A] leading-[1.15] max-w-4xl mx-auto font-display">
      Harmoni Hunian Siap Pakai, Lebih Praktis di <span class="italic text-[#8C5835]">Apartemen Kalibata City</span>
    </h2>

    <p class="text-[#737370] text-sm md:text-lg max-w-2xl mx-auto leading-relaxed font-light">
      Koleksi unit sewa bulanan dan tahunan bernuansa tenang dan fungsional. Dilengkapi akses instan menuju Mall Kalibata City Square dan 2 menit berjalan kaki ke Stasiun KRL.
    </p>

    <div class="pt-4 flex flex-col sm:flex-row justify-center items-center gap-3 md:gap-4">
      <button onclick="toggleFloatingChat()" class="w-full sm:w-auto px-7 py-3.5 japandi-btn-wood font-semibold text-xs uppercase tracking-wider rounded-2xl shadow-md transition flex items-center justify-center gap-2">
        <span>Konsultasi Sewa via Kusuma AI</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
      </button>
      <button onclick="openWhatsAppDirect()" class="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-[#F4EFE6] text-[#2C2C2A] border border-[#DDD3C2] font-semibold text-xs uppercase tracking-wider rounded-2xl shadow-sm transition flex items-center justify-center gap-2">
        <span>Chat Konsultan Properti</span>
      </button>
    </div>
  </section>

  <!-- Keunggulan Section -->
  <section id="keunggulan" class="max-w-6xl mx-auto px-4 md:px-8 py-16">
    <div class="text-center space-y-2 mb-12">
      <span class="text-xs font-bold text-[#8C5835] uppercase tracking-widest">Kenapa Memilih Kami</span>
      <h3 class="text-2xl md:text-4xl text-[#2C2C2A] font-display font-normal">Kenyamanan Sederhana yang Esensial</h3>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="japandi-card p-7 rounded-3xl space-y-3">
        <div class="w-12 h-12 rounded-2xl bg-[#F4EFE6] text-[#8C5835] flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
        </div>
        <h4 class="text-lg font-bold text-[#2C2C2A] font-sans">Mall KCS Tepat di Bawah Unit</h4>
        <p class="text-[#737370] text-xs leading-relaxed">
          Pusat kuliner, Farmers Market, kafe santai, apotek, dan bioskop XXI tinggal turun lift tanpa repot berkendara keluar kawasan.
        </p>
      </div>

      <div class="japandi-card p-7 rounded-3xl space-y-3">
        <div class="w-12 h-12 rounded-2xl bg-[#EAF0EB] text-[#3A5A40] flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <h4 class="text-lg font-bold text-[#2C2C2A] font-sans">200 Meter ke Stasiun KRL</h4>
        <p class="text-[#737370] text-xs leading-relaxed">
          Cukup 2 menit jalan kaki santai ke Stasiun Duren Kalibata. Bebas macet menuju koridor segitiga emas Sudirman, Kuningan, dan Tebet.
        </p>
      </div>

      <div class="japandi-card p-7 rounded-3xl space-y-3">
        <div class="w-12 h-12 rounded-2xl bg-[#F8ECE8] text-[#B35436] flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h4 class="text-lg font-bold text-[#2C2C2A] font-sans">Full Furnished & Terawat</h4>
        <p class="text-[#737370] text-xs leading-relaxed">
          Interior rapi dan terinspeksi bersih. Dilengkapi sistem keamanan kartu akses 24 jam serta transparansi proses sewa.
        </p>
      </div>
    </div>
  </section>

  <!-- Pilihan Unit Section -->
  <section id="tipe-unit" class="max-w-6xl mx-auto px-4 md:px-8 py-16 border-t border-[#E8DFD3]">
    <div class="text-center space-y-2 mb-12">
      <span class="text-xs font-bold text-[#8C5835] uppercase tracking-widest">Katalog Pilihan</span>
      <h3 class="text-2xl md:text-4xl text-[#2C2C2A] font-display font-normal">Tipe Unit Populer Siap Huni</h3>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="japandi-card p-7 rounded-3xl flex flex-col justify-between space-y-6">
        <div class="space-y-3">
          <span class="px-3 py-1 bg-[#F4EFE6] text-[#8C5835] text-[11px] font-bold tracking-wider uppercase rounded-full">Single / Eksekutif</span>
          <h4 class="text-xl font-bold text-[#2C2C2A]">Studio Deluxe</h4>
          <p class="text-xs text-[#737370]">Luas 21 m² • Full Furnished • AC, Spring Bed, Kitchen Set, Smart TV</p>
          <div class="pt-4 border-t border-[#E8DFD3]">
            <span class="text-[11px] text-[#737370]">Tarif Sewa Mulai</span>
            <p class="text-2xl font-bold text-[#8C5835] font-serif">Rp 3.000.000 <span class="text-xs text-[#737370] font-sans font-normal">/bulan</span></p>
          </div>
        </div>
        <button onclick="bookViewingUnit('Studio Deluxe')" class="w-full py-3 bg-[#FAF7F2] hover:bg-[#8C5835] hover:text-white text-[#2C2C2A] border border-[#DDD3C2] text-xs font-bold rounded-2xl transition">
          Jadwalkan Survei Unit
        </button>
      </div>

      <div class="japandi-card-warm p-7 rounded-3xl flex flex-col justify-between space-y-6 shadow-md border-[#D4A373]">
        <div class="space-y-3">
          <span class="px-3 py-1 bg-[#8C5835] text-white text-[11px] font-bold tracking-wider uppercase rounded-full">Paling Favorit</span>
          <h4 class="text-xl font-bold text-[#2C2C2A]">2 Bedroom Standard</h4>
          <p class="text-xs text-[#737370]">Luas 33 m² • 2 Kamar Tidur • Living Room, Dapur Lengkap, Balkon</p>
          <div class="pt-4 border-t border-[#DDD3C2]">
            <span class="text-[11px] text-[#737370]">Tarif Sewa Mulai</span>
            <p class="text-2xl font-bold text-[#8C5835] font-serif">Rp 4.200.000 <span class="text-xs text-[#737370] font-sans font-normal">/bulan</span></p>
          </div>
        </div>
        <button onclick="bookViewingUnit('2 Bedroom Standard')" class="w-full py-3 japandi-btn-wood text-xs font-bold rounded-2xl shadow transition">
          Jadwalkan Survei Unit
        </button>
      </div>

      <div class="japandi-card p-7 rounded-3xl flex flex-col justify-between space-y-6">
        <div class="space-y-3">
          <span class="px-3 py-1 bg-[#EAF0EB] text-[#3A5A40] text-[11px] font-bold tracking-wider uppercase rounded-full">Green Palace Resort</span>
          <h4 class="text-xl font-bold text-[#2C2C2A]">2 Bedroom Executive</h4>
          <p class="text-xs text-[#737370]">Akses Kolam Renang Tematik • Gym Indoor • Interior Modern</p>
          <div class="pt-4 border-t border-[#E8DFD3]">
            <span class="text-[11px] text-[#737370]">Tarif Sewa Mulai</span>
            <p class="text-2xl font-bold text-[#3A5A40] font-serif">Rp 5.500.000 <span class="text-xs text-[#737370] font-sans font-normal">/bulan</span></p>
          </div>
        </div>
        <button onclick="bookViewingUnit('2 Bedroom Executive')" class="w-full py-3 bg-[#FAF7F2] hover:bg-[#3A5A40] hover:text-white text-[#2C2C2A] border border-[#DDD3C2] text-xs font-bold rounded-2xl transition">
          Jadwalkan Survei Unit
        </button>
      </div>
    </div>
  </section>

  <!-- Fasilitas Section -->
  <section id="fasilitas" class="max-w-6xl mx-auto px-4 md:px-8 py-16 border-t border-[#E8DFD3]">
    <div class="text-center space-y-2 mb-12">
      <span class="text-xs font-bold text-[#8C5835] uppercase tracking-widest">Fasilitas Lengkap</span>
      <h3 class="text-2xl md:text-4xl text-[#2C2C2A] font-display font-normal">Segala Kebutuhan di Satu Tempat</h3>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      <div class="japandi-card p-6 rounded-3xl text-center space-y-2">
        <div class="w-12 h-12 rounded-2xl bg-[#F4EFE6] text-[#8C5835] mx-auto flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 15a4 4 0 004 4h10a4 4 0 004-4M3 9a4 4 0 014-4h10a4 4 0 014 4M3 12h18"></path></svg>
        </div>
        <h5 class="font-bold text-sm text-[#2C2C2A]">Kolam Renang</h5>
        <p class="text-[11px] text-[#737370]">Adult Pool & Kids Pool tematik di Green Palace.</p>
      </div>

      <div class="japandi-card p-6 rounded-3xl text-center space-y-2">
        <div class="w-12 h-12 rounded-2xl bg-[#EAF0EB] text-[#3A5A40] mx-auto flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 6h16M4 12h16M4 18h16M7 6v12M17 6v12"></path></svg>
        </div>
        <h5 class="font-bold text-sm text-[#2C2C2A]">Fitness Center</h5>
        <p class="text-[11px] text-[#737370]">Pusat kebugaran cardio & beban indoor.</p>
      </div>

      <div class="japandi-card p-6 rounded-3xl text-center space-y-2">
        <div class="w-12 h-12 rounded-2xl bg-[#F8ECE8] text-[#B35436] mx-auto flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h5 class="font-bold text-sm text-[#2C2C2A]">Sports Court</h5>
        <p class="text-[11px] text-[#737370]">Lapangan tenis, basket, futsal, & jogging track.</p>
      </div>

      <div class="japandi-card p-6 rounded-3xl text-center space-y-2">
        <div class="w-12 h-12 rounded-2xl bg-[#F4EFE6] text-[#8C5835] mx-auto flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
        </div>
        <h5 class="font-bold text-sm text-[#2C2C2A]">Mall KCS & Cinema</h5>
        <p class="text-[11px] text-[#737370]">Farmers Market & XXI tinggal turun lift.</p>
      </div>
    </div>
  </section>

  <!-- Peta Lokasi Section -->
  <section id="lokasi" class="max-w-6xl mx-auto px-4 md:px-8 py-16 border-t border-[#E8DFD3]">
    <div class="text-center space-y-2 mb-12">
      <span class="text-xs font-bold text-[#8C5835] uppercase tracking-widest">Konektivitas</span>
      <h3 class="text-2xl md:text-4xl text-[#2C2C2A] font-display font-normal">Akses Strategis Jakarta Selatan</h3>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div class="lg:col-span-2 japandi-card p-4 rounded-3xl space-y-3">
        <div class="flex justify-between items-center px-2">
          <span class="text-xs font-bold text-[#2C2C2A]">Peta Kawasan Kalibata City</span>
          <a href="https://maps.google.com/?q=Apartemen+Kalibata+City+Jakarta+Selatan" target="_blank" class="text-xs text-[#8C5835] font-bold hover:underline">
            Buka di Google Maps &rarr;
          </a>
        </div>
        <div class="w-full h-[280px] md:h-[380px] rounded-2xl overflow-hidden border border-[#E8DFD3]">
          <iframe 
            title="Peta Presisi Apartemen Kalibata City"
            src="https://maps.google.com/maps?q=-6.2558,106.8552&hl=id&z=17&output=embed" 
            width="100%" 
            height="100%" 
            style="border:0;" 
            allowfullscreen="" 
            loading="lazy">
          </iframe>
        </div>
      </div>

      <div class="space-y-4">
        <div class="japandi-card p-6 rounded-3xl space-y-1 border-l-4 border-[#3A5A40]">
          <span class="text-[10px] font-bold text-[#3A5A40] uppercase tracking-wider">Transportasi Terintegrasi</span>
          <h5 class="font-bold text-sm text-[#2C2C2A]">Stasiun KRL Duren Kalibata (200m)</h5>
          <p class="text-xs text-[#737370]">Jalan kaki santai 2 menit. Akses cepat ke Sudirman, Kuningan, dan Manggarai.</p>
        </div>

        <div class="japandi-card p-6 rounded-3xl space-y-1 border-l-4 border-[#8C5835]">
          <span class="text-[10px] font-bold text-[#8C5835] uppercase tracking-wider">Kawasan Bisnis & Tol</span>
          <h5 class="font-bold text-sm text-[#2C2C2A]">Kuningan & Gatot Subroto (10-15 Menit)</h5>
          <p class="text-xs text-[#737370]">Akses mudah ke perkantoran HR Rasuna Said, SCBD, MT Haryono, dan Pintu Tol Pancoran.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="japandi-panel border-t border-[#E8DFD3] py-8 px-4 text-center text-xs text-[#737370] space-y-2">
    <p class="font-semibold text-[#2C2C2A]">Kusuma Properti &copy; 2026 — Kalibata City Haven</p>
    <p>Jl. Raya Kalibata No.1, Rawajati, Pancoran, Jakarta Selatan 12750</p>
  </footer>

  <!-- Floating Chatbot Widget (Japandi Soft Warm Floating Assistant) -->
  <div id="floating-chat-widget" class="fixed bottom-5 right-5 z-50 flex flex-col items-end">
    <!-- Chat Window Container -->
    <div id="chat-popup" class="hidden japandi-panel border border-[#DDD3C2] rounded-3xl shadow-xl w-[calc(100vw-32px)] md:w-96 mb-3 overflow-hidden flex flex-col h-[480px]">
      <div class="bg-[#F4EFE6] p-4 border-b border-[#E8DFD3] flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-[#8C5835] text-white flex items-center justify-center font-bold text-xs font-serif">K</div>
          <div>
            <h6 class="text-xs font-bold text-[#2C2C2A]">Kusuma AI Concierge</h6>
            <p class="text-[10px] text-[#3A5A40] flex items-center gap-1 font-medium">
              <span class="w-1.5 h-1.5 rounded-full bg-[#3A5A40]"></span> Online | Asisten Kalibata City
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="openWhatsAppDirect()" class="text-xs font-bold text-[#3A5A40] bg-[#EAF0EB] px-2.5 py-1 rounded-lg border border-[#D5E2D7]">
            WA
          </button>
          <button onclick="toggleFloatingChat()" class="text-[#737370] hover:text-[#2C2C2A] text-lg font-bold px-1.5">&times;</button>
        </div>
      </div>

      <div id="widget-messages" class="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-[#FAF7F2]">
        <div class="flex items-start gap-2.5">
          <div class="w-7 h-7 rounded-xl bg-[#8C5835] text-white flex items-center justify-center font-bold text-[10px] font-serif shrink-0">K</div>
          <div class="bg-white border border-[#E8DFD3] p-3 rounded-2xl rounded-tl-none text-[#2C2C2A] leading-relaxed shadow-sm">
            Halo! Saya Kusuma AI. Ada yang bisa saya bantu terkait pilihan unit sewa, tarif bulanan, info parkir, atau jadwal survei di Kalibata City?
          </div>
        </div>
      </div>

      <div class="px-3 py-2 bg-[#F4EFE6] border-t border-[#E8DFD3] flex gap-2 overflow-x-auto text-[11px]">
        <button onclick="sendWidgetQuickPrompt('Berapa harga sewa unit Studio Kalibata City?')" class="bg-white border border-[#DDD3C2] px-3 py-1 rounded-xl text-[#2C2C2A] whitespace-nowrap hover:bg-[#FAF7F2]">
          Tarif Studio
        </button>
        <button onclick="sendWidgetQuickPrompt('Bagaimana aturan dan biaya parkir mobil di Kalibata City?')" class="bg-white border border-[#DDD3C2] px-3 py-1 rounded-xl text-[#2C2C2A] whitespace-nowrap hover:bg-[#FAF7F2]">
          Info Parkir
        </button>
        <button onclick="sendWidgetQuickPrompt('Jadwalkan survei unit 2BR')" class="bg-white border border-[#DDD3C2] px-3 py-1 rounded-xl text-[#2C2C2A] whitespace-nowrap hover:bg-[#FAF7F2]">
          Survei 2BR
        </button>
      </div>

      <div class="p-3 bg-white border-t border-[#E8DFD3] flex gap-2">
        <input type="text" id="widget-input" placeholder="Tanyakan seputar unit sewa & fasilitas..." class="flex-1 px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DDD3C2] rounded-xl text-xs text-[#2C2C2A] focus:outline-none focus:ring-1 focus:ring-[#8C5835]">
        <button onclick="handleWidgetSend()" id="btn-widget-send" class="px-4 py-2.5 japandi-btn-wood rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </button>
      </div>
    </div>

    <!-- Floating Toggle Buttons -->
    <div class="flex items-center gap-2.5">
      <button onclick="openWhatsAppDirect()" title="Chat WhatsApp Konsultan" class="w-12 h-12 bg-[#3A5A40] hover:bg-[#2D4732] text-white font-bold rounded-full shadow-lg flex items-center justify-center transition transform hover:scale-105">
        <span class="text-xs font-bold">WA</span>
      </button>
      <button onclick="toggleFloatingChat()" class="px-5 py-3.5 japandi-btn-wood font-semibold text-xs tracking-wider uppercase rounded-full shadow-lg flex items-center gap-2 transition transform hover:scale-105">
        <span class="w-2 h-2 rounded-full bg-[#EAF0EB]"></span>
        <span>Tanya Kusuma AI</span>
      </button>
    </div>
  </div>

  <script src="js/config.js"></script>
  <script src="js/landing.js"></script>
</body>
</html>
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/frontend/index.html", $indexHtml, $Utf8NoBomEncoding)


# ==============================================================================
# 3. DEFENSIVE GIT COMMIT
# ==============================================================================
if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Host "Menyimpan commit transformasi gaya Japandi ke Git..." -ForegroundColor Cyan
    git add .
    git commit -m "style: overhaul entire visual design system to Japandi minimalism (v10.0)"
}

Write-Host "`n[SUCCESS] Seluruh Tampilan Berhasil Dikonversi ke Style Japandi (v10.0)!" -ForegroundColor Green