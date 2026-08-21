/**
 * Trose Property Manager - Maintenance Module Logic
 * File: frontend/js/maintenance.js
 */

async function loadMaintenanceTable() {
  try {
    const data = await gasApiCall("getMaintenance");
    if (data && data.success && Array.isArray(data.maintenance)) {
      renderMaintenanceTable(data.maintenance);
      return;
    }
  } catch (err) {
    console.warn("GAS API error fetching maintenance:", err);
  }
  renderMaintenanceTable([]);
}

function renderMaintenanceTable(tickets) {
  const tbody = document.getElementById("table-maintenance-body");
  if (!tbody) return;

  if (tickets.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-400 font-medium">Tidak ada kendala perbaikan unit saat ini.</td></tr>`;
    return;
  }

  tbody.innerHTML = tickets.map(t => `
    <tr class="border-b border-slate-100 hover:bg-slate-50 transition">
      <td class="py-3 px-4 font-mono font-bold text-slate-800">${t.Ticket_ID}</td>
      <td class="py-3 px-4 font-semibold text-slate-900">${t.unitDisplay || t.Unit_ID}</td>
      <td class="py-3 px-4 text-slate-700 font-medium">${t.Issue_Description}</td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 text-xs font-bold rounded-full ${
          t.Priority === 'Emergency' ? 'bg-rose-100 text-rose-700' :
          t.Priority === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
        }">
          ${t.Priority || 'Medium'}
        </span>
      </td>
      <td class="py-3 px-4 text-xs text-slate-600">${t.Assigned_Vendor || 'In-House'}</td>
      <td class="py-3 px-4">
        <span class="px-2.5 py-1 text-xs font-semibold rounded-full ${t.Status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}">
          ${t.Status || 'In_Progress'}
        </span>
      </td>
      <td class="py-3 px-4 text-right">
        <select onchange="updateTicketStatusLive('${t.Ticket_ID}', this.value)" class="text-xs border border-slate-300 rounded-lg px-2 py-1 bg-white text-slate-800">
          <option value="">Set Status</option>
          <option value="In_Progress">In Progress</option>
          <option value="Waiting_Parts">Waiting Parts</option>
          <option value="Resolved">Resolved (Selesai)</option>
        </select>
      </td>
    </tr>
  `).join('');
}

function updateTicketStatusLive(ticketId, status) {
  if (!status) return;
  ensureAdminPasscode(async () => {
    try {
      const res = await gasApiCall("updateMaintenanceStatus", { ticketId: ticketId, status: status }, "POST");
      if (res && res.success) {
        showToast(res.message || "Status tiket berhasil diupdate!");
        loadMaintenanceTable();
      } else {
        showToast(res.error || "Gagal update status", "error");
      }
    } catch (e) {
      showToast("Error server", "error");
    }
  });
}

async function populateMaintenanceUnitDropdown() {
  const select = document.getElementById("ticket-unit-id");
  if (!select) return;

  try {
    const data = await gasApiCall("getUnits");
    if (data && data.success && Array.isArray(data.units)) {
      select.innerHTML = `<option value="">Pilih Unit...</option>` +
        data.units.map(u => `<option value="${u.Unit_ID}">${u.Tower} #${u.Unit_No}</option>`).join('');
    }
  } catch (e) {}
}

function openNewTicketModal() {
  populateMaintenanceUnitDropdown();
  document.getElementById("modal-new-ticket").classList.remove("hidden");
}

function closeNewTicketModal() {
  document.getElementById("modal-new-ticket").classList.add("hidden");
}

async function submitNewTicket(e) {
  e.preventDefault();
  const formData = {
    unitId: document.getElementById("ticket-unit-id").value,
    priority: document.getElementById("ticket-priority").value,
    issueDescription: document.getElementById("ticket-desc").value,
    assignedVendor: document.getElementById("ticket-vendor").value
  };

  ensureAdminPasscode(async () => {
    const btn = document.getElementById("btn-submit-ticket");
    btn.disabled = true;
    btn.innerText = "Menyimpan...";

    try {
      const res = await gasApiCall("createMaintenance", { data: formData }, "POST");
      if (res && res.success) {
        showToast("Tiket maintenance berhasil dibuat!");
        closeNewTicketModal();
        document.getElementById("form-new-ticket").reset();
        loadMaintenanceTable();
      } else {
        showToast(res.error || "Gagal membuat tiket", "error");
      }
    } catch (err) {
      showToast("Error saat menyimpan tiket", "error");
    } finally {
      btn.disabled = false;
      btn.innerText = "Simpan Tiket";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadMaintenanceTable();
  const form = document.getElementById("form-new-ticket");
  if (form) form.addEventListener("submit", submitNewTicket);
});
