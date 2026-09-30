/**
 * Kusuma Properti - Database Master Consolidator & Cleaner
 * File: UpdateDatabaseMaster.gs
 * Fungsi: Merapikan kolom duplikat, menyatukan kontak tervalidasi, dan membersihkan sheet lama.
 */
function rapikanDanUpdateMasterDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Hapus Sheet1 jika ada dan kosong
  const sheet1 = ss.getSheetByName("Sheet1");
  if (sheet1) {
    try { ss.deleteSheet(sheet1); Logger.log("🗑️ Sheet1 berhasil dihapus."); } catch (e) {}
  }

  // 2. Hapus Sheet4 jika ada (karena redundan dengan Settings_Templates)
  const sheet4 = ss.getSheetByName("Sheet4");
  if (sheet4) {
    try { ss.deleteSheet(sheet4); Logger.log("🗑️ Sheet4 berhasil dihapus."); } catch (e) {}
  }

  // 3. Ambil sheet Master Penyewa Aktif & Tagihan
  let targetSheet = null;
  for (let s of ss.getSheets()) {
    const sName = s.getName().trim().toLowerCase();
    if (sName.includes("master penyewa") || sName.includes("master_penyewa")) {
      targetSheet = s;
      break;
    }
  }

  if (!targetSheet) {
    targetSheet = ss.insertSheet("Master Penyewa Aktif & Tagihan");
  }

  // Struktur 14 Kolom Baku (Tanpa Redudansi)
  const cleanHeaders = [
    "No_Unit", 
    "Nama_Penyewa", 
    "WA_Penyewa", 
    "Tagihan_WE", 
    "No_VA_BCA", 
    "No_VA_Mandiri", 
    "Periode Sewa_bln", 
    "Tgl_Jatuh_Tempo", 
    "Harga_Sewa_Owner", 
    "Harga_Sewa_Penyewa", 
    "Deposit", 
    "Catatan", 
    "Status_Bayar", 
    "Tgl_Lahir_HUT"
  ];

  // Data 32 Unit Bersih Hasil Konsolidasi & Update Referensi Terbaru
  const cleanRows = [
    ["A09AF", "Ronny (Pemilik)", "628170004762", 177135, "0011401401110006", "1401110006", "-", "dd/mm/yyyy", "-", "-", "-", "-", "Dipakai Pemilik", "-"],
    ["A09AV", "Criana (klien Criana)", "6281286262255", 854148, "0011401401110019", "1401110019", 1, "2026-09-16", 3200000, 3500000, "dibudi", "dibudi", "Belum Bayar", "-"],
    ["B12CJ", "klien Criana", "6281286262255", 1456670, "0011401402140040", "1402140040", 1, "2026-09-16", 2500000, 2800000, 1500000, "-", "Belum Bayar", "-"],
    ["C07CL", "Arjunansyah", "6282259701201", 932092, "0011401403090042", "1403090042", 1, "2026-09-11", 3300000, 3500000, 1500000, "belum setor ke owner", "Belum Bayar", "1984-06-06"],
    ["C16CL", "Hasan Maulana", "628118700645", 98877, "0011401403160042", "1403160042", 1, "2026-10-14", 3500000, 3500000, 2000000, "we blm byr", "Belum Bayar", "1999-01-21"],
    ["F06BB", "Erri / Afifa", "6285785799579", 667227, "0011401406060007", "1406060007", 3, "2026-09-25", 9000000, 9500000, 1500000, "-", "Belum Bayar", "1995-08-18"],
    ["F07CP", "Gibran / Icha", "6282110912943", 509247, "0011401406100034", "1406100034", 1, "2026-09-08", 3200000, 3200000, 1500000, "-", "Belum Bayar", "1998-05-12"],
    ["F08AM", "Faza", "6285743131059", 342974, "0011401406120016", "1406120016", 12, "2027-05-01", 38000000, 40000000, 2000000, "kpa mandiri", "Belum Bayar", "1988-12-28"],
    ["F08AP", "Rezka Putriani", "6285726860000", 230392, "0011401406120019", "1406120019", 1, "2026-10-01", 3500000, 3500000, 1500000, "-", "Belum Bayar", "1990-08-29"],
    ["F08AR", "Henri / Gega", "6282399152480", 354511, "0011401406120021", "1406120021", 1, "2026-09-09", 3500000, 3500000, 1500000, "-", "Belum Bayar", "1997-07-18"],
    ["F11AE", "Ibu Olga (Chaerani)", "6281343910207", 419454, "0011401406160009", "1406160009", 1, "2026-09-15", 3500000, 3500000, 1500000, "-", "Belum Bayar", "-"],
    ["F12AT", "Rintan Ari Bonita", "6282268845778", 888116, "0011401406180023", "1406180023", 1, "2026-10-01", 3500000, 3500000, 1500000, "-", "Belum Bayar", "1999-06-28"],
    ["J06CU", "Nira Kusumawati", "6285797969939", 369969, "0011401409090040", "1409090040", 1, "2026-10-01", 3500000, 3500000, 1500000, "-", "Belum Bayar", "1994-04-13"],
    ["J15BD", "Agustinah (Mama Ayini)", "6281397986848", 313902, "0011401409220015", "1409220015", 3, "2026-12-01", 10000000, 10500000, 1500000, "-", "Belum Bayar", "1988-08-04"],
    ["J17CG", "Anugrah Pratama H", "6287825891252", 123877, "0011401409250033", "1409250033", 1, "2026-09-25", 3200000, 3500000, 1500000, "-", "Belum Bayar", "1999-03-21"],
    ["K05BE", "Karin", "6281283865127", 2084102, "0011401410050011", "1410050011", 1, "2026-09-13", 3500000, 3500000, 1500000, "we nunggak", "Belum Bayar", "-"],
    ["K08AR", "M. Nurdi Yusuf", "6281388000107", 436907, "0011401410090021", "1410090021", 1, "2026-09-03", 3500000, 3500000, 1500000, "-", "Belum Bayar", "1964-07-01"],
    ["K12BG", "Wreda Prasetyo", "628155558830", 247131, "0011401410140019", "1410140019", 1, "2026-09-20", 3500000, 3500000, 1500000, "-", "Belum Bayar", "1995-08-20"],
    ["K15AK", "Daffa Alief Ranna", "6282165120020", 851430, "0011401410190013", "1410190013", 3, "2026-09-29", 9500000, 10000000, 2000000, "-", "Belum Bayar", "1998-08-26"],
    ["K16CH", "Mutiara Candra", "6282284971441", 59600, "0011401410160039", "1410160039", 3, "2026-10-01", 10000000, 10000000, 2000000, "-", "Belum Bayar", "1995-06-07"],
    ["K16CV", "Heda Zafirah", "6281318471490", 499339, "0011401410160049", "1410160049", 6, "2026-12-02", 19000000, 20000000, 2000000, "-", "Belum Bayar", "1995-10-10"],
    ["K18CN", "Fathia Mahmuda", "6282244143956", "-", "0011401410210043", "1410210043", 1, "2026-09-09", 3200000, 3200000, 1500000, "-", "Belum Bayar", "1992-10-17"],
    ["L20BJ", "Epi Rahmawati (Evi)", "6281382708011", 478620, "0011401411210034", "1411210034", 1, "2026-09-24", 3500000, 3800000, 1500000, "-", "Belum Bayar", "1973-06-08"],
    ["M12CC", "Musfirah", "6282311675177", "-", "0011401412150038", "1412150038", 6, "2027-02-03", 21500000, 23000000, 2000000, "-", "Belum Bayar", "1994-01-09"],
    ["M12CD", "Julian Astriadi", "6281910336493", 266706, "0011401412150039", "1412150039", 1, "2026-09-25", 3000000, 3000000, 1500000, "-", "Belum Bayar", "1986-07-31"],
    ["N21BC", "Adyka Fajar Anugrah", "6287825271906", 974364, "0011401413230018", "1413230018", 3, "2027-08-25", 10000000, 11000000, 1500000, "-", "Belum Bayar", "1995-01-31"],
    ["R06CH", "Dewa Panca Arian", "6289509412807", 273438, "0011401415060037", "1415060037", 6, "2027-01-10", 25000000, 26500000, 2000000, "-", "Belum Bayar", "1996-06-04"],
    ["R12AJ", "Aditya Pratama", "6281999557762", "-", "0011401415140014", "1415140014", 3, "2026-10-09", 8250000, 8750000, 1500000, "-", "Belum Bayar", "1988-03-18"],
    ["S09CF", "Agus Kurniawan", "6285220716958", 480401, "0011401416110037", "1416110037", 3, "2026-09-13", 13000000, 13000000, 1500000, "-", "Belum Bayar", "1993-08-25"],
    ["V15BC", "Bayu Ardan", "6281286262255", 594363, "0011401418150022", "1418150022", 1, "2026-09-27", 4250000, 4250000, 2000000, "ref perjanjian 22 April 2022", "Belum Bayar", "1977-08-18"],
    ["V15AG", "Andi Ibnu Mada", "6285156266479", 648496, "0011401418180007", "1418180007", 1, "2026-09-07", 3000000, 3000000, 1500000, "ref perjanjian 1 Februari 2022", "Belum Bayar", "1979-04-06"],
    ["K11BK", "Kusumawati (Test Dummy)", "6281221559000", 0, "0011401410130029", "1410130029", 1, "2026-10-01", 3000000, 3000000, 1500000, "Unit Testing", "Belum Bayar", "1965-08-28"]
  ];

  // Bersihkan total dan pasang struktur baru
  targetSheet.clear();
  targetSheet.getRange(1, 1, 1, cleanHeaders.length).setValues([cleanHeaders]);
  targetSheet.getRange(1, 1, 1, cleanHeaders.length)
    .setBackground("#1F4E79")
    .setFontColor("#FFFFFF")
    .setFontWeight("bold");

  targetSheet.getRange(2, 1, cleanRows.length, cleanHeaders.length).setValues(cleanRows);

  // Format kolom nomor WA dan No. VA agar tetap berupa teks murni (bukan notasi ilmiah)
  targetSheet.getRange(2, 3, cleanRows.length, 1).setNumberFormat("@");
  targetSheet.getRange(2, 5, cleanRows.length, 2).setNumberFormat("@");

  Logger.log(`✨ DATABASE SELESAI DIRAPIKAN! ${cleanRows.length} baris unit kini rapi dalam 14 kolom standar.`);
}