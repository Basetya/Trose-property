/**
 * Trose Property Manager - Rose AI Concierge Context Engine (v6.7)
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
      appendWidgetMessage(generateSmartKnowledgeReply(message), "ai");
    }
  } catch (err) {
    typing.remove();
    appendWidgetMessage(generateSmartKnowledgeReply(message), "ai");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>`;
  }
}

function generateSmartKnowledgeReply(userQuery) {
  const q = String(userQuery || '').toLowerCase();
  
  if (q.includes("harian") || q.includes("hari") || q.includes("malam") || q.includes("transit") || q.includes("short stay")) {
    return "Mohon maaf, saat ini kami tidak menyediakan fasilitas sewa harian. Trose Property berfokus melayani sewa bulanan (mulai Rp 3 Jt/bln) dan sewa tahunan demi kenyamanan, keamanan, serta privasi optimal penghuni. Apakah Anda ingin melihat pilihan unit bulanan kami?";
  }
  if (q.includes("studio") || q.includes("harga") || q.includes("biaya") || q.includes("rate") || q.includes("tarif") || q.includes("sewa")) {
    return "Pilihan sewa unit bulanan resmi di Kalibata City:\n- Studio Deluxe: Mulai Rp 3.000.000/bln\n- 2 Bedroom Standard: Mulai Rp 4.200.000/bln\n- 2 Bedroom Green Palace: Mulai Rp 5.500.000/bln\nSemua unit Full Furnished (AC, Springbed, Kitchen Set, TV). Tersedia juga opsi sewa tahunan lebih hemat.";
  }
  if (q.includes("fasilitas") || q.includes("kolam") || q.includes("gym") || q.includes("mall") || q.includes("green palace")) {
    return "Fasilitas kawasan Superblock Kalibata City:\n- Mall Kalibata City Square (KCS) langsung di bawah hunian (Farmers Market, Bioskop XXI, food court).\n- Kolam renang dewasa & anak, Gym, Lapangan Tenis/Futsal di Green Palace.\n- Keamanan kartu akses lift 24 jam & Masjid Raya Nurullah.";
  }
  if (q.includes("lokasi") || q.includes("stasiun") || q.includes("krl") || q.includes("alamat")) {
    return "Lokasi di Jl. Raya Kalibata No.1, Pancoran, Jakarta Selatan. Hanya 2 menit jalan kaki (200m) ke Stasiun KRL Duren Kalibata dan 10-15 menit ke kawasan bisnis Kuningan / Gatot Subroto.";
  }
  if (q.includes("survei") || q.includes("viewing") || q.includes("lihat")) {
    return "Jadwal survei unit (viewing) buka setiap hari (09.00 - 18.00 WIB). Silakan klik tombol 'WA' di kanan atas untuk janjian waktu kunjungan bersama tim kami.";
  }

  return "Halo! Saya Rose, asisten virtual Apartemen Kalibata City. Kami menyediakan unit Studio & 2BR siap huni (bulanan dan tahunan). Ada yang bisa saya bantu seputar harga, fasilitas, atau jadwal survei?";
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
      <div class="w-6 h-6 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-white text-[10px] shrink-0">R</div>
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