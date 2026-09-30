// ===================================================================
// GOOGLE CALENDAR AUTOMATION SERVICE - KUSUMA PROPERTI (COMPLETE)
// Sinkronisasi Jatuh Tempo Sewa & Jadwal Inspeksi Unit Kalibata City
// ===================================================================

const CAL_CONFIG = {
  SHEET_PENYEWA: 'Master_Penyewa_Kontrak',
  CALENDAR_NAME: 'Kusuma Properti - Kalibata City'
};

// 1. DAPATKAN ATAU BUAT KALENDER KHUSUS PROPERTI
function getOrCreatePropertyCalendar() {
  const calendars = CalendarApp.getCalendarsByName(CAL_CONFIG.CALENDAR_NAME);
  if (calendars.length > 0) {
    return calendars[0];
  }
  const newCal = CalendarApp.createCalendar(CAL_CONFIG.CALENDAR_NAME, {
    summary: 'Kalender operasional sewa unit apartemen Kalibata City',
    timeZone: 'Asia/Jakarta',
    color: CalendarApp.Color.BLUE
  });
  Logger.log(`Kalender baru '${CAL_CONFIG.CALENDAR_NAME}' berhasil dibuat.`);
  return newCal;
}

// 2. HELPER PARSER TANGGAL SERBAGUNA (MENGATASI ERROR parseDateValue)
function parseDateValue(rawDate, defaultDate) {
  if (!rawDate || String(rawDate).trim() === "" || String(rawDate) === "-") {
    return null;
  }

  // Jika sudah berupa objek Date JavaScript
  if (rawDate instanceof Date) {
    if (!isNaN(rawDate.getTime())) {
      const d = new Date(rawDate);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    return null;
  }

  const str = String(rawDate).trim();

  // Format Standar: YYYY-MM-DD (misal 2026-09-14)
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const parts = str.split("T")[0].split("-");
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // Format DD/MM/YYYY (misal 14/09/2026)
  if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/.test(str)) {
    const parts = str.split(/[\/\-]/);
    const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // Jika hanya angka hari (misal tanggal "14")
  if (/^\d{1,2}$/.test(str) && defaultDate) {
    const dayNum = parseInt(str, 10);
    const d = new Date(defaultDate.getFullYear(), defaultDate.getMonth(), dayNum);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    parsed.setHours(0, 0, 0, 0);
    return parsed;
  }

  return null;
}

// 3. SINKRONISASI JATUH TEMPO SEWA KE GOOGLE CALENDAR
function syncAllRentalsToCalendar() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CAL_CONFIG.SHEET_PENYEWA);
  if (!sheet) {
    Logger.log("Sheet penyewa tidak ditemukan.");
    return;
  }

  const cal = getOrCreatePropertyCalendar();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const colUnit = 0;
  const colNama = 1;
  const colWA = 2;
  const colDueDate = 4;
  const colNominal = 6;
  const colStatusBayar = 9;
  
  let colEventId = headers.indexOf("Cal_Event_ID");
  if (colEventId === -1) {
    colEventId = headers.length;
    sheet.getRange(1, colEventId + 1).setValue("Cal_Event_ID")
      .setBackground("#1F4E79").setFontColor("#FFFFFF").setFontWeight("bold");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let syncedCount = 0;

  for (let i = 1; i < data.length; i++) {
    const unit = String(data[i][colUnit]).trim();
    const nama = String(data[i][colNama]).trim();
    const wa = String(data[i][colWA]).trim();
    const rawDueDate = data[i][colDueDate];
    const nominal = data[i][colNominal];
    const statusBayar = String(data[i][colStatusBayar]).trim();
    const existingEventId = String(data[i][colEventId] || "").trim();

    if (nama.toLowerCase().includes("dipakai pemilik") || !unit || unit === "-") continue;

    const dueDateObj = parseDateValue(rawDueDate, today);
    if (!dueDateObj) continue;

    const formattedNominal = (!isNaN(nominal) && Number(nominal) > 0) 
      ? "Rp " + Number(nominal).toLocaleString('id-ID') 
      : "-";

    const title = `[DUE DATE] Unit ${unit} - ${nama}`;
    const description = `Masa sewa unit apartemen Kalibata City jatuh tempo.\n\n` +
                        `• Unit: ${unit}\n` +
                        `• Penyewa: ${nama}\n` +
                        `• WhatsApp: ${wa}\n` +
                        `• Nominal Sewa: ${formattedNominal}\n` +
                        `• Status Bayar: ${statusBayar}\n\n` +
                        `_Kusuma Properti CRM Engine_`;

    try {
      let event = null;
      if (existingEventId) {
        try {
          event = cal.getEventById(existingEventId);
        } catch (e) {
          event = null;
        }
      }

      if (event) {
        event.setTitle(title);
        event.setDescription(description);
        event.setAllDayDate(dueDateObj);
      } else {
        event = cal.createAllDayEvent(title, dueDateObj, {
          description: description
        });
        event.addPopupReminder(30 * 24 * 60); // Reminder H-30
        event.addPopupReminder(7 * 24 * 60);  // Reminder H-7
        sheet.getRange(i + 1, colEventId + 1).setValue(event.getId());
      }
      syncedCount++;
    } catch (err) {
      Logger.log(`Gagal sinkron unit ${unit}: ${err.message}`);
    }
  }

  Logger.log(`Sinkronisasi kalender selesai: ${syncedCount} jadwal tercatat.`);
}

// 4. JADWAL INSPEKSI & CHECK-OUT SAAT SEWA BERAKHIR
function createCheckoutInspectionEvent(unit, namaPenyewa, tglCheckout, jamMulaiStr) {
  const cal = getOrCreatePropertyCalendar();
  const jam = jamMulaiStr || "13:00";
  const [jamNum, menitNum] = jam.split(":").map(Number);
  
  const startTime = new Date(tglCheckout);
  startTime.setHours(jamNum, menitNum, 0, 0);
  
  const endTime = new Date(startTime);
  endTime.setHours(jamNum + 2, menitNum, 0, 0);

  const title = `[INSPEKSI & CHECKOUT] Unit ${unit} - ${namaPenyewa}`;
  const description = `Agenda Serah Terima Kunci & Pengecekan Fisik Unit:\n\n` +
                      `• Unit: ${unit}\n` +
                      `• Penyewa: ${namaPenyewa}\n` +
                      `• Agenda: Cek kelengkapan unit, meteran listrik/air, serah terima kunci/access card.\n\n` +
                      `_Kusuma Properti Operations_`;

  const event = cal.createEvent(title, startTime, endTime, {
    description: description,
    location: `Apartemen Kalibata City Tower/Unit ${unit}`
  });
  
  event.addPopupReminder(24 * 60);
  event.addPopupReminder(120);

  return event.getId();
}