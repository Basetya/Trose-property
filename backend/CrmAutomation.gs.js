/**
 * Kusuma Properti - Unified CRM Visual Alert, Birthday Banner & Dual Auto-Sorting Engine
 * File: CrmAutomation.gs.gs
 * Versi: v3.1 (H-1 Reminder Alert Only + Dual CRM Engine)
 */

// ===================================================================
// 1. FUNGSI UTAMA: CRM ENGINE UNTUK PENYEWA & PEMILIK
// ===================================================================
function setupCrmVisualAndSorting() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // A. PROSES SHEET: MASTER PENYEWA AKTIF & TAGIHAN
  let sheetPenyewa = null;
  for (let s of ss.getSheets()) {
    const sName = s.getName().trim().toLowerCase();
    if (sName.includes("master penyewa") || sName.includes("master_penyewa")) {
      sheetPenyewa = s;
      break;
    }
  }

  if (sheetPenyewa) {
    applyConditionalFormattingPenyewa(sheetPenyewa);
    autoSortMasterPenyewa(sheetPenyewa);
    setupBirthdayStatusColumnPenyewa(sheetPenyewa);
    Logger.log("✅ Sheet Penyewa: Alert visual H-1, Sorting Tagihan, & Status HUT siap.");
  }

  // B. PROSES SHEET: MASTER_PEMILIK
  let sheetPemilik = null;
  for (let s of ss.getSheets()) {
    const sName = s.getName().trim().toLowerCase();
    if (sName.includes("master_pemilik") || sName.includes("master pemilik")) {
      sheetPemilik = s;
      break;
    }
  }

  if (sheetPemilik) {
    setupMasterPemilikCrm(sheetPemilik);
    Logger.log("✅ Sheet Pemilik: Sorting HUT Terdekat & Status HUT siap.");
  }

  Logger.log("✨ DUAL CRM ENGINE KUSUMA PROPERTI BERHASIL DIPERBARUI!");
}

// ===================================================================
// 2. MODUL SHEET MASTER PENYEWA (H-1 ALERT)
// ===================================================================
function applyConditionalFormattingPenyewa(sheet) {
  sheet.clearConditionalFormatRules();

  const maxRows = sheet.getMaxRows();
  const rangeTagihan = sheet.getRange("H2:M" + maxRows);
  const rangeUltah = sheet.getRange("N2:O" + maxRows);

  // 1. Merah untuk Overdue (Lewat Jatuh Tempo)
  const ruleOverdue = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND(ISDATE($H2), $H2<TODAY(), $M2="Belum Bayar")')
    .setBackground("#FCE8E6")
    .setFontColor("#C5221F")
    .setBold(true)
    .setRanges([rangeTagihan])
    .build();

  // 2. Kuning: KHUSUS H-1 (Besok Jatuh Tempo)
  const ruleUpcomingH1 = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND(ISDATE($H2), $H2=(TODAY()+1), $M2="Belum Bayar")')
    .setBackground("#FEF7E0")
    .setFontColor("#7A4100")
    .setBold(true)
    .setRanges([rangeTagihan])
    .build();

  // 3. Hijau untuk Birthday
  const ruleBirthday = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$O2<>""')
    .setBackground("#D4EDDA")
    .setFontColor("#155724")
    .setBold(true)
    .setRanges([rangeUltah])
    .build();

  // 4. Hijau untuk Tagihan Lunas
  const ruleLunas = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$M2="Lunas"')
    .setBackground("#E6F4EA")
    .setFontColor("#137333")
    .setBold(true)
    .setRanges([sheet.getRange("M2:M" + maxRows)])
    .build();

  sheet.setConditionalFormatRules([ruleOverdue, ruleUpcomingH1, ruleBirthday, ruleLunas]);
}

function autoSortMasterPenyewa(sheet) {
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  if (values.length < 3) return;

  const headers = values[0];
  const rows = values.slice(1);

  const validDateRows = [];
  const nonDateRows = [];

  rows.forEach(row => {
    const rawDate = row[7];
    const parsed = parseAnyDate(rawDate);

    if (parsed) {
      validDateRows.push({ row: row, time: parsed.getTime() });
    } else {
      nonDateRows.push(row);
    }
  });

  validDateRows.sort((a, b) => a.time - b.time);
  const sortedRows = validDateRows.map(item => item.row).concat(nonDateRows);
  sheet.getRange(2, 1, sortedRows.length, headers.length).setValues(sortedRows);
}

function setupBirthdayStatusColumnPenyewa(sheet) {
  const headerCell = sheet.getRange("O1");
  headerCell.setValue("Status_HUT");
  headerCell.setBackground("#1F4E79").setFontColor("#FFFFFF").setFontWeight("bold");

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  const bdayFormula = 
    '=IF(ISBLANK(N2), "", ' +
    'LET(' +
    '  raw, N2, ' +
    '  dVal, IF(ISDATE(raw), raw, IF(ISNUMBER(SEARCH("/", raw)), DATE(INDEX(SPLIT(raw, "/"), 3), INDEX(SPLIT(raw, "/"), 2), INDEX(SPLIT(raw, "/"), 1)), DATEVALUE(raw))), ' +
    '  bdayThisYear, DATE(YEAR(TODAY()), MONTH(dVal), DAY(dVal)), ' +
    '  diff, bdayThisYear - TODAY(), ' +
    '  IF(diff = 0, "🎂 Birthday !!!", ' +
    '  IF(diff = 1, "🎈 H-1 Birthday", ' +
    '  IF(AND(diff >= -3, diff < 0), "🎉 H+" & ABS(diff) & " Birthday", "")))' +
    '))';

  sheet.getRange(2, 15, lastRow - 1, 1).setFormula(bdayFormula).setHorizontalAlignment("center");
}

// ===================================================================
// 3. MODUL SHEET MASTER_PEMILIK
// ===================================================================
function setupMasterPemilikCrm(sheet) {
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  if (values.length < 1) return;

  const headers = values[0];
  let hutColIdx = -1;
  let statusHutColIdx = -1;

  for (let c = 0; c < headers.length; c++) {
    const h = String(headers[c]).toLowerCase().trim();
    if (h.includes("hut") || h.includes("lahir") || h.includes("birthday") || h.includes("tgl_lahir")) {
      if (h.includes("status")) {
        statusHutColIdx = c;
      } else if (hutColIdx === -1) {
        hutColIdx = c;
      }
    }
  }

  if (hutColIdx === -1) hutColIdx = 4;

  if (statusHutColIdx === -1) {
    statusHutColIdx = hutColIdx + 1;
    sheet.getRange(1, statusHutColIdx + 1).setValue("Status_HUT")
      .setBackground("#1F4E79").setFontColor("#FFFFFF").setFontWeight("bold");
  }

  autoSortMasterPemilikByBirthday(sheet, hutColIdx);
  applyBirthdayFormulaPemilik(sheet, hutColIdx, statusHutColIdx);

  const hutColLetter = getColumnLetter(hutColIdx + 1);
  const statusColLetter = getColumnLetter(statusHutColIdx + 1);
  const rangeGlow = sheet.getRange(hutColLetter + "2:" + statusColLetter + sheet.getMaxRows());

  sheet.clearConditionalFormatRules();
  const ruleBdayPemilik = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$' + statusColLetter + '2<>""')
    .setBackground("#D4EDDA")
    .setFontColor("#155724")
    .setBold(true)
    .setRanges([rangeGlow])
    .build();

  sheet.setConditionalFormatRules([ruleBdayPemilik]);
}

function applyBirthdayFormulaPemilik(sheet, hutColIdx, statusHutColIdx) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  const hutColLetter = getColumnLetter(hutColIdx + 1);
  const formulaPemilik = 
    '=IF(ISBLANK(' + hutColLetter + '2), "", ' +
    'LET(' +
    '  raw, ' + hutColLetter + '2, ' +
    '  dVal, IF(ISDATE(raw), raw, IF(ISNUMBER(SEARCH("/", raw)), DATE(INDEX(SPLIT(raw, "/"), 3), INDEX(SPLIT(raw, "/"), 2), INDEX(SPLIT(raw, "/"), 1)), DATEVALUE(raw))), ' +
    '  bdayThisYear, DATE(YEAR(TODAY()), MONTH(dVal), DAY(dVal)), ' +
    '  diff, bdayThisYear - TODAY(), ' +
    '  IF(diff = 0, "🎂 Birthday !!!", ' +
    '  IF(diff = 1, "🎈 H-1 Birthday", ' +
    '  IF(AND(diff >= -3, diff < 0), "🎉 H+" & ABS(diff) & " Birthday", "")))' +
    '))';

  sheet.getRange(2, statusHutColIdx + 1, lastRow - 1, 1).setFormula(formulaPemilik).setHorizontalAlignment("center");
}

function autoSortMasterPemilikByBirthday(sheet, hutColIdx) {
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  if (values.length < 3) return;

  const headers = values[0];
  const rows = values.slice(1);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const curYear = today.getFullYear();

  const validBdayRows = [];
  const emptyBdayRows = [];

  rows.forEach(row => {
    const raw = row[hutColIdx];
    const parsedDate = parseAnyDate(raw);

    if (parsedDate) {
      let nextBday = new Date(curYear, parsedDate.getMonth(), parsedDate.getDate());
      nextBday.setHours(0, 0, 0, 0);

      let diffTime = nextBday.getTime() - today.getTime();
      let diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < -3) {
        nextBday = new Date(curYear + 1, parsedDate.getMonth(), parsedDate.getDate());
        diffDays = Math.round((nextBday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      }

      validBdayRows.push({ row: row, daysUntil: diffDays });
    } else {
      emptyBdayRows.push(row);
    }
  });

  validBdayRows.sort((a, b) => a.daysUntil - b.daysUntil);
  const sortedRows = validBdayRows.map(item => item.row).concat(emptyBdayRows);

  sheet.getRange(2, 1, sortedRows.length, headers.length).setValues(sortedRows);
}

// ===================================================================
// 4. HELPER PARSER & HURUF KOLOM
// ===================================================================
function parseAnyDate(val) {
  if (!val) return null;
  if (val instanceof Date && !isNaN(val.getTime())) return val;

  const str = String(val).trim();
  if (str === "" || str.toLowerCase() === "dd/mm/yyyy" || str === "-") return null;

  if (str.includes("/")) {
    const parts = str.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      let year = parseInt(parts[2], 10);
      if (year < 100) year += 2000;
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }
  }

  if (str.includes("-")) {
    const parts = str.split("-");
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        if (!isNaN(d.getTime())) return d;
      } else {
        const d = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
        if (!isNaN(d.getTime())) return d;
      }
    }
  }

  const d = new Date(str);
  return !isNaN(d.getTime()) ? d : null;
}

function getColumnLetter(colIndex) {
  let temp, letter = '';
  while (colIndex > 0) {
    temp = (colIndex - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    colIndex = (colIndex - temp - 1) / 26;
  }
  return letter;
}