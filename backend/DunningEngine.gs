/**
 * Kusuma Properti Manager - Automated WhatsApp Dunning Engine (v9.0)
 * File: backend/DunningEngine.gs
 */

function runDailyDunningScheduler() {
  const invoices = getSheetDataAsJson("05_INVOICES");
  const leases = getSheetDataAsJson("04_LEASES");
  const contacts = getSheetDataAsJson("03_CONTACTS_360");
  const units = getSheetDataAsJson("02_UNITS");

  const unpaidInvoices = invoices.filter(inv => inv.Status === "Unpaid");
  let dispatchedCount = 0;

  let webAppUrl = "";
  try {
    webAppUrl = ScriptApp.getService().getUrl();
  } catch (e) {
    webAppUrl = "";
  }

  unpaidInvoices.forEach(inv => {
    const lease = leases.find(l => String(l.Lease_ID).trim() === String(inv.Lease_ID).trim()) || {};
    const tenant = contacts.find(c => String(c.Contact_ID).trim() === String(lease.Tenant_ID).trim()) || {};
    const unit = units.find(u => String(u.Unit_ID).trim() === String(inv.Unit_ID).trim()) || {};

    if (tenant.Phone_WA) {
      const cleanPhone = String(tenant.Phone_WA).replace(/[^0-9]/g, '');
      const invoiceUrl = webAppUrl ? `${webAppUrl}?action=getInvoiceDetail&invoiceId=${inv.Invoice_ID}` : `ID Tagihan: ${inv.Invoice_ID}`;
      
      const msg = `Halo Bapak/Ibu ${tenant.Full_Name || 'Penyewa'},\n\n` +
        `Berikut pengingat tagihan sewa apartemen Kalibata City dari Kusuma Properti untuk:\n` +
        `Unit: ${unit.Tower || 'Tower'} #${unit.Unit_No || inv.Unit_ID}\n` +
        `Periode: ${inv.Period || 'Bulan Ini'}\n` +
        `Total Pembayaran: Rp ${Number(inv.Total_Amount || 0).toLocaleString('id-ID')} (termasuk 3 digit kode unik)\n\n` +
        `Rute Rekening Transfer:\n` +
        `${inv.Destination_Bank || inv.Bank_Name || 'BCA'} No. Rek: ${inv.Destination_Account_No || inv.Bank_Account_No || '-'} a.n. ${inv.Destination_Account_Holder || inv.Bank_Holder_Name || '-'}\n\n` +
        `Tautan Konfirmasi Bukti Pembayaran:\n` +
        `${invoiceUrl}\n\n` +
        `Terima kasih atas kerja sama Anda.\n- Tim Manajemen Kusuma Properti`;

      sendWhatsAppMessage(cleanPhone, msg);
      dispatchedCount++;
    }
  });

  return { success: true, message: `Dunning Kusuma Properti berhasil dijalankan: ${dispatchedCount} reminder terkirim.` };
}