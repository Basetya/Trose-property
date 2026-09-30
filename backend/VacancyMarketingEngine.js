// ===================================================================
// VACANCY & PRE-MARKETING ENGINE - KUSUMA PROPERTI (ZERO-VACANCY)
// Mengelola Siklus Kekosongan & Auto-Generate Copywriting Iklan Siap Broadcast
// ===================================================================

const VACANCY_CONFIG = {
  SHEET_UNITS: '02_UNITS',
  SHEET_PENYEWA: 'Master_Penyewa_Kontrak'
};

// 1. FUNGSI UTAMA: TRIGGER SAAT PENYEWA KONFIRMASI CHECKOUT (TIDAK PERPANJANG)
function triggerUnitVacancyAndMarketing(targetUnit, tglKeluarPenyewa) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetUnits = ss.getSheetByName(VACANCY_CONFIG.SHEET_UNITS);
  const sheetPenyewa = ss.getSheetByName(VACANCY_CONFIG.SHEET_PENYEWA);

  if (!sheetUnits) {
    Logger.log("Tab 02_UNITS tidak ditemukan.");
    return;
  }

  const cleanUnit = String(targetUnit).trim().toUpperCase();
  const unitData = sheetUnits.getDataRange().getValues();

  for (let i = 1; i < unitData.length; i++) {
    if (String(unitData[i][0]).trim().toUpperCase() === cleanUnit) {
      const tower = unitData[i][1];
      const lantai = unitData[i][2];
      const tipe = unitData[i][3];
      const harga = unitData[i][6];
      const furnishing = unitData[i][7];
      const fasilitas = unitData[i][8];

      const tglTersedia = tglKeluarPenyewa || "Akhir Bulan Ini";
      const statusBaru = `Segera Tersedia (per ${tglTersedia})`;

      // Susun Narasi Copywriting Iklan Siap Sebar
      const copyIklan = 
        `🏢 *DISEWAKAN CEPAT: UNIT APARTEMEN KALIBATA CITY*\n\n` +
        `Segera tersedia unit nyaman dan siap huni dengan detail:\n` +
        `• *Unit*: ${cleanUnit} (${tower}, ${lantai})\n` +
        `• *Tipe*: ${tipe}\n` +
        `• *Kondisi*: ${furnishing}\n` +
        `• *Fasilitas Lengkap*: ${fasilitas}\n` +
        `• *Estimasi Sewa*: Rp ${harga}/bulan (Nego)\n` +
        `• *Jadwal Ready*: ${tglTersedia}\n\n` +
        `Lokasi sangat strategis, selangkah ke Stasiun KRL Kalibata & Mall Kalibata City Square.\n\n` +
        `📞 *Minat / Jadwal Survey Unit:*\n` +
        `Kusuma Properti Management\n` +
        `WhatsApp: https://wa.me/6281282589705\n` +
        `_(Unit terbatas, sistem siapa cepat dia dapat)_`;

      // A. Update Status dan Simpan Draft Iklan di Tab 02_UNITS
      sheetUnits.getRange(i + 1, 5).setValue(statusBaru).setBackground("#FFF2CC").setFontColor("#B25900").setFontWeight("bold"); // Status_Unit
      sheetUnits.getRange(i + 1, 6).setValue(tglTersedia); // Tgl_Tersedia
      sheetUnits.getRange(i + 1, 10).setValue(copyIklan);  // Draft_Iklan_Marketing

      // B. Buat Jadwal Agenda Inspeksi Serah Terima Kunci di Google Calendar (Point 1)
      if (typeof createCheckoutInspectionEvent === 'function' && tglKeluarPenyewa) {
        // Ambil nama penyewa
        let namaPenyewa = "Penyewa Unit " + cleanUnit;
        if (sheetPenyewa) {
          const pData = sheetPenyewa.getDataRange().getValues();
          for (let p = 1; p < pData.length; p++) {
            if (String(pData[p][0]).trim().toUpperCase() === cleanUnit) {
              namaPenyewa = pData[p][1];
              break;
            }
          }
        }
        createCheckoutInspectionEvent(cleanUnit, namaPenyewa, tglKeluarPenyewa, "13:00");
      }

      // C. Kirimkan Notifikasi Iklan Siap Sebar ke WhatsApp Admin
      const notifAdmin = 
        `📢 *[PRE-MARKETING ALERT]*\n` +
        `Penyewa Unit *${cleanUnit}* konfirmasi checkout per *${tglTersedia}*.\n\n` +
        `Status unit diubah ke *${statusBaru}* dan jadwal inspeksi kalender telah dibuat.\n\n` +
        `Berikut draf iklan siap sebar Anda:\n------------------------------------\n` +
        copyIklan;

      if (typeof sendFonnteMessage === 'function') {
        sendFonnteMessage(HITL_CONFIG.ADMIN_PHONE, notifAdmin);
      }

      Logger.log(`✅ Sukses Pre-Marketing Unit ${cleanUnit}! Draf iklan tersimpan.`);
      SpreadsheetApp.getActiveSpreadsheet().toast(`Iklan siap sebar untuk unit ${cleanUnit} telah dibuat!`, "Zero Vacancy");
      return;
    }
  }

  Logger.log(`Unit ${cleanUnit} tidak ditemukan di tab 02_UNITS.`);
}

// 2. FUNGSI UJI COBA LANGSUNG DARI EDITOR APPS SCRIPT
function testVacancyMarketing() {
  const unitUji = "C07CL"; // Contoh unit C07CL (Arjunsyah) checkout tanggal 11 Sept
  const tglCheckout = "2026-09-11";
  
  Logger.log(`Menjalankan simulasi kekosongan & iklan untuk unit ${unitUji}...`);
  triggerUnitVacancyAndMarketing(unitUji, tglCheckout);
}