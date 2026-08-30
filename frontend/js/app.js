/**
 * Kusuma Properti Manager - Frontend Application Core
 * File: js/app.js
 * Version: v46.1.0 (Sanitized Official WhatsApp & Multi-Module Synchronizer)
 */

// Konfigurasi URL Master
const MASTER_API_URL = (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) 
  ? window.APP_CONFIG.API_BASE_URL 
  : "https://script.google.com/macros/s/AKfycbxZ7ctf2V1Peo969s3UPBQxoHkaSyZMdstGosy8V1ZGL_fF-xSP0wf7L9Gv3qMhJOQ_nQ/exec";

// ==============================================================================
// 1. INISIALISASI UTAMA
// ==============================================================================
document.addEventListener("DOMContentLoaded", () => {
  fetchDashboard();
  syncOfficialWhatsAppNumber();
});

// ==============================================================================
// 2. DASHBOARD DATA FETCHING (Metrik & Tagihan)
// ==============================================================================
async function fetchDashboard() {
  try {
    const res = await fetch(`${MASTER_API_URL}?action=getDashboardData&_t=${Date.now()}`);
    const data = await res.json();

    if (data.success && data.stats) {
      // Perbarui Metrik Kartu
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

      // Render Baris Tagihan (Invoices)
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
// 3. SINKRONISASI RESMI NOMOR WHATSAPP (Default: 628135600058)
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

  // Fallback pasti jika server belum merespon
  if (inputEl) inputEl.value = "628135600058";
  if (badgeEl) badgeEl.innerText = "Aktif: +628135600058";
}

// ==============================================================================
// 4. KONTROL CMS POPULAR UNITS & VISUAL THEME
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
  alert("✅ Konten Tipe Unit Populer berhasil disimpan secara lokal & diterapkan ke Landing Page!");
}

function resetPopularUnitsCMS() {
  localStorage.removeItem("KUSUMA_POPULAR_UNITS_CMS");
  alert("Pengaturan unit dikembalikan ke standar awal.");
  location.reload();
}

function handleVisualSliderLive(type, val) {
  const valEl = document.getElementById(`val-${type}`);
  if (valEl) valEl.innerText = `${val}%`;
}

function saveVisualSettingsManual() {
  const settings = {
    opacity: document.getElementById("slider-opacity")?.value || "90",
    brightness: document.getElementById("slider-brightness")?.value || "100",
    contrast: document.getElementById("slider-contrast")?.value || "100"
  };
  localStorage.setItem("KUSUMA_VISUAL_SETTINGS", JSON.stringify(settings));
  alert("✅ Efek visual latar belakang Japandi berhasil disimpan!");
}

function resetVisualSettings() {
  localStorage.removeItem("KUSUMA_VISUAL_SETTINGS");
  alert("Efek visual dikembalikan ke default.");
  location.reload();
}

// ==============================================================================
// 5. HELPER UTILS
// ==============================================================================
function formatRupiah(num) {
  return "Rp " + Number(num).toLocaleString("id-ID");
}

function toggleMobileDrawer() {
  const drawer = document.getElementById("mobile-drawer");
  if (drawer) drawer.classList.toggle("hidden");
}

function logoutAdminSession() {
  sessionStorage.clear();
  alert("Sesi admin ditutup.");
  location.reload();
}