/**
 * Trose Property Manager - Inspection Engine Logic
 * File: frontend/js/inspections.js
 */

async function loadInspectionsTable() {
  try {
    const data = await gasApiCall("getInspections");
    if (data && data.success && Array.isArray(data.inspections)) {
      renderInspectionsTable(data.inspections);
      return;
    }
  } catch (err) {
    console.warn("GAS API error fetching inspections:", err);
  }
  renderInspectionsTable([]);
}

function renderInspectionsTable(inspections) {
  const tbody = document.getElementById("table-inspections-body");
  if (!tbody) return;

  if (inspections.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400 font-medium">Belum ada data audit inspeksi unit. Silakan klik '+ Catat Inspeksi Baru'.</td></tr>`;
    return;
  }

  tbody.innerHTML = inspections.map(i => `
    <tr class="border-b border-slate-100 hover:bg-slate-50 transition">
      <td class="py-3 px-4 font-mono font-bold text-slate-800">${i.Inspection_ID}</td>
      <td class="py-3 px-4 font-semibold text-slate-900">${i.Unit_ID}</td>
      <td class="py-3 px-4">
        <span class="px-2.5 py-1 text-xs font-semibold rounded-full ${i.Type === 'Move_In' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}">
          ${i.Type || 'Move_In'}
        </span>
      </td>
      <td class="py-3 px-4 text-xs text-slate-600">
        Living: <b>${i.Living_Room_Condition}</b> | Bed: <b>${i.Bedroom_Condition}</b> | AC: <b>${i.AC_Condition}</b>
      </td>
      <td class="py-3 px-4 font-mono font-bold text-rose-600">Rp ${Number(i.Deposit_Deduction_Est || 0).toLocaleString('id-ID')}</td>
      <td class="py-3 px-4 text-xs text-slate-500">${String(i.Inspection_Date || '').substring(0, 10)}</td>
    </tr>
  `).join('');
}

async function populateInspectionUnitDropdown() {
  const select = document.getElementById("insp-unit-id");
  if (!select) return;

  try {
    const data = await gasApiCall("getUnits");
    if (data && data.success && Array.isArray(data.units)) {
      select.innerHTML = `<option value="">Pilih Unit...</option>` +
        data.units.map(u => `<option value="${u.Unit_ID}">${u.Tower} #${u.Unit_No}</option>`).join('');
    }
  } catch (e) {}
}

function openNewInspectionModal() {
  populateInspectionUnitDropdown();
  document.getElementById("modal-new-inspection").classList.remove("hidden");
}

function closeNewInspectionModal() {
  document.getElementById("modal-new-inspection").classList.add("hidden");
}

async function submitNewInspection(e) {
  e.preventDefault();
  const formData = {
    unitId: document.getElementById("insp-unit-id").value,
    type: document.getElementById("insp-type").value,
    livingRoom: document.getElementById("insp-living").value,
    bedroom: document.getElementById("insp-bedroom").value,
    bathroom: document.getElementById("insp-bathroom").value,
    ac: document.getElementById("insp-ac").value,
    depositDeduction: document.getElementById("insp-deduction").value,
    photoUrls: document.getElementById("insp-photos").value,
    notes: document.getElementById("insp-notes").value
  };

  ensureAdminPasscode(async () => {
    const btn = document.getElementById("btn-submit-insp");
    btn.disabled = true;
    btn.innerText = "Menyimpan...";

    try {
      const res = await gasApiCall("createInspection", { data: formData }, "POST");
      if (res && res.success) {
        showToast("Inspeksi berhasil dicatat!");
        closeNewInspectionModal();
        document.getElementById("form-new-inspection").reset();
        loadInspectionsTable();
      } else {
        showToast(res.error || "Gagal menyimpan inspeksi", "error");
      }
    } catch (err) {
      showToast("Error saat menyimpan inspeksi", "error");
    } finally {
      btn.disabled = false;
      btn.innerText = "Simpan Hasil Audit";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadInspectionsTable();
  const form = document.getElementById("form-new-inspection");
  if (form) form.addEventListener("submit", submitNewInspection);
});
