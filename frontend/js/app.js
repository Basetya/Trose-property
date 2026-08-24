/**
 * Kusuma Properti Manager - Admin Cockpit & CMS Logic (v22.0)
 * File: frontend/js/app.js
 */

document.addEventListener("DOMContentLoaded", () => {
  fetchDashboard();
  loadSavedVisualSettings();
  loadAiConfig();
  initPopularUnitsCMSFields();
});

function toggleMobileDrawer() {
  const drawer = document.getElementById("mobile-drawer");
  if (drawer) drawer.classList.toggle("hidden");
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl text-xs font-bold shadow-2xl transition-all duration-300 transform translate-y-0 ${
    type === "error" ? "bg-[#B35436] text-white" : "bg-[#3A5A40] text-white"
  }`;
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("opacity-0", "-translate-y-2");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// -------------------------------------------------------------
// CMS EDITOR 3 UNIT POPULER HANDLERS
// -------------------------------------------------------------
function getDefaultPopularUnitsCMS() {
  return [
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
}

function initPopularUnitsCMSFields() {
  const saved = localStorage.getItem("kusuma_cms_popular_units");
  const units = saved ? JSON.parse(saved) : getDefaultPopularUnitsCMS();

  if (document.getElementById("cms-u1-badge")) {
    document.getElementById("cms-u1-badge").value = units[0].badge;
    document.getElementById("cms-u1-title").value = units[0].title;
    document.getElementById("cms-u1-desc").value = units[0].desc;
    document.getElementById("cms-u1-price").value = units[0].price;

    document.getElementById("cms-u2-badge").value = units[1].badge;
    document.getElementById("cms-u2-title").value = units[1].title;
    document.getElementById("cms-u2-desc").value = units[1].desc;
    document.getElementById("cms-u2-price").value = units[1].price;

    document.getElementById("cms-u3-badge").value = units[2].badge;
    document.getElementById("cms-u3-title").value = units[2].title;
    document.getElementById("cms-u3-desc").value = units[2].desc;
    document.getElementById("cms-u3-price").value = units[2].price;
  }
}

function savePopularUnitsCMS() {
  const unitsData = [
    {
      badge: document.getElementById("cms-u1-badge").value.trim() || "Single / Eksekutif",
      title: document.getElementById("cms-u1-title").value.trim() || "Studio Deluxe",
      desc: document.getElementById("cms-u1-desc").value.trim() || "Luas 21 m2 • Full Furnished",
      price: Number(document.getElementById("cms-u1-price").value) || 3000000
    },
    {
      badge: document.getElementById("cms-u2-badge").value.trim() || "Paling Favorit",
      title: document.getElementById("cms-u2-title").value.trim() || "2 Bedroom Standard",
      desc: document.getElementById("cms-u2-desc").value.trim() || "Luas 33 m2 • 2 Kamar Tidur",
      price: Number(document.getElementById("cms-u2-price").value) || 4200000
    },
    {
      badge: document.getElementById("cms-u3-badge").value.trim() || "Green Palace Resort",
      title: document.getElementById("cms-u3-title").value.trim() || "2 Bedroom Executive",
      desc: document.getElementById("cms-u3-desc").value.trim() || "Akses Kolam Renang • Gym Indoor",
      price: Number(document.getElementById("cms-u3-price").value) || 5500000
    }
  ];

  localStorage.setItem("kusuma_cms_popular_units", JSON.stringify(unitsData));
  showToast("Konten 3 Unit Populer berhasil diperbarui untuk Landing Page!");
}

function resetPopularUnitsCMS() {
  if (confirm("Kembalikan konten 3 unit populer ke teks bawaan?")) {
    const defaults = getDefaultPopularUnitsCMS();
    localStorage.setItem("kusuma_cms_popular_units", JSON.stringify(defaults));
    initPopularUnitsCMSFields();
    showToast("Konten unit populer dikembalikan ke pengaturan awal.");
  }
}

// -------------------------------------------------------------
// VISUAL CONTROLS HANDLERS
// -------------------------------------------------------------
function handleVisualSliderLive(type, val) {
  const root = document.documentElement;
  if (type === "opacity") {
    root.style.setProperty("--bg-overlay-opacity", (val / 100).toString());
    const label = document.getElementById("val-opacity");
    if (label) label.innerText = val + "%";
  } else if (type === "brightness") {
    root.style.setProperty("--bg-brightness", val + "%");
    const label = document.getElementById("val-brightness");
    if (label) label.innerText = val + "%";
  } else if (type === "contrast") {
    root.style.setProperty("--bg-contrast", val + "%");
    const label = document.getElementById("val-contrast");
    if (label) label.innerText = val + "%";
  }
}

function loadSavedVisualSettings() {
  const op = localStorage.getItem("kusuma_bg_opacity") || "90";
  const br = localStorage.getItem("kusuma_bg_brightness") || "100";
  const ct = localStorage.getItem("kusuma_bg_contrast") || "100";

  handleVisualSliderLive("opacity", op);
  handleVisualSliderLive("brightness", br);
  handleVisualSliderLive("contrast", ct);

  const slOp = document.getElementById("slider-opacity");
  const slBr = document.getElementById("slider-brightness");
  const slCt = document.getElementById("slider-contrast");
  if (slOp) slOp.value = op;
  if (slBr) slBr.value = br;
  if (slCt) slCt.value = ct;
}

function saveVisualSettingsManual() {
  const op = document.getElementById("slider-opacity").value;
  const br = document.getElementById("slider-brightness").value;
  const ct = document.getElementById("slider-contrast").value;

  localStorage.setItem("kusuma_bg_opacity", op);
  localStorage.setItem("kusuma_bg_brightness", br);
  localStorage.setItem("kusuma_bg_contrast", ct);
  showToast("Pengaturan visual latar belakang berhasil disimpan!");
}

function resetVisualSettings() {
  localStorage.removeItem("kusuma_bg_opacity");
  localStorage.removeItem("kusuma_bg_brightness");
  localStorage.removeItem("kusuma_bg_contrast");
  loadSavedVisualSettings();
  showToast("Pengaturan visual dikembalikan ke default.");
}

// -------------------------------------------------------------
// AI STUDIO HANDLERS
// -------------------------------------------------------------
async function loadAiConfig() {
  try {
    const res = await gasApiCall("getAiConfig", {}, "GET");
    if (res && res.success) {
      const kbEl = document.getElementById("ai-kb-text");
      const grEl = document.getElementById("ai-guardrail-text");
      if (kbEl && res.knowledgeBase) kbEl.value = res.knowledgeBase;
      if (grEl && res.guardrails) grEl.value = res.guardrails;
    }
  } catch (err) {
    console.warn("Using local AI defaults:", err);
  }
}

async function handleSaveAiConfig(e) {
  e.preventDefault();
  const kb = document.getElementById("ai-kb-text").value;
  const gr = document.getElementById("ai-guardrail-text").value;
  const btn = document.getElementById("btn-save-ai");

  btn.disabled = true;
  btn.innerText = "Menyimpan...";
  const currentPasscode = sessionStorage.getItem("kusuma_admin_passcode") || "kusuma288";

  try {
    const res = await gasApiCall("saveAiConfig", { passcode: currentPasscode, knowledgeBase: kb, guardrails: gr }, "POST");
    if (res && res.success) {
      showToast(res.message || "Knowledge base Kusuma AI tersimpan!");
    } else {
      showToast(res.error || "Gagal menyimpan", "error");
    }
  } catch (err) {
    showToast("Error saat menghubungi server", "error");
  } finally {
    btn.disabled = false;
    btn.innerText = "Simpan Knowledge";
  }
}

function resetToStandardDefaults() {
  document.getElementById("ai-kb-text").value = `LOKASI & FASILITAS SEKITAR APARTEMEN KALIBATA CITY:\n- Alamat: Jl. Raya Kalibata No.1, Pancoran, Jakarta Selatan.\n- Total 18 Tower: Tower Akasia hingga Tower Viola.\n- Green Palace memiliki kolam renang tematik & gym indoor.\n- Biaya IPL: Rata-rata Rp300.000 - Rp350.000/bln (Studio), Rp450.000 - Rp500.000/bln (2BR).\n- Mall Kalibata City Square di bawah tower (Bioskop XXI, Farmers Market, kuliner 24 jam).\n- Stasiun KRL Duren Kalibata: 2 menit jalan kaki (200m).\n- Fasilitas Medis: RS Brawijaya Duren Tiga (2.5 km), RSUD Budhi Asih (3 km), RS Tebet (3.5 km).`;
  document.getElementById("ai-guardrail-text").value = `1. NO DAILY RENTALS: Tolak sewa harian dengan sopan. Fokus pada sewa bulanan dan tahunan demi kenyamanan dan keamanan.\n2. PRIVASI: Dilarang membocorkan nama pemilik unit pribadi atau nomor rekening landlord kepada publik.\n3. AJAKAN AKSI: Tawarkan bantuan untuk survei unit atau klik tombol WhatsApp Admin.`;
}

async function handleClearAiConfig() {
  if (confirm("Kosongkan seluruh Knowledge Base & Guardrails Kusuma AI di server?")) {
    const currentPasscode = sessionStorage.getItem("kusuma_admin_passcode") || "kusuma288";
    try {
      const res = await gasApiCall("clearAiConfig", { passcode: currentPasscode }, "POST");
      if (res && res.success) {
        document.getElementById("ai-kb-text").value = "";
        document.getElementById("ai-guardrail-text").value = "";
        showToast("Knowledge Base berhasil dikosongkan.");
      }
    } catch (e) {
      showToast("Gagal mengosongkan memory AI", "error");
    }
  }
}

// -------------------------------------------------------------
// DASHBOARD METRICS & TABLE
// -------------------------------------------------------------
async function fetchDashboard() {
  try {
    const res = await gasApiCall("getDashboardData", {}, "GET");
    if (res && res.success && res.stats) {
      const s = res.stats;
      document.getElementById("stat-occupancy").innerText = s.occupancyRate || "0%";
      document.getElementById("stat-units").innerText = `${s.occupiedUnits || 0} / ${s.totalUnits || 0} Units`;
      document.getElementById("stat-due").innerText = "Rp " + Number(s.totalRevenueDue || 0).toLocaleString("id-ID");
      document.getElementById("stat-outstanding").innerText = "Rp " + Number(s.totalOutstanding || 0).toLocaleString("id-ID");
      document.getElementById("stat-leads").innerText = s.activeLeads || 0;
      document.getElementById("stat-maintenance").innerText = `${s.openMaintenance || 0} Open Tickets`;

      renderRecentInvoicesTable(res.recentInvoices || []);
    }
  } catch (err) {
    console.warn("Dashboard offline mode:", err);
  }
}

function renderRecentInvoicesTable(invoices) {
  const tbody = document.getElementById("table-invoices-body");
  if (!tbody) return;

  if (invoices.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-[#737370] font-medium">Belum ada tagihan sewa di database.</td></tr>`;
    return;
  }

  tbody.innerHTML = invoices.map(inv => `
    <tr class="border-b border-[#E8DFD3]/60 hover:bg-[#FAF7F2]">
      <td class="py-3 px-3 font-mono font-bold text-[#8C5835]">${inv.Invoice_ID}</td>
      <td class="py-3 px-3">${inv.Unit_ID}</td>
      <td class="py-3 px-3 font-semibold">Rp ${Number(inv.Total_Amount || 0).toLocaleString('id-ID')}</td>
      <td class="py-3 px-3">
        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${
          inv.Status === 'Paid' ? 'bg-[#EAF0EB] text-[#3A5A40]' : 'bg-[#F8ECE8] text-[#B35436]'
        }">
          ${inv.Status}
        </span>
      </td>
      <td class="py-3 px-3 text-right">
        <button onclick="window.location.href='billing.html'" class="text-xs text-[#8C5835] font-bold hover:underline">Kelola &rarr;</button>
      </td>
    </tr>
  `).join("");
}

// -------------------------------------------------------------
// ONE-CLICK RUMAH123 IMPORTER HANDLERS
// -------------------------------------------------------------
function openImportRumah123Modal() {
  const modal = document.getElementById("modal-import-rumah123");
  if (modal) modal.classList.remove("hidden");
}

function closeImportRumah123Modal() {
  const modal = document.getElementById("modal-import-rumah123");
  if (modal) modal.classList.add("hidden");
}

async function handleExecuteImportRumah123(e) {
  e.preventDefault();
  const urlInput = document.getElementById("import-listing-url");
  const listingUrl = urlInput ? urlInput.value.trim() : "";
  if (!listingUrl) return;

  const btn = document.getElementById("btn-submit-import");
  btn.disabled = true;
  btn.innerText = "Mengekstrak & Mengunggah...";

  const currentPasscode = sessionStorage.getItem("kusuma_admin_passcode") || "kusuma288";

  try {
    const res = await gasApiCall("importRumah123", { passcode: currentPasscode, url: listingUrl }, "POST");
    if (res && res.success) {
      showToast(res.message || "Listing berhasil diimpor & otomatis muncul di database!");
      closeImportRumah123Modal();
      if (urlInput) urlInput.value = "";
      fetchDashboard();
    } else {
      showToast(res.error || "Gagal mengimpor listing", "error");
    }
  } catch (err) {
    showToast("Error saat menghubungi server", "error");
  } finally {
    btn.disabled = false;
    btn.innerText = "Impor ke Database";
  }
}

async function handleWipeDatabase() {
  if (confirm("PERINGATAN: Apakah Anda yakin ingin mengosongkan seluruh baris data mockup di Google Sheets?")) {
    const currentPasscode = sessionStorage.getItem("kusuma_admin_passcode") || "kusuma288";
    try {
      const res = await gasApiCall("wipeAllMockupData", { passcode: currentPasscode }, "POST");
      if (res && res.success) {
        showToast("Database mockup berhasil dibersihkan.");
        fetchDashboard();
      }
    } catch (e) {
      showToast("Gagal membersihkan database", "error");
    }
  }
}