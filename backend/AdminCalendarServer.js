/**
 * Kusuma Properti - Unified Schedule Mirroring (Calendar + Database Sheets)
 * File: AdminCalendarServer.gs
 * Versi: v4.0 (Configurable Timeline: Default 14-Day Focus, 1-Month, & 3-Month Expansion)
 */

const ADMIN_PASS = "tearose288";

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile("AdminCalendarView")
    .setTitle("Kusuma Properti - Admin Schedule Portal")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag("viewport", "width=device-width, initial-scale=1.0");
}

function verifyAdminLogin(inputPassword) {
  if (inputPassword === ADMIN_PASS) {
    return { success: true };
  }
  return { success: false, message: "Password salah. Silakan coba lagi." };
}

// AMBIL DATA DENGAN PARAMETER FLEKSIBEL (PAST & AHEAD DAYS)
function getCalendarScheduleData(daysPast, daysAhead) {
  try {
    const now = new Date();
    // Default: Hari ini (0 hari lalu) sampai 14 hari ke depan jika tidak dispesifikasikan
    const pastDays = (typeof daysPast === "number") ? daysPast : 0;
    const aheadDays = (typeof daysAhead === "number") ? daysAhead : 14;

    const startDate = new Date(now.getTime() - (pastDays * 24 * 60 * 60 * 1000));
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(now.getTime() + (aheadDays * 24 * 60 * 60 * 1000));
    endDate.setHours(23, 59, 59, 999);

    const combinedEvents = [];
    const eventUniqueKeys = new Set();

    // 1. Ambil Event dari Google Calendar Resmi kusumaproperti123@gmail.com
    try {
      const cal = CalendarApp.getDefaultCalendar();
      const calEvents = cal.getEvents(startDate, endDate);

      calEvents.forEach(function(evt) {
        const start = evt.getStartTime();
        const end = evt.getEndTime();
        const isAllDay = evt.isAllDayEvent();
        const title = evt.getTitle();
        const dateKey = Utilities.formatDate(start, "Asia/Jakarta", "yyyyMMdd");
        const dedupKey = (title + "_" + dateKey).toLowerCase().replace(/\s+/g, "");

        if (!eventUniqueKeys.has(dedupKey)) {
          eventUniqueKeys.add(dedupKey);

          let meetUrl = "";
          const desc = evt.getDescription() || "";
          if (desc.includes("meet.google.com/")) {
            const match = desc.match(/https:\/\/meet\.google\.com\/[a-zA-Z0-9\-]+/);
            if (match) meetUrl = match[0];
          }

          let category = "General";
          const titleLower = title.toLowerCase();
          if (titleLower.includes("tagihan we") || titleLower.includes("listrik") || titleLower.includes("air")) {
            category = "Tagihan WE";
          } else if (titleLower.includes("sewa") || titleLower.includes("jatuh tempo")) {
            category = "Sewa";
          } else if (titleLower.includes("meeting") || titleLower.includes("demo")) {
            category = "Meeting";
          } else if (titleLower.includes("birthday") || titleLower.includes("hut")) {
            category = "Birthday";
          } else if (titleLower.includes("inspeksi") || titleLower.includes("maintenance")) {
            category = "Operasional";
          }

          // Cek apakah tanggal sudah terlewat sebelum hari ini
          const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
          const isOverdue = start.getTime() < todayZero.getTime();

          combinedEvents.push({
            id: evt.getId(),
            title: title,
            description: desc,
            location: evt.getLocation() || "-",
            sortTime: start.getTime(),
            displayDate: Utilities.formatDate(start, "Asia/Jakarta", "EEEE, dd MMM yyyy"),
            displayTime: isAllDay ? "Sepanjang Hari" : Utilities.formatDate(start, "Asia/Jakarta", "HH:mm") + " - " + Utilities.formatDate(end, "Asia/Jakarta", "HH:mm 'WIB'"),
            category: category,
            isOverdue: isOverdue,
            meetUrl: meetUrl
          });
        }
      });
    } catch (eCal) {
      Logger.log("Info Calendar: " + eCal.toString());
    }

    // 2. Ambil Data Tagihan & Jatuh Tempo dari Sheet Master Penyewa
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let sheetPenyewa = null;
      for (let s of ss.getSheets()) {
        const sName = s.getName().trim().toLowerCase();
        if (sName.includes("master penyewa") || sName.includes("master_penyewa")) {
          sheetPenyewa = s;
          break;
        }
      }

      if (sheetPenyewa) {
        const values = sheetPenyewa.getDataRange().getValues();
        const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

        for (let i = 1; i < values.length; i++) {
          const row = values[i];
          const noUnit = String(row[0] || "").trim();
          const nama = String(row[1] || "").trim();
          const phone = String(row[2] || "").trim();
          const tagihanWE = row[3];
          const vaBca = String(row[4] || "").trim();
          const vaMandiri = String(row[5] || "").trim();
          const rawDueDate = row[7];
          const sewaPenyewa = row[9] || 0;
          const statusBayar = String(row[12] || "").trim();

          if (!noUnit || statusBayar.toLowerCase() === "dipakai pemilik" || statusBayar.toLowerCase() === "lunas") {
            continue;
          }

          let dueDate = null;
          if (rawDueDate instanceof Date && !isNaN(rawDueDate.getTime())) {
            dueDate = rawDueDate;
          } else if (rawDueDate && typeof rawDueDate === "string" && rawDueDate.toLowerCase() !== "dd/mm/yyyy") {
            const d = new Date(rawDueDate);
            if (!isNaN(d.getTime())) dueDate = d;
          }

          if (dueDate && dueDate.getTime() >= startDate.getTime() && dueDate.getTime() <= endDate.getTime()) {
            const dateStr = Utilities.formatDate(dueDate, "Asia/Jakarta", "EEEE, dd MMM yyyy");
            const dateKey = Utilities.formatDate(dueDate, "Asia/Jakarta", "yyyyMMdd");
            const isOverdue = dueDate.getTime() < todayZero.getTime();

            // A. Event Jatuh Tempo Sewa
            const titleSewa = `[Jatuh Tempo Sewa] Unit ${noUnit} - ${nama}`;
            const keySewa = (titleSewa + "_" + dateKey).toLowerCase().replace(/\s+/g, "");

            if (!eventUniqueKeys.has(keySewa)) {
              eventUniqueKeys.add(keySewa);
              combinedEvents.push({
                id: "sewa_" + noUnit + "_" + dateKey,
                title: titleSewa,
                description: `Penyewa: ${nama} | HP: ${phone}\nNominal: Rp${Number(sewaPenyewa).toLocaleString('id-ID')}\nVA BCA: ${vaBca} | Mandiri: ${vaMandiri}\nStatus: ${statusBayar}`,
                location: `Apartemen Kalibata City Tower ${noUnit}`,
                sortTime: dueDate.getTime(),
                displayDate: dateStr,
                displayTime: "Jatuh Tempo Sewa",
                category: "Sewa",
                isOverdue: isOverdue,
                meetUrl: ""
              });
            }

            // B. Event Tagihan Listrik & Air (WE)
            if (Number(tagihanWE) > 0) {
              const titleWE = `[Tagihan WE] Unit ${noUnit} - Rp${Number(tagihanWE).toLocaleString('id-ID')}`;
              const keyWE = (titleWE + "_" + dateKey).toLowerCase().replace(/\s+/g, "");

              if (!eventUniqueKeys.has(keyWE)) {
                eventUniqueKeys.add(keyWE);
                combinedEvents.push({
                  id: "we_" + noUnit + "_" + dateKey,
                  title: titleWE,
                  description: `Penyewa: ${nama}\nTagihan Listrik & Air: Rp${Number(tagihanWE).toLocaleString('id-ID')}\nVA BCA: ${vaBca} | Mandiri: ${vaMandiri}`,
                  location: `Apartemen Kalibata City Tower ${noUnit}`,
                  sortTime: dueDate.getTime(),
                  displayDate: dateStr,
                  displayTime: "Tagihan Listrik & Air",
                  category: "Tagihan WE",
                  isOverdue: isOverdue,
                  meetUrl: ""
                });
              }
            }
          }
        }
      }
    } catch (eSheet) {
      Logger.log("Info Sheet: " + eSheet.toString());
    }

    // Urutkan kronologis
    combinedEvents.sort((a, b) => a.sortTime - b.sortTime);

    const lastSyncFormatted = Utilities.formatDate(now, "Asia/Jakarta", "dd MMM yyyy, HH:mm:ss") + " WIB";

    return {
      status: "success",
      total: combinedEvents.length,
      lastSync: lastSyncFormatted,
      events: combinedEvents
    };
  } catch (err) {
    return { status: "error", message: err.toString() };
  }
}