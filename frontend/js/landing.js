/**
 * Kusuma Properti Manager - Landing Page Dynamic Engine
 * File: frontend/js/landing.js
 * Version: v155.0.0 (Hard Cache Purge & Force Media Sync) (Zero-Regression Media Card & Multi-Container Resolver)
 */

document.addEventListener("DOMContentLoaded", () => {
  initVisualTheme();
  initDynamicUnits();
  initWhatsAppButtons();
  initLandingChatbot();
  updateHeroAndFooterCopy();
});

// 1. Terapkan Pengaturan Visual Japandi
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

// 2. Muat Katalog 3 Unit Populer Lengkap dengan Media Foto/Video
function initDynamicUnits() {
  var target = null;
  var els = document.querySelectorAll("*");
  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    if (el.children.length === 0 && el.textContent && el.textContent.trim().indexOf("Memuat katalog unit siap huni") !== -1) {
      target = el.parentElement || el;
      break;
    }
  }

  if (!target) {
    target = document.getElementById("dynamic-unit-catalog") || document.getElementById("popular-units-grid");
  }
  if (!target) return;

  var defaultUnits = [
    {
      badge: "Single / Eksekutif",
      title: "Studio Deluxe",
      desc: "Luas 21 m² • Full Furnished • AC, Spring Bed, Kitchen Set, Smart TV.",
      price: 3000000,
      mediaUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
    },
    {
      badge: "Paling Favorit",
      title: "2 Bedroom Standard",
      desc: "Luas 33 m² • 2 Kamar Tidur • Living Room, Dapur Lengkap, Balkon.",
      price: 4200000,
      mediaUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
    },
    {
      badge: "Green Palace",
      title: "3 Bedroom",
      desc: "Akses Kolam Renang Tematik • Gym Indoor • Interior Modern+ ev charger",
      price: 4000000,
      mediaUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"
    }
  ];

  var units = defaultUnits;
  var savedCMS = localStorage.getItem("KUSUMA_POPULAR_UNITS_CMS");
  if (savedCMS) {
    try {
      var d = JSON.parse(savedCMS);
      units = defaultUnits.map(function(def, idx) {
        var u = d["u" + (idx + 1)] || {};
        var validMedia = (u.mediaUrl && u.mediaUrl.trim().length > 10) ? u.mediaUrl.trim() : def.mediaUrl;
        return {
          badge: (u.badge && u.badge.trim() !== "") ? u.badge.trim() : def.badge,
          title: (u.title && u.title.trim() !== "") ? u.title.trim() : def.title,
          desc: (u.desc && u.desc.trim() !== "") ? u.desc.trim() : def.desc,
          price: (u.price !== undefined && u.price !== "") ? Number(u.price) : def.price,
          mediaUrl: validMedia
        };
      });
    } catch (e) {
      units = defaultUnits;
    }
  }

  target.className = "grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-8";
  target.innerHTML = units.map(function(u, idx) {
    var rawMedia = (u.mediaUrl && u.mediaUrl.trim().length > 10) ? u.mediaUrl.trim() : defaultUnits[idx].mediaUrl;
    var isVideo = rawMedia.indexOf("data:video") === 0 || rawMedia.endsWith(".mp4") || rawMedia.endsWith(".webm");
    
    var mediaHtml = "";
    if (isVideo) {
      mediaHtml = '<div class="w-full h-48 rounded-2xl overflow-hidden mb-4 relative bg-black"><video src="' + rawMedia + '" autoplay muted loop playsinline class="w-full h-full object-cover"></video><span class="absolute top-2 right-2 px-2 py-0.5 bg-black/60 text-white rounded text-[10px] font-bold">VIDEO TOUR</span></div>';
    } else {
      mediaHtml = '<div class="w-full h-48 rounded-2xl overflow-hidden mb-4 relative bg-[#F4EFE6]"><img src="' + rawMedia + '" alt="' + u.title + '" loading="lazy" class="w-full h-full object-cover transition duration-500 hover:scale-105" onerror="this.src=\'' + defaultUnits[idx].mediaUrl + '\'"><span class="absolute top-2 right-2 px-2.5 py-1 bg-[#2C2C2A]/70 text-white rounded-lg text-[10px] font-bold tracking-wider uppercase">FOTO ASLI</span></div>';
    }

    return '<div class="japandi-card p-5 sm:p-6 rounded-3xl flex flex-col justify-between space-y-3 bg-white/90 border border-[#E8DFD3] shadow-sm hover:shadow-md transition">' +
      '<div>' +
        mediaHtml +
        '<div class="space-y-1.5">' +
          '<span class="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#F4EFE6] text-[#8C5835] border border-[#DDD3C2]">' + u.badge + '</span>' +
          '<h4 class="text-lg font-bold text-[#2C2C2A]">' + u.title + '</h4>' +
          '<p class="text-xs text-[#737370] leading-relaxed">' + u.desc + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="pt-3 border-t border-[#E8DFD3] flex items-center justify-between">' +
        '<div>' +
          '<span class="text-[10px] text-[#737370] uppercase">Mulai Dari</span>' +
          '<p class="text-base font-bold font-mono text-[#8C5835]">Rp ' + Number(u.price).toLocaleString("id-ID") + '<span class="text-xs font-normal text-[#737370]">/bln</span></p>' +
        '</div>' +
        '<button onclick="handleInquireUnit(event, \'' + u.title + '\')" class="px-4 py-2 bg-[#8C5835] hover:bg-[#704326] text-white text-xs font-bold rounded-xl shadow-sm transition">Tanya Unit</button>' +
      '</div>' +
    '</div>';
  }).join("");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDynamicUnits);
} else {
  initDynamicUnits();
}

// 3. Sinkronisasi & Penanganan Tombol WhatsApp
let targetAdminWa = (window.APP_CONFIG && window.APP_CONFIG.DEFAULT_WA) ? window.APP_CONFIG.DEFAULT_WA : "628135600058";

function buildSingleWaLink(unitName = "") {
  const baseWaNumber = String(targetAdminWa).replace(/\D/g, "") || "628135600058";
  const cleanUnit = (typeof unitName === "string" && unitName.trim() && unitName !== "[object MouseEvent]") ? unitName.trim() : "";
  
  const textMessage = cleanUnit 
    ? `Halo Admin Kusuma Properti, saya tertarik dengan unit ${cleanUnit} di Kalibata City. Apakah masih tersedia?`
    : "Halo Admin Kusuma Properti, saya ingin konsultasi seputar sewa unit di Kalibata City.";
    
  return `https://wa.me/${baseWaNumber}?text=${encodeURIComponent(textMessage)}`;
}

function openCleanWhatsApp(e, unitName = "") {
  if (e && typeof e.preventDefault === "function") {
    e.preventDefault();
    e.stopPropagation();
  }
  const url = buildSingleWaLink(unitName);
  window.open(url, "_blank", "noopener,noreferrer");
}

function initWhatsAppButtons() {
  const btnHeaderWa = document.getElementById("header-btn-wa");
  const btnFloatingWa = document.getElementById("floating-btn-wa");
  const btnWidgetWa = document.getElementById("widget-btn-wa");

  if (btnHeaderWa) {
    btnHeaderWa.removeAttribute("href");
    btnHeaderWa.onclick = (e) => openCleanWhatsApp(e, "");
  }
  if (btnFloatingWa) {
    btnFloatingWa.removeAttribute("href");
    btnFloatingWa.onclick = (e) => openCleanWhatsApp(e, "");
  }
  if (btnWidgetWa) {
    btnWidgetWa.removeAttribute("href");
    btnWidgetWa.onclick = (e) => openCleanWhatsApp(e, "");
  }

  window.handleInquireUnit = (e, uName) => {
    if (typeof e === "string" && !uName) {
      openCleanWhatsApp(null, e);
    } else {
      openCleanWhatsApp(e, uName);
    }
  };
}

// 4. Prompt System & Knowledge Base Kalibata City
const KUSUMA_AI_SYSTEM_PROMPT = `
Anda adalah 'Kusuma AI Concierge', Asisten Konsultan Real Estate Resmi Kusuma Properti di Apartemen Kalibata City, Jakarta Selatan.
Lokasi Kantor: Tower Flamboyan Lt. GF (Ground Floor).
WhatsApp Resmi Pengelola: 08135600058.

DATABASE HARGA & FASILITAS KALIBATA CITY:
1. Tipe Studio (21 m2): Rp 2.800.000 - Rp 3.500.000 / bulan (Full Furnished, AC, Spring Bed, Kitchen Set, Lemari).
   - Estimasi 6 Bulan: Rp 16.800.000 - Rp 21.000.000.
   - Estimasi 1 Tahun: Rp 30.000.000 - Rp 36.000.000.
2. Tipe 2 Bedroom (33 m2): Rp 3.800.000 - Rp 4.800.000 / bulan (2 Kamar Tidur, Ruang Keluarga, Dapur, Balkon).
   - Estimasi 6 Bulan: Rp 22.800.000 - Rp 28.000.000.
   - Estimasi 1 Tahun: Rp 42.000.000 - Rp 50.000.000.
3. Tipe Green Palace Resort / 3BR: Rp 5.000.000 - Rp 6.500.000 / bulan (Akses Kolam Renang Tematik Resort, Gym Indoor).
4. Fasilitas: Mall Kalibata City Square (KCS), Farmers Market, Cinema XXI, Food Court, Stasiun KRL Duren Kalibata (5 mnt jalan kaki).
5. Parkir: Basement mobil luas (tersedia sistem harian & member bulanan) dan gedung parkir motor bertingkat.
`;

// 5. Mesin Pemanggil Gemini AI Realtime
async function fetchGeminiRealAIReply(userText) {
  const apiKey = (window.APP_CONFIG && window.APP_CONFIG.GEMINI_API_KEY) ? window.APP_CONFIG.GEMINI_API_KEY : "";
  if (!apiKey) return null;

  const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest"];
  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `${KUSUMA_AI_SYSTEM_PROMPT}\n\nPertanyaan Pengguna: ${userText}` }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 400 }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content?.parts?.length > 0) {
          return data.candidates[0].content.parts[0].text;
        }
      }
    } catch (e) {
      console.warn(`Gagal memanggil model ${model}:`, e);
    }
  }
  return null;
}

// 6. Cadangan Pengetahuan Dinamis Lokal
function generateDynamicFallbackReply(promptText) {
  const q = String(promptText || "").toLowerCase().trim();

  if (q.includes("6 bulan") || q.includes("enam bulan") || q.includes("semester")) {
    return "Untuk sewa selama **6 bulan**, unit paling murah dan hemat adalah **Tipe Studio (21 m²)** dengan estimasi total sekitar **Rp 16.800.000 - Rp 19.500.000** (Full Furnished siap huni).\n\nSedangkan untuk unit **2 Bedroom (2 Kamar)** selama 6 bulan berkisar **Rp 22.800.000 - Rp 27.000.000**.\n\nSilakan jadwalkan survei ke kantor kami di **Tower Flamboyan Lt. GF** atau kontak WhatsApp **08135600058**.";
  }

  if (q.includes("murah") || q.includes("nurah") || q.includes("termurah") || q.includes("budget")) {
    return "Pilihan unit sewa **paling murah** di Apartemen Kalibata City adalah **Tipe Studio (luas 21 m²)** dengan tarif mulai **Rp 2.800.000 hingga Rp 3.500.000 per bulan** (Full Furnished siap huni).\n\nUntuk tipe keluarga 2 Kamar (2BR), tarif mulai **Rp 3.800.000 / bulan**.\n\nSilakan kunjungi kantor kami di **Tower Flamboyan Lt. GF** atau chat WhatsApp **08135600058**.";
  }

  if (q.includes("parkir") || q.includes("mobil") || q.includes("motor")) {
    return "Kawasan Kalibata City menyediakan fasilitas parkir terpadu:\n\n1. **Parkir Mobil**: Tersedia di area basement gedung yang luas dengan sistem harian maupun member bulanan khusus penghuni.\n2. **Parkir Motor**: Disediakan area gedung parkir khusus roda dua.\n\nPengurusan member parkir dapat dibantu langsung di kantor kami di **Tower Flamboyan Lt. GF** (WA: **08135600058**).";
  }

  return "Halo! Selamat datang di **Kusuma Properti** Kalibata City. 🙏\n\nKami mengelola puluhan unit sewa bulanan dan tahunan mulai dari tipe **Studio, 2BR, hingga 3BR** (siap huni & full furnished).\n\nAda yang bisa kami bantu seputar tarif sewa, perhitungan sewa multi-bulan, atau jadwal survei di **Tower Flamboyan Lt. GF**?";
}

// 7. Widget Chatbot AI Controller
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
            Kusuma AI sedang menganalisa...
          </div>
        </div>`;
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }

    let reply = await fetchGeminiRealAIReply(text);
    if (!reply) reply = generateDynamicFallbackReply(text);

    document.getElementById(loadingId)?.remove();

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

  document.getElementById("quick-prompt-studio")?.addEventListener("click", () => sendAiChat("Berapa tarif sewa unit Studio per bulan di Kalibata City?"));
  document.getElementById("quick-prompt-parkir")?.addEventListener("click", () => sendAiChat("Bagaimana informasi dan ketentuan parkir mobil/motor di Kalibata City?"));
  document.getElementById("quick-prompt-2br")?.addEventListener("click", () => sendAiChat("Apakah saya bisa survei unit 2 Bedroom hari ini?"));
}

// 8. Surgical Copy Updater
function updateHeroAndFooterCopy() {
  const allLinksAndButtons = document.querySelectorAll('a, button');
  allLinksAndButtons.forEach(el => {
    const text = el.textContent || "";
    if (text.includes("Lihat Unit") || text.includes("disewa dan dijual") || text.includes("click \"Cari\"") || text.includes("Tampilkan")) {
      el.textContent = "Lihat unit disewa dan dijual";
    }
  });

  const allFooterElements = document.querySelectorAll('footer p, footer div, footer span, p, div');
  allFooterElements.forEach(el => {
    const text = el.textContent || "";
    if (text.includes("Kalibata City Haven") || (text.includes("Kusuma Properti ©") && text.includes("Haven"))) {
      el.textContent = "Kusuma Properti © 2026 - Kalibata City";
    }
  });
}

















