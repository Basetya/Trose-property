/**
 * Kusuma Properti Manager - Dynamic Catalog & Adaptive Landing Engine (v12.0)
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
          <p class="text-xs text-[#737370]">Lantai ${u.Floor || "-"} â€¢ Full Furnished â€¢ AC, Spring Bed, Kitchen Set, TV</p>
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
        <p class="text-xs text-[#737370]">Luas 21 m2 â€¢ Full Furnished â€¢ AC, Spring Bed, Kitchen Set, Smart TV</p>
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
        <p class="text-xs text-[#737370]">Luas 33 m2 â€¢ 2 Kamar Tidur â€¢ Living Room, Dapur Lengkap, Balkon</p>
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
        <p class="text-xs text-[#737370]">Akses Kolam Renang Tematik â€¢ Gym Indoor â€¢ Interior Modern</p>
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

    if (res && res.reply && res.reply.trim() !== "") {
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

  if (q.includes("parkir") || q.includes("mobil") || q.includes("motor") || q.includes("kendaraan") || q.includes("slot")) {
    return "Untuk area parkir di Apartemen Kalibata City:\n- Tersedia basement luas dan gedung parkir khusus penghuni maupun pengunjung.\n- Tarif parkir berlangganan (member bulanan) mobil dan motor dapat didaftarkan langsung ke kantor Badan Pengelola Kalibata City setelah kontrak sewa aktif.\n- Akses keluar-masuk menggunakan sistem kartu gate otomatis 24 jam.";
  }
  if (q.includes("jam") || q.includes("buka") || q.includes("tutup") || q.includes("operasional")) {
    if (q.includes("mall") || q.includes("kcs") || q.includes("square") || q.includes("market")) {
      return "Mall Kalibata City Square (KCS) buka setiap hari mulai pukul 10.00 WIB hingga 22.00 WIB. Untuk Farmers Market di lantai dasar buka lebih awal mulai pukul 08.00 WIB.";
    }
    return "Mall Kalibata City Square buka pukul 10.00 - 22.00 WIB setiap hari. Sedangkan layanan konsultasi & survei unit Kusuma Properti buka pukul 09.00 - 18.00 WIB.";
  }
  if (q.includes("harian") || q.includes("hari") || q.includes("malam") || q.includes("transit") || q.includes("short stay")) {
    return "Mohon maaf, saat ini kami tidak menyediakan fasilitas sewa harian. Kusuma Properti berfokus melayani sewa bulanan (mulai Rp 3 Jt/bln) dan sewa tahunan demi kenyamanan, keamanan, serta privasi optimal bagi seluruh penghuni.";
  }
  if (q.includes("studio") || q.includes("harga") || q.includes("biaya") || q.includes("rate") || q.includes("tarif") || q.includes("sewa") || q.includes("2br")) {
    return "Pilihan sewa unit bulanan resmi di Kalibata City bersama Kusuma Properti:\n- Studio Deluxe (21 m2): Mulai Rp 3.000.000/bln\n- 2 Bedroom Standard (33 m2): Mulai Rp 4.200.000/bln\n- 2 Bedroom Green Palace (Pool Access): Mulai Rp 5.500.000/bln\nSemua unit Full Furnished siap huni. Tersedia juga opsi diskon untuk sewa tahunan.";
  }
  if (q.includes("fasilitas") || q.includes("kolam") || q.includes("gym") || q.includes("renang") || q.includes("green palace")) {
    return "Fasilitas lengkap di kawasan Superblock Kalibata City:\n- Mall Kalibata City Square (KCS) langsung di bawah hunian (Farmers Market, XXI, kuliner 24 jam).\n- Kolam renang dewasa & anak serta Gym Center di Tower Green Palace.\n- Lapangan Tenis, Basket, Futsal, Jogging Track, dan Masjid Raya Nurullah.\n- Keamanan kartu akses lift 24 jam & CCTV.";
  }
  if (q.includes("lokasi") || q.includes("stasiun") || q.includes("krl") || q.includes("alamat") || q.includes("peta")) {
    return "Lokasi sangat strategis di Jl. Raya Kalibata No.1, Pancoran, Jakarta Selatan. Hanya 2 menit (200m) jalan kaki ke Stasiun KRL Duren Kalibata, dan 10-15 menit ke kawasan bisnis Kuningan & Gatot Subroto.";
  }
  if (q.includes("survei") || q.includes("viewing") || q.includes("lihat") || q.includes("jadwal")) {
    return "Jadwal survei unit (viewing) tersedia setiap hari (Senin-Minggu, 09.00 - 18.00 WIB). Silakan klik tombol 'WhatsApp' untuk konfirmasi jam kunjungan bersama tim konsultan kami.";
  }

  return "Halo! Saya Kusuma AI, asisten virtual resmi Apartemen Kalibata City. Kami menyediakan pilihan sewa unit Studio dan 2BR siap huni. Ada yang bisa saya bantu terkait tarif sewa, fasilitas, info parkir, atau jadwal survei unit?";
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