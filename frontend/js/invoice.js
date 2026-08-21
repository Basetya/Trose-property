/**
 * Trose Property Manager - Clean Invoice Engine (v2.4)
 * File: frontend/js/invoice.js
 */

async function loadInvoiceDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const invoiceId = urlParams.get('id');

  if (!invoiceId) {
    document.getElementById("inv-property-title").innerText = "Invoice ID Tidak Ditemukan";
    document.getElementById("inv-unit-period").innerText = "Silakan periksa kembali parameter URL invoice Anda.";
    return;
  }

  try {
    const res = await gasApiCall("getInvoiceDetail", { invoiceId: invoiceId });
    if (res && res.success && res.invoice) {
      renderInvoiceView(res.invoice, res.unit || {});
      return;
    }
  } catch (err) {
    console.warn("GAS API offline or invoice not found:", err);
  }

  document.getElementById("inv-id-display").innerText = invoiceId;
  document.getElementById("inv-unit-period").innerText = "Menghubungkan ke Google Sheets...";
}

function renderInvoiceView(inv, unit) {
  document.getElementById("inv-id-display").innerText = inv.Invoice_ID || "-";
  document.getElementById("inv-property-title").innerText = "Trose Residence";
  document.getElementById("inv-unit-period").innerText = `${unit.Tower || "Tower"} #${unit.Unit_No || inv.Unit_ID} (Periode: ${inv.Period || "-"})`;
  
  const statusBadge = document.getElementById("inv-status-badge");
  statusBadge.innerText = inv.Status || "Unpaid";
  statusBadge.className = `px-3 py-1 text-xs font-black rounded-full uppercase border ${
    inv.Status === 'Paid' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
    inv.Status === 'Verifying' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
  }`;

  document.getElementById("inv-rent-fee").innerText = `Rp ${Number(inv.Rent_Fee || 0).toLocaleString('id-ID')}`;
  document.getElementById("inv-utility-fee").innerText = `Rp ${Number(inv.Utility_Fee || 0).toLocaleString('id-ID')}`;
  document.getElementById("inv-unique-code").innerText = `+ Rp ${Number(inv.Unique_Code || 0).toLocaleString('id-ID')}`;
  document.getElementById("inv-total-amount").innerText = `Rp ${Number(inv.Total_Amount || 0).toLocaleString('id-ID')}`;

  const routeTitle = inv.Payment_Route === "Direct_Landlord" ? "Tujuan Transfer (Langsung ke Rekening Landlord)" : "Tujuan Transfer (Rekening Pengelola Management)";
  document.getElementById("inv-route-title").innerText = routeTitle;
  
  const accountNumber = inv.Bank_Account_No || "-";
  const accountHolder = inv.Bank_Holder_Name || "-";
  const bankName = inv.Bank_Name || "Bank Transfer";

  document.getElementById("inv-account-no").innerText = accountNumber;
  document.getElementById("inv-bank-holder").innerText = `${bankName} a.n. ${accountHolder}`;
  
  document.getElementById("btn-copy-account").onclick = () => {
    if (accountNumber !== "-") {
      navigator.clipboard.writeText(accountNumber);
      showToast("Nomor rekening berhasil disalin!");
    }
  };

  if (inv.Status === 'Paid') {
    document.getElementById("proof-submission-card").innerHTML = `
      <div class="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-center">
        <h4 class="text-emerald-800 font-bold text-sm">Tagihan Ini Sudah Lunas</h4>
        <p class="text-xs text-emerald-600 mt-1">Terima kasih atas pembayaran tepat waktu Anda.</p>
      </div>
    `;
  }
}

async function handleProofSubmit(e) {
  e.preventDefault();
  const urlParams = new URLSearchParams(window.location.search);
  const invoiceId = urlParams.get('id');
  const proofUrl = document.getElementById("proof-input").value.trim();

  if (!proofUrl) {
    showToast("Masukkan URL atau link bukti transfer", "error");
    return;
  }

  const btn = document.getElementById("btn-submit-proof");
  btn.disabled = true;
  btn.innerText = "Mengirim...";

  try {
    const res = await gasApiCall("submitProof", { invoiceId: invoiceId, proofUrl: proofUrl }, "POST");
    if (res && res.success) {
      showToast("Bukti pembayaran berhasil dikirim! Status diubah menjadi Verifying.");
      loadInvoiceDetails();
    } else {
      showToast(res.error || "Gagal mengirim bukti pembayaran", "error");
    }
  } catch (err) {
    showToast("Gagal menghubungi server", "error");
  } finally {
    btn.disabled = false;
    btn.innerText = "Kirim Bukti Pembayaran";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadInvoiceDetails();
  const proofForm = document.getElementById("form-proof");
  if (proofForm) proofForm.addEventListener("submit", handleProofSubmit);
});
