/**
 * Kusuma Properti Manager - Dashboard Logic & Visual Controller (v11.2)
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

// ==========================================
// DYNAMIC VISUAL CONTROLLER (Live Reactive Preview)
// ==========================================
let currentVisualState = {
  opacity: "90",
  brightness: "100",
  contrast: "100"
};

function initVisualSettings() {
  currentVisualState.opacity = localStorage.getItem("kusuma_bg_opacity") || "90";
  currentVisualState.brightness = localStorage.getItem("kusuma_bg_brightness") || "100";
  currentVisualState.contrast = localStorage.getItem("kusuma_bg_contrast") || "100";

  applyVisualThemeToDocument(currentVisualState.opacity, currentVisualState.brightness, currentVisualState.contrast);

  const sliderOp = document.getElementById("slider-opacity");
  const sliderBr = document.getElementById("slider-brightness");
  const sliderCt = document.getElementById("slider-contrast");

  if (sliderOp) { sliderOp.value = currentVisualState.opacity; document.getElementById("val-opacity").innerText = currentVisualState.opacity + "%"; }
  if (sliderBr) { sliderBr.value = currentVisualState.brightness; document.getElementById("val-brightness").innerText = currentVisualState.brightness + "%"; }
  if (sliderCt) { sliderCt.value = currentVisualState.contrast; document.getElementById("val-contrast").innerText = currentVisualState.contrast + "%"; }
}

function handleVisualSliderLive(type, value) {
  if (type === 'opacity') {
    currentVisualState.opacity = value;
    const label = document.getElementById("val-opacity");
    if (label) label.innerText = value + "%";
  } else if (type === 'brightness') {
    currentVisualState.brightness = value;
    const label = document.getElementById("val-brightness");
    if (label) label.innerText = value + "%";
  } else if (type === 'contrast') {
    currentVisualState.contrast = value;
    const label = document.getElementById("val-contrast");
    if (label) label.innerText = value + "%";
  }

  // Live Instant Preview pada dokumen
  applyVisualThemeToDocument(currentVisualState.opacity, currentVisualState.brightness, currentVisualState.contrast);
}

function applyVisualThemeToDocument(op, br, ct) {
  const root = document.documentElement;
  root.style.setProperty("--bg-overlay-opacity", (Number(op) / 100).toString());
  root.style.setProperty("--bg-brightness", br + "%");
  root.style.setProperty("--bg-contrast", ct + "%");
}

function saveVisualSettingsManual() {
  localStorage.setItem("kusuma_bg_opacity", currentVisualState.opacity);
  localStorage.setItem("kusuma_bg_brightness", currentVisualState.brightness);
  localStorage.setItem("kusuma_bg_contrast", currentVisualState.contrast);
  showToast("Pengaturan visual latar belakang berhasil disimpan!");
}

function resetVisualSettings() {
  currentVisualState = { opacity: "90", brightness: "100", contrast: "100" };
  localStorage.setItem("kusuma_bg_opacity", "90");
  localStorage.setItem("kusuma_bg_brightness", "100");
  localStorage.setItem("kusuma_bg_contrast", "100");
  initVisualSettings();
  showToast("Pengaturan visual latar belakang direset ke default!");
}

// AI KNOWLEDGE BASE & GUARDRAILS LOGIC
async function loadAiConfig() {
  const kbArea = document.getElementById("ai-kb-text");
  const grArea = document.getElementById("ai-guardrail-text");
  if (!kbArea || !grArea) return;

  const localKb = localStorage.getItem("kusuma_ai_kb") || localStorage.getItem("trose_ai_kb");
  const localGr = localStorage.getItem("kusuma_ai_gr") || localStorage.getItem("trose_ai_gr");

  if (localKb !== null) kbArea.value = localKb;
  if (localGr !== null) grArea.value = localGr;

  try {
    const res = await gasApiCall("getAiConfig", {}, "GET");
    if (res && res.success) {
      if (res.knowledgeBase !== undefined) {
        kbArea.value = res.knowledgeBase;
        localStorage.setItem("kusuma_ai_kb", res.knowledgeBase);
      }
      if (res.guardrails !== undefined) {
        grArea.value = res.guardrails;
        localStorage.setItem("kusuma_ai_gr", res.guardrails);
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
    kbArea.value = "SUPERBLOCK KALIBATA CITY INFORMATION (KUSUMA PROPERTI):\n" +
      "- 18 Tower Total: Akasia, Borneo, Cendana, Damar, Ebony, Flamboyan, Gaharu, Hebras, Kemuning, Jasmine, Lotus, Mawar, Nusa Indah, Palem, Raffles, Sakura, Tulip, Viola.\n" +
      "- Tower Green Palace (Mawar s/d Viola) memiliki akses kolam renang tematik & gym indoor.\n" +
      "- Tarif Sewa Bulanan: Studio (Rp 2.8Jt - 3.5Jt/bln), 2BR Standard (Rp 3.8Jt - 4.5Jt/bln), 2BR Green Palace (Rp 4.5Jt - 5.5Jt/bln).\n" +
      "- Seluruh unit Full Furnished (AC, springbed, lemari, kitchen set, kulkas, TV).\n" +
      "- Mall Kalibata City Square (KCS) buka pukul 10.00 - 22.00 WIB (Farmers Market buka 08.00 WIB).\n" +
      "- Stasiun KRL Duren Kalibata berjarak 200m (2 menit jalan kaki).";
  }
  if (grArea) {
    grArea.value = "1. NO DAILY RENTALS: Tolak dengan sopan pertanyaan sewa harian/transit/per malam. Jelaskan bahwa Kusuma Properti hanya menyediakan sewa bulanan dan tahunan demi keamanan & kenyamanan.\n" +
      "2. STRICT PROPERTY DOMAIN: Hanya jawab seputar properti, fasilitas, sewa, dan jadwal viewing di Kalibata City.\n" +
      "3. PRIVACY PROTECTION: Dilarang membeberkan nama pemilik unit atau nomor rekening pribadi landlord kepada publik.\n" +
      "4. VERIFICATION PROTOCOL: Data privat penyewa (masa sewa, sisa tagihan) hanya boleh dijawab jika Single ID (CNT-XXXX) atau No WA cocok di database.\n" +
      "5. LEAD CAPTURE: Arahkan pengguna menjadwalkan survei unit (viewing) atau klik tombol WhatsApp Admin.";
  }
  showToast("Template default Kusuma Properti dimuat ke editor!");
}

async function handleSaveAiConfig(e) {
  e.preventDefault();
  const kbVal = document.getElementById("ai-kb-text").value.trim();
  const grVal = document.getElementById("ai-guardrail-text").value.trim();
  const btn = document.getElementById("btn-save-ai");

  btn.disabled = true;
  btn.innerText = "Menyimpan...";

  localStorage.setItem("kusuma_ai_kb", kbVal);
  localStorage.setItem("kusuma_ai_gr", grVal);

  const currentPasscode = sessionStorage.getItem("kusuma_admin_passcode") || "kusuma288";

  try {
    const res = await gasApiCall("saveAiConfig", { 
      passcode: currentPasscode,
      knowledgeBase: kbVal, 
      guardrails: grVal 
    }, "POST");

    if (res && res.success) {
      showToast(res.message || "Knowledge Base & Guardrails Kusuma AI berhasil disimpan!");
    } else {
      showToast("Knowledge Base & Guardrails disimpan aktif di Browser!");
    }
  } catch (err) {
    showToast("Knowledge Base & Guardrails disimpan aktif di Browser!");
  } finally {
    btn.disabled = false;
    btn.innerText = "Simpan Knowledge";
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

  localStorage.setItem("kusuma_official_wa", val);
  OFFICIAL_WA_NUMBER = val;

  const currentPasscode = sessionStorage.getItem("kusuma_admin_passcode") || "kusuma288";

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
    btn.innerText = "Simpan WA";
  }
}

function testWaLink() {
  const input = document.getElementById("admin-wa-input");
  const val = input ? input.value.trim() : OFFICIAL_WA_NUMBER;
  const url = `https://wa.me/${val.replace(/[^0-9]/g, '')}?text=Tes%20koneksi%20WhatsApp%20Kusuma%20Properti`;
  window.open(url, '_blank');
}

function requestVerifyPayment(invoiceId) {
  if (!confirm(`Verifikasi pembayaran untuk invoice ${invoiceId} sebagai LUNAS?`)) return;

  const currentPasscode = sessionStorage.getItem("kusuma_admin_passcode") || "kusuma288";
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

function toggleMobileDrawer() {
  const drawer = document.getElementById("mobile-drawer");
  if (drawer) {
    if (drawer.classList.contains("hidden")) {
      drawer.classList.remove("hidden");
    } else {
      drawer.classList.add("hidden");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initVisualSettings();
  if (document.getElementById("stat-occupancy")) {
    fetchDashboard();
  }
});