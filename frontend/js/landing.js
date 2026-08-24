/**
 * Kusuma Properti Manager - Direct AI & Comprehensive Concierge Engine (v13.0)
 * File: frontend/js/landing.js
 */

function applyPublicVisualSettings() {
  const opVal = Number(localStorage.getItem("kusuma_bg_opacity") || 90);
  const br = localStorage.getItem("kusuma_bg_brightness") || "100";
  const ct = localStorage.getItem("kusuma_bg_contrast") || "100";

  const root = document.documentElement;
  root.style.setProperty("--bg-overlay-opacity", (opVal / 100).toString());
  root.style.setProperty("--bg-brightness", br + "%");
  root.style.setProperty("--bg-contrast", ct + "%");

  if (opVal <= 65) {
    root.style.setProperty("--hero-title-color", "#1A1A18");
    root.style.setProperty("--hero-desc-color", "#2B2B28");
    root.style.setProperty("--hero-text-shadow", "0 2px 10px rgba(255, 255, 255, 0.85)");
    root.style.setProperty("--hero-scrim-bg", "rgba(255, 255, 255, 0.75)");
  } else {
    root.style.setProperty("--hero-title-color", "#2C2C2A");
    root.style.setProperty("--hero-desc-color", "#595956");
    root.style.setProperty("--hero-text-shadow", "none");
    root.style.setProperty("--hero-scrim-bg", "transparent");
  }
}

applyPublicVisualSettings();

async function initLandingSettings() {
  applyPublicVisualSettings();
  loadDynamicCatalog();

  const localWa = localStorage.getItem("kusuma_official_wa") || localStorage.getItem("trose_official_wa");
  if (localWa) OFFICIAL_WA_NUMBER = localWa;

  try {
    const res = await gasApiCall("getPublicSettings", {}, "GET");
    if (res && res.success && res.settings && res.settings.waNumber) {
      OFFICIAL_WA_NUMBER = res.settings.waNumber;
      localStorage.setItem("kusuma_official_wa", OFFICIAL_WA_NUMBER);
    }
  } catch (e) {
    console.warn("Using active WA Number:", OFFICIAL_WA_NUMBER);
  }
}

async function loadDynamicCatalog() {
  const catalogContainer = document.getElementById("dynamic-unit-catalog");
  if (!catalogContainer) return;

  try {
    const res = await gasApiCall("getUnits");
    if (res && res.success && Array.isArray(res.units) && res.units.length > 0) {
      const availableUnits = res.units.filter(u => u.Status === "Available");
      renderCatalogCards(availableUnits.length > 0 ? availableUnits : res.units);
      return;
    }
  } catch (err) {
    console.warn("Using default Japandi unit templates:", err);
  }

  renderDefaultFallbackCatalog();
}

function renderCatalogCards(units) {
  const container = document.getElementById("dynamic-unit-catalog");
  if (!container) return;

  container.innerHTML = units.slice(0, 6).map((u, idx) => {
    const isSpecial = idx % 2 === 1;
    const cardClass = isSpecial ? "japandi-card-warm p-6 md:p-7 rounded-3xl flex flex-col justify-between space-y-6 shadow-md border-[#D4A373]" : "japandi-card p-6 md:p-7 rounded-3xl flex flex-col justify-between space-y-6";
    const btnClass = isSpecial ? "w-full py-3.5 japandi-btn-wood text-xs font-bold rounded-2xl shadow transition" : "w-full py-3.5 bg-[#FAF7F2] hover:bg-[#8C5835] hover:text-white text-[#2C2C2A] border border-[#DDD3C2] text-xs font-bold rounded-2xl transition";
    
    return `
      <div class="${cardClass}">
        <div class="space-y-3">
          <div class="flex justify-between items-start">
            <span class="px-3 py-1 bg-[#F4EFE6] text-[#8C5835] text-[10px] md:text-[11px] font-bold tracking-wider uppercase rounded-full">
              ${u.Tower || "Kalibata City"}
            </span>
            <span class="text-[10px] text-[#3A5A40] font-bold bg-[#EAF0EB] px-2 py-0.5 rounded-lg">Siap Huni</span>
          </div>
          <h4 class="text-lg md:text-xl font-bold text-[#2C2C2A] font-sans">${u.Type || "Apartment Unit"} #${u.Unit_No || "Unit"}</h4>
          <p class="text-xs text-[#737370]">Lantai ${u.Floor || "-"} • Full Furnished • AC, Spring Bed, Kitchen Set, TV</p>
          <div class="pt-4 border-t border-[#E8DFD3]">
            <span class="text-[11px] text-[#737370]">Tarif Sewa Mulai</span>
            <p class="text-xl md:text-2xl font-bold text-[#8C5835] font-serif">Rp ${Number(u.Base_Rent || 3000000).toLocaleString('id-ID')} <span class="text-xs text-[#737370] font-sans font-normal">/bulan</span></p>
          </div>
        </div>
        <button onclick="bookViewingUnit('${u.Tower} #${u.Unit_No} (${u.Type})')" class="${btnClass}">
          Jadwalkan Survei Unit
        </button>
      </div>
    `;
  }).join('');
}

function renderDefaultFallbackCatalog() {
  const container = document.getElementById("dynamic-unit-catalog");
  if (!container) return;

  container.innerHTML = `
    <div class="japandi-card p-6 md:p-7 rounded-3xl flex flex-col justify-between space-y-6">
      <div class="space-y-3">
        <span class="px-3 py-1 bg-[#F4EFE6] text-[#8C5835] text-[11px] font-bold tracking-wider uppercase rounded-full">Single / Eksekutif</span>
        <h4 class="text-xl font-bold text-[#2C2C2A]">Studio Deluxe</h4>
        <p class="text-xs text-[#737370]">Luas 21 m2 • Full Furnished • AC, Spring Bed, Kitchen Set, Smart TV</p>
        <div class="pt-4 border-t border-[#E8DFD3]">
          <span class="text-[11px] text-[#737370]">Tarif Sewa Mulai</span>
          <p class="text-2xl font-bold text-[#8C5835] font-serif">Rp 3.000.000 <span class="text-xs text-[#737370] font-sans font-normal">/bulan</span></p>
        </div>
      </div>
      <button onclick="bookViewingUnit('Studio Deluxe')" class="w-full py-3.5 bg-[#FAF7F2] hover:bg-[#8C5835] hover:text-white text-[#2C2C2A] border border-[#DDD3C2] text-xs font-bold rounded-2xl transition">
        Jadwalkan Survei Unit
      </button>
    </div>

    <div class="japandi-card-warm p-6 md:p-7 rounded-3xl flex flex-col justify-between space-y-6 shadow-md border-[#D4A373]">
      <div class="space-y-3">
        <span class="px-3 py-1 bg-[#8C5835] text-white text-[11px] font-bold tracking-wider uppercase rounded-full">Paling Favorit</span>
        <h4 class="text-xl font-bold text-[#2C2C2A]">2 Bedroom Standard</h4>
        <p class="text-xs text-[#737370]">Luas 33 m2 • 2 Kamar Tidur • Living Room, Dapur Lengkap, Balkon</p>
        <div class="pt-4 border-t border-[#DDD3C2]">
          <span class="text-[11px] text-[#737370]">Tarif Sewa Mulai</span>
          <p class="text-2xl font-bold text-[#8C5835] font-serif">Rp 4.200.000 <span class="text-xs text-[#737370] font-sans font-normal">/bulan</span></p>
        </div>
      </div>
      <button onclick="bookViewingUnit('2 Bedroom Standard')" class="w-full py-3.5 japandi-btn-wood text-xs font-bold rounded-2xl shadow transition">
        Jadwalkan Survei Unit
      </button>
    </div>

    <div class="japandi-card p-6 md:p-7 rounded-3xl flex flex-col justify-between space-y-6">
      <div class="space-y-3">
        <span class="px-3 py-1 bg-[#EAF0EB] text-[#3A5A40] text-[11px] font-bold tracking-wider uppercase rounded-full">Green Palace Resort</span>
        <h4 class="text-xl font-bold text-[#2C2C2A]">2 Bedroom Executive</h4>
        <p class="text-xs text-[#737370]">Akses Kolam Renang Tematik • Gym Indoor • Interior Modern</p>
        <div class="pt-4 border-t border-[#E8DFD3]">
          <span class="text-[11px] text-[#737370]">Tarif Sewa Mulai</span>
          <p class="text-2xl font-bold text-[#3A5A40] font-serif">Rp 5.500.000 <span class="text-xs text-[#737370] font-sans font-normal">/bulan</span></p>
        </div>
      </div>
      <button onclick="bookViewingUnit('2 Bedroom Executive')" class="w-full py-3.5 bg-[#FAF7F2] hover:bg-[#3A5A40] hover:text-white text-[#2C2C2A] border border-[#DDD3C2] text-xs font-bold rounded-2xl transition">
        Jadwalkan Survei Unit
      </button>
    </div>
  `;
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
  const text = customMessage || ((typeof OFFICIAL_WA_GREETING !== "undefined") ? OFFICIAL_WA_GREETING : "Halo Admin Kusuma Properti Kalibata City, saya ingin konsultasi sewa unit.");
  const url = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function bookViewingUnit(unitType) {
  const msg = `Halo Admin Kusuma Properti, saya ingin jadwalkan survei untuk unit ${unitType} di Kalibata City.`;
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

    if (res && res.reply && res.reply.trim() !== "" && !res.reply.startsWith("Halo! Saya Kusuma AI, asisten virtual resmi")) {
      appendWidgetMessage(res.reply, "ai");
    } else {
      appendWidgetMessage(generateSmartKnowledgeReply(message), "ai");
    }
  } catch (err) {
    console.warn("GAS API Offline, using Smart Local Engine:", err);
    typing.remove();
    appendWidgetMessage(generateSmartKnowledgeReply(message), "ai");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>`;
  }
}

function generateSmartKnowledgeReply(userQuery) {
  const q = String(userQuery || '').toLowerCase();

  // 1. Rumah Sakit & Fasilitas Kesehatan
  if (q.includes("rumah sakit") || q.includes("rs") || q.includes("klinik") || q.includes("dokter") || q.includes("medis") || q.includes("apotek") || q.includes("sakit") || q.includes("obat") || q.includes("puskesmas")) {
    return "Tentu, ada beberapa fasilitas kesehatan dan rumah sakit terdekat dari Apartemen Kalibata City:\n\n" +
      "1. RS Brawijaya Duren Tiga (±5–7 menit / 2.5 km)\n" +
      "2. RSUD Budhi Asih Cawang (±7–10 menit / 3 km)\n" +
      "3. RS Tebet (±10 menit / 3.5 km)\n" +
      "4. RS Siloam & Medistra Gatot Subroto (±10–15 menit)\n" +
      "5. Klinik 24 Jam & Apotek (Kimia Farma, Century, Guardian) tersedia langsung di lantai dasar Mall Kalibata City Square (KCS).\n\n" +
      "Apakah Anda ingin informasi tambahan seputar fasilitas lain atau survei unit?";
  }

  // 2. Parkir & Kendaraan
  if (q.includes("parkir") || q.includes("mobil") || q.includes("motor") || q.includes("kendaraan") || q.includes("slot") || q.includes("helm")) {
    return "Untuk fasilitas parkir di Apartemen Kalibata City:\n- Tersedia area basement luas & gedung parkir bertingkat khusus penghuni dan tamu.\n- Tarif parkir member bulanan dapat didaftarkan langsung ke kantor Badan Pengelola setelah kontrak sewa berjalan.\n- Dilengkapi gate kartu akses otomatis dan keamanan CCTV 24 jam.";
  }

  // 3. Jam Operasional Mall & Kantor
  if (q.includes("jam") || q.includes("buka") || q.includes("tutup") || q.includes("operasional") || q.includes("malam")) {
    if (q.includes("mall") || q.includes("kcs") || q.includes("square") || q.includes("market") || q.includes("belanja")) {
      return "Mall Kalibata City Square (KCS) buka setiap hari pukul 10.00 – 22.00 WIB. Khusus Farmers Market buka lebih awal mulai pukul 08.00 WIB.";
    }
    return "Layanan survei unit & kantor konsultasi Kusuma Properti buka setiap hari pukul 09.00 – 18.00 WIB. Sedangkan Mall KCS buka pukul 10.00 – 22.00 WIB.";
  }

  // 4. Sewa Harian (Strict Policy)
  if (q.includes("harian") || q.includes("hari") || q.includes("transit") || q.includes("short stay") || q.includes("menginap")) {
    return "Mohon maaf, saat ini kami tidak menyediakan sewa harian. Kusuma Properti berfokus melayani sewa bulanan (mulai Rp 3 Jt/bln) dan sewa tahunan demi kenyamanan, privasi, serta keamanan seluruh penghuni apartemen.";
  }

  // 5. Harga & Pilihan Tipe Unit
  if (q.includes("studio") || q.includes("harga") || q.includes("biaya") || q.includes("rate") || q.includes("tarif") || q.includes("sewa") || q.includes("2br") || q.includes("kamar")) {
    return "Pilihan sewa unit bulanan resmi bersama Kusuma Properti di Kalibata City:\n- Studio Deluxe (21 m²): Mulai Rp 3.000.000/bln\n- 2 Bedroom Standard (33 m²): Mulai Rp 4.200.000/bln\n- 2 Bedroom Green Palace (Pool Access): Mulai Rp 5.500.000/bln\nSemua unit Full Furnished siap huni (AC, Springbed, Kitchen Set, TV).";
  }

  // 6. Fasilitas Olahraga & Kawasan
  if (q.includes("fasilitas") || q.includes("kolam") || q.includes("gym") || q.includes("renang") || q.includes("lapangan") || q.includes("green palace")) {
    return "Fasilitas kawasan Superblock Kalibata City meliputi:\n- Mall Kalibata City Square (KCS) di bawah tower (XXI, Farmers Market, kuliner 24 jam).\n- Kolam renang dewasa & anak serta Gym Center di Green Palace.\n- Lapangan Tenis, Basket, Futsal, Jogging Track, dan Masjid Raya Nurullah.\n- Keamanan kartu akses lift 24 jam & CCTV.";
  }

  // 7. Lokasi & Transportasi
  if (q.includes("lokasi") || q.includes("stasiun") || q.includes("krl") || q.includes("alamat") || q.includes("peta") || q.includes("jalan") || q.includes("akses")) {
    return "Lokasi sangat strategis di Jl. Raya Kalibata No.1, Pancoran, Jakarta Selatan. Hanya 2 menit (200 meter) jalan kaki ke Stasiun KRL Duren Kalibata, dan 10–15 menit ke kawasan bisnis Kuningan serta Gatot Subroto.";
  }

  // 8. Jadwal Survei / Viewing
  if (q.includes("survei") || q.includes("viewing") || q.includes("lihat") || q.includes("jadwal") || q.includes("kunjung")) {
    return "Jadwal survei unit (viewing) tersedia setiap hari (Senin–Minggu, 09.00 – 18.00 WIB). Silakan klik tombol 'WhatsApp' untuk konfirmasi jam kunjungan bersama tim konsultan kami.";
  }

  // Custom Knowledge Base Admin fallback jika ada
  const dynamicKb = localStorage.getItem("kusuma_ai_kb") || "";
  if (dynamicKb && dynamicKb.length > 30) {
    return "Halo! Berdasarkan informasi resmi Kusuma Properti:\n\n" + dynamicKb.substring(0, 300) + "...\n\nAda yang ingin Anda tanyakan lebih spesifik seputar ketersediaan unit atau jadwal viewing?";
  }

  return "Halo! Saya Kusuma AI, asisten virtual resmi Apartemen Kalibata City. Kami menyediakan pilihan sewa unit Studio & 2BR siap huni, informasi fasilitas (kolam renang, gym, mall, rumah sakit terdekat), hingga jadwal survei unit. Ada yang bisa saya bantu?";
}

function appendWidgetMessage(text, sender) {
  const container = document.getElementById("widget-messages");
  const wrapper = document.createElement("div");
  wrapper.className = sender === "user" ? "flex justify-end" : "flex items-start gap-2";

  if (sender === "user") {
    wrapper.innerHTML = `
      <div class="bg-[#8C5835] text-white p-3 rounded-2xl rounded-tr-none max-w-[85%] leading-relaxed text-xs shadow">
        ${escapeHtml(text)}
      </div>
    `;
  } else {
    wrapper.innerHTML = `
      <div class="w-6 h-6 rounded-lg bg-[#8C5835] text-white flex items-center justify-center font-bold text-[10px] shrink-0 font-serif">K</div>
      <div class="bg-white border border-[#E8DFD3] p-3 rounded-2xl rounded-tl-none text-[#2C2C2A] leading-relaxed text-xs shadow-sm whitespace-pre-line">
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
    <div class="w-6 h-6 rounded-lg bg-[#8C5835] text-white flex items-center justify-center font-bold text-[10px] shrink-0 font-serif">K</div>
    <div class="bg-white border border-[#E8DFD3] px-3 py-2 rounded-2xl rounded-tl-none text-[10px] text-[#737370] animate-pulse">
      Kusuma AI sedang mengetik...
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