/**
 * Kusuma Properti Manager - Landing Page Dynamic Engine
 * File: frontend/js/landing.js
 * Version: v113.0.0 (Anti-CORS Robust AI Handshake & Japandi Visual Baseline)
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
  const btnAi = document.getElementById("floating-btn-ai") || document.getElementById("chatToggleBtn");
  const popup = document.getElementById("chat-popup") || document.getElementById("chatWidget");
  const btnClose = document.getElementById("widget-btn-close") || document.getElementById("chatCloseBtn");
  const btnSend = document.getElementById("btn-widget-send") || document.getElementById("chatSendBtn");
  const inputMsg = document.getElementById("widget-input") || document.getElementById("chatInput");
  const messagesBox = document.getElementById("widget-messages") || document.getElementById("chatMessages");

  if (!btnAi || !popup) return;

  btnAi.onclick = () => popup.classList.toggle("hidden");
  if (btnClose) btnClose.onclick = () => popup.classList.add("hidden");

  const sendAiChat = async (presetText = "") => {
    const text = presetText || (inputMsg ? inputMsg.value.trim() : "");
    if (!text) return;

    if (!presetText && inputMsg) inputMsg.value = "";

    if (messagesBox) {
      messagesBox.innerHTML += `
        <div class="flex items-start justify-end gap-2.5 my-2">
          <div class="bg-[#8C5835] text-white p-3 rounded-2xl rounded-tr-none text-xs leading-relaxed shadow-sm max-w-[80%]">
            ${text}
          </div>
        </div>`;
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }

    const loadingId = "ai-loading-" + Date.now();
    if (messagesBox) {
      messagesBox.innerHTML += `
        <div id="${loadingId}" class="flex items-start gap-2.5 my-2">
          <img src="img/kusuma-avatar.png" onerror="this.src='https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&q=80'" alt="AI" class="w-7 h-7 rounded-full object-cover border border-white shrink-0 shadow-sm">
          <div class="bg-white border border-[#E8DFD3] p-3 rounded-2xl rounded-tl-none text-[#737370] text-xs italic shadow-sm animate-pulse">
            Kusuma AI sedang mengetik...
          </div>
        </div>`;
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }

    try {
      const apiEndpoint = (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) 
        ? window.APP_CONFIG.API_BASE_URL 
        : "https://script.google.com/macros/s/AKfycbwM0tRCZvTd6qpWwGRzt6U14QUwtAI7gaxBAfsUAejM2kO1nLe9T90fcvjhqg2daLG4/exec";

      // 1. Coba Request POST Anti-CORS
      let reply = "";
      try {
        const postRes = await fetch(apiEndpoint, {
          method: "POST",
          mode: "cors",
          redirect: "follow",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            action: "aiChatbot",
            message: text,
            prompt: text,
            senderPhone: "Web_Lead"
          })
        });
        if (postRes.ok) {
          const postData = await postRes.json();
          reply = postData.reply || postData.response || postData.message || "";
        }
      } catch (errPost) {
        console.warn("POST fetch gagal, beralih ke GET fallback:", errPost);
      }

      // 2. Jika POST gagal, otomatis gunakan GET Fallback
      if (!reply) {
        const getUrl = `${apiEndpoint}?action=aiChatbot&message=${encodeURIComponent(text)}&senderPhone=Web_Lead&_t=${Date.now()}`;
        const getRes = await fetch(getUrl, {
          method: "GET",
          mode: "cors",
          redirect: "follow"
        });
        if (getRes.ok) {
          const getData = await getRes.json();
          reply = getData.reply || getData.response || getData.message || "";
        }
      }

      document.getElementById(loadingId)?.remove();

      if (!reply) {
        reply = "Halo! Terima kasih telah menghubungi Kusuma Properti Kalibata City. 🙏\n\nUntuk konsultasi unit dan survei langsung ke Tower Flamboyan Lt. GF, Anda dapat langsung menghubungi WhatsApp resmi kami di 08135600058.";
      }

      if (messagesBox) {
        messagesBox.innerHTML += `
          <div class="flex items-start gap-2.5 my-2">
            <img src="img/kusuma-avatar.png" onerror="this.src='https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&q=80'" alt="AI" class="w-7 h-7 rounded-full object-cover border border-white shrink-0 shadow-sm">
            <div class="bg-white border border-[#E8DFD3] p-3 rounded-2xl rounded-tl-none text-[#2C2C2A] text-xs leading-relaxed shadow-sm whitespace-pre-line">
              ${reply}
            </div>
          </div>`;
        messagesBox.scrollTop = messagesBox.scrollHeight;
      }

    } catch (e) {
      console.error("AI Chatbot Fetch Fatal Error:", e);
      document.getElementById(loadingId)?.remove();
      if (messagesBox) {
        messagesBox.innerHTML += `
          <div class="flex items-start gap-2.5 my-2">
            <img src="img/kusuma-avatar.png" onerror="this.src='https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&q=80'" alt="AI" class="w-7 h-7 rounded-full object-cover border border-white shrink-0 shadow-sm">
            <div class="bg-white border border-[#E8DFD3] p-3 rounded-2xl rounded-tl-none text-[#2C2C2A] text-xs leading-relaxed shadow-sm whitespace-pre-line">
              Halo! Terima kasih atas pertanyaan Anda. Silakan langsung hubungi WhatsApp resmi admin kami di 08135600058 atau kunjungi kantor kami di Tower Flamboyan Lt. GF untuk survei unit.
            </div>
          </div>`;
        messagesBox.scrollTop = messagesBox.scrollHeight;
      }
    }
  };

  if (btnSend) btnSend.onclick = (e) => { e?.preventDefault(); sendAiChat(); };
  if (inputMsg) {
    inputMsg.onkeydown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendAiChat();
      }
    };
  }

  // Quick Prompt Listeners
  document.getElementById("quick-prompt-studio")?.addEventListener("click", () => sendAiChat("Berapa tarif sewa unit Studio per bulan di Kalibata City?"));
  document.getElementById("quick-prompt-parkir")?.addEventListener("click", () => sendAiChat("Bagaimana informasi dan ketentuan parkir mobil/motor di Kalibata City?"));
  document.getElementById("quick-prompt-2br")?.addEventListener("click", () => sendAiChat("Apakah saya bisa survei unit 2 Bedroom hari ini?"));

  // Delegasi klik tombol quick pill berbasis teks
  document.querySelectorAll("[data-quick-topic], .quick-topic-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const topic = btn.textContent.trim();
      if (topic.includes("Studio")) sendAiChat("Berapa tarif sewa unit Studio per bulan di Kalibata City?");
      else if (topic.includes("Parkir")) sendAiChat("Bagaimana informasi dan ketentuan parkir mobil/motor di Kalibata City?");
      else if (topic.includes("2BR")) sendAiChat("Apakah saya bisa survei unit 2 Bedroom hari ini?");
      else sendAiChat(topic);
    });
  });
}