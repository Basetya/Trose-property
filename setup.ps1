# ==============================================================================
# Trose-property - 1-Click Setup (Rose AI Intelligent Knowledge Engine v7.8)
# ==============================================================================

Write-Host "Upgrading Rose AI Knowledge Engine & Jam Operasional Mall KB v7.8..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "backend", "frontend/css", "frontend/js", "frontend/img", "scripts" | Out-Null

$Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False

# ------------------------------------------------------------------------------
# 1. backend/GeminiCRM.gs
# ------------------------------------------------------------------------------
Write-Host "Updating backend/GeminiCRM.gs (Gemini 1.5 Flash Resilient Hook)..." -ForegroundColor Yellow
$geminiGs = @'
/**
 * Trose Property Manager - Rose AI Concierge Engine (v7.8)
 * Dynamic Knowledge Base & Gemini 1.5 Flash API Connector
 * File: backend/GeminiCRM.gs
 */

function handleGeminiAiChat(userMessage, senderIdentifier) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const apiKey = scriptProperties.getProperty("GEMINI_API_KEY");

  // 1. Ambil Knowledge Base & Guardrails Dinamis
  const storedKb = scriptProperties.getProperty("AI_KNOWLEDGE_BASE");
  const storedGr = scriptProperties.getProperty("AI_GUARDRAILS");

  const customKnowledgeBase = storedKb !== null && storedKb !== "" ? storedKb : getDefaultKnowledgeBase();
  const customGuardrails = storedGr !== null && storedGr !== "" ? storedGr : getDefaultGuardrails();

  // 2. Ambil data inventori unit aktual dari tab 02_UNITS Google Sheets
  let liveUnitInventory = "";
  try {
    const units = getSheetDataAsJson("02_UNITS");
    const availableUnits = units.filter(u => u.Status === "Available");
    if (availableUnits.length > 0) {
      liveUnitInventory = "DAFTAR UNIT TERSEDIA SAAT INI (REAL-TIME SHEETS DATABASE):\n";
      availableUnits.forEach(u => {
        liveUnitInventory += `- ${u.Tower} No.${u.Unit_No} (${u.Type}): Rp${Number(u.Base_Rent).toLocaleString("id-ID")}/bln (Rute: ${u.Payment_Route}).\n`;
      });
    } else {
      liveUnitInventory = "STATUS UNIT: Saat ini belum ada unit kosong yang terdaftar di sistem.\n";
    }
  } catch (e) {
    liveUnitInventory = "Katalog sewa bulanan dan tahunan Kalibata City aktif.\n";
  }

  // 3. Verifikasi Identitas Pengguna (Single ID / WhatsApp)
  const cleanId = String(senderIdentifier || '').replace(/[^a-zA-Z0-9-]/g, '');
  let verifiedCustomerContext = "";

  try {
    const contacts = getSheetDataAsJson("03_CONTACTS_360");
    const leases = getSheetDataAsJson("04_LEASES");
    const invoices = getSheetDataAsJson("05_INVOICES");

    let matchedContact = contacts.find(c => 
      (c.Phone_WA && String(c.Phone_WA).replace(/[^0-9]/g, '') === cleanId) ||
      (c.Contact_ID && String(c.Contact_ID).trim().toLowerCase() === cleanId.toLowerCase())
    );

    if (matchedContact) {
      const userLease = leases.find(l => String(l.Tenant_ID).trim() === String(matchedContact.Contact_ID).trim() && l.Status === "Active");
      const userInvoices = invoices.filter(inv => userLease && String(inv.Lease_ID).trim() === String(userLease.Lease_ID).trim());
      
      verifiedCustomerContext = `\n[DATA PENYEWA TERVERIFIKASI SISTEM]\n` +
        `- Nama: ${matchedContact.Full_Name}\n` +
        `- Status: ${matchedContact.Role}\n` +
        (userLease ? `- Kontrak Unit: ${userLease.Unit_ID} (Berakhir: ${userLease.End_Date}, Sewa: Rp${Number(userLease.Monthly_Rent).toLocaleString('id-ID')}/bln)\n` : "- Belum memiliki kontrak aktif.\n") +
        `- Tagihan: ${userInvoices.length} total (${userInvoices.filter(i => i.Status === 'Unpaid').length} belum lunas).\n`;
    }
  } catch (err) {
    Logger.log("Customer context resolution error: " + err.toString());
  }

  // Fallback respons lokal jika GEMINI_API_KEY belum terpasang
  if (!apiKey) {
    return {
      success: true,
      reply: generateStructuredOfflineAnswer(userMessage, customKnowledgeBase, customGuardrails)
    };
  }

  // 4. Master Prompt Directive
  const systemPrompt = `Anda adalah "Rose", Asisten Virtual AI & Leasing Concierge resmi untuk Trose Property di Superblock Apartemen Kalibata City, Jakarta Selatan.

=== INFORMASI OPERASIONAL & KNOWLEDGE BASE ===
- Jam Operasional Mall Kalibata City Square (KCS): Buka setiap hari pukul 10.00 WIB s/d 22.00 WIB (Supermarket Farmers Market buka lebih awal mulai pukul 08.00 WIB).
- Jam Operasional Kantor Pengelola & Jadwal Survei (Viewing): Buka setiap hari (Senin - Minggu) pukul 09.00 - 18.00 WIB.
- Kebijakan Sewa: HANYA melayani sewa BULANAN (mulai Rp 3 Jt/bln) dan TAHUNAN (mulai Rp 32 Jt/thn). Fasilitas sewa harian TIDAK TERSEDIA.

=== KNOWLEDGE BASE AKTIF DARI PENGELOLA ===
${customKnowledgeBase}

=== LIVE INVENTORY DARI GOOGLE SHEETS ===
${liveUnitInventory}

=== ATURAN GUARDRAILS & KEBIJAKAN RESPON ===
${customGuardrails}

=== DATA PELANGGAN TERDAFTAR ===
${verifiedCustomerContext || "PENGGUNA SAAT INI: Pengunjung umum / Belum terverifikasi."}

Panduan Respon:
1. Jawab pertanyaan pengguna secara spesifik, langsung pada inti pertanyaan, ramah, sopan, dan solutif.
2. JANGAN PERNAH membocorkan nama pemilik unit, nomor rekening landlord, atau data sewa penyewa lain.
3. Selalu gunakan Bahasa Indonesia yang elegan, rapi, dan mudah dimengerti.`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: systemPrompt + "\n\nPertanyaan Pengguna: " + userMessage }]
      }
    ],
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 500
    }
  };

  const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(endpoint, options);
    const json = JSON.parse(response.getContentText());

    if (json.candidates && json.candidates.length > 0 &&
        json.candidates[0].content &&
        json.candidates[0].content.parts &&
        json.candidates[0].content.parts[0] &&
        json.candidates[0].content.parts[0].text) {
      return { success: true, reply: json.candidates[0].content.parts[0].text };
    } else {
      return { success: true, reply: generateStructuredOfflineAnswer(userMessage, customKnowledgeBase, customGuardrails) };
    }
  } catch (err) {
    Logger.log("Gemini Live API Error: " + err.toString());
    return { success: true, reply: generateStructuredOfflineAnswer(userMessage, customKnowledgeBase, customGuardrails) };
  }
}

function generateStructuredOfflineAnswer(userQuery, kb, gr) {
  const q = String(userQuery || '').toLowerCase();
  
  if (q.includes("jam") || q.includes("buka") || q.includes("tutup") || q.includes("operasional")) {
    if (q.includes("mall") || q.includes("kcs") || q.includes("square") || q.includes("market")) {
      return "Mall Kalibata City Square (KCS) buka setiap hari (Senin s/d Minggu) mulai pukul 10.00 WIB hingga 22.00 WIB. Untuk Farmers Market di lantai dasar buka lebih awal mulai pukul 08.00 WIB.";
    }
    if (q.includes("kantor") || q.includes("survei") || q.includes("viewing") || q.includes("admin")) {
      return "Layanan konsultasi dan survei unit (viewing) di kantor Trose Property buka setiap hari pukul 09.00 – 18.00 WIB. Silakan hubungi kami via WhatsApp untuk membuat janji temu.";
    }
    return "Mall Kalibata City Square beroperasi pukul 10.00 - 22.00 WIB setiap hari. Sedangkan layanan survei unit sewa buka pukul 09.00 - 18.00 WIB.";
  }

  if (q.includes("harian") || q.includes("hari") || q.includes("malam") || q.includes("transit") || q.includes("short stay")) {
    return "Mohon maaf, saat ini kami tidak menyediakan fasilitas sewa harian. Trose Property berfokus melayani sewa bulanan (mulai Rp 3 Jt/bln) dan sewa tahunan demi kenyamanan, keamanan, serta privasi optimal bagi seluruh penghuni. Apakah Anda ingin mengetahui pilihan unit bulanan kami?";
  }
  if (q.includes("studio") || q.includes("harga") || q.includes("biaya") || q.includes("tarif") || q.includes("rate") || q.includes("sewa")) {
    return "Berikut pilihan sewa bulanan resmi di Kalibata City:\n- Studio Deluxe (21 m2): Mulai Rp 3.000.000/bulan\n- 2 Bedroom Standard (33 m2): Mulai Rp 4.200.000/bulan\n- 2 Bedroom Green Palace (Pool Access): Mulai Rp 5.500.000/bulan\nSemua unit Full Furnished siap huni. Kami juga melayani sewa tahunan dengan tarif lebih hemat.";
  }
  if (q.includes("fasilitas") || q.includes("kolam") || q.includes("gym") || q.includes("green palace")) {
    return "Fasilitas lengkap di kawasan Superblock Kalibata City:\n- Mall Kalibata City Square (KCS) langsung di bawah hunian (Farmers Market, XXI, kuliner 24 jam).\n- Kolam renang tematik (Adult & Kids Pool) dan Gym Center di Green Palace.\n- Lapangan Tenis, Basket, Futsal, Jogging Track, dan Masjid Raya Nurullah.\n- Keamanan kartu akses lift 24 jam & CCTV.";
  }
  if (q.includes("lokasi") || q.includes("stasiun") || q.includes("krl") || q.includes("alamat") || q.includes("peta")) {
    return "Lokasi sangat strategis di Jl. Raya Kalibata No.1, Pancoran, Jakarta Selatan. Hanya 2 menit (200m) jalan kaki ke Stasiun KRL Duren Kalibata, dan 10-15 menit ke kawasan perkantoran Kuningan (Rasuna Said) serta Gatot Subroto.";
  }
  if (q.includes("survei") || q.includes("viewing") || q.includes("lihat") || q.includes("jadwal")) {
    return "Tentu! Jadwal survei unit (viewing) tersedia setiap hari (Senin-Minggu, 09.00 - 18.00 WIB). Silakan klik tombol 'WhatsApp Admin' untuk konfirmasi jam kunjungan Anda bersama tim konsultan kami.";
  }

  return "Halo! Saya Rose, AI Concierge resmi Apartemen Kalibata City. Kami siap membantu informasi sewa unit bulanan dan tahunan, fasilitas Superblock, jam operasional, maupun jadwal survei lokasi. Ada yang bisa saya bantu?";
}
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/backend/GeminiCRM.gs", $geminiGs, $Utf8NoBomEncoding)

# ------------------------------------------------------------------------------
# 2. frontend/js/landing.js
# ------------------------------------------------------------------------------
Write-Host "Updating frontend/js/landing.js (Context-Specific Fallback Parser)..." -ForegroundColor Yellow
$landingJs = @'
/**
 * Trose Property Manager - Rose AI Concierge Context Engine (v7.8)
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
  
  if (q.includes("jam") || q.includes("buka") || q.includes("tutup") || q.includes("operasional")) {
    if (q.includes("mall") || q.includes("kcs") || q.includes("square") || q.includes("market")) {
      return "Mall Kalibata City Square (KCS) buka setiap hari mulai pukul 10.00 WIB hingga 22.00 WIB. Untuk supermarket Farmers Market buka lebih awal mulai pukul 08.00 WIB.";
    }
    if (q.includes("kantor") || q.includes("survei") || q.includes("viewing") || q.includes("admin")) {
      return "Layanan konsultasi dan survei unit di kantor Trose Property buka setiap hari (Senin-Minggu) pukul 09.00 – 18.00 WIB. Silakan hubungi kami via WhatsApp untuk membuat janji temu.";
    }
    return "Mall Kalibata City Square buka pukul 10.00 - 22.00 WIB setiap hari. Sedangkan layanan survei unit buka pukul 09.00 - 18.00 WIB.";
  }

  if (q.includes("harian") || q.includes("hari") || q.includes("malam") || q.includes("transit") || q.includes("short stay")) {
    return "Mohon maaf, saat ini kami tidak menyediakan fasilitas sewa harian. Trose Property berfokus melayani sewa bulanan (mulai Rp 3 Jt/bln) dan sewa tahunan demi kenyamanan, keamanan, serta privasi optimal penghuni. Apakah Anda ingin melihat pilihan unit bulanan kami?";
  }
  if (q.includes("studio") || q.includes("harga") || q.includes("biaya") || q.includes("rate") || q.includes("tarif") || q.includes("sewa")) {
    return "Pilihan sewa unit bulanan resmi di Kalibata City:\n- Studio Deluxe: Mulai Rp 3.000.000/bln\n- 2 Bedroom Standard: Mulai Rp 4.200.000/bln\n- 2 Bedroom Green Palace: Mulai Rp 5.500.000/bln\nSemua unit Full Furnished (AC, Springbed, Kitchen Set, TV). Tersedia juga opsi sewa tahunan lebih hemat.";
  }
  if (q.includes("fasilitas") || q.includes("kolam") || q.includes("gym") || q.includes("green palace")) {
    return "Fasilitas kawasan Superblock Kalibata City:\n- Mall Kalibata City Square (KCS) langsung di bawah hunian (Farmers Market, Bioskop XXI, food court).\n- Kolam renang dewasa & anak, Gym, Lapangan Tenis/Futsal di Green Palace.\n- Keamanan kartu akses lift 24 jam & Masjid Raya Nurullah.";
  }
  if (q.includes("lokasi") || q.includes("stasiun") || q.includes("krl") || q.includes("alamat")) {
    return "Lokasi di Jl. Raya Kalibata No.1, Pancoran, Jakarta Selatan. Hanya 2 menit jalan kaki (200m) ke Stasiun KRL Duren Kalibata dan 10-15 menit ke kawasan bisnis Kuningan / Gatot Subroto.";
  }
  if (q.includes("survei") || q.includes("viewing") || q.includes("lihat")) {
    return "Jadwal survei unit (viewing) buka setiap hari (09.00 - 18.00 WIB). Silakan klik tombol 'WA' di kanan atas untuk janjian waktu kunjungan bersama tim kami.";
  }

  return "Halo! Saya Rose, asisten virtual Apartemen Kalibata City. Kami menyediakan unit Studio & 2BR siap huni (bulanan dan tahunan). Ada yang bisa saya bantu seputar harga, fasilitas, jam operasional, atau jadwal survei?";
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
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/frontend/js/landing.js", $landingJs, $Utf8NoBomEncoding)

Write-Host "`n[SUCCESS] Rose AI v7.8 Knowledge & Resilient Engine successfully applied!" -ForegroundColor Green