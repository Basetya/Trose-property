/**
 * Kusuma Properti Manager - Kusuma AI Concierge & Smart Contrast Engine (v11.4)
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

  // Logika Cerdas: Adaptasi Otomatis Kontras Font Sesuai Opacity
  if (opVal <= 65) {
    // Mode Background Foto Tajam: Berikan kontras solid & scrim proteksi agar selalu terbaca jelas
    root.style.setProperty("--hero-title-color", "#1A1A18");
    root.style.setProperty("--hero-desc-color", "#2B2B28");
    root.style.setProperty("--hero-text-shadow", "0 2px 10px rgba(255, 255, 255, 0.85)");
    root.style.setProperty("--hero-scrim-bg", "rgba(255, 255, 255, 0.72)");
  } else {
    // Mode Kanvas Japandi Krem Lembut
    root.style.setProperty("--hero-title-color", "#2C2C2A");
    root.style.setProperty("--hero-desc-color", "#595956");
    root.style.setProperty("--hero-text-shadow", "none");
    root.style.setProperty("--hero-scrim-bg", "transparent");
  }
}

applyPublicVisualSettings();

async function initLandingSettings() {
  applyPublicVisualSettings();

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

  // 1. Parkir & Kendaraan
  if (q.includes("parkir") || q.includes("mobil") || q.includes("motor") || q.includes("kendaraan") || q.includes("slot")) {
    return "Untuk area parkir di Apartemen Kalibata City:\n- Tersedia basement luas dan gedung parkir khusus penghuni maupun pengunjung.\n- Tarif parkir berlangganan (member bulanan) mobil dan motor dapat didaftarkan langsung ke kantor Badan Pengelola Kalibata City setelah kontrak sewa aktif.\n- Akses keluar-masuk menggunakan sistem kartu gate otomatis 24 jam.";
  }

  // 2. Jam Buka / Operasional Mall & Kantor
  if (q.includes("jam") || q.includes("buka") || q.includes("tutup") || q.includes("operasional")) {
    if (q.includes("mall") || q.includes("kcs") || q.includes("square") || q.includes("market")) {
      return "Mall Kalibata City Square (KCS) buka setiap hari mulai pukul 10.00 WIB hingga 22.00 WIB. Untuk Farmers Market di lantai dasar buka lebih awal mulai pukul 08.00 WIB.";
    }
    return "Mall Kalibata City Square buka pukul 10.00 - 22.00 WIB setiap hari. Sedangkan layanan konsultasi & survei unit Kusuma Properti buka pukul 09.00 - 18.00 WIB.";
  }

  // 3. Sewa Harian (Strict Policy)
  if (q.includes("harian") || q.includes("hari") || q.includes("malam") || q.includes("transit") || q.includes("short stay")) {
    return "Mohon maaf, saat ini kami tidak menyediakan fasilitas sewa harian. Kusuma Properti berfokus melayani sewa bulanan (mulai Rp 3 Jt/bln) dan sewa tahunan demi kenyamanan, keamanan, serta privasi optimal bagi seluruh penghuni.";
  }

  // 4. Harga / Tipe Unit
  if (q.includes("studio") || q.includes("harga") || q.includes("biaya") || q.includes("rate") || q.includes("tarif") || q.includes("sewa") || q.includes("2br")) {
    return "Pilihan sewa unit bulanan resmi di Kalibata City bersama Kusuma Properti:\n- Studio Deluxe (21 m2): Mulai Rp 3.000.000/bln\n- 2 Bedroom Standard (33 m2): Mulai Rp 4.200.000/bln\n- 2 Bedroom Green Palace (Pool Access): Mulai Rp 5.500.000/bln\nSemua unit Full Furnished siap huni. Tersedia juga opsi diskon untuk sewa tahunan.";
  }

  // 5. Fasilitas & Olahraga
  if (q.includes("fasilitas") || q.includes("kolam") || q.includes("gym") || q.includes("renang") || q.includes("green palace")) {
    return "Fasilitas lengkap di kawasan Superblock Kalibata City:\n- Mall Kalibata City Square (KCS) langsung di bawah hunian (Farmers Market, XXI, kuliner 24 jam).\n- Kolam renang dewasa & anak serta Gym Center di Tower Green Palace.\n- Lapangan Tenis, Basket, Futsal, Jogging Track, dan Masjid Raya Nurullah.\n- Keamanan kartu akses lift 24 jam & CCTV.";
  }

  // 6. Lokasi & Transportasi
  if (q.includes("lokasi") || q.includes("stasiun") || q.includes("krl") || q.includes("alamat") || q.includes("peta")) {
    return "Lokasi sangat strategis di Jl. Raya Kalibata No.1, Pancoran, Jakarta Selatan. Hanya 2 menit (200m) jalan kaki ke Stasiun KRL Duren Kalibata, dan 10-15 menit ke kawasan bisnis Kuningan & Gatot Subroto.";
  }

  // 7. Jadwal Survei / Viewing
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
      <div class="bg-rose-600 text-white p-2.5 rounded-2xl rounded-tr-none max-w-[85%] leading-relaxed text-xs">
        ${escapeHtml(text)}
      </div>
    `;
  } else {
    wrapper.innerHTML = `
      <div class="w-6 h-6 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-white text-[10px] shrink-0">K</div>
      <div class="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl rounded-tl-none text-slate-200 leading-relaxed text-xs whitespace-pre-line">
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
    <div class="w-6 h-6 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-white text-[10px] shrink-0">K</div>
    <div class="bg-slate-900 border border-slate-800 px-3 py-2 rounded-2xl rounded-tl-none text-[10px] text-slate-400 animate-pulse">
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