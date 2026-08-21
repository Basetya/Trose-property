/**
 * Trose Property Manager - Live CRM Kanban Logic (v2.4 Zero Dummy)
 * File: frontend/js/crm.js
 */

async function loadCrmData() {
  try {
    const data = await gasApiCall("getLeads");
    if (data && data.success && Array.isArray(data.pipeline)) {
      renderKanban(data.pipeline);
      return;
    }
  } catch (err) {
    console.warn("Connecting to GAS CRM Pipeline...", err);
  }
  renderKanban([]);
}

function renderKanban(leads) {
  const stages = ["Inquiry", "Viewing", "Negotiation", "Deal"];
  
  stages.forEach(stage => {
    const col = document.getElementById(`col-${stage.toLowerCase()}`);
    if (!col) return;
    
    const filtered = leads.filter(l => (l.Stage || "").toLowerCase() === stage.toLowerCase());
    
    if (filtered.length === 0) {
      col.innerHTML = `<div class="text-xs text-slate-500 italic p-6 text-center border border-dashed border-slate-800 rounded-xl">Kosong</div>`;
      return;
    }

    col.innerHTML = filtered.map(lead => `
      <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition mb-3 text-slate-900">
        <div class="flex justify-between items-start mb-2">
          <span class="text-xs font-bold text-slate-500 uppercase font-mono">${lead.Lead_ID || "-"}</span>
          <span class="px-2 py-0.5 text-xs font-bold rounded-full ${Number(lead.leadScore) >= 70 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}">
            Score: ${lead.leadScore || 50}
          </span>
        </div>
        <h4 class="font-bold text-slate-900">${lead.contactName || "Calon Penyewa"}</h4>
        <p class="text-xs text-slate-500 mt-1">Target: <span class="font-semibold text-slate-700">${lead.unitDetails || "-"}</span></p>
        <p class="text-xs text-slate-500">Budget: <span class="font-semibold text-slate-700">Rp ${Number(lead.Budget_Monthly || 0).toLocaleString('id-ID')}</span></p>
        <div class="mt-2.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          Catatan: ${lead.Interaction_Notes || "Belum ada catatan interaksi."}
        </div>
        <div class="mt-3 flex justify-between items-center pt-2 border-t border-slate-100">
          <a href="https://wa.me/${String(lead.phone || '').replace(/[^0-9]/g, '')}" target="_blank" class="text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
            WhatsApp
          </a>
          <select onchange="requestUpdateLeadStage('${lead.Lead_ID}', this.value)" class="text-xs border border-slate-300 rounded-lg px-2 py-1 bg-white text-slate-800 font-medium">
            <option value="">Pindah &rarr;</option>
            <option value="Inquiry" ${lead.Stage === 'Inquiry' ? 'disabled' : ''}>Inquiry</option>
            <option value="Viewing" ${lead.Stage === 'Viewing' ? 'disabled' : ''}>Viewing</option>
            <option value="Negotiation" ${lead.Stage === 'Negotiation' ? 'disabled' : ''}>Negotiation</option>
            <option value="Deal" ${lead.Stage === 'Deal' ? 'disabled' : ''}>Deal</option>
          </select>
        </div>
      </div>
    `).join('');
  });
}

function requestUpdateLeadStage(leadId, newStage) {
  if (!newStage) return;

  ensureAdminPasscode(async () => {
    showToast(`Memindahkan ${leadId} ke stage ${newStage}...`);
    try {
      const res = await gasApiCall("updateLeadStage", { leadId: leadId, stage: newStage }, "POST");
      if (res && res.success) {
        showToast(res.message || "Stage berhasil diperbarui!");
        loadCrmData();
      } else {
        showToast(res.error || "Gagal memperbarui stage", "error");
      }
    } catch (err) {
      showToast("Gagal terhubung ke Google Sheets", "error");
    }
  });
}

function openNewLeadModal() {
  document.getElementById("modal-new-lead").classList.remove("hidden");
}

function closeNewLeadModal() {
  document.getElementById("modal-new-lead").classList.add("hidden");
}

async function submitNewLead(e) {
  e.preventDefault();
  const formData = {
    fullName: document.getElementById("lead-name").value,
    phone: document.getElementById("lead-phone").value,
    email: document.getElementById("lead-email").value,
    targetUnit: document.getElementById("lead-unit").value,
    budget: document.getElementById("lead-budget").value,
    stage: document.getElementById("lead-stage").value,
    notes: document.getElementById("lead-notes").value
  };

  ensureAdminPasscode(async () => {
    const btn = document.getElementById("btn-submit-lead");
    btn.disabled = true;
    btn.innerText = "Menyimpan...";

    try {
      const res = await gasApiCall("createLead", { data: formData }, "POST");
      if (res && res.success) {
        showToast("Lead baru berhasil disimpan ke Google Sheets!");
        closeNewLeadModal();
        document.getElementById("form-new-lead").reset();
        loadCrmData();
      } else {
        showToast(res.error || "Gagal membuat lead", "error");
      }
    } catch (err) {
      showToast("Error saat mengirim data", "error");
    } finally {
      btn.disabled = false;
      btn.innerText = "Simpan Lead";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadCrmData();
  const leadForm = document.getElementById("form-new-lead");
  if (leadForm) leadForm.addEventListener("submit", submitNewLead);
});
