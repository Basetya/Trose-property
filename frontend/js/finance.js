/**
 * Trose Property Manager - 3-Tier Financial Renderer
 * File: frontend/js/finance.js
 */

let cachedFinancials = null;

async function loadFinancialData() {
  try {
    const res = await gasApiCall("getFinancials");
    if (res && res.success && res.data) {
      cachedFinancials = res.data;
      renderAllFinancials(res.data);
      return;
    }
  } catch (err) {
    console.warn("GAS Financials API error:", err);
  }

  // Fallback clean view
  renderAllFinancials({
    propertyManager: { leasingAcquisitionFees: 0, managementFees: 0, totalPMRevenue: 0 },
    landlordStatements: [],
    corporate: { grossRevenueCollected: 0, totalExpenses: 0, netOperatingIncome: 0, estimatedCapRate: "0.00%" }
  });
}

function renderAllFinancials(data) {
  // 1. Render PM View
  const pm = data.propertyManager || {};
  document.getElementById("pm-leasing-fee").innerText = `Rp ${Number(pm.leasingAcquisitionFees || 0).toLocaleString('id-ID')}`;
  document.getElementById("pm-mgmt-fee").innerText = `Rp ${Number(pm.managementFees || 0).toLocaleString('id-ID')}`;
  document.getElementById("pm-total-revenue").innerText = `Rp ${Number(pm.totalPMRevenue || 0).toLocaleString('id-ID')}`;

  // 2. Render Landlord Statements
  const tbody = document.getElementById("table-landlords-body");
  if (tbody) {
    const list = data.landlordStatements || [];
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-400 font-medium">Belum ada data unit atau transaksi landlord.</td></tr>`;
    } else {
      tbody.innerHTML = list.map(ls => `
        <tr class="border-b border-slate-100 hover:bg-slate-50 transition">
          <td class="py-3 px-4 font-bold text-slate-900">${ls.ownerName} <span class="block text-xs font-normal text-slate-500">${ls.phone}</span></td>
          <td class="py-3 px-4 font-semibold text-slate-700">${ls.totalUnits} Unit</td>
          <td class="py-3 px-4 font-mono font-medium text-slate-800">Rp ${Number(ls.grossRental || 0).toLocaleString('id-ID')}</td>
          <td class="py-3 px-4 font-mono text-rose-600">- Rp ${Number(ls.mgmtFeeDeduction || 0).toLocaleString('id-ID')}</td>
          <td class="py-3 px-4 font-mono text-rose-600">- Rp ${Number(ls.maintenanceDeduction || 0).toLocaleString('id-ID')}</td>
          <td class="py-3 px-4 font-mono text-rose-600">- Rp ${Number(ls.iplDeduction || 0).toLocaleString('id-ID')}</td>
          <td class="py-3 px-4 font-mono font-black text-emerald-600">Rp ${Number(ls.netPayout || 0).toLocaleString('id-ID')}</td>
        </tr>
      `).join('');
    }
  }

  // 3. Render Corporate View
  const corp = data.corporate || {};
  document.getElementById("corp-gross").innerText = `Rp ${Number(corp.grossRevenueCollected || 0).toLocaleString('id-ID')}`;
  document.getElementById("corp-expenses").innerText = `Rp ${Number(corp.totalExpenses || 0).toLocaleString('id-ID')}`;
  document.getElementById("corp-noi").innerText = `Rp ${Number(corp.netOperatingIncome || 0).toLocaleString('id-ID')}`;
  document.getElementById("corp-cap-rate").innerText = corp.estimatedCapRate || "0.00%";
}

function switchFinancialRole(role) {
  const views = ["pm", "landlord", "corporate"];
  views.forEach(v => {
    document.getElementById(`view-${v}`).classList.add("hidden");
    const btn = document.getElementById(`tab-btn-${v}`);
    btn.className = "px-4 py-2 text-xs font-bold rounded-xl text-slate-400 hover:text-white transition";
  });

  document.getElementById(`view-${role}`).classList.remove("hidden");
  const activeBtn = document.getElementById(`tab-btn-${role}`);
  activeBtn.className = "px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white transition";
}

document.addEventListener("DOMContentLoaded", () => {
  loadFinancialData();
});
