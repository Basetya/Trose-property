// ===================================================================
// ROLLOVER ENGINE - KUSUMA PROPERTI
// Logika 1-Klik Perpanjangan Sewa & Auto-Archive ke Financial Logs
// ===================================================================

const ROLLOVER_CONFIG = {
  SHEET_PENYEWA: 'Master_Penyewa_Kontrak',
  SHEET_FINANCE: '08_FINANCIAL_LOGS'
};

// 1. FUNGSI UTAMA ROLLOVER SEWA (MAJUKAN DUE DATE & CATAT KEUANGAN)
function executeUnitRollover(targetUnit) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(ROLLOVER_CONFIG.SHEET_PENYEWA);
  const financeSheet = ss.getSheetByName(ROLLOVER_CONFIG.SHEET_FINANCE);

  if (!sheet || !financeSheet) {
    Logger.log("Sheet Master atau Finance tidak ditemukan.");
    return;
  }

  const cleanUnit = String(targetUnit).trim().toUpperCase();
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const unit = String(data[i][0]).trim().toUpperCase();
    if (unit === cleanUnit) {
      const namaPenyewa = data[i][1];
      const periodeBulan = parseInt(data[i][3]) || 1;
      const currentDueDate = new Date(data[i][4]);
      const nominalBayar = data[i][6]; // Harga sewa penyewa

      if (isNaN(currentDueDate.getTime())) {
        Logger.log(`Gagal rollover unit ${unit}: Format tanggal jatuh tempo tidak valid.`);
        return;
      }

      // Majukan tanggal jatuh tempo sesuai jumlah bulan periode sewa baru
      currentDueDate.setMonth(currentDueDate.getMonth() + periodeBulan);
      const newDueDateStr = Utilities.formatDate(currentDueDate, "Asia/Jakarta", "yyyy-MM-dd");

      // A. Update Baris di Master Penyewa:
      // - Perbarui Tgl_Jatuh_Tempo (kolom E / index 4)
      // - Ubah Status_Bayar kembali ke 'Belum Bayar' (kolom J / index 9)
      // - Kosongkan status reminder H-30, H-14, H-7 (kolom L, M, N / index 11, 12, 13)
      sheet.getRange(i + 1, 5).setValue(newDueDateStr);
      sheet.getRange(i + 1, 10).setValue("Belum Bayar");
      sheet.getRange(i + 1, 11).setValue(""); // Tgl_Bayar
      sheet.getRange(i + 1, 12).setValue(""); // Status_H30
      sheet.getRange(i + 1, 13).setValue(""); // Status_H14
      sheet.getRange(i + 1, 14).setValue(""); // Status_H7

      // B. Catat Riwayat ke Tab 08_FINANCIAL_LOGS
      const timestamp = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
      financeSheet.appendRow([
        timestamp,
        unit,
        namaPenyewa,
        `${periodeBulan} Bulan`,
        nominalBayar,
        "LUNAS / Rollover Berhasil",
        `Perpanjangan sewa otomatis ke periode jatuh tempo ${newDueDateStr}`
      ]);

      // C. Sinkronisasi ulang ke Google Calendar (jika fungsi CalendarService aktif)
      if (typeof syncAllRentalsToCalendar === 'function') {
        syncAllRentalsToCalendar();
      }

      Logger.log(`✅ Sukses Rollover Unit ${unit}! Jatuh tempo baru: ${newDueDateStr}`);
      SpreadsheetApp.getActiveSpreadsheet().toast(`Unit ${unit} berhasil diperpanjang ke ${newDueDateStr}!`, "Rollover Sukses");
      return;
    }
  }
  Logger.log(`Unit ${cleanUnit} tidak ditemukan dalam data kontrak.`);
}

// 2. FUNGSI PENGUJIAN DARI EDITOR
function testExecuteRollover() {
  const unitTest = "C16CL"; // Contoh uji unit Pak Hasan
  Logger.log(`Menjalankan uji coba rollover untuk unit ${unitTest}...`);
  executeUnitRollover(unitTest);
}