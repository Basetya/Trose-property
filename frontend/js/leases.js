/**
 * Trose Property Manager - Leases & Tenant 360 Logic
 * File: frontend/js/leases.js
 */

async function loadLeasesTable() {
  try {
    const data = await gasApiCall("getLeases");
    if (data && data.success && Array.isArray(data.leases)) {
      renderLeasesTable(data.leases);
      return;
    }
  } catch (err) {
    console.warn("GAS API error fetching leases:", err);
  }
  renderLeasesTable([]);
}

function renderLeasesTable(leases) {
  const tbody = document.getElementById("table-leases-body");
  if (!tbody) return;

  if (leases.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-400 font-medium">Belum ada kontrak sewa aktif. Silakan klik '+ Buat Kontrak Sewa Baru'.</td></tr>`;
    return;
  }

  tbody.innerHTML = leases.map(l => `
    <tr class="border-b border-slate-100 hover:bg-slate-50 transition">
      <td class="py-3 px-4 font-mono font-bold text-slate-800">${l.Lease_ID}</td>
      <td class="py-3 px-4 font-semibold text-slate-900">${l.unitDisplay || l.Unit_ID}</td>
      <td class="py-3 px-4">
        <p class="font-bold text-slate-800">${l.tenantName || 'Tenant'}</p>
        <p class="text-xs text-slate-500">${l.tenantPhone || '-'}</p>
      </td>
      <td class="py-3 px-4 text-xs text-slate-600">${l.Start_Date || '-'} s/d ${l.End_Date || '-'}</td>
      <td class="py-3 px-4 font-mono font-medium text-slate-800">Rp ${Number(l.Monthly_Rent || 0).toLocaleString('id-ID')}</td>
      <td class="py-3 px-4">
        <span class="px-2.5 py-1 text-xs font-semibold rounded-full ${l.Status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}">
          ${l.Status || 'Active'}
        </span>
      </td>
      <td class="py-3 px-4 text-right">
        <a href="https://wa.me/${String(l.tenantPhone || '').replace(/[^0-9]/g, '')}" target="_blank" class="text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
          WhatsApp
        </a>
      </td>
    </tr>
  `).join('');
}

async function populateUnitDropdown() {
  const select = document.getElementById("lease-unit-id");
  if (!select) return;

  try {
    const data = await gasApiCall("getUnits");
    if (data && data.success && Array.isArray(data.units)) {
      const avail = data.units.filter(u => u.Status === "Available");
      select.innerHTML = `<option value="">Pilih Unit Tersedia (${avail.length} Unit)...</option>` +
        avail.map(u => `<option value="${u.Unit_ID}">${u.Tower} #${u.Unit_No} - Rp ${Number(u.Base_Rent).toLocaleString('id-ID')}/bln</option>`).join('');
    }
  } catch (e) {}
}

function openNewLeaseModal() {
  populateUnitDropdown();
  document.getElementById("modal-new-lease").classList.remove("hidden");
}

function closeNewLeaseModal() {
  document.getElementById("modal-new-lease").classList.add("hidden");
}

async function submitNewLease(e) {
  e.preventDefault();
  const formData = {
    unitId: document.getElementById("lease-unit-id").value,
    tenantName: document.getElementById("lease-tenant-name").value,
    tenantPhone: document.getElementById("lease-tenant-phone").value,
    startDate: document.getElementById("lease-start").value,
    endDate: document.getElementById("lease-end").value,
    monthlyRent: document.getElementById("lease-rent").value,
    depositAmount: document.getElementById("lease-deposit").value
  };

  ensureAdminPasscode(async () => {
    const btn = document.getElementById("btn-submit-lease");
    btn.disabled = true;
    btn.innerText = "Mengaktifkan...";

    try {
      const res = await gasApiCall("createLease", { data: formData }, "POST");
      if (res && res.success) {
        showToast("Kontrak sewa berhasil diaktifkan!");
        closeNewLeaseModal();
        document.getElementById("form-new-lease").reset();
        loadLeasesTable();
      } else {
        showToast(res.error || "Gagal membuat kontrak", "error");
      }
    } catch (err) {
      showToast("Error saat mengaktifkan kontrak", "error");
    } finally {
      btn.disabled = false;
      btn.innerText = "Aktifkan Kontrak";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadLeasesTable();
  const form = document.getElementById("form-new-lease");
  if (form) form.addEventListener("submit", submitNewLease);
});
