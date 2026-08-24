/**
 * Kusuma Properti Manager - Pure Real-Time Gemini AI Chatbot & Dynamic Catalog Engine (v22.0)
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
  bindCleanEventListeners();

  const localWa = localStorage.getItem("kusuma_official_wa") || localStorage.getItem("trose_official_wa");
  if (localWa) OFFICIAL_WA_NUMBER = localWa;

  try {
    const res = await gasApiCall("getPublicSettings", {}, "GET");
    if (res && res.success && res.settings && res.settings.waNumber) {
      OFFICIAL_WA_NUMBER = res.settings.waNumber;
      localStorage.setItem("kusuma_official_wa", OFFICIAL_WA_NUMBER);
    }
  } catch (e) {
    console.warn("Menggunakan nomor WhatsApp aktif:", OFFICIAL_WA_NUMBER);
  }
}

function bindCleanEventListeners() {
  const addClick = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", fn);
  };

  addClick("nav-btn-wa", () => openWhatsAppDirect());
  addClick("mobile-nav-btn-wa", () => openWhatsAppDirect());
  
  addClick("hero-btn-ai", () => toggleFloatingChat());
  addClick("hero-btn-wa", () => openWhatsAppDirect());

  addClick("floating-btn-wa", () => openWhatsAppDirect());
  addClick("floating-btn-ai", () => toggleFloatingChat());

  addClick("widget-btn-wa", () => openWhatsAppDirect());
  addClick("widget-btn-close", () => toggleFloatingChat());

  addClick("quick-prompt-studio", () => sendWidgetQuickPrompt("Berapa harga sewa unit Studio Kalibata City?"));
  addClick("quick-prompt-parkir", () => sendWidgetQuickPrompt("Bagaimana aturan dan biaya parkir mobil di Kalibata City?"));
  addClick("quick-prompt-2br", () => sendWidgetQuickPrompt("Jadwalkan survei unit 2BR"));

  const btnSend = document.getElementById("btn-widget-send");
  const inputEl = document.getElementById("widget-input");
  
  if (btnSend) btnSend.addEventListener("click", () => handleWidgetSend());
  if (inputEl) {
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleWidgetSend();
      }
    });
  }
}

function getPopularUnitsData() {
  const saved = localStorage.getItem("kusuma_cms_popular_units");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.warn("Invalid CMS storage, using default units");
    }
  }
  return [
    {
      badge: "Single / Eksekutif",
      title: "Studio Deluxe",
      desc: "Luas 21 m2 • Full Furnished • AC, Spring Bed, Kitchen Set, Smart TV",
      price: 3000000
    },
    {
      badge: "Paling Favorit",
      title: "2 Bedroom Standard",
      desc: "Luas 33 m2 • 2 Kamar Tidur • Living Room, Dapur Lengkap, Balkon",
      price: 4200000
    },
    {
      badge: "Green Palace Resort",
      title: "2 Bedroom Executive",
      desc: "Akses Kolam Renang Tematik • Gym Indoor • Interior Modern",
      price: 5500000
    }
  ];
}

async function loadDynamicCatalog() {
  const container = document.getElementById("dynamic-unit-catalog");
  if (!container) return;

  const units = getPopularUnitsData();

  container.innerHTML = units.map((u, idx) => {
    const isSpecial = idx === 1;
    const isGreen = idx === 2;
    
    let badgeClass = "bg-[#F4EFE6] text-[#8C5835]";
    let cardClass = "japandi-card p-6 md:p-7 rounded-3xl flex flex-col justify-between space-y-6";
    let btnClass = "w-full py-3.5 bg-[#FAF7F2] hover:bg-[#8C5835] hover:text-white text-[#2C2C2A] border border-[#DDD3C2] text-xs font-bold rounded-2xl transition";
    let priceColor = "text-[#8C5835]";

    if (isSpecial) {
      badgeClass = "bg-[#8C5835] text-white";
      cardClass = "japandi-card-warm p-6 md:p-7 rounded-3xl flex flex-col justify-between space-y-6 shadow-md border-[#D4A373]";
      btnClass = "w-full py-3.5 japandi-btn-wood text-xs font-bold rounded-2xl shadow transition";
    } else if (isGreen) {
      badgeClass = "bg-[#EAF0EB] text-[#3A5A40]";
      priceColor = "text-[#3A5A40]";
      btnClass = "w-full py-3.5 bg-[#FAF7F2] hover:bg-[#3A5A40] hover:text-white text-[#2C2C2A] border border-[#DDD3C2] text-xs font-bold rounded-2xl transition";
    }

    return `
      <div class="${cardClass}">
        <div class="space-y-3.5">
          <div class="flex items-center justify-between">
            <span class="px-3.5 py-1 ${badgeClass} text-[10px] md:text-[11px] font-extrabold tracking-wider uppercase rounded-full">
              ${escapeHtml(u.badge)}
            </span>
            <span class="text-[10px] text-[#3A5A40] font-bold bg-[#EAF0EB] px-2 py-0.5 rounded-lg">Siap Huni</span>
          </div>
          <h4 class="font-bold text-[#2C2C2A] font-sans card-unit-title">${escapeHtml(u.title)}</h4>
          <p class="text-[#737370] card-unit-desc min-h-[42px]">${escapeHtml(u.desc)}</p>
          <div class="pt-4 border-t border-[#E8DFD3]/80">
            <span class="text-[11px] text-[#737370] block font-medium">Tarif Sewa Mulai</span>
            <p class="font-bold ${priceColor} font-serif card-unit-price mt-0.5">
              Rp ${Number(u.price || 3000000).toLocaleString('id-ID')} <span class="text-xs text-[#737370] font-sans font-normal">/bulan</span>
            </p>
          </div>
        </div>
        <button type="button" data-unit="${escapeHtml(u.title)}" class="catalog-book-btn ${btnClass}">
          Jadwalkan Survei Unit
        </button>
      </div>
    `;
  }).join('');

  container.querySelectorAll(".catalog-book-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      bookViewingUnit(btn.getAttribute("data-unit"));
    });
  });
}

function toggleFloatingChat() {
  const popup = document.getElementById("chat-popup");
  if (!popup) return;
  if (popup.classList.contains("hidden")) {
    popup.classList.remove("hidden");
    const input = document.getElementById("widget-input");
    if (input) input.focus();
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
    const input = document.getElementById("widget-input");
    if (input) {
      input.value = msg;
      handleWidgetSend();
    }
  }
}

function sendWidgetQuickPrompt(text) {
  const input = document.getElementById("widget-input");
  if (input) {
    input.value = text;
    handleWidgetSend();
  }
}

// REAL-TIME AI ENGINE (Direct Gemini LLM via GET Protocol)
async function handleWidgetSend() {
  const input = document.getElementById("widget-input");
  if (!input) return;
  const message = input.value.trim();
  if (!message) return;

  appendWidgetMessage(message, "user");
  input.value = "";

  const btn = document.getElementById("btn-widget-send");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="animate-pulse">...</span>`;
  }

  const typing = appendWidgetTyping();

  try {
    const res = await gasApiCall("aiChatbot", { message: message, senderPhone: "Public_Web_Lead" }, "GET");
    typing.remove();

    if (res && res.reply && res.reply.trim() !== "") {
      appendWidgetMessage(res.reply, "ai");
    } else if (res && res.error) {
      appendWidgetMessage(`[Kusuma AI Info]: ${res.error}`, "ai");
    } else {
      appendWidgetMessage("Maaf, server AI tidak memberikan balasan teks. Silakan coba kembali.", "ai");
    }
  } catch (err) {
    console.error("[AI Chatbot Failed]:", err);
    typing.remove();
    appendWidgetMessage(`[Koneksi Error]: Gagal memanggil endpoint AI: ${err.message}.`, "ai");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>`;
    }
  }
}

function appendWidgetMessage(text, sender) {
  const container = document.getElementById("widget-messages");
  if (!container) return;
  const wrapper = document.createElement("div");
  wrapper.className = sender === "user" ? "flex justify-end" : "flex items-start gap-2.5";

  if (sender === "user") {
    wrapper.innerHTML = `
      <div class="bg-[#8C5835] text-white p-3 rounded-2xl rounded-tr-none max-w-[85%] leading-relaxed text-xs shadow">
        ${escapeHtml(text)}
      </div>
    `;
  } else {
    wrapper.innerHTML = `
      <img src="img/kusuma-avatar.png" alt="Kusuma AI" class="w-7 h-7 rounded-full object-cover border border-white shrink-0 shadow-sm">
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
  wrapper.className = "flex items-start gap-2.5";
  wrapper.innerHTML = `
    <img src="img/kusuma-avatar.png" alt="Kusuma AI" class="w-7 h-7 rounded-full object-cover border border-white shrink-0 shadow-sm">
    <div class="bg-white border border-[#E8DFD3] px-3 py-2 rounded-2xl rounded-tl-none text-[10px] text-[#737370] animate-pulse">
      Kusuma AI sedang berpikir...
    </div>
  `;
  if (container) {
    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
  }
  return wrapper;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => {
  initLandingSettings();
});