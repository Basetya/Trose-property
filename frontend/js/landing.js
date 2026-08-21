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
    return "Untuk sewa unit harian di Apartemen Kalibata City, kami menyediakan unit Studio dan 2BR full-furnished (mulai Rp300rbâ€“Rp450rb/malam) tergantung ketersediaan. Silakan klik tombol 'WA' untuk booking instan dengan admin.";
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
    return "Tentu! Jadwal survei unit (viewing) buka setiap hari (Seninâ€“Minggu, 09.00â€“18.00 WIB). Silakan klik tombol 'WA' di kanan atas untuk konfirmasi jam kedatangan Anda dengan tim pengelola.";
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