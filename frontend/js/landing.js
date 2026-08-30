/**
 * Kusuma Properti Manager - Landing Page Dynamic Engine
 * File: frontend/js/landing.js
 * Version: v112.0.0 (Unified aiChatbot Protocol & Anti-CORS Redirect Follow)
 */

document.addEventListener("DOMContentLoaded", () => {
  initVisualTheme();
  initDynamicUnits();
  initWhatsAppButtons();
  initLandingChatbot();
});

// 1. Terapkan Kustomisasi Visual Latar Belakang dari LocalStorage
function initVisualTheme() {
  const saved = localStorage.getItem("KUSUMA_VISUAL_SETTINGS");
  if (saved) {
    try {
      const s = JSON.parse(saved);
      if (s.opacity) {
        document.documentElement.style.setProperty("--japandi-scrim-opacity", `${Number(s.opacity) / 100}`);
      }
      if (s.brightness) {
        document.documentElement.style.setProperty("--japandi-bg-brightness", `${s.brightness}%`);
      }
      if (s.contrast) {
        document.documentElement.style.setProperty("--japandi-bg-contrast", `${s.contrast}%`);
      }
    } catch (e) {
      console.warn("Gagal memuat tema visual:", e);
    }
  }
}

// 2. Muat 3 Unit Populer (CMS / Database Fallback)
function initDynamicUnits() {
  const catalogEl = document.getElementById("dynamic-unit-catalog");
  if (!catalogEl) return;

  const defaultUnits = [
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

  let units = defaultUnits;
  const savedCMS = localStorage.getItem("KUSUMA_POPULAR_UNITS_CMS");
  if (savedCMS) {
    try {
      const d = JSON.parse(savedCMS);
      units = [
        d.u1 || defaultUnits[0],
        d.u2 || defaultUnits[1],
        d.u3 || defaultUnits[2]
      ];
    } catch (e) {
      units = defaultUnits;
    }
  }

  catalogEl.innerHTML = units.map(u => `
    <div class="japandi-card p-6 rounded-3xl flex flex-col justify-between space-y-4">
      <div class="space-y-2">
        <span class="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#F4EFE6] text-[#8C5835] border border-[#DDD3C2]">
          ${u.badge || "Tersedia"}
        </span>
        <h4 class="text-lg font-bold text-[#2C2C2A]">${u.title || "Unit Kalibata"}</h4>
        <p class="text-xs text-[#737370] leading-relaxed">${u.desc || ""}</p>
      </div>
      <div class="pt-3 border-t border-[#E8DFD3] flex items-center justify-between">
        <div>
          <span class="text-[10px] text-[#737370] uppercase">Mulai Dari</span>
          <p class="text-base font-bold font-mono text-[#8C5835]">Rp ${Number(u.price || 0).toLocaleString("id-ID")}<span class="text-xs font-normal text-[#737370]">/bln</span></p>
        </div>
        <button onclick="handleInquireUnit('${u.title}')" class="px-4 py-2 bg-[#8C5835] hover:bg-[#704326] text-white text-xs font-bold rounded-xl shadow-sm transition">
          Tanya Unit
        </button>
      </div>
    </div>
  `).join("");
}

// 3. Sinkronisasi Tombol WhatsApp Dinamis
let targetAdminWa = (window.APP_CONFIG && window.APP_CONFIG.DEFAULT_WA) ? window.APP_CONFIG.DEFAULT_WA : "628135600058";

async function initWhatsAppButtons() {
  const apiEndpoint = (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) 
    ? window.APP_CONFIG.API_BASE_URL 
    : "https://script.google.com/macros/s/AKfycbwM0tRCZvTd6qpWwGRzt6U14QUwtAI7gaxBAfsUAejM2kO1nLe9T90fcvjhqg2daLG4/exec";

  try {
    const res = await fetch(`${apiEndpoint}?action=getPublicSettings&_t=${Date.now()}`, {
      method: "GET",
      mode: "cors",
      redirect: "follow"
    });
    const data = await res.json();
    if (data.success && data.settings && data.settings.waNumber) {
      targetAdminWa = String(data.settings.waNumber).replace(/\D/g, "");
    }
  } catch (e) {
    targetAdminWa = "628135600058";
  }

  const btnFloatingWa = document.getElementById("floating-btn-wa");
  const btnWidgetWa = document.getElementById("widget-btn-wa");

  const openWa = (unitName = "") => {
    const text = unitName 
      ? `Halo Admin Kusuma Properti, saya tertarik dengan unit ${unitName} di Kalibata City. Apakah masih tersedia?`
      : "Halo Admin Kusuma Properti, saya ingin konsultasi seputar sewa unit di Kalibata City.";
    window.open(`https://wa.me/${targetAdminWa}?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (btnFloatingWa) btnFloatingWa.onclick = () => openWa();
  if (btnWidgetWa) btnWidgetWa.onclick = () => openWa();
  window.handleInquireUnit = openWa;
}

// 4. Widget Chatbot AI Landing Page
function initLandingChatbot() {
  const btnAi = document.getElementById("floating-btn-ai");
  const popup = document.getElementById("chat-popup");
  const btnClose = document.getElementById("widget-btn-close");
  const btnSend = document.getElementById("btn-widget-send");
  const inputMsg = document.getElementById("widget-input");
  const messagesBox = document.getElementById("widget-messages");

  if (!btnAi || !popup) return;

  btnAi.onclick = () => popup.classList.toggle("hidden");
  if (btnClose) btnClose.onclick = () => popup.classList.add("hidden");

  const sendAiChat = async (presetText = "") => {
    const text = presetText || (inputMsg ? inputMsg.value.trim() : "");
    if (!text) return;

    if (!presetText && inputMsg) inputMsg.value = "";

    messagesBox.innerHTML += `
      <div class="flex items-start justify-end gap-2.5">
        <div class="bg-[#8C5835] text-white p-3 rounded-2xl rounded-tr-none text-xs leading-relaxed shadow-sm max-w-[80%]">
          ${text}
        </div>
      </div>`;
    messagesBox.scrollTop = messagesBox.scrollHeight;

    const loadingId = "ai-loading-" + Date.now();
    messagesBox.innerHTML += `
      <div id="${loadingId}" class="flex items-start gap-2.5">
        <img src="img/kusuma-avatar.png" alt="AI" class="w-7 h-7 rounded-full object-cover border border-white shrink-0 shadow-sm">
        <div class="bg-white border border-[#E8DFD3] p-3 rounded-2xl rounded-tl-none text-[#737370] text-xs italic shadow-sm animate-pulse">
          Kusuma AI sedang mengetik...
        </div>
      </div>`;
    messagesBox.scrollTop = messagesBox.scrollHeight;

    try {
      const apiEndpoint = (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) 
        ? window.APP_CONFIG.API_BASE_URL 
        : "https://script.google.com/macros/s/AKfycbwM0tRCZvTd6qpWwGRzt6U14QUwtAI7gaxBAfsUAejM2kO1nLe9T90fcvjhqg2daLG4/exec";

      // Eksekusi GET dengan mode CORS dan follow redirect untuk bypass 302
      const targetUrl = `${apiEndpoint}?action=aiChatbot&message=${encodeURIComponent(text)}&senderPhone=Web_Lead&_t=${Date.now()}`;
      const res = await fetch(targetUrl, {
        method: "GET",
        mode: "cors",
        redirect: "follow"
      });

      if (!res.ok) {
        throw new Error("HTTP Status: " + res.status);
      }

      const data = await res.json();
      document.getElementById(loadingId)?.remove();

      const reply = (data && (data.reply || data.response || data.message))
        ? (data.reply || data.response || data.message)
        : "Terima kasih telah bertanya. Silakan hubungi tim admin kami via WhatsApp untuk detail unit lebih lengkap.";

      messagesBox.innerHTML += `
        <div class="flex items-start gap-2.5">
          <img src="img/kusuma-avatar.png" alt="AI" class="w-7 h-7 rounded-full object-cover border border-white shrink-0 shadow-sm">
          <div class="bg-white border border-[#E8DFD3] p-3 rounded-2xl rounded-tl-none text-[#2C2C2A] text-xs leading-relaxed shadow-sm">
            ${reply}
          </div>
        </div>`;
    } catch (e) {
      console.error("AI Chatbot Fetch Error:", e);
      document.getElementById(loadingId)?.remove();
      messagesBox.innerHTML += `
        <div class="flex items-start gap-2.5">
          <img src="img/kusuma-avatar.png" alt="AI" class="w-7 h-7 rounded-full object-cover border border-white shrink-0 shadow-sm">
          <div class="bg-white border border-[#E8DFD3] p-3 rounded-2xl rounded-tl-none text-[#B35436] text-xs shadow-sm">
            Koneksi ke asisten AI terganggu. Silakan langsung chat via WhatsApp admin.
          </div>
        </div>`;
    }
    messagesBox.scrollTop = messagesBox.scrollHeight;
  };

  if (btnSend) btnSend.onclick = () => sendAiChat();
  if (inputMsg) {
    inputMsg.onkeydown = (e) => {
      if (e.key === "Enter") sendAiChat();
    };
  }

  document.getElementById("quick-prompt-studio")?.addEventListener("click", () => sendAiChat("Berapa tarif sewa unit Studio per bulan di Kalibata City?"));
  document.getElementById("quick-prompt-parkir")?.addEventListener("click", () => sendAiChat("Bagaimana informasi dan ketentuan parkir mobil/motor di Kalibata City?"));
  document.getElementById("quick-prompt-2br")?.addEventListener("click", () => sendAiChat("Apakah saya bisa survei unit 2 Bedroom hari ini?"));
}