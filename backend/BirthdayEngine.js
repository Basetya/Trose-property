// ===================================================================
// BIRTHDAY ENGINE - KUSUMA PROPERTI MANAGEMENT
// Modul Pengirim Ucapan Ulang Tahun Otomatis Pemilik Unit
// Sumber Data: Sheet 'Master_Pemilik'
// ===================================================================

const BIRTHDAY_CONFIG = {
  SHEET_NAME: 'Master_Pemilik',
  FONNTE_TOKEN: 'KMF4w9jSpsG3igSwbkxS',
  ADMIN_PHONE: '628118700645'
};

// 1. FUNGSI UTAMA: PEMINDAI ULANG TAHUN HARIAN (getDisplayValues)
function sendBirthdayWishesMaster() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(BIRTHDAY_CONFIG.SHEET_NAME);

  if (!sheet) {
    Logger.log("❌ Sheet '" + BIRTHDAY_CONFIG.SHEET_NAME + "' tidak ditemukan.");
    return;
  }

  // Gunakan getDisplayValues agar membaca teks persis seperti tampilan di layar
  const displayData = sheet.getDataRange().getDisplayValues();
  const today = new Date();
  
  const currentDay = Utilities.formatDate(today, "Asia/Jakarta", "dd");
  const currentMonth = Utilities.formatDate(today, "Asia/Jakarta", "MM");
  const currentYear = Utilities.formatDate(today, "Asia/Jakarta", "yyyy");
  const todayTarget = currentDay + "/" + currentMonth; // "08/09"

  Logger.log("🔍 Memulai pemindaian ulang tahun untuk tanggal: " + todayTarget + " (Tahun " + currentYear + ")");

  let totalDitemukan = 0;
  let totalTerkirim = 0;

  for (let i = 1; i < displayData.length; i++) {
    const rowNum = i + 1;
    const unit = String(displayData[i][0] || "").trim();
    const sapaan = String(displayData[i][1] || "Bapak/Ibu").trim();
    const nama = String(displayData[i][2] || "").trim();
    const rawPhone = String(displayData[i][3] || "").replace(/\D/g, "");
    const rawTgl = String(displayData[i][4] || "").trim(); // Kolom E (Tgl_Lahir)
    const lastSentYear = String(displayData[i][9] || "").trim(); // Kolom J (Last_HBD_Year)

    if (!rawTgl || !rawPhone || !nama) continue;

    // Bersihkan karakter tanggal
    let cleanTgl = rawTgl.replace(/-/g, "/").trim();
    const parts = cleanTgl.split("/");
    let tglFormatted = "";

    if (parts.length >= 2) {
      const d = parts[0].trim().padStart(2, "0");
      const m = parts[1].trim().padStart(2, "0");
      tglFormatted = d + "/" + m;
    }

    // Pencocokan langsung teks "08/09"
    if (tglFormatted === todayTarget || cleanTgl.startsWith(todayTarget)) {
      totalDitemukan++;

      if (lastSentYear === currentYear) {
        Logger.log("ℹ️ Dilewati: " + nama + " (Unit " + unit + ") sudah menerima ucapan tahun " + currentYear);
        continue;
      }

      const pesan = 
        "Selamat Ulang Tahun kami ucapkan kepada " + sapaan + " " + nama + " (Pemilik Unit " + unit + ")! 🎉🎂\n\n" +
        "Semoga senantiasa diberikan kesehatan, kebahagiaan, serta kelancaran dalam segala urusan dan rezeki.\n\n" +
        "Terima kasih atas kerja sama dan kepercayaan yang terjalin selama ini bersama Kusuma Properti.\n\n" +
        "Salam hangat,\n*Kusuma Properti Management*";

      Logger.log("🚀 Mengirim ucapan ke: " + nama + " (" + rawPhone + ") - Unit: " + unit);

      const statusKirim = kirimFonnteBirthday(rawPhone, pesan);

      if (statusKirim) {
        sheet.getRange(rowNum, 10).setValue(currentYear);
        totalTerkirim++;
        Logger.log("✅ Berhasil terkirim dan tercatat di sel J" + rowNum + " untuk " + nama);
      } else {
        Logger.log("❌ Gagal mengirim via Fonnte ke nomor: " + rawPhone);
      }
    }
  }

  Logger.log("📊 Rekap: " + totalDitemukan + " pemilik terdeteksi hari ini. " + totalTerkirim + " ucapan berhasil dikirim.");
}

// 2. HELPER SERVICE: PENGIRIMAN VIA FONNTE
function kirimFonnteBirthday(targetPhone, messageContent) {
  const url = "https://api.fonnte.com/send";
  
  const payload = {
    target: String(targetPhone).replace(/\D/g, ""),
    message: messageContent
  };

  const options = {
    method: "post",
    headers: {
      "Authorization": BIRTHDAY_CONFIG.FONNTE_TOKEN.trim()
    },
    payload: payload,
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const resText = response.getContentText();
    Logger.log("Fonnte Response [" + targetPhone + "]: " + resText);

    const resJson = JSON.parse(resText);
    return resJson.status === true;
  } catch (err) {
    Logger.log("Fonnte Exception [" + targetPhone + "]: " + err.message);
    return false;
  }
}

// 3. RUNNER SIMULASI MANUAL
function testBirthdayEngineManual() {
  Logger.log("=== MEMULAI TEST RUNNER BIRTHDAY ENGINE ===");
  sendBirthdayWishesMaster();
  Logger.log("=== PENGUJIAN SELESAI ===");
}