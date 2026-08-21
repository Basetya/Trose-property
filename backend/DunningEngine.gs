/**
 * Trose Property Manager - Automated WhatsApp Dunning Engine
 * File: backend/DunningEngine.gs
 */

function runDailyDunningScheduler() {
  const invoices = getSheetDataAsJson("05_INVOICES");
  const leases = getSheetDataAsJson("04_LEASES");
  const contacts = getSheetDataAsJson("03_CONTACTS_360");
  const units = getSheetDataAsJson("02_UNITS");

  const unpaidInvoices = invoices.filter(inv => inv.Status === "Unpaid");
  let dispatchedCount = 0;

  unpaidInvoices.forEach(inv => {
    const lease = leases.find(l => String(l.Lease_ID).trim() === String(inv.Lease_ID).trim()) || {};
    const tenant = contacts.find(c => String(c.Contact_ID).trim() === String(lease.Tenant_ID).trim()) || {};
    const unit = units.find(u => String(u.Unit_ID).trim() === String(inv.Unit_ID).trim()) || {};

    if (tenant.Phone_WA) {
      const cleanPhone = String(tenant.Phone_WA).replace(/[^0-9]/g, '');
      const msg = `Halo Bapak/Ibu ${tenant.Full_Name || 'Penyewa'},\n\n` +
        `Berikut pengingat tagihan sewa apartemen Trose Residence untuk:\n` +
        `Unit: ${unit.Tower || 'Tower'} #${unit.Unit_No || inv.Unit_ID}\n` +
        `Periode: ${inv.Period || 'Bulan Ini'}\n` +
        `Total Pembayaran: Rp ${Number(inv.Total_Amount || 0).toLocaleString('id-ID')} (termasuk kode unik)\n\n` +
        `Rute Pembayaran: ${inv.Bank_Name || 'BCA'} No. Rek: ${inv.Bank_Account_No || '-'} a.n. ${inv.Bank_Holder_Name || '-'}\n\n` +
        `Mohon konfirmasikan bukti transfer Anda melalui tautan portal resmi:\n` +
        `https://script.google.com/macros/s/.../exec?id=${inv.Invoice_ID}\n\n` +
        `Terima kasih atas kerja sama Anda.\n- Tim Manajemen Trose`;

      sendWhatsAppMessage(cleanPhone, msg);
      dispatchedCount++;
    }
  });

  return { success: true, message: `Dunning executed: ${dispatchedCount} reminders sent.` };
}
