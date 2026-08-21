/**
 * Trose Property Manager - Billing & Dunning Logic (v4.0)
 * File: frontend/js/billing.js
 */

async function loadBillingTable() {
  try {
    const data = await gasApiCall("getInvoices");
    if (data && data.success && Array.isArray(data.invoices)) {
      renderBillingTable(data.invoices);
      return;
    }
  } catch (err) {
    console.warn("GAS API error fetching invoices:", err);
  }
  renderBillingTable([]);
}

function renderBillingTable(invoices) {
  const tbody = document.getElementById("table-billing-body");
  if (!tbody) return;

  if (invoices.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400 font-medium">Belum ada tagihan sewa terbit. Silakan klik '+ Terbitkan Tagihan Baru'.</td></tr>`;
    return;
  }

  tbody.innerHTML = invoices.map(inv => `
    <tr class="border-b border-slate-100 hover:bg-slate-50 transition">
      <td class="py-3 px-4 font-mono font-bold text-slate-800">${inv.Invoice_ID}</td>
      <td class="py-3 px-4 font-semibold text-slate-900">${inv.Unit_ID} (${inv.Period || '-'})</td>
      <td class="py-3 px-4 text-xs text-slate-600">Sewa: Rp ${Number(inv.Rent_Fee || 0).toLocaleString('id-ID')} | Util: Rp ${Number(inv.Utility_Fee || 0).toLocaleString('id-ID')}</td>
      <td class="py-3 px-4 font-mono font-black text-rose-600">Rp ${Number(inv.Total_Amount || 0).toLocaleString('id-ID')}</td>
      <td class="py-3 px-4">
        <span class="px-2.5 py-1 text-xs font-semibold rounded-full ${
          inv.Status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
          inv.Status === 'Verifying' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
        }">
          ${inv.Status || 'Unpaid'}
        </span>
      </td>
      <td class="py-3 px-4 text-right space-x-2">
        ${inv.Status !== 'Paid' ? `
          <button onclick="requestVerifyBillingPayment('${inv.Invoice_ID}')" class="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg transition">
            Verify
          </button>
        ` : ''}
        <a href="invoice-view.html?id=${inv.Invoice_ID}" target="_blank" class="text-rose-600 hover:text-rose-800 text-xs font-bold underline inline-block py-1">
          Buka Invoice &rarr;
        </a>
      </td>
    </tr>
  `).join('');
}

function requestVerifyBillingPayment(invoiceId) {
  ensureAdminPasscode(async () => {
    if (!confirm(`Verifikasi pembayaran untuk invoice ${invoiceId} sebagai LUNAS?`)) return;

    try {
      const res = await gasApiCall("verifyPayment", { invoiceId: invoiceId }, "POST");
      if (res && res.success) {
        showToast(res.message || "Invoice berhasil diverifikasi!");
        loadBillingTable();
      } else {
        showToast(res.error || "Gagal verifikasi", "error");
      }
    } catch (err) {
      showToast("Error server", "error");
    }
  });
}

function triggerWhatsAppDunningLive() {
  ensureAdminPasscode(async () => {
    showToast("Mengirim WhatsApp reminder dunning ke semua invoice unpaid...");
    try {
      const res = await gasApiCall("triggerDunning", {}, "POST");
      if (res && res.success) {
        showToast(res.message || "Pengingat berhasil dikirim!");
      } else {
        showToast(res.error || "Gagal memicu dunning", "error");
      }
    } catch (e) {
      showToast("Gagal menghubungi gateway", "error");
    }
  });
}

async function populateInvoiceUnitDropdown() {
  const select = document.getElementById("invoice-unit-id");
  if (!select) return;

  try {
    const data = await gasApiCall("getUnits");
    if (data && data.success && Array.isArray(data.units)) {
      select.innerHTML = `<option value="">Pilih Unit...</option>` +
        data.units.map(u => `<option value="${u.Unit_ID}">${u.Tower} #${u.Unit_No} (${u.Status})</option>`).join('');
    }
  } catch (e) {}
}

function openNewInvoiceModal() {
  populateInvoiceUnitDropdown();
  document.getElementById("modal-new-invoice").classList.remove("hidden");
}

function closeNewInvoiceModal() {
  document.getElementById("modal-new-invoice").classList.add("hidden");
}

async function submitNewInvoice(e) {
  e.preventDefault();
  const formData = {
    unitId: document.getElementById("invoice-unit-id").value,
    period: document.getElementById("invoice-period").value,
    rentFee: document.getElementById("invoice-rent").value,
    utilityFee: document.getElementById("invoice-utility").value
  };

  ensureAdminPasscode(async () => {
    const btn = document.getElementById("btn-submit-invoice");
    btn.disabled = true;
    btn.innerText = "Menerbitkan...";

    try {
      const res = await gasApiCall("createInvoice", { data: formData }, "POST");
      if (res && res.success) {
        showToast("Invoice berhasil diterbitkan!");
        closeNewInvoiceModal();
        document.getElementById("form-new-invoice").reset();
        loadBillingTable();
      } else {
        showToast(res.error || "Gagal menerbitkan invoice", "error");
      }
    } catch (err) {
      showToast("Error saat menerbitkan invoice", "error");
    } finally {
      btn.disabled = false;
      btn.innerText = "Terbitkan Tagihan";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadBillingTable();
  const form = document.getElementById("form-new-invoice");
  if (form) form.addEventListener("submit", submitNewInvoice);
});
