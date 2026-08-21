/**
 * Trose Property Manager - Units Module Logic
 * File: frontend/js/units.js
 */

async function loadUnitsTable() {
  try {
    const data = await gasApiCall("getUnits");
    if (data && data.success && Array.isArray(data.units)) {
      renderUnitsTable(data.units);
      return;
    }
  } catch (err) {
    console.warn("GAS API error fetching units:", err);
  }
  renderUnitsTable([]);
}

function renderUnitsTable(units) {
  const tbody = document.getElementById("table-units-body");
  if (!tbody) return;

  if (units.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-400 font-medium">Belum ada unit terdaftar di database. Silakan klik '+ Tambah Unit Baru'.</td></tr>`;
    return;
  }

  tbody.innerHTML = units.map(u => `
    <tr class="border-b border-slate-100 hover:bg-slate-50 transition">
      <td class="py-3 px-4 font-mono font-bold text-slate-800">${u.Unit_ID}</td>
      <td class="py-3 px-4 font-semibold text-slate-900">${u.Tower} #${u.Unit_No} (Lt.${u.Floor || '-'})</td>
      <td class="py-3 px-4 text-slate-600">${u.Type || 'Studio'}</td>
      <td class="py-3 px-4 font-mono font-medium text-slate-800">Rp ${Number(u.Base_Rent || 0).toLocaleString('id-ID')}</td>
      <td class="py-3 px-4">
        <span class="px-2.5 py-1 text-xs font-semibold rounded-full ${
          u.Status === 'Occupied' ? 'bg-emerald-100 text-emerald-700' :
          u.Status === 'Available' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
        }">
          ${u.Status || 'Available'}
        </span>
      </td>
      <td class="py-3 px-4 text-xs text-slate-500">${u.Payment_Route} (${u.Bank_Name || 'BCA'})</td>
      <td class="py-3 px-4 text-right">
        <select onchange="updateUnitStatusLive('${u.Unit_ID}', this.value)" class="text-xs border border-slate-300 rounded-lg px-2 py-1 bg-white text-slate-800">
          <option value="">Set Status</option>
          <option value="Available">Available</option>
          <option value="Occupied">Occupied</option>
          <option value="Maintenance">Maintenance</option>
        </select>
      </td>
    </tr>
  `).join('');
}

function updateUnitStatusLive(unitId, status) {
  if (!status) return;
  ensureAdminPasscode(async () => {
    try {
      const res = await gasApiCall("updateUnitStatus", { unitId: unitId, status: status }, "POST");
      if (res && res.success) {
        showToast(res.message || "Status unit berhasil diubah!");
        loadUnitsTable();
      } else {
        showToast(res.error || "Gagal mengubah status unit", "error");
      }
    } catch (e) {
      showToast("Gagal menghubungi server", "error");
    }
  });
}

function openNewUnitModal() {
  document.getElementById("modal-new-unit").classList.remove("hidden");
}

function closeNewUnitModal() {
  document.getElementById("modal-new-unit").classList.add("hidden");
}

async function submitNewUnit(e) {
  e.preventDefault();
  const formData = {
    tower: document.getElementById("unit-tower").value,
    unitNo: document.getElementById("unit-number").value,
    floor: document.getElementById("unit-floor").value,
    type: document.getElementById("unit-type").value,
    baseRent: document.getElementById("unit-rent").value,
    paymentRoute: document.getElementById("unit-route").value,
    bankName: document.getElementById("unit-bank").value,
    bankAccountNo: document.getElementById("unit-account-no").value,
    bankHolderName: document.getElementById("unit-holder").value
  };

  ensureAdminPasscode(async () => {
    const btn = document.getElementById("btn-submit-unit");
    btn.disabled = true;
    btn.innerText = "Menyimpan...";

    try {
      const res = await gasApiCall("createUnit", { data: formData }, "POST");
      if (res && res.success) {
        showToast("Unit baru berhasil didaftarkan ke Google Sheets!");
        closeNewUnitModal();
        document.getElementById("form-new-unit").reset();
        loadUnitsTable();
      } else {
        showToast(res.error || "Gagal membuat unit", "error");
      }
    } catch (err) {
      showToast("Error saat menyimpan unit", "error");
    } finally {
      btn.disabled = false;
      btn.innerText = "Simpan Unit";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadUnitsTable();
  const form = document.getElementById("form-new-unit");
  if (form) form.addEventListener("submit", submitNewUnit);
});
