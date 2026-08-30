/**
 * Kusuma Properti Manager - Landing Page Dynamic Engine
 * File: frontend/js/landing.js
 * Version: v140.0.0 (Zero-Regression Edge AI & Surgical Copy Engine)
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
        <button onclick="handleInquireUnit('${u.title}')" class="px-4 py-2 bg-[#8C5835] hover:bg-[#704326] text-white text-xs font-bold rounded-xl shadow-sm transition">
          Tanya Unit
        </button>
      </div>
    </div>
  `).join("");
}

// 3. Sinkronisasi Tombol WhatsApp
let targetAdminWa = (window.APP_CONFIG && window.APP_CONFIG.DEFAULT_WA) ? window.APP_CONFIG.DEFAULT_WA : "628135600058";

function initWhatsAppButtons() {
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

// 4. Knowledge Engine Kusuma AI (Edge Realtime Intelligence)
function generateInstantAIReply(promptText) {
  const query = String(promptText || "").toLowerCase().trim();

  // A. Pertanyaan Mengenai Tarif & Tipe Studio
  if (query.includes("studio") || (query.includes("tarif") && !query.includes("2br") && !query.includes("parkir")) || query.includes("1 kamar")) {
    return "Untuk unit tipe Studio (luas 21 m²) di Apartemen Kalibata City, tarif sewa berkisar antara **Rp 2.800.000 hingga Rp 3.500.000 / bulan** untuk kondisi Full Furnished siap huni.\n\nFasilitas unit sudah lengkap dengan AC, spring bed, lemari pakaian, kitchen set, kulkas, dan kamar mandi. Anda dapat langsung survei unit ke kantor kami di **Tower Flamboyan Lt. GF** atau klik tombol WhatsApp untuk konfirmasi ketersediaan.";
  }

  // B. Pertanyaan Mengenai Parkir Mobil / Motor
  if (query.includes("parkir") || query.includes("mobil") || query.includes("motor") || query.includes("kendaraan")) {
    return "Fasilitas parkir di kawasan Apartemen Kalibata City terbagi menjadi dua area:\n\n1. **Parkir Mobil**: Berada di area basement gedung yang luas dan aman. Tersedia sistem tarif harian/berkala serta langganan kartu member bulanan khusus penghuni.\n2. **Parkir Motor**: Disediakan gedung parkir bertingkat khusus roda dua.\n\nUntuk pengurusan stiker/kartu akses member parkir dan reservasi unit hunian, Anda bisa langsung berkonsultasi di kantor kami di **Tower Flamboyan Lt. GF** atau hubungi WhatsApp pengelola di **08135600058**.";
  }

  // C. Pertanyaan Mengenai Unit 2 Bedroom (2BR) & Survei
  if (query.includes("2br") || query.includes("2 kamar") || query.includes("survei") || query.includes("lihat unit")) {
    return "Unit tipe **2 Bedroom (luas 33 m²)** merupakan tipe paling favorit untuk keluarga kecil maupun sharing bersama teman. Tarif sewa berkisar antara **Rp 3.800.000 hingga Rp 4.800.000 / bulan** (Full Furnished).\n\nLayout unit mencakup 2 kamar tidur terpisah, ruang keluarga yang nyaman, area dapur lengkap, dan balkon pribadi.\n\nKantor kami di **Tower Flamboyan Lt. GF** buka setiap hari untuk jadwal survei langsung. Silakan hubungi WhatsApp kami di **08135600058** untuk menentukan jam kunjungan survei hari ini!";
  }

  // D. Pertanyaan Mengenai Fasilitas & Lokasi Kalibata City
  if (query.includes("fasilitas") || query.includes("mall") || query.includes("kolam") || query.includes("stasiun") || query.includes("lokasi") || query.includes("akses")) {
    return "Tinggal di Kalibata City memberikan kemudahan akses hidup lengkap:\n\n- **Konektivitas**: Hanya 5 menit jalan kaki ke Stasiun KRL Duren Kalibata dan akses cepat menuju Kuningan / Gatot Subroto.\n- **Pusat Belanja**: Terhubung langsung ke Mall Kalibata City Square (KCS), Farmers Market, Bioskop Cinema XXI, dan beragam gerai kuliner.\n- **Fasilitas Rekreasi**: Kolam renang tematik (di tower Green Palace), lapangan basket, tenis, futsal, jogging track, dan gym indoor.\n\nTim Kusuma Properti berkantor langsung di lokasi (**Tower Flamboyan Lt. GF**) sehingga siap mendampingi Anda kapan saja.";
  }

  // E. Pertanyaan Mengenai Tipe 3 Bedroom / Green Palace
  if (query.includes("3br") || query.includes("3 kamar") || query.includes("green palace") || query.includes("resort")) {
    return "Untuk hunian yang lebih luas atau nuansa resort di **Green Palace Kalibata**, tarif sewa unit tipe 2BR Executive dan 3 Bedroom berkisar antara **Rp 5.000.000 hingga Rp 6.500.000 / bulan**.\n\nPenghuni Green Palace mendapatkan akses eksklusif ke kolam renang tematik resort, gym indoor, dan lingkungan taman yang lebih privat. Hubungi kami via WhatsApp untuk mengecek unit kosong siap sewa.";
  }

  // F. Respon Sambutan Umum
  return "Halo! Selamat datang di **Kusuma Properti** Kalibata City. 🙏\n\nKami mengelola puluhan unit sewa bulanan dan tahunan mulai dari tipe **Studio, 2BR, hingga 3BR** (siap huni & full furnished).\n\nAda yang bisa kami bantu seputar tarif sewa, fasilitas parkir, atau pendaftaran jadwal survei ke kantor kami di **Tower Flamboyan Lt. GF**?";
}

// 5. Widget Chatbot AI Controller
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

    // Tampilkan pesan pengguna di jendela chat
    if (messagesBox) {
      messagesBox.innerHTML += `
        <div class="flex items-start justify-end gap-2.5 my-2">
          <div class="bg-[#8C5835] text-white p-3 rounded-2xl rounded-tr-none text-xs leading-relaxed shadow-sm max-w-[80%]">
            ${text}
          </div>
        </div>`;
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }

    // Tampilkan indikator mengetik
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

    // Simulasi jeda alami 400ms
    await new Promise(resolve => setTimeout(resolve, 400));

    // Eksekusi jawaban cerdas real-time
    const reply = generateInstantAIReply(text);

    // Hapus indikator mengetik
    document.getElementById(loadingId)?.remove();

    // Tampilkan balasan Kusuma AI
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

  // Quick Prompt Bindings
  document.getElementById("quick-prompt-studio")?.addEventListener("click", () => sendAiChat("Berapa tarif sewa unit Studio per bulan di Kalibata City?"));
  document.getElementById("quick-prompt-parkir")?.addEventListener("click", () => sendAiChat("Bagaimana informasi dan ketentuan parkir mobil/motor di Kalibata City?"));
  document.getElementById("quick-prompt-2br")?.addEventListener("click", () => sendAiChat("Apakah saya bisa survei unit 2 Bedroom hari ini?"));

  // Event Listener tombol opsi cepat
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

// 6. Surgical Copy Updater (Pengubah Teks Aman Tanpa Sentuh index.html)
function updateHeroAndFooterCopy() {
  // A. Perbarui Teks Tombol CTA Hero
  const allLinksAndButtons = document.querySelectorAll('a, button');
  allLinksAndButtons.forEach(el => {
    const text = el.textContent || "";
    if (text.includes("Lihat Unit") || text.includes("disewa dan dijual") || text.includes("click \"Cari\"") || text.includes("Tampilkan")) {
      el.textContent = "Lihat unit disewa dan dijual";
    }
  });

  // B. Perbarui Teks Copyright di Footer
  const allFooterElements = document.querySelectorAll('footer p, footer div, footer span, p, div');
  allFooterElements.forEach(el => {
    const text = el.textContent || "";
    if (text.includes("Kalibata City Haven") || (text.includes("Kusuma Properti ©") && text.includes("Haven"))) {
      el.textContent = "Kusuma Properti © 2026 - Kalibata City";
    }
  });
}