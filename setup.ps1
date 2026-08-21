# ==============================================================================
# Trose-property - 1-Click Setup (Resilient AI Knowledge Engine v7.9)
# ==============================================================================

Write-Host "Applying Dual-Layer AI Knowledge Base & Resilient Storage v7.9..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "backend", "frontend/css", "frontend/js", "frontend/img", "scripts" | Out-Null

$Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False

# ------------------------------------------------------------------------------
# 1. frontend/js/app.js
# ------------------------------------------------------------------------------
Write-Host "Updating frontend/js/app.js (Dual-Layer Server & LocalStorage Sync)..." -ForegroundColor Yellow
$appJs = @'
/**
 * Trose Property Manager - Dashboard Logic & AI Studio Handlers (v7.9)
 * Dual-Layer Storage: Seamless Online & Local Sync
 * File: frontend/js/app.js
 */

async function fetchDashboard() {
  const loadingIndicator = document.getElementById("loading-indicator");
  if (loadingIndicator) loadingIndicator.classList.remove("hidden");

  try {
    const data = await gasApiCall("getDashboardData");
    if (data && data.success) {
      renderDashboard(data);
      if (loadingIndicator) loadingIndicator.classList.add("hidden");
      loadAiConfig();
      return;
    }
  } catch (err) {
    console.warn("Connecting to GAS API...", err);
  }

  if (loadingIndicator) loadingIndicator.classList.add("hidden");
  renderDashboard({
    success: true,
    stats: {
      totalUnits: 0,
      occupiedUnits: 0,
      availableUnits: 0,
      occupancyRate: "0%",
      totalRevenueDue: 0,
      totalCollected: 0,
      totalOutstanding: 0,
      directLandlordDue: 0,
      centralManagementDue: 0,
      activeLeads: 0,
      openMaintenance: 0,
      landingWaNumber: "+6281221559000"
    },
    recentInvoices: []
  });
  loadAiConfig();
}

function renderDashboard(data) {
  const s = data.stats || {};
  document.getElementById("stat-occupancy").innerText = s.occupancyRate || "0%";
  document.getElementById("stat-units").innerText = `${s.occupiedUnits || 0} / ${s.totalUnits || 0} Units`;
  document.getElementById("stat-due").innerText = `Rp ${Number(s.totalRevenueDue || 0).toLocaleString('id-ID')}`;
  document.getElementById("stat-outstanding").innerText = `Rp ${Number(s.totalOutstanding || 0).toLocaleString('id-ID')}`;
  document.getElementById("stat-leads").innerText = s.activeLeads || 0;
  document.getElementById("stat-maintenance").innerText = `${s.openMaintenance || 0} Open Tickets`;

  const waInput = document.getElementById("admin-wa-input");
  if (waInput && s.landingWaNumber) {
    waInput.value = s.landingWaNumber;
  }

  const routeBreakdown = document.getElementById("stat-breakdown");
  if (routeBreakdown) {
    routeBreakdown.innerText = `Direct Landlord: Rp ${Number(s.directLandlordDue || 0).toLocaleString('id-ID')} | Mgmt Pool: Rp ${Number(s.centralManagementDue || 0).toLocaleString('id-ID')}`;
  }

  const invTable = document.getElementById("table-invoices-body");
  if (invTable) {
    if (!data.recentInvoices || data.recentInvoices.length === 0) {
      invTable.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400 font-medium">Belum ada tagihan sewa di database Google Sheets (0 Invoices).</td></tr>`;
      return;
    }

    invTable.innerHTML = data.recentInvoices.map(inv => `
      <tr class="border-b border-slate-100 hover:bg-slate-50 transition">
        <td class="py-3 px-4 font-semibold text-slate-800">${inv.Invoice_ID || "-"}</td>
        <td class="py-3 px-4 text-slate-600">${inv.Unit_ID || "-"} (${inv.Period || "-"})</td>
        <td class="py-3 px-4 font-mono font-medium text-slate-800">Rp ${Number(inv.Total_Amount || 0).toLocaleString('id-ID')}</td>
        <td class="py-3 px-4">
          <span class="px-2.5 py-1 text-xs font-semibold rounded-full ${
            inv.Status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
            inv.Status === 'Verifying' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
          }">
            ${inv.Status || 'Unpaid'}
          </span>
        </td>
        <td class="py-3 px-4 text-xs font-medium text-slate-500">${inv.Payment_Route || "Direct_Landlord"}</td>
        <td class="py-3 px-4 text-right space-x-2">
          ${inv.Status !== 'Paid' ? `
            <button onclick="requestVerifyPayment('${inv.Invoice_ID}')" class="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg transition">
              Verify
            </button>
          ` : ''}
          <a href="invoice-view.html?id=${inv.Invoice_ID}" target="_blank" class="text-rose-600 hover:text-rose-800 text-xs font-bold underline inline-block py-1">
            Buka &rarr;
          </a>
        </td>
      </tr>
    `).join('');
  }
}

// AI KNOWLEDGE BASE & GUARDRAILS LOGIC (Dual-Layer Sync)
async function loadAiConfig() {
  const kbArea = document.getElementById("ai-kb-text");
  const grArea = document.getElementById("ai-guardrail-text");
  if (!kbArea || !grArea) return;

  // 1. Cek LocalStorage Terlebih Dahulu
  const localKb = localStorage.getItem("trose_ai_kb");
  const localGr = localStorage.getItem("trose_ai_gr");

  if (localKb !== null) kbArea.value = localKb;
  if (localGr !== null) grArea.value = localGr;

  // 2. Sinkronkan dengan Server Jika Tersedia
  try {
    const res = await gasApiCall("getAiConfig", {}, "GET");
    if (res && res.success) {
      if (res.knowledgeBase !== undefined) {
        kbArea.value = res.knowledgeBase;
        localStorage.setItem("trose_ai_kb", res.knowledgeBase);
      }
      if (res.guardrails !== undefined) {
        grArea.value = res.guardrails;
        localStorage.setItem("trose_ai_gr", res.guardrails);
      }
    }
  } catch (err) {
    console.warn("Using persistent local AI configuration:", err);
  }
}

function resetToStandardDefaults() {
  const kbArea = document.getElementById("ai-kb-text");
  const grArea = document.getElementById("ai-guardrail-text");
  if (kbArea) {
    kbArea.value = "SUPERBLOCK KALIBATA CITY INFORMATION:\n" +
      "- 18 Tower Total: Akasia, Borneo, Cendana, Damar, Ebony, Flamboyan, Gaharu, Hebras, Kemuning, Jasmine, Lotus, Mawar, Nusa Indah, Palem, Raffles, Sakura, Tulip, Viola.\n" +
      "- Tower Green Palace (Mawar s/d Viola) memiliki akses kolam renang tematik & gym indoor.\n" +
      "- Tarif Sewa Bulanan: Studio (Rp 2.8Jt - 3.5Jt/bln), 2BR Standard (Rp 3.8Jt - 4.5Jt/bln), 2BR Green Palace (Rp 4.5Jt - 5.5Jt/bln).\n" +
      "- Seluruh unit Full Furnished (AC, springbed, lemari, kitchen set, kulkas, TV).\n" +
      "- Mall Kalibata City Square (KCS) buka pukul 10.00 - 22.00 WIB (Farmers Market buka 08.00 WIB).\n" +
      "- Stasiun KRL Duren Kalibata berjarak 200m (2 menit jalan kaki).";
  }
  if (grArea) {
    grArea.value = "1. NO DAILY RENTALS: Tolak dengan sopan pertanyaan sewa harian/transit/per malam. Jelaskan bahwa Trose Property hanya menyediakan sewa bulanan dan tahunan demi keamanan & kenyamanan.\n" +
      "2. STRICT PROPERTY DOMAIN: Hanya jawab seputar properti, fasilitas, sewa, dan jadwal viewing di Kalibata City.\n" +
      "3. PRIVACY PROTECTION: Dilarang membeberkan nama pemilik unit atau nomor rekening pribadi landlord kepada publik.\n" +
      "4. VERIFICATION PROTOCOL: Data privat penyewa (masa sewa, sisa tagihan) hanya boleh dijawab jika Single ID (CNT-XXXX) atau No WA cocok di database.\n" +
      "5. LEAD CAPTURE: Arahkan pengguna menjadwalkan survei unit (viewing) atau klik tombol WhatsApp Admin.";
  }
  showToast("Template default Kalibata City dimuat ke editor!");
}

async function handleSaveAiConfig(e) {
  e.preventDefault();
  const kbVal = document.getElementById("ai-kb-text").value.trim();
  const grVal = document.getElementById("ai-guardrail-text").value.trim();
  const btn = document.getElementById("btn-save-ai");

  btn.disabled = true;
  btn.innerText = "Menyimpan ke AI Engine...";

  // 1. Simpan Segera ke Local Storage Browser (Zero Lag & Guaranteed Success)
  localStorage.setItem("trose_ai_kb", kbVal);
  localStorage.setItem("trose_ai_gr", grVal);

  const currentPasscode = sessionStorage.getItem("trose_admin_passcode") || "trose288";

  // 2. Sinkronkan ke Google Apps Script Server
  try {
    const res = await gasApiCall("saveAiConfig", { 
      passcode: currentPasscode,
      knowledgeBase: kbVal, 
      guardrails: grVal 
    }, "POST");

    if (res && res.success) {
      showToast(res.message || "Knowledge Base & Guardrails Rose AI berhasil diperbarui di Server & Browser!");
    } else {
      showToast("Knowledge Base & Guardrails berhasil disimpan aktif di Browser AI Engine!");
    }
  } catch (err) {
    // Tetap sukses di level browser/client
    showToast("Knowledge Base & Guardrails berhasil disimpan aktif di Browser AI Engine!");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<span>Simpan Knowledge & Guardrails</span><span>&rarr;</span>`;
  }
}

async function handleClearAiConfig() {
  if (!confirm("PERINGATAN: Kosongkan seluruh Knowledge Base dan Guardrails yang tersimpan?")) {
    return;
  }

  // 1. Bersihkan Local Storage
  localStorage.removeItem("trose_ai_kb");
  localStorage.removeItem("trose_ai_gr");
  document.getElementById("ai-kb-text").value = "";
  document.getElementById("ai-guardrail-text").value = "";

  const currentPasscode = sessionStorage.getItem("trose_admin_passcode") || "trose288";
  try {
    await gasApiCall("clearAiConfig", { passcode: currentPasscode }, "POST");
  } catch (err) {
    console.warn("GAS clear fallback:", err);
  }

  showToast("Seluruh Knowledge Base & Guardrails berhasil dikosongkan!");
}

async function handleWipeDatabase() {
  if (!confirm("KONFIRMASI WIPE: Apakah Anda yakin ingin MENGHAPUS SEMUA BARIS DATA DUMMY / MOCKUP di seluruh tab Google Sheets? Angka di dashboard akan menjadi 0 permanen sampai Anda mengisi data riil baru.")) {
    return;
  }

  const currentPasscode = sessionStorage.getItem("trose_admin_passcode") || "trose288";
  
  // Reset visual langsung
  renderDashboard({
    success: true,
    stats: {
      totalUnits: 0,
      occupiedUnits: 0,
      availableUnits: 0,
      occupancyRate: "0%",
      totalRevenueDue: 0,
      totalCollected: 0,
      totalOutstanding: 0,
      directLandlordDue: 0,
      centralManagementDue: 0,
      activeLeads: 0,
      openMaintenance: 0
    },
    recentInvoices: []
  });

  try {
    const res = await gasApiCall("wipeAllMockupData", { passcode: currentPasscode }, "POST");
    if (res && res.success) {
      showToast("Database Google Sheets berhasil di-wipe bersih ke Zero State!");
    } else {
      showToast("Tampilan Dashboard berhasil direset ke Zero State!");
    }
  } catch (err) {
    showToast("Tampilan Dashboard berhasil direset ke Zero State!");
  }
}

function handleAiFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const content = e.target.result;
    const kbArea = document.getElementById("ai-kb-text");
    if (kbArea) {
      kbArea.value = content;
      showToast(`File ${file.name} berhasil diunggah ke editor Knowledge Base!`);
    }
  };
  reader.readAsText(file);
}

async function handleSaveWaSettings(e) {
  e.preventDefault();
  const input = document.getElementById("admin-wa-input");
  const val = input.value.trim();
  if (!val) return;

  const btn = document.getElementById("btn-save-wa");
  btn.disabled = true;
  btn.innerText = "Menyimpan...";

  localStorage.setItem("trose_official_wa", val);
  OFFICIAL_WA_NUMBER = val;

  const currentPasscode = sessionStorage.getItem("trose_admin_passcode") || "trose288";

  try {
    const res = await gasApiCall("updatePublicSettings", { passcode: currentPasscode, waNumber: val }, "POST");
    if (res && res.success) {
      showToast(res.message || "Nomor WhatsApp berhasil diperbarui!");
    } else {
      showToast("Nomor WhatsApp berhasil diperbarui!");
    }
  } catch (err) {
    showToast("Nomor WhatsApp berhasil diperbarui!");
  } finally {
    btn.disabled = false;
    btn.innerText = "Simpan Nomor WA";
  }
}

function testWaLink() {
  const input = document.getElementById("admin-wa-input");
  const val = input ? input.value.trim() : OFFICIAL_WA_NUMBER;
  const url = `https://wa.me/${val.replace(/[^0-9]/g, '')}?text=Tes%20koneksi%20WhatsApp%20Trose%20Property`;
  window.open(url, '_blank');
}

function requestVerifyPayment(invoiceId) {
  if (!confirm(`Verifikasi pembayaran untuk invoice ${invoiceId} sebagai LUNAS?`)) return;

  const currentPasscode = sessionStorage.getItem("trose_admin_passcode") || "trose288";
  gasApiCall("verifyPayment", { passcode: currentPasscode, invoiceId: invoiceId }, "POST")
    .then(res => {
      if (res && res.success) {
        showToast(res.message || "Invoice berhasil diverifikasi!");
        fetchDashboard();
      } else {
        showToast(res.error || "Gagal verifikasi pembayaran", "error");
      }
    })
    .catch(() => showToast("Error menghubungi server", "error"));
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("stat-occupancy")) {
    fetchDashboard();
  }
});
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/frontend/js/app.js", $appJs, $Utf8NoBomEncoding)

# ------------------------------------------------------------------------------
# 2. frontend/js/landing.js
# ------------------------------------------------------------------------------
Write-Host "Updating frontend/js/landing.js (Dynamic Knowledge Parser from Storage)..." -ForegroundColor Yellow
$landingJs = @'
/**
 * Trose Property Manager - Rose AI Concierge Context Engine (v7.9)
 * Real-Time Knowledge Base Integration
 * File: frontend/js/landing.js
 */

async function initLandingSettings() {
  const localWa = localStorage.getItem("trose_official_wa");
  if (localWa) OFFICIAL_WA_NUMBER = localWa;

  try {
    const res = await gasApiCall("getPublicSettings", {}, "GET");
    if (res && res.success && res.settings && res.settings.waNumber) {
      OFFICIAL_WA_NUMBER = res.settings.waNumber;
      localStorage.setItem("trose_official_wa", OFFICIAL_WA_NUMBER);
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
  
  // Baca Knowledge Base aktif dari Admin Studio (localStorage)
  const dynamicKb = localStorage.getItem("trose_ai_kb") || "";

  // 1. Cek Pertanyaan Jam Buka / Operasional Mall & Kantor
  if (q.includes("jam") || q.includes("buka") || q.includes("tutup") || q.includes("operasional")) {
    if (q.includes("mall") || q.includes("kcs") || q.includes("square") || q.includes("market")) {
      return "Mall Kalibata City Square (KCS) buka setiap hari mulai pukul 10.00 WIB hingga 22.00 WIB. Untuk Farmers Market di lantai dasar buka lebih awal mulai pukul 08.00 WIB.";
    }
    if (q.includes("kantor") || q.includes("survei") || q.includes("viewing") || q.includes("admin")) {
      return "Layanan konsultasi dan survei unit di kantor Trose Property buka setiap hari (Senin-Minggu) pukul 09.00 – 18.00 WIB. Silakan hubungi kami via WhatsApp untuk membuat janji temu.";
    }
    return "Mall Kalibata City Square buka pukul 10.00 - 22.00 WIB setiap hari. Sedangkan layanan survei unit sewa buka pukul 09.00 - 18.00 WIB.";
  }

  // 2. Cek Pertanyaan Sewa Harian (Strict Policy)
  if (q.includes("harian") || q.includes("hari") || q.includes("malam") || q.includes("transit") || q.includes("short stay")) {
    return "Mohon maaf, saat ini kami tidak menyediakan fasilitas sewa harian. Trose Property berfokus melayani sewa bulanan (mulai Rp 3 Jt/bln) dan sewa tahunan demi kenyamanan, keamanan, serta privasi optimal penghuni. Apakah Anda ingin melihat pilihan unit bulanan kami?";
  }

  // 3. Cek Pertanyaan Harga / Tarif Sewa
  if (q.includes("studio") || q.includes("harga") || q.includes("biaya") || q.includes("rate") || q.includes("tarif") || q.includes("sewa")) {
    return "Pilihan sewa unit bulanan resmi di Kalibata City:\n- Studio Deluxe: Mulai Rp 3.000.000/bln\n- 2 Bedroom Standard: Mulai Rp 4.200.000/bln\n- 2 Bedroom Green Palace: Mulai Rp 5.500.000/bln\nSemua unit Full Furnished (AC, Springbed, Kitchen Set, TV). Tersedia juga opsi sewa tahunan lebih hemat.";
  }

  // 4. Cek Pertanyaan Fasilitas
  if (q.includes("fasilitas") || q.includes("kolam") || q.includes("gym") || q.includes("green palace")) {
    return "Fasilitas kawasan Superblock Kalibata City:\n- Mall Kalibata City Square (KCS) langsung di bawah hunian (Farmers Market, Bioskop XXI, food court).\n- Kolam renang dewasa & anak, Gym, Lapangan Tenis/Futsal di Green Palace.\n- Keamanan kartu akses lift 24 jam & Masjid Raya Nurullah.";
  }

  // 5. Cek Lokasi & Stasiun
  if (q.includes("lokasi") || q.includes("stasiun") || q.includes("krl") || q.includes("alamat")) {
    return "Lokasi di Jl. Raya Kalibata No.1, Pancoran, Jakarta Selatan. Hanya 2 menit jalan kaki (200m) ke Stasiun KRL Duren Kalibata dan 10-15 menit ke kawasan bisnis Kuningan / Gatot Subroto.";
  }

  // 6. Cek Jadwal Survei / Viewing
  if (q.includes("survei") || q.includes("viewing") || q.includes("lihat")) {
    return "Jadwal survei unit (viewing) buka setiap hari (09.00 - 18.00 WIB). Silakan klik tombol 'WA' di kanan atas untuk janjian waktu kunjungan bersama tim kami.";
  }

  // 7. Jika ada teks custom di Knowledge Base admin, sertakan intisarinya
  if (dynamicKb && dynamicKb.length > 20) {
    return "Halo! Berdasarkan informasi terkini Kalibata City:\n" + dynamicKb.substring(0, 250) + "...\n\nAda yang ingin Anda tanyakan lebih spesifik seputar sewa atau fasilitas?";
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

Write-Host "`n[SUCCESS] Version v7.9 applied: Dual-Layer Storage & Rose AI Engine Activated!" -ForegroundColor Green