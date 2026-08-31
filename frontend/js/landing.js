/**
 * Kusuma Properti Manager - Landing Page Dynamic Engine
 * File: frontend/js/landing.js
 * Version: v148.0.0 (Zero-Regression Clean WhatsApp Link & Direct Edge Engine)
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

// 2. Muat Katalog Unit Populer
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
        <button onclick="handleInquireUnit(event, '${u.title}')" class="px-4 py-2 bg-[#8C5835] hover:bg-[#704326] text-white text-xs font-bold rounded-xl shadow-sm transition">
          Tanya Unit
        </button>
      </div>
    </div>
  `).join("");
}

// 3. Sinkronisasi & Penanganan Tombol WhatsApp (Anti-Double Text Guard)
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

  // Hapus listener duplikat dan pasang handler tunggal
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

  // Tautkan ke scope global secara aman
  window.handleInquireUnit = (e, uName) => {
    // Tangani kemungkinan passing parameter terbalik atau tanpa event
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
   - Estimasi 1 Tahun: Rp 30.000.000 - Rp 36.000.000 (bisa negosiasi).
2. Tipe 2 Bedroom (33 m2): Rp 3.800.000 - Rp 4.800.000 / bulan (2 Kamar Tidur, Ruang Keluarga, Dapur, Balkon).
   - Estimasi 6 Bulan: Rp 22.800.000 - Rp 28.000.000.
   - Estimasi 1 Tahun: Rp 42.000.000 - Rp 50.000.000.
3. Tipe Green Palace Resort / 3BR: Rp 5.000.000 - Rp 6.500.000 / bulan (Akses Kolam Renang Tematik Resort, Gym Indoor).
4. Fasilitas: Mall Kalibata City Square (KCS), Farmers Market, Cinema XXI, Food Court, Stasiun KRL Duren Kalibata (5 mnt jalan kaki).
5. Parkir: Basement mobil luas (tersedia sistem harian & member bulanan) dan gedung parkir motor bertingkat.

PEDOMAN MENJAWAB:
- Jawab dengan ramah, komunikatif, cerdas, dan langsung menjawab hitungan/pertanyaan spesifik pengguna.
- Jika pengguna bertanya perkiraan sewa beberapa bulan (misal 3 bulan, 6 bulan, atau 1 tahun), hitungkan perkiraan biayanya secara transparan.
- Tawarkan jadwal survei langsung di Tower Flamboyan Lt. GF atau hubungi WhatsApp 08135600058.
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
          contents: [
            {
              role: "user",
              parts: [{ text: `${KUSUMA_AI_SYSTEM_PROMPT}\n\nPertanyaan Pengguna: ${userText}` }]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 400
          }
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

// 6. Cadangan Pengetahuan Dinamis Lokal (Toleran Typo & Multi-Bulan)
function generateDynamicFallbackReply(promptText) {
  const q = String(promptText || "").toLowerCase().trim();

  if (q.includes("6 bulan") || q.includes("enam bulan") || q.includes("semester")) {
    return "Untuk sewa selama **6 bulan**, unit paling murah dan hemat adalah **Tipe Studio (21 m²)** dengan estimasi total sekitar **Rp 16.800.000 - Rp 19.500.000** (rata-rata Rp 2,8jt - 3,2jt/bulan dalam kondisi Full Furnished siap huni).\n\nSedangkan untuk unit **2 Bedroom (2 Kamar)** selama 6 bulan berkisar **Rp 22.800.000 - Rp 27.000.000**.\n\nBiaya tersebut sudah termasuk perabot lengkap di dalam unit. Anda dapat langsung survei unit ke kantor kami di **Tower Flamboyan Lt. GF** atau hubungi WhatsApp kami di **08135600058** untuk negosiasi jadwal.";
  }

  if (q.includes("1 tahun") || q.includes("setahun") || q.includes("tahunan") || q.includes("12 bulan")) {
    return "Untuk masa sewa **1 tahun (tahunan)**, Anda bisa mendapatkan harga yang lebih hemat:\n\n- **Studio (21 m²)**: Mulai dari **Rp 30.000.000 - Rp 36.000.000 / tahun**.\n- **2 Bedroom (33 m²)**: Mulai dari **Rp 42.000.000 - Rp 50.000.000 / tahun**.\n\nSemua unit siap huni dengan furnitur lengkap. Silakan konsultasikan pilihan tower favorit Anda via WhatsApp di **08135600058**.";
  }

  if (q.includes("murah") || q.includes("nurah") || q.includes("termurah") || q.includes("terendah") || q.includes("budget") || q.includes("hemat")) {
    return "Pilihan unit sewa **paling murah** di Apartemen Kalibata City adalah **Tipe Studio (luas 21 m²)** dengan tarif mulai **Rp 2.800.000 hingga Rp 3.500.000 per bulan** (Full Furnished siap huni dengan AC, spring bed, lemari, kitchen set, kulkas).\n\nUntuk tipe keluarga 2 Kamar (2BR), tarif mulai **Rp 3.800.000 / bulan**.\n\nSilakan kunjungi kantor kami di **Tower Flamboyan Lt. GF** atau chat WhatsApp **08135600058** untuk survei langsung hari ini.";
  }

  if (q.includes("parkir") || q.includes("mobil") || q.includes("motor")) {
    return "Kawasan Kalibata City menyediakan fasilitas parkir terpadu:\n\n1. **Parkir Mobil**: Tersedia di area basement gedung yang luas dengan sistem harian maupun member bulanan khusus penghuni.\n2. **Parkir Motor**: Disediakan area gedung parkir khusus roda dua.\n\nPengurusan member parkir dapat dibantu saat penandatanganan sewa unit di kantor kami di **Tower Flamboyan Lt. GF** (WA: **08135600058**).";
  }

  if (q.includes("studio")) {
    return "Unit tipe **Studio (21 m²)** disewakan dengan tarif **Rp 2.800.000 - Rp 3.500.000 / bulan** (Full Furnished). Sangat cocok untuk profesional muda atau mahasiswa yang membutuhkan akses cepat ke Stasiun KRL Duren Kalibata.";
  }

  if (q.includes("2br") || q.includes("2 kamar") || q.includes("survei")) {
    return "Unit tipe **2 Bedroom (33 m²)** disewakan dengan tarif **Rp 3.800.000 - Rp 4.800.000 / bulan**. Memiliki 2 kamar tidur, ruang keluarga, dan dapur lengkap. Kantor kami di **Tower Flamboyan Lt. GF** buka setiap hari untuk jadwal survei.";
  }

  return "Halo! Selamat datang di **Kusuma Properti** Kalibata City. 🙏\n\nKami mengelola puluhan unit sewa bulanan dan tahunan mulai dari tipe **Studio, 2BR, hingga 3BR** (siap huni & full furnished).\n\nAda yang bisa kami bantu seputar tarif sewa, perhitungan sewa 6 bulan/1 tahun, fasilitas parkir, atau survei di **Tower Flamboyan Lt. GF**?";
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

    if (!reply) {
      reply = generateDynamicFallbackReply(text);
    }

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