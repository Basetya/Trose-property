/**
 * Trose Property Manager - Dashboard Logic & Settings Handler (v5.4)
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
      invTable.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400 font-medium">Belum ada tagihan sewa terdaftar di Google Sheets.</td></tr>`;
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

async function handleSaveWaSettings(e) {
  e.preventDefault();
  const input = document.getElementById("admin-wa-input");
  const val = input.value.trim();
  if (!val) return;

  const btn = document.getElementById("btn-save-wa");
  btn.disabled = true;
  btn.innerText = "Menyimpan...";

  try {
    const res = await gasApiCall("updatePublicSettings", { waNumber: val }, "POST");
    if (res && res.success) {
      showToast(res.message || "Nomor WhatsApp berhasil diperbarui!");
      OFFICIAL_WA_NUMBER = val;
    } else {
      showToast(res.error || "Gagal memperbarui nomor WA", "error");
    }
  } catch (err) {
    showToast("Error saat menghubungi server", "error");
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
  ensureAdminPasscode(async () => {
    if (!confirm(`Verifikasi pembayaran untuk invoice ${invoiceId} sebagai LUNAS?`)) return;

    try {
      const res = await gasApiCall("verifyPayment", { invoiceId: invoiceId }, "POST");
      if (res && res.success) {
        showToast(res.message || "Invoice berhasil diverifikasi!");
        fetchDashboard();
      } else {
        showToast(res.error || "Gagal verifikasi pembayaran", "error");
      }
    } catch (err) {
      showToast("Error menghubungi server", "error");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("stat-occupancy")) {
    fetchDashboard();
  }
});