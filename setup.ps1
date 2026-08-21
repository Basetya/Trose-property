# ==============================================================================
# Trose-property - 1-Click Setup (AI Concierge Live Hook & SVG Fix v6.5)
# ==============================================================================

Write-Host "Updating Rose AI Concierge Engine & Clean Arrow Icons..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "backend", "frontend/css", "frontend/js", "frontend/img", "scripts" | Out-Null

$Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False

Write-Host "Updating frontend/index.html (Clean SVG Chat Send Button)..." -ForegroundColor Yellow
$indexHtml = @'
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trose Property - Sewa Apartemen Kalibata City Nyaman & Strategis</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/custom.css">
</head>
<body class="bg-slate-950 text-slate-100 bg-kalibata min-h-screen">
  <!-- Navbar -->
  <header class="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-6 py-4">
    <div class="max-w-7xl mx-auto flex justify-between items-center">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-rose-500/30">T</div>
        <div>
          <h1 class="font-extrabold text-base text-white leading-tight">Trose Property</h1>
          <p class="text-xs text-rose-400 font-medium">Kalibata City Specialist</p>
        </div>
      </div>

      <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
        <a href="#keunggulan" class="hover:text-rose-400 transition">Keunggulan</a>
        <a href="#tipe-unit" class="hover:text-rose-400 transition">Pilihan Unit</a>
        <a href="#fasilitas" class="hover:text-rose-400 transition">Fasilitas Lengkap</a>
        <a href="#lokasi" class="hover:text-rose-400 transition">Peta & Akses</a>
        <button onclick="openWhatsAppDirect()" class="text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1.5 font-bold">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          WhatsApp Admin
        </button>
      </nav>

      <div class="flex items-center gap-3">
        <a href="dashboard.html" class="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition shadow-md flex items-center gap-1.5">
          <span>Admin Login</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="max-w-7xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28 text-center space-y-6">
    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold tracking-wide uppercase">
      Superblock Terintegrasi Terlengkap di Jakarta Selatan
    </div>
    <h2 class="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
      Tinggal Lebih Praktis, Nyaman, dan Bebas Macet di <span class="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500">Apartemen Kalibata City</span>
    </h2>
    <p class="text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
      Sewa unit siap huni (Studio, 2BR, hingga Green Palace Executive). Nikmati kemudahan hidup dengan mall di dalam kawasan hunian, 2 menit ke Stasiun KRL, dan akses cepat ke pusat bisnis Jakarta.
    </p>
    <div class="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
      <button onclick="toggleFloatingChat()" class="w-full sm:w-auto px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl shadow-xl shadow-rose-600/30 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
        <span>Konsultasi Sewa via AI Concierge</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
      </button>
      <button onclick="openWhatsAppDirect()" class="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2">
        <span>Chat WhatsApp Langsung</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
      </button>
    </div>
  </section>

  <!-- Keunggulan Section -->
  <section id="keunggulan" class="max-w-7xl mx-auto px-6 py-16">
    <div class="text-center space-y-2 mb-12">
      <h3 class="text-xs font-bold text-rose-400 uppercase tracking-widest">Mengapa Kalibata City?</h3>
      <h4 class="text-3xl font-extrabold text-white">Semua Kebutuhan Hidup Ada di Depan Pintu Anda</h4>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="glass-card p-6 rounded-3xl space-y-3">
        <div class="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl font-bold">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
        </div>
        <h5 class="text-lg font-bold text-white">Mall Kalibata City Square (KCS)</h5>
        <p class="text-slate-300 text-sm leading-relaxed">
          Pusat belanja, bioskop XXI, Farmers Market, food court kuliner Nusantara, kafe, apotek, dan ATM center lengkap langsung di bawah tower Anda.
        </p>
      </div>

      <div class="glass-card p-6 rounded-3xl space-y-3">
        <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-bold">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <h5 class="text-lg font-bold text-white">2 Menit ke Stasiun KRL & Halte Bus</h5>
        <p class="text-slate-300 text-sm leading-relaxed">
          Hanya 200 meter ke Stasiun KRL Duren Kalibata. Bebas macet menuju koridor segitiga emas Sudirman, Kuningan, Tebet, dan Gatot Subroto.
        </p>
      </div>

      <div class="glass-card p-6 rounded-3xl space-y-3">
        <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h5 class="text-lg font-bold text-white">Harga Terjangkau & Full Furnished</h5>
        <p class="text-slate-300 text-sm leading-relaxed">
          Sewa bulanan dan tahunan hemat dengan fasilitas keamanan kartu akses lift 24 jam, CCTV, dan fasilitas olahraga lengkap.
        </p>
      </div>
    </div>
  </section>

  <!-- Pilihan Unit Section -->
  <section id="tipe-unit" class="max-w-7xl mx-auto px-6 py-16 border-t border-slate-800/80">
    <div class="text-center space-y-2 mb-12">
      <h3 class="text-xs font-bold text-rose-400 uppercase tracking-widest">Katalog Unit</h3>
      <h4 class="text-3xl font-extrabold text-white">Tipe Unit Populer Siap Huni</h4>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="glass-card p-6 rounded-3xl space-y-4 flex flex-col justify-between">
        <div>
          <span class="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full">Favorit Single / Profesional</span>
          <h5 class="text-xl font-bold text-white mt-3">Studio Deluxe (21 m2)</h5>
          <p class="text-xs text-slate-300 mt-1">Full Furnished / AC / Kitchen Set / Spring Bed / TV</p>
          <div class="mt-4 pt-4 border-t border-slate-700/80">
            <span class="text-xs text-slate-400">Mulai dari</span>
            <p class="text-2xl font-black text-rose-400 font-mono">Rp 3.000.000 <span class="text-xs text-slate-400 font-normal">/bulan</span></p>
          </div>
        </div>
        <button onclick="bookViewingUnit('Studio Deluxe')" class="w-full py-2.5 bg-slate-800 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition">
          Jadwalkan Survei Unit
        </button>
      </div>

      <div class="glass-card p-6 rounded-3xl space-y-4 flex flex-col justify-between border-rose-500/50 shadow-xl shadow-rose-950/50">
        <div>
          <span class="px-3 py-1 bg-rose-500/20 text-rose-300 text-xs font-bold rounded-full">Paling Diminati</span>
          <h5 class="text-xl font-bold text-white mt-3">2 Bedroom Standard (33 m2)</h5>
          <p class="text-xs text-slate-300 mt-1">2 Kamar Tidur / Ruang Tamu / Kitchen Set / TV & AC</p>
          <div class="mt-4 pt-4 border-t border-slate-700/80">
            <span class="text-xs text-slate-400">Mulai dari</span>
            <p class="text-2xl font-black text-rose-400 font-mono">Rp 4.200.000 <span class="text-xs text-slate-400 font-normal">/bulan</span></p>
          </div>
        </div>
        <button onclick="bookViewingUnit('2 Bedroom Standard')" class="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition">
          Jadwalkan Survei Unit
        </button>
      </div>

      <div class="glass-card p-6 rounded-3xl space-y-4 flex flex-col justify-between">
        <div>
          <span class="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full">Tower Green Palace (Premium)</span>
          <h5 class="text-xl font-bold text-white mt-3">2 Bedroom Executive</h5>
          <p class="text-xs text-slate-300 mt-1">Akses Kolam Renang / Gym / Tennis Court / Interior Mewah</p>
          <div class="mt-4 pt-4 border-t border-slate-700/80">
            <span class="text-xs text-slate-400">Mulai dari</span>
            <p class="text-2xl font-black text-rose-400 font-mono">Rp 5.500.000 <span class="text-xs text-slate-400 font-normal">/bulan</span></p>
          </div>
        </div>
        <button onclick="bookViewingUnit('2 Bedroom Executive')" class="w-full py-2.5 bg-slate-800 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition">
          Jadwalkan Survei Unit
        </button>
      </div>
    </div>
  </section>

  <!-- Fasilitas Lengkap Superblock Section (Pure SVG Icons) -->
  <section id="fasilitas" class="max-w-7xl mx-auto px-6 py-16 border-t border-slate-800/80">
    <div class="text-center space-y-2 mb-12">
      <h3 class="text-xs font-bold text-rose-400 uppercase tracking-widest">Fasilitas Kawasan Superblock</h3>
      <h4 class="text-3xl font-extrabold text-white">Semua Kebutuhan Olahraga, Belanja, & Ibadah Tersedia</h4>
      <p class="text-slate-400 text-sm max-w-xl mx-auto">Fasilitas terintegrasi dalam area 12 hektar yang dirancang untuk kenyamanan keluarga dan profesional muda.</p>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="glass-card p-5 rounded-2xl text-center space-y-2">
        <div class="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h10a4 4 0 004-4M3 9a4 4 0 014-4h10a4 4 0 014 4M3 12h18"></path></svg>
        </div>
        <h6 class="font-bold text-sm text-white">Kolam Renang Tematik</h6>
        <p class="text-xs text-slate-400">Adult Pool & Kids Pool dengan area sun deck santai di Green Palace.</p>
      </div>

      <div class="glass-card p-5 rounded-2xl text-center space-y-2">
        <div class="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16M7 6v12M17 6v12"></path></svg>
        </div>
        <h6 class="font-bold text-sm text-white">Fitness Center & Gym</h6>
        <p class="text-xs text-slate-400">Pusat kebugaran lengkap dengan peralatan cardio dan beban.</p>
      </div>

      <div class="glass-card p-5 rounded-2xl text-center space-y-2">
        <div class="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h6 class="font-bold text-sm text-white">Sports Complex</h6>
        <p class="text-xs text-slate-400">Lapangan tenis, basket, futsal, dan jogging track rindang.</p>
      </div>

      <div class="glass-card p-5 rounded-2xl text-center space-y-2">
        <div class="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
        </div>
        <h6 class="font-bold text-sm text-white">Farmers Market & KCS Mall</h6>
        <p class="text-xs text-slate-400">Belanja kebutuhan dapur segar dan bioskop XXI tinggal turun lift.</p>
      </div>

      <div class="glass-card p-5 rounded-2xl text-center space-y-2">
        <div class="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 mx-auto flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
        </div>
        <h6 class="font-bold text-sm text-white">Masjid Raya Nurullah</h6>
        <p class="text-xs text-slate-400">Fasilitas ibadah megah dan nyaman di dalam komplek hunian.</p>
      </div>

      <div class="glass-card p-5 rounded-2xl text-center space-y-2">
        <div class="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
        </div>
        <h6 class="font-bold text-sm text-white">Keamanan & Access Card 24 Jam</h6>
        <p class="text-xs text-slate-400">CCTV pengawasan 24/7 dan kartu akses lift privat per lantai.</p>
      </div>

      <div class="glass-card p-5 rounded-2xl text-center space-y-2">
        <div class="w-12 h-12 rounded-xl bg-pink-500/20 text-pink-400 mx-auto flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
        </div>
        <h6 class="font-bold text-sm text-white">Ratusan Kios Laundry & Jasa</h6>
        <p class="text-xs text-slate-400">Layanan laundry kiloan cepat, salon, galon, dan ekspedisi paket.</p>
      </div>

      <div class="glass-card p-5 rounded-2xl text-center space-y-2">
        <div class="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 mx-auto flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
        </div>
        <h6 class="font-bold text-sm text-white">Taman Hutan Kota & Danau</h6>
        <p class="text-xs text-slate-400">Area hijau terbuka yang asri untuk jalan santai dan bermain anak.</p>
      </div>
    </div>
  </section>

  <!-- Peta Lokasi Presisi Kalibata City Superblock -->
  <section id="lokasi" class="max-w-7xl mx-auto px-6 py-16 border-t border-slate-800/80">
    <div class="text-center space-y-2 mb-12">
      <h3 class="text-xs font-bold text-rose-400 uppercase tracking-widest">Akses & Lokasi Strategis</h3>
      <h4 class="text-3xl font-extrabold text-white">Jantung Mobilitas Jakarta Selatan</h4>
      <p class="text-slate-400 text-sm max-w-xl mx-auto">Titik presisi Superblock Apartemen Kalibata City & Mall Kalibata City Square di seberang Stasiun KRL Duren Kalibata.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div class="lg:col-span-2 glass-panel p-4 rounded-3xl overflow-hidden shadow-2xl space-y-3">
        <div class="flex justify-between items-center px-2">
          <span class="text-xs font-bold text-slate-300">Peta Satelit & Street View Kawasan</span>
          <a href="https://maps.google.com/?q=Apartemen+Kalibata+City+Jakarta+Selatan" target="_blank" class="text-xs text-rose-400 hover:text-rose-300 font-bold underline flex items-center gap-1">
            <span>Buka di Google Maps</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </a>
        </div>
        <div class="w-full h-[420px] rounded-2xl overflow-hidden border border-slate-700/80">
          <iframe 
            title="Peta Presisi Apartemen Kalibata City"
            src="https://maps.google.com/maps?q=-6.2558,106.8552&hl=id&z=17&output=embed" 
            width="100%" 
            height="100%" 
            style="border:0;" 
            allowfullscreen="" 
            loading="lazy" 
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
      </div>

      <div class="space-y-4">
        <div class="glass-card p-5 rounded-2xl space-y-1.5 border-l-4 border-emerald-500">
          <span class="text-xs font-bold text-emerald-400 uppercase tracking-wide">Transit Oriented Development (TOD)</span>
          <h6 class="font-bold text-white text-base">Stasiun KRL Duren Kalibata (200m)</h6>
          <p class="text-xs text-slate-300 leading-relaxed">2 menit jalan kaki dari lobi tower. Menghubungkan langsung ke Sudirman (Dukuh Atas), Manggarai, Juanda, Depok, dan Bogor.</p>
        </div>

        <div class="glass-card p-5 rounded-2xl space-y-1.5 border-l-4 border-rose-500">
          <span class="text-xs font-bold text-rose-400 uppercase tracking-wide">Segitiga Emas & Tol Dalam Kota</span>
          <h6 class="font-bold text-white text-base">Kuningan & Gatot Subroto (10-15 Menit)</h6>
          <p class="text-xs text-slate-300 leading-relaxed">Akses lancar ke koridor perkantoran HR Rasuna Said, SCBD, MT Haryono, dan Gerbang Tol Pancaran/Cawang.</p>
        </div>

        <div class="glass-card p-5 rounded-2xl space-y-1.5 border-l-4 border-amber-500">
          <span class="text-xs font-bold text-amber-400 uppercase tracking-wide">Kesehatan, Pendidikan & Kuliner</span>
          <h6 class="font-bold text-white text-base">Kawasan Kuliner Rawajati & RS Tebet</h6>
          <p class="text-xs text-slate-300 leading-relaxed">Dikelilingi RS Brawijaya Duren Tiga, RS Tria Dipa, Universitas Trilogi, dan sentra durian Kalibata 24 jam.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="glass-panel border-t border-slate-800 py-8 px-6 text-center text-xs text-slate-400 space-y-2">
    <p class="font-bold text-slate-300">Trose Property Manager &copy; 2026 - Hunian Sewa Apartemen Kalibata City</p>
    <p>Jl. Raya Kalibata No.1, Rawajati, Pancoran, Jakarta Selatan 12750</p>
  </footer>

  <!-- Floating Chatbot Widget (Rose AI Concierge) -->
  <div id="floating-chat-widget" class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
    <!-- Chat Window Container -->
    <div id="chat-popup" class="hidden glass-panel border border-slate-700 rounded-3xl shadow-2xl w-80 md:w-96 mb-3 overflow-hidden flex flex-col h-[500px]">
      <div class="bg-slate-900/95 p-4 border-b border-slate-800 flex justify-between items-center">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center font-bold text-white text-xs">R</div>
          <div>
            <h6 class="text-xs font-bold text-white">Rose - AI Concierge</h6>
            <p class="text-[10px] text-emerald-400">Online | Kalibata City Assistant</p>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <button onclick="openWhatsAppDirect()" title="Chat WhatsApp" class="text-emerald-400 hover:text-emerald-300 text-xs px-2 py-1 bg-emerald-950/60 rounded-lg border border-emerald-800/60 font-bold">
            WA
          </button>
          <button onclick="toggleFloatingChat()" class="text-slate-400 hover:text-white text-lg font-bold px-1.5">&times;</button>
        </div>
      </div>

      <div id="widget-messages" class="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
        <div class="flex items-start gap-2">
          <div class="w-6 h-6 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-white text-[10px] shrink-0">R</div>
          <div class="bg-slate-900 border border-slate-800 p-3 rounded-2xl rounded-tl-none text-slate-200 leading-relaxed">
            Halo! Saya Rose. Mau cari unit sewa di Kalibata City, tanya fasilitas kolam renang/gym, atau cek jadwal survei lokasi?
          </div>
        </div>
      </div>

      <div class="px-3 py-2 bg-slate-950/80 border-t border-slate-800 flex gap-1.5 overflow-x-auto text-[10px]">
        <button onclick="sendWidgetQuickPrompt('Berapa harga sewa unit Studio Kalibata City?')" class="bg-slate-900 px-2.5 py-1 rounded-lg text-slate-300 whitespace-nowrap hover:bg-slate-800">
          Studio Rate
        </button>
        <button onclick="sendWidgetQuickPrompt('Apa saja fasilitas di Tower Green Palace?')" class="bg-slate-900 px-2.5 py-1 rounded-lg text-slate-300 whitespace-nowrap hover:bg-slate-800">
          Fasilitas Tower
        </button>
        <button onclick="sendWidgetQuickPrompt('Jadwalkan viewing unit 2BR besok')" class="bg-slate-900 px-2.5 py-1 rounded-lg text-slate-300 whitespace-nowrap hover:bg-slate-800">
          Survei 2BR
        </button>
      </div>

      <div class="p-3 bg-slate-900/95 border-t border-slate-800 flex gap-2">
        <input type="text" id="widget-input" placeholder="Tanyakan seputar unit & fasilitas..." class="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-100">
        <button onclick="handleWidgetSend()" id="btn-widget-send" class="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </button>
      </div>
    </div>

    <!-- Toggle Buttons -->
    <div class="flex items-center gap-2">
      <button onclick="openWhatsAppDirect()" title="Chat WhatsApp Pengelola" class="w-12 h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full shadow-2xl shadow-emerald-600/50 flex items-center justify-center transition transform hover:scale-105">
        <span class="text-sm font-bold">WA</span>
      </button>
      <button onclick="toggleFloatingChat()" class="px-5 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-full shadow-2xl shadow-rose-600/50 flex items-center gap-2.5 transition transform hover:scale-105">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="text-sm">Tanya Rose AI</span>
      </button>
    </div>
  </div>

  <script src="js/config.js"></script>
  <script src="js/landing.js"></script>
</body>
</html>
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/frontend/index.html", $indexHtml, $Utf8NoBomEncoding)

Write-Host "Updating frontend/js/landing.js (With Contextual Dynamic Knowledge Base)..." -ForegroundColor Yellow
$landingJs = @'
/**
 * Trose Property Manager - Landing Page & Live AI Bridge (v6.5)
 * File: frontend/js/landing.js
 */

async function initLandingSettings() {
  try {
    const res = await gasApiCall("getPublicSettings", {}, "GET");
    if (res && res.success && res.settings && res.settings.waNumber) {
      OFFICIAL_WA_NUMBER = res.settings.waNumber;
    }
  } catch (e) {
    console.warn("Using local fallback WA Number:", OFFICIAL_WA_NUMBER);
  }
}

function toggleFloatingChat() {
  const popup = document.getElementById("chat-popup");
  if (popup.classList.contains("hidden")) {
    popup.classList.remove("hidden");
    document.getElementById("widget-input").focus();
  } else {
    popup.classList.add("hidden");
  }
}

function openWhatsAppDirect(customMessage) {
  const phone = (typeof OFFICIAL_WA_NUMBER !== "undefined") ? OFFICIAL_WA_NUMBER : "+6281221559000";
  const text = customMessage || ((typeof OFFICIAL_WA_GREETING !== "undefined") ? OFFICIAL_WA_GREETING : "Halo Admin Trose Kalibata City, saya ingin konsultasi sewa unit.");
  const url = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function bookViewingUnit(unitType) {
  const msg = `Halo Admin Trose, saya ingin jadwalkan survei untuk unit ${unitType} di Kalibata City.`;
  if (confirm(`Hubungi WhatsApp Pengelola untuk survei unit ${unitType}?`)) {
    openWhatsAppDirect(msg);
  } else {
    toggleFloatingChat();
    document.getElementById("widget-input").value = msg;
    handleWidgetSend();
  }
}

function sendWidgetQuickPrompt(text) {
  document.getElementById("widget-input").value = text;
  handleWidgetSend();
}

async function handleWidgetSend() {
  const input = document.getElementById("widget-input");
  const message = input.value.trim();
  if (!message) return;

  appendWidgetMessage(message, "user");
  input.value = "";

  const btn = document.getElementById("btn-widget-send");
  btn.disabled = true;
  btn.innerHTML = `<span class="animate-pulse">...</span>`;

  const typing = appendWidgetTyping();

  try {
    const res = await gasApiCall("aiChatbot", { message: message, senderPhone: "Public_Web_Lead" }, "POST");
    typing.remove();

    if (res && res.reply) {
      appendWidgetMessage(res.reply, "ai");
    } else {
      appendWidgetMessage(generateSmartFallbackReply(message), "ai");
    }
  } catch (err) {
    typing.remove();
    appendWidgetMessage(generateSmartFallbackReply(message), "ai");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>`;
  }
}

function generateSmartFallbackReply(userQuery) {
  const q = userQuery.toLowerCase();
  
  if (q.includes("harian") || q.includes("hari")) {
    return "Untuk sewa unit harian di Apartemen Kalibata City, kami menyediakan unit Studio dan 2BR full-furnished (mulai Rp300rb–Rp450rb/malam) tergantung ketersediaan. Silakan klik tombol 'WA' untuk booking instan dengan admin.";
  }
  if (q.includes("studio") || q.includes("harga") || q.includes("biaya") || q.includes("rate")) {
    return "Harga sewa bulanan di Kalibata City:\n- Studio Deluxe: Mulai Rp3.000.000/bulan\n- 2 Bedroom Standard: Mulai Rp4.200.000/bulan\n- 2 Bedroom Green Palace (Pool Access): Mulai Rp5.500.000/bulan.\nSemua unit sudah full furnished (AC, kasur, kitchen set, kulkas, TV).";
  }
  if (q.includes("fasilitas") || q.includes("kolam") || q.includes("gym") || q.includes("mall")) {
    return "Fasilitas lengkap di kawasan Kalibata City Superblock mencakup:\n- Mall Kalibata City Square (KCS), bioskop XXI, Farmers Market di bawah hunian.\n- Kolam renang dewasa & anak, gym indoor, lapangan tenis/basket/futsal.\n- Keamanan kartu akses lift 24 jam & Masjid Raya Nurullah.";
  }
  if (q.includes("lokasi") || q.includes("stasiun") || q.includes("krl") || q.includes("alamat")) {
    return "Lokasi sangat strategis di Jl. Raya Kalibata No.1, Pancoran, Jakarta Selatan. Hanya 2 menit (200m) jalan kaki ke Stasiun KRL Duren Kalibata, dan 10-15 menit ke kawasan perkantoran Kuningan / Gatot Subroto.";
  }
  if (q.includes("survei") || q.includes("viewing") || q.includes("lihat")) {
    return "Tentu! Jadwal survei unit (viewing) buka setiap hari (Senin–Minggu, 09.00–18.00 WIB). Silakan klik tombol 'WA' di kanan atas untuk konfirmasi jam kedatangan Anda dengan tim pengelola.";
  }

  return "Halo! Saya Rose, asisten resmi sewa Apartemen Kalibata City. Kami menyediakan unit Studio dan 2BR siap huni (bulanan/tahunan/harian). Ada yang bisa saya bantu terkait harga, fasilitas, atau jadwal viewing?";
}

function appendWidgetMessage(text, sender) {
  const container = document.getElementById("widget-messages");
  const wrapper = document.createElement("div");
  wrapper.className = sender === "user" ? "flex justify-end" : "flex items-start gap-2";

  if (sender === "user") {
    wrapper.innerHTML = `
      <div class="bg-rose-600 text-white p-2.5 rounded-2xl rounded-tr-none max-w-[85%] leading-relaxed">
        ${escapeHtml(text)}
      </div>
    `;
  } else {
    wrapper.innerHTML = `
      <div class="w-6 h-6 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-white text-[10px] shrink-0">R</div>
      <div class="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl rounded-tl-none text-slate-200 leading-relaxed whitespace-pre-line">
        ${escapeHtml(text)}
      </div>
    `;
  }

  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
}

function appendWidgetTyping() {
  const container = document.getElementById("widget-messages");
  const wrapper = document.createElement("div");
  wrapper.className = "flex items-start gap-2";
  wrapper.innerHTML = `
    <div class="w-6 h-6 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-white text-[10px] shrink-0">R</div>
    <div class="bg-slate-900 border border-slate-800 px-3 py-2 rounded-2xl rounded-tl-none text-[10px] text-slate-400 animate-pulse">
      Rose sedang mengetik...
    </div>
  `;
  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
  return wrapper;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => {
  initLandingSettings();
  const input = document.getElementById("widget-input");
  if (input) {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleWidgetSend();
    });
  }
});
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/frontend/js/landing.js", $landingJs, $Utf8NoBomEncoding)

Write-Host "`n[SUCCESS] Setup v6.5 completed: Smart Chatbot Engine & Pure SVG Arrows applied!" -ForegroundColor Green