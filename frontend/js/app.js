/**
 * Kusuma Properti Manager - Frontend Application Core
 * Version: v53.0.0 (Direct CSS Variable Injection & Visual Live Controller)
 * File: frontend/js/app.js
 */

const MASTER_API_URL = (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) 
  ? window.APP_CONFIG.API_BASE_URL 
  : "https://script.google.com/macros/s/AKfycbxZ7ctf2V1Peo969s3UPBQxoHkaSyZMdstGosy8V1ZGL_fF-xSP0wf7L9Gv3qMhJOQ_nQ/exec";

// ==============================================================================
// 1. INISIALISASI UTAMA
// ==============================================================================
document.addEventListener("DOMContentLoaded", () => {
  fetchDashboard();
  syncOfficialWhatsAppNumber();
  loadVisualSettings();
  loadPopularUnitsCMS();
  loadAiConfig();
});

// ==============================================================================
// 2. DASHBOARD DATA FETCHING (Metrik & Tagihan)
// ==============================================================================
async function fetchDashboard() {
  try {
    const res = await fetch(`${MASTER_API_URL}?action=getDashboardData&_t=${Date.now()}`);
    const data = await res.json();

    if (data.success && data.stats) {
      const elOccupancy = document.getElementById("stat-occupancy");
      const elUnits = document.getElementById("stat-units");
      const elDue = document.getElementById("stat-due");
      const elOutstanding = document.getElementById("stat-outstanding");
      const elLeads = document.getElementById("stat-leads");

      if (elOccupancy) elOccupancy.innerText = data.stats.occupancyRate || "0%";
      if (elUnits) elUnits.innerText = `${data.stats.occupiedUnits || 0} / ${data.stats.totalUnits || 0} Units`;
      if (elDue) elDue.innerText = formatRupiah(data.stats.totalRevenueDue || 0);
      if (elOutstanding) elOutstanding.innerText = formatRupiah(data.stats.totalOutstanding || 0);
      if (elLeads) elLeads.innerText = data.stats.activeLeads || "0";

      renderInvoiceTable(data.recentInvoices || []);
    }
  } catch (err) {
    console.warn("[Dashboard Sync Error]:", err);
  }
}

function renderInvoiceTable(invoices) {
  const tbody = document.getElementById("table-invoices-body");
  if (!tbody) return;

  if (!invoices || invoices.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="py-6 text-center text-[#737370] font-medium">Belum ada tagihan sewa di database (0 Invoices).</td>
      </tr>`;
    return;
  }

  tbody.innerHTML = invoices.map(inv => `
    <tr class="border-b border-[#E8DFD3]/60 hover:bg-[#F4EFE6]/50 transition">
      <td class="py-3 px-3 font-mono font-bold text-[#8C5835]">${inv.Invoice_ID || "-"}</td>
      <td class="py-3 px-3 font-semibold text-[#2C2C2A]">${inv.Unit_ID || "-"}</td>
      <td class="py-3 px-3 font-mono">${formatRupiah(inv.Total_Amount || 0)}</td>
      <td class="py-3 px-3">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
          String(inv.Status).toLowerCase() === "paid" 
            ? "bg-[#EAF0EB] text-[#3A5A40] border border-[#D5E2D7]" 
            : "bg-[#F8ECE8] text-[#B35436] border border-[#F0D5CD]"
        }">
          ${inv.Status || "Unpaid"}
        </span>
      </td>
      <td class="py-3 px-3 text-right font-mono text-xs text-[#737370]">${inv.Period || "-"}</td>
    </tr>
  `).join("");
}

// ==============================================================================
// 3. SINKRONISASI NOMOR WHATSAPP RESMI (628135600058)
// ==============================================================================
async function syncOfficialWhatsAppNumber() {
  const inputEl = document.getElementById("inputAdminWa");
  const badgeEl = document.getElementById("waBadgeStatus");

  try {
    const res = await fetch(`${MASTER_API_URL}?action=getPublicSettings&_t=${Date.now()}`);
    const data = await res.json();

    if (data.success && data.settings && data.settings.waNumber) {
      const cleanNum = String(data.settings.waNumber).replace(/\D/g, "");
      if (cleanNum && cleanNum.length >= 9) {
        if (inputEl) inputEl.value = cleanNum;
        if (badgeEl) badgeEl.innerText = `Aktif: +${cleanNum}`;
        return;
      }
    }
  } catch (err) {
    console.warn("[WA Settings Fetch Error]:", err);
  }

  if (inputEl) inputEl.value = "628135600058";
  if (badgeEl) badgeEl.innerText = "Aktif: +628135600058";
}

// ==============================================================================
// 4. KONTROL VISUAL LATAR BELAKANG JAPANDI
// ==============================================================================
function handleVisualSliderLive(type, val) {
  const valEl = document.getElementById(`val-${type}`);
  if (valEl) valEl.innerText = `${val}%`;
  applyVisualStylesLive();
}

function applyVisualStylesLive() {
  const opacity = document.getElementById("slider-opacity")?.value || "90";
  const brightness = document.getElementById("slider-brightness")?.value || "100";
  const contrast = document.getElementById("slider-contrast")?.value || "100";

  document.documentElement.style.setProperty("--japandi-scrim-opacity", `${Number(opacity) / 100}`);
  document.documentElement.style.setProperty("--japandi-bg-brightness", `${brightness}%`);
  document.documentElement.style.setProperty("--japandi-bg-contrast", `${contrast}%`);
}

function saveVisualSettingsManual() {
  const settings = {
    opacity: document.getElementById("slider-opacity")?.value || "90",
    brightness: document.getElementById("slider-brightness")?.value || "100",
    contrast: document.getElementById("slider-contrast")?.value || "100"
  };
  localStorage.setItem("KUSUMA_VISUAL_SETTINGS", JSON.stringify(settings));
  alert("✅ Pengaturan visual latar belakang berhasil disimpan ke sistem!");
}

function loadVisualSettings() {
  const saved = localStorage.getItem("KUSUMA_VISUAL_SETTINGS");
  if (!saved) {
    applyVisualStylesLive();
    return;
  }
  try {
    const s = JSON.parse(saved);
    if (s.opacity && document.getElementById("slider-opacity")) {
      document.getElementById("slider-opacity").value = s.opacity;
      const el = document.getElementById("val-opacity");
      if (el) el.innerText = `${s.opacity}%`;
    }
    if (s.brightness && document.getElementById("slider-brightness")) {
      document.getElementById("slider-brightness").value = s.brightness;
      const el = document.getElementById("val-brightness");
      if (el) el.innerText = `${s.brightness}%`;
    }
    if (s.contrast && document.getElementById("slider-contrast")) {
      document.getElementById("slider-contrast").value = s.contrast;
      const el = document.getElementById("val-contrast");
      if (el) el.innerText = `${s.contrast}%`;
    }
    applyVisualStylesLive();
  } catch (e) {
    console.warn("Gagal memuat visual settings:", e);
    applyVisualStylesLive();
  }
}

function resetVisualSettings() {
  localStorage.removeItem("KUSUMA_VISUAL_SETTINGS");
  if (document.getElementById("slider-opacity")) document.getElementById("slider-opacity").value = "90";
  if (document.getElementById("slider-brightness")) document.getElementById("slider-brightness").value = "100";
  if (document.getElementById("slider-contrast")) document.getElementById("slider-contrast").value = "100";
  
  if (document.getElementById("val-opacity")) document.getElementById("val-opacity").innerText = "90%";
  if (document.getElementById("val-brightness")) document.getElementById("val-brightness").innerText = "100%";
  if (document.getElementById("val-contrast")) document.getElementById("val-contrast").innerText = "100%";

  applyVisualStylesLive();
  alert("Pengaturan visual dikembalikan ke default.");
}

// ==============================================================================
// 5. AI STUDIO: KNOWLEDGE BASE & GUARDRAILS
// ==============================================================================
const DEFAULT_KALIBATA_KB = `SUPERBLOCK KALIBATA CITY INFORMATION:
- Lokasi: Jl. Raya Kalibata No.1, Rawajati, Pancoran, Jakarta Selatan 12750.
- Terdiri dari 18 Tower (Kalibata Residences, Kalibata Regency, dan Green Palace Resort).
- Aksesibilitas: 200 meter / 5 menit jalan kaki ke Stasiun KRL Duren Kalibata.
- Fasilitas: Mall Kalibata City Square (KCS) di basement, Farmers Market, Bioskop XXI, Food Court, ATM Center, Kolam Renang Tematik, Gym, Lapangan Basket/Futsal, Jogging Track.
- Tipe Unit: Studio (21 m2), 2 Bedroom Standard (33 m2), 2 Bedroom Green Palace Resort (35 m2).
- Minimal masa sewa: 1 Bulan (Tersedia sewa 3 Bulan, 6 Bulan, dan 1 Tahun).
- Deposit jaminan: 1 bulan sewa (dikembalikan utuh setelah masa sewa berakhir).`;

const DEFAULT_KALIBATA_GUARDRAILS = `1. NO DAILY RENTALS: Tolak dengan sopan pertanyaan sewa harian/transit. Fokus pada sewa bulanan & tahunan.
2. TONE & STYLE: Santun, ramah, profesional, bernuansa hangat (Gunakan sapaan Kak/Bapak/Ibu).
3. CONCISE: Maksimal 3-4 kalimat per respons agar nyaman dibaca di layar ponsel.
4. CALL TO ACTION: Ajak calon penyewa menjadwalkan survei unit secara langsung di lokasi.`;

function resetToStandardDefaults() {
  const kbEl = document.getElementById("ai-kb-text");
  const grEl = document.getElementById("ai-guardrail-text");

  if (kbEl) kbEl.value = DEFAULT_KALIBATA_KB;
  if (grEl) grEl.value = DEFAULT_KALIBATA_GUARDRAILS;

  alert("✅ Template Default Kalibata City berhasil dimuat ke editor!");
}

function handleClearAiConfig() {
  if (confirm("Apakah Anda yakin ingin mengosongkan teks Knowledge Base dan Guardrails?")) {
    const kbEl = document.getElementById("ai-kb-text");
    const grEl = document.getElementById("ai-guardrail-text");
    if (kbEl) kbEl.value = "";
    if (grEl) grEl.value = "";
  }
}

function handleAiFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const content = e.target.result;
    const kbEl = document.getElementById("ai-kb-text");
    if (kbEl) {
      kbEl.value = (kbEl.value ? kbEl.value + "\n\n" : "") + content;
      alert("✅ Berkas berhasil diunggah dan ditambahkan ke Knowledge Base!");
    }
  };
  reader.readAsText(file);
}

async function loadAiConfig() {
  const kbEl = document.getElementById("ai-kb-text");
  const grEl = document.getElementById("ai-guardrail-text");
  
  if (kbEl && !kbEl.value) kbEl.value = DEFAULT_KALIBATA_KB;
  if (grEl && !grEl.value) grEl.value = DEFAULT_KALIBATA_GUARDRAILS;
}

async function handleSaveAiConfig(e) {
  if (e && e.preventDefault) e.preventDefault();

  const kb = document.getElementById("ai-kb-text")?.value.trim() || "";
  const guardrails = document.getElementById("ai-guardrail-text")?.value.trim() || "";

  const passcode = prompt("Masukkan Passcode Admin:");
  if (!passcode) return;

  const btn = document.getElementById("btn-save-ai");
  if (btn) {
    btn.disabled = true;
    btn.innerText = "Menyimpan...";
  }

  try {
    const res = await fetch(MASTER_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "saveAiConfig",
        passcode: passcode,
        knowledgeBase: kb,
        guardrails: guardrails
      })
    });

    const data = await res.json();
    if (data.success) {
      alert("✅ Berhasil: " + data.message);
    } else {
      alert("❌ Gagal: " + data.error);
    }
  } catch (err) {
    alert("❌ Kendala jaringan: " + err.toString());
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = "Simpan Knowledge";
    }
  }
}

// ==============================================================================
// 6. CMS UNIT POPULER & UTILS
// ==============================================================================
function savePopularUnitsCMS() {
  const cmsData = {
    u1: {
      badge: document.getElementById("cms-u1-badge")?.value || "",
      title: document.getElementById("cms-u1-title")?.value || "",
      desc: document.getElementById("cms-u1-desc")?.value || "",
      price: document.getElementById("cms-u1-price")?.value || "0"
    },
    u2: {
      badge: document.getElementById("cms-u2-badge")?.value || "",
      title: document.getElementById("cms-u2-title")?.value || "",
      desc: document.getElementById("cms-u2-desc")?.value || "",
      price: document.getElementById("cms-u2-price")?.value || "0"
    },
    u3: {
      badge: document.getElementById("cms-u3-badge")?.value || "",
      title: document.getElementById("cms-u3-title")?.value || "",
      desc: document.getElementById("cms-u3-desc")?.value || "",
      price: document.getElementById("cms-u3-price")?.value || "0"
    }
  };

  localStorage.setItem("KUSUMA_POPULAR_UNITS_CMS", JSON.stringify(cmsData));
  alert("✅ Konten Tipe Unit Populer berhasil disimpan!");
}

function loadPopularUnitsCMS() {
  const saved = localStorage.getItem("KUSUMA_POPULAR_UNITS_CMS");
  if (!saved) return;
  try {
    const d = JSON.parse(saved);
    if (d.u1) {
      if (document.getElementById("cms-u1-badge")) document.getElementById("cms-u1-badge").value = d.u1.badge;
      if (document.getElementById("cms-u1-title")) document.getElementById("cms-u1-title").value = d.u1.title;
      if (document.getElementById("cms-u1-desc")) document.getElementById("cms-u1-desc").value = d.u1.desc;
      if (document.getElementById("cms-u1-price")) document.getElementById("cms-u1-price").value = d.u1.price;
    }
    if (d.u2) {
      if (document.getElementById("cms-u2-badge")) document.getElementById("cms-u2-badge").value = d.u2.badge;
      if (document.getElementById("cms-u2-title")) document.getElementById("cms-u2-title").value = d.u2.title;
      if (document.getElementById("cms-u2-desc")) document.getElementById("cms-u2-desc").value = d.u2.desc;
      if (document.getElementById("cms-u2-price")) document.getElementById("cms-u2-price").value = d.u2.price;
    }
    if (d.u3) {
      if (document.getElementById("cms-u3-badge")) document.getElementById("cms-u3-badge").value = d.u3.badge;
      if (document.getElementById("cms-u3-title")) document.getElementById("cms-u3-title").value = d.u3.title;
      if (document.getElementById("cms-u3-desc")) document.getElementById("cms-u3-desc").value = d.u3.desc;
      if (document.getElementById("cms-u3-price")) document.getElementById("cms-u3-price").value = d.u3.price;
    }
  } catch (e) {
    console.warn("Gagal memuat CMS units:", e);
  }
}

function resetPopularUnitsCMS() {
  localStorage.removeItem("KUSUMA_POPULAR_UNITS_CMS");
  alert("Pengaturan unit dikembalikan ke standar.");
  location.reload();
}

function formatRupiah(num) {
  return "Rp " + Number(num).toLocaleString("id-ID");
}

function toggleMobileDrawer() {
  const drawer = document.getElementById("mobile-drawer");
  if (drawer) drawer.classList.toggle("hidden");
}

function logoutAdminSession() {
  sessionStorage.removeItem("kusuma_admin_passcode");
  alert("Sesi admin ditutup.");
  window.location.href = "index.html";
}