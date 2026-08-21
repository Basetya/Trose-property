/**
 * Trose Property Manager - Owner Portal Logic
 * File: frontend/js/owner-portal.js
 */

async function loadOwnerPortal() {
  const urlParams = new URLSearchParams(window.location.search);
  const ownerName = urlParams.get('name') || "Budi Santoso";

  try {
    const res = await gasApiCall("getOwnerStatement", { ownerName: ownerName });
    if (res && res.success && res.statement) {
      renderOwnerStatement(res.statement);
      return;
    }
  } catch (err) {
    console.warn("GAS Owner Statement API error:", err);
  }

  // Fallback visual mock
  renderOwnerStatement({
    ownerName: ownerName,
    phone: "081122334455",
    totalUnits: 1,
    grossRental: 6500000,
    mgmtFeeDeduction: 650000,
    maintenanceDeduction: 250000,
    iplDeduction: 450000,
    netPayout: 5150000
  });
}

function renderOwnerStatement(st) {
  document.getElementById("owner-name-title").innerText = `Laporan ${st.ownerName}`;
  document.getElementById("owner-phone-sub").innerText = `No. Kontak: ${st.phone || '-'}`;
  document.getElementById("owner-total-units").innerText = `${st.totalUnits} Unit`;
  document.getElementById("owner-gross-rent").innerText = `Rp ${Number(st.grossRental || 0).toLocaleString('id-ID')}`;
  document.getElementById("owner-deduct-mgmt").innerText = `- Rp ${Number(st.mgmtFeeDeduction || 0).toLocaleString('id-ID')}`;
  document.getElementById("owner-deduct-maint").innerText = `- Rp ${Number(st.maintenanceDeduction || 0).toLocaleString('id-ID')}`;
  document.getElementById("owner-deduct-ipl").innerText = `- Rp ${Number(st.iplDeduction || 0).toLocaleString('id-ID')}`;
  document.getElementById("owner-net-payout").innerText = `Rp ${Number(st.netPayout || 0).toLocaleString('id-ID')}`;
}

document.addEventListener("DOMContentLoaded", () => {
  loadOwnerPortal();
});
