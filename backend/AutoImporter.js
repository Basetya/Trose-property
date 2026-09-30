// ===================================================================
// MASTER AUTO IMPORTER & SCHEMA BUILDER - KUSUMA PROPERTI (REVISED P4)
// ===================================================================

function autoImportKalibataData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Settings_Templates
  const tplHeaders = ["Template_Code", "Kategori", "Template_Text"];
  const tplRows = [
    ["TPL_H30", "Reminder H-30", "Halo {Sapaan} *{Nama_Penyewa}*,\nSalam hangat dari kami di manajemen properti.\n\nSemoga {Sapaan} sekeluarga selalu sehat dan nyaman tinggal di unit *Kalibata City No. {No_Unit}*.\n\nSekadar menginfokan, masa sewa unit {Sapaan} akan berakhir dalam *30 hari* ke depan (jatuh tempo pada *{Tgl_Jatuh_Tempo}*).\n\nApakah {Sapaan} berencana memperpanjang masa sewa untuk periode berikutnya? Mohon kabari kami ya {Sapaan} agar jadwal dan administrasinya bisa kami prioritaskan dengan baik.\n\nTerima kasih banyak 🙏"],
    ["TPL_H14", "Reminder H-14", "Halo {Sapaan} *{Nama_Penyewa}*,\nSemoga aktivitas {Sapaan} berjalan lancar.\n\nMengingatkan kembali bahwa masa sewa unit *Kalibata City No. {No_Unit}* tersisa *14 hari lagi* (jatuh tempo pada *{Tgl_Jatuh_Tempo}*).\n\nRincian sewa:\n• Unit: *{No_Unit}*\n• Nilai Sewa: *{Nominal}*\n\nJika {Sapaan} ingin melanjutkan sewa, mohon infokan ke kami agar dokumen konfirmasi disiapkan. Namun jika berencana checkout, mohon infokan jadwal serah terima kunci dan pengecekan unit bersama tim kami ya {Sapaan}.\n\nTerima kasih atas kerja samanya 🙏"],
    ["TPL_H7", "Reminder H-7", "Halo {Sapaan} *{Nama_Penyewa}*,\nSemoga dalam keadaan sehat selalu.\n\nKami menginfokan bahwa masa sewa unit *Kalibata City No. {No_Unit}* akan berakhir dalam *7 hari* lagi (jatuh tempo pada *{Tgl_Jatuh_Tempo}*).\n\nUntuk kelancaran administrasi perpanjangan sewa sebesar *{Nominal}*, mohon konfirmasi kelanjutan proses atau bukti transfernya ya {Sapaan}.\n\n_(Abaikan pesan ini apabila {Sapaan} sudah menyelesaikan administrasi dengan Admin sebelumnya)._\n\nTerima kasih banyak atas kerja samanya 🙏"],
    ["TPL_HBD_OWNER", "Ulang Tahun Pemilik", "Selamat Pagi {Sapaan} *{Nama}*,\n\nKami segenap tim manajemen properti mengucapkan *Selamat Ulang Tahun*! 🎂🎉\n\nSemoga {Sapaan} senantiasa dilimpahkan kesehatan, kebahagiaan, umur yang berkah, serta kelancaran rezeki.\n\nTerima kasih banyak atas kemitraan dan kepercayaan {Sapaan} dalam mempercayakan pengelolaan unit Kalibata City bersama kami.\n\nSalam hangat,\n*Kusuma Properti Management*"],
    ["TPL_HBD_TENANT", "Ulang Tahun Penyewa", "Selamat Pagi {Sapaan} *{Nama}*,\n\nSegenap tim manajemen mengucapkan *Selamat Ulang Tahun*! 🎂🎉\n\nSemoga hari ini menjadi awal dari tahun yang penuh berkah, kesehatan, dan kesuksesan untuk {Sapaan}.\n\nTerima kasih sudah menjadi bagian dari keluarga besar penghuni di unit *Kalibata City No. {No_Unit}*. Semoga selalu merasa nyaman dan betah tinggal di sini ya {Sapaan}.\n\nSelamat merayakan hari istimewa ini! 🥳"]
  ];

  // 2. Master_Pemilik
  const pemilikHeaders = ["No_Unit", "Sapaan", "Nama_Pemilik", "WA_Pemilik", "Tgl_Lahir (DD/MM)", "Nama_Bank", "No_Rekening", "Atas_Nama", "Status_Unit", "Last_HBD_Year"];
  const pemilikRows = [
    ["A09AV", "Bpk.", "Budi Rachmat", "[WA KOSONG]", "02/08", "[KOSONG]", "[KOSONG]", "[KOSONG]", "Disewakan", ""],
    ["A09AF", "Ibu", "Nurlisma Titiati", "[WA KOSONG]", "02/08", "[KOSONG]", "[KOSONG]", "[KOSONG]", "Dipakai Pemilik", ""],
    ["B12CJ", "Ibu", "Nurlisma Titiati", "[WA KOSONG]", "02/08", "BCA", "350372148", "AZILA NOVIATI", "Disewakan", ""],
    ["C07CL", "Ibu", "Ir.H.Widiyanti", "[WA KOSONG]", "02/08", "[KOSONG]", "[KOSONG]", "[KOSONG]", "Disewakan", ""],
    ["C16CL", "Ibu", "Siti Chasanah", "628118700645", "02/08", "[KOSONG]", "[KOSONG]", "[KOSONG]", "Disewakan", ""],
    ["F06BB", "Bpk.", "Ahmad Syaf Fitrah", "[WA KOSONG]", "02/08", "[KOSONG]", "[KOSONG]", "[KOSONG]", "Disewakan", ""],
    ["F07CP", "Ibu", "Nabila Shananda", "[WA KOSONG]", "07/04", "[KOSONG]", "[KOSONG]", "[KOSONG]", "Disewakan", ""],
    ["F08AM", "Bpk.", "Ir Puntodewo", "[WA KOSONG]", "08/11", "[KOSONG]", "[KOSONG]", "[KOSONG]", "Disewakan", ""],
    ["F08AP", "Ibu", "Ir. Siti Sarah", "[WA KOSONG]", "16/11", "[KOSONG]", "[KOSONG]", "[KOSONG]", "Disewakan", ""],
    ["F08AR", "Ibu", "Sastikanya Prabu", "[WA KOSONG]", "[TGL KOSONG]", "[KOSONG]", "[KOSONG]", "[KOSONG]", "Disewakan", ""],
    ["F09AV", "Bpk.", "Budi Rachmat", "[WA KOSONG]", "02/08", "[KOSONG]", "[KOSONG]", "[KOSONG]", "[UNIT KOSONG]", ""],
    ["F11AE", "Bpk.", "Fariz Aditya", "[WA KOSONG]", "07/09", "[KOSONG]", "[KOSONG]", "[KOSONG]", "Disewakan", ""],
    ["F12AT", "Ibu", "Ranisha Calluel", "[WA KOSONG]", "02/08", "[KOSONG]", "[KOSONG]", "[KOSONG]", "Disewakan", ""],
    ["J06CU", "Ibu", "ir Atmadji Wiseso", "6281282589705", "02/08", "BCA", "860274132", "ATMADJI WISESO", "Disewakan", ""],
    ["J15BD", "Ibu", "Zadiyanti Prabandini", "[WA KOSONG]", "02/08", "[KOSONG]", "[KOSONG]", "[KOSONG]", "Disewakan", ""],
    ["J17CG", "Ibu", "Fadhilah Yuza", "6285210154065", "02/08", "[KOSONG]", "[KOSONG]", "[KOSONG]", "Disewakan", ""],
    ["K05BE", "Ibu", "Dwi Arie Praptantinah", "6281310351951", "31/10", "[KOSONG]", "[KOSONG]", "[KOSONG]", "Disewakan", ""],
    ["K08AR", "Ibu", "Dyah Ida Zakijah", "6285210154065", "06/03", "[KOSONG]", "[KOSONG]", "[KOSONG]", "Disewakan", ""],
    ["K12BG", "Bpk.", "Ir H Setya Boma", "628158101409", "16/12", "[KOSONG]", "[KOSONG]", "[KOSONG]", "Disewakan", ""],
    ["K15AK", "Ibu", "Heksa Hadi Agust", "[WA KOSONG]", "02/08", "BCA", "4491247189", "HEKSA HADI A", "Disewakan", ""],
    ["K16CH", "Ibu", "Diah Faras", "[WA KOSONG]", "02/08", "BCA", "4212545001", "NOFTALINA", "Disewakan", ""],
    ["K16CV", "Ibu", "Hastanti Prabande", "[WA KOSONG]", "02/08", "[KOSONG]", "[KOSONG]", "[KOSONG]", "Disewakan", ""],
    ["K18CN", "Bpk.", "Mikhael Sakharov", "[WA KOSONG]", "02/08", "BCA", "4212545001", "NOFTALINA", "Disewakan", ""],
    ["L20BJ", "Bpk.", "Abraham Sianipar", "628122026822", "02/08", "BCA", "[KOSONG]", "[KOSONG]", "Disewakan", ""],
    ["M12CC", "Ibu", "Marina Mustafa Soleh", "[WA KOSONG]", "02/08", "BCA", "2370043208", "MARINA MUSTAFA S", "Disewakan", ""],
    ["M12CD", "Ibu", "Marina Mustafa Soleh", "[WA KOSONG]", "02/08", "BCA", "2370043208", "MARINA MUSTAFA S", "Disewakan", ""],
    ["N21BC", "Bpk.", "Krishna Pratama", "[WA KOSONG]", "02/08", "[KOSONG]", "[KOSONG]", "[KOSONG]", "Disewakan", ""],
    ["R06CH", "Bpk.", "Gunawan", "[WA KOSONG]", "02/08", "BCA", "[KOSONG]", "[KOSONG]", "Disewakan", ""],
    ["R12AJ", "Ibu", "Tia Aprianti H", "[WA KOSONG]", "02/08", "BCA", "[KOSONG]", "[KOSONG]", "Disewakan", ""],
    ["S09CF", "Ibu", "Hartaty", "6285210154065", "02/08", "BCA", "1500581009", "HARTATI", "Disewakan", ""],
    ["V15BC", "Ibu", "Ir Marita Alisyahbana", "[WA KOSONG]", "02/08", "[KOSONG]", "[KOSONG]", "[KOSONG]", "Disewakan", ""],
    ["V18AG", "Ibu", "Ir Marita Alisyahbana", "[WA KOSONG]", "02/08", "[KOSONG]", "[KOSONG]", "[KOSONG]", "Disewakan", ""]
  ];

  // 3. Master_Penyewa_Kontrak
  const penyewaHeaders = [
    "No_Unit", "Nama_Penyewa", "WA_Penyewa", "Periode_Bulan", "Tgl_Jatuh_Tempo", 
    "Harga_Sewa_Owner", "Harga_Sewa_Penyewa", "Deposit", "Catatan", 
    "Status_Bayar", "Tgl_Bayar", "Status_H30", "Status_H14", "Status_H7", 
    "Tgl_Lahir_Penyewa", "Last_HBD_Year", "Cal_Event_ID"
  ];

  const penyewaRows = [
    ["A091F", "dipakai pemilik", "[WA KOSONG]", "-", "-", "-", "-", "-", "", "Dipakai Pemilik", "", "", "", "", "[TGL KOSONG]", "", ""],
    ["A09AV", "klien Criana", "[WA KOSONG]", "1", "2026-09-16", "3200000", "3500000", "[KOSONG]", "", "Belum Bayar", "", "", "", "", "[TGL KOSONG]", "", ""],
    ["B12CJ", "klien Criana", "[WA KOSONG]", "1", "2026-09-16", "2500000", "2800000", "1500000", "", "Belum Bayar", "", "", "", "", "[TGL KOSONG]", "", ""],
    ["C07CL", "Arjunsyah", "[WA KOSONG]", "1", "2026-09-11", "3300000", "3500000", "[KOSONG]", "belum setor ke owner", "Belum Bayar", "", "", "", "", "[TGL KOSONG]", "", ""],
    ["C16CL", "Hasan", "628118700645", "1", "2026-10-14", "3500000", "3500000", "2000000", "we blm byr", "Belum Bayar", "", "", "", "", "[TGL KOSONG]", "", ""],
    ["F06BB", "Erri/Afifa", "[WA KOSONG]", "3", "2026-09-25", "9000000", "9500000", "1500000", "bayar bulann ke owner", "Belum Bayar", "", "", "", "", "[TGL KOSONG]", "", ""],
    ["F07CP", "Gibran/Icha", "[WA KOSONG]", "1", "2026-09-08", "3200000", "[KOSONG]", "1500000", "", "Belum Bayar", "", "", "", "", "[TGL KOSONG]", "", ""],
    ["F08AM", "Faza", "[WA KOSONG]", "12", "2027-05-01", "39000000", "40000000", "1500000", "", "Belum Bayar", "", "", "", "", "[TGL KOSONG]", "", ""],
    ["F08AP", "Rezka Putriani", "[WA KOSONG]", "1", "2026-10-01", "3350000", "3500000", "[KOSONG]", "", "Belum Bayar", "", "", "", "", "[TGL KOSONG]", "", ""],
    ["F08AR", "Gega/Henri", "[WA KOSONG]", "1", "2026-09-09", "3500000", "3500000", "1500000", "", "Belum Bayar", "", "", "", "", "[TGL KOSONG]", "", ""],
    ["F11AE", "bu Olga", "[WA KOSONG]", "1", "2026-09-15", "3500000", "3500000", "1500000", "", "Belum Bayar", "", "", "", "", "[TGL KOSONG]", "", ""],
    ["F12AT", "Rintan", "[WA KOSONG]", "1", "2026-10-01", "3500000", "3500000", "2000000", "owner", "Belum Bayar", "", "", "", "", "[TGL KOSONG]", "", ""],
    ["J06CU", "Nira Kusumawati", "6281282589705", "1", "2026-10-01", "3500000", "3500000", "[KOSONG]", "", "Belum Bayar", "", "", "", "", "[TGL KOSONG]", "", ""],
    ["J15BD", "Pak Muhammad", "[WA KOSONG]", "3", "2026-12-01", "3500000", "3300000", "2000000", "", "Belum Bayar", "", "", "", "", "[TGL KOSONG]", "", ""],
    ["J17CG", "Anugrah Pratama H", "6285210154065", "1", "2026-09-25", "3700000", "3500000", "1500000", "", "Belum Bayar", "", "", "", "", "[TGL KOSONG]", "", ""],
    ["K05BE", "Bu Karin", "6281310351951", "1", "2026-09-15", "3500000", "[KOSONG]", "1500000", "ref mtransfer 14/6/2021", "Belum Bayar", "", "", "", "", "[TGL KOSONG]", "", ""],
    ["K08AR", "Pak Nurdy", "6285210154065", "1", "2026-09-18", "3500000", "[KOSONG]", "0", "", "Belum Bayar", "", "", "", "", "[TGL KOSONG]", "", ""],
    ["K12BG", "Wreda", "628158101409", "1", "2026-09-20", "3500000", "[KOSONG]", "1500000", "", "Belum Bayar", "", "", "", "", "[TGL KOSONG]", "", ""],
    ["K15AK", "Daffa, Ariq", "[WA KOSONG]", "3", "2026-09-29", "10000000", "[KOSONG]", "1500000", "", "Belum Bayar", "", "", "", "", "[TGL KOSONG]", "", ""],
    ["K16CH", "Mutiara Candra", "[WA KOSONG]", "1", "2026-10-01", "10000000", "[KOSONG]", "2000000", "", "Belum Bayar", "", "", "", "", "[TGL KOSONG]", "", ""],
    ["K16CV", "Heda Zafirah", "[WA KOSONG]", "6", "2026-12-02", "20000000", "[KOSONG]", "1500000", "", "Belum Bayar", "", "", "", "", "[TGL KOSONG]", "", ""],
    ["K18CN", "Fathia", "[WA KOSONG]", "1", "2026-09-09", "3200000", "[KOSONG]", "1500000", "", "Belum Bayar", "", "", "", "", "[TGL KOSONG]", "", ""],
    ["L20BJ", "Evi exk8ar", "628122026822", "1", "2026-09-24", "3750000", "3800000", "1500000", "ref mtransfer 28 Mei 2022", "Belum Bayar", "", "", "", "", "[TGL KOSONG]", "", ""],
    ["M12CC", "Musfirah", "[WA KOSONG]", "6", "2027-02-03", "22000000", "23000000", "1500000", "berdasar perjanjian 1/8/2021", "Belum Bayar", "", "", "", "", "[TGL KOSONG]", "", ""],
    ["M12CD", "Julian Astriadi", "[WA KOSONG]", "1", "2026-09-25", "9000000", "[KOSONG]", "1500000", "", "Belum Bayar", "", "", "", "", "[TGL KOSONG]", "", ""],
    ["N21BC", "Adyka/Airien", "[WA KOSONG]", "3", "2027-08-25", "11000000", "[KOSONG]", "1500000", "ref mtransfer 5/5/2021", "Belum Bayar", "", "", "", "", "[TGL KOSONG]", "", ""],
    ["R06CH", "Panca", "[WA KOSONG]", "12", "2027-01-10", "26500000", "[KOSONG]", "1500000", "", "Belum Bayar", "", "", "", "", "[TGL KOSONG]", "", ""],
    ["R12AJ", "Aditya", "[WA KOSONG]", "3", "2026-10-09", "9000000", "8750000", "1500000", "ke owner bulanan setor 2,5 jt", "Belum Bayar", "", "", "", "", "[TGL KOSONG]", "", ""],
    ["S09CF", "Agus &Tera", "6285210154065", "3", "2026-09-13", "13000000", "[KOSONG]", "1500000", "", "Belum Bayar", "", "", "", "", "[TGL KOSONG]", "", ""],
    ["V15BC", "Bayu", "[WA KOSONG]", "1", "2026-09-27", "4250000", "[KOSONG]", "2000000", "ref perjanjian 22 April 2022", "Belum Bayar", "", "", "", "", "[TGL KOSONG]", "", ""],
    ["V15AG", "ibnu 7/8", "[WA KOSONG]", "1", "2026-09-07", "3000000", "[KOSONG]", "1500000", "ref perjanjian 1 Februari 2022", "Belum Bayar", "", "", "", "", "[TGL KOSONG]", "", ""]
  ];

  // 4. Approval_Queue
  const queueHeaders = ["Queue_ID", "Tgl_Queue", "No_Unit", "Nama_Penyewa", "WA_Penyewa", "Tipe_Reminder", "Due_Date", "Nominal", "Draft_Pesan", "Status", "Approve_Action"];

  // 5. 08_FINANCIAL_LOGS
  const financialHeaders = ["Timestamp", "No_Unit", "Nama_Penyewa", "Periode_Bulan", "Nominal_Bayar", "Status", "Keterangan"];

  // 6. 02_UNITS (MANAJEMEN FISIK UNIT & MARKETING ZERO-VACANCY)
  const unitsHeaders = ["No_Unit", "Tower", "Lantai", "Tipe_Unit", "Status_Unit", "Tgl_Tersedia", "Harga_Sewa_Bulan", "Furnishing", "Fasilitas", "Draft_Iklan_Marketing"];
  
  // Ekstrak unit dasar untuk diisi ke tab 02_UNITS
  const unitList = [
    "A09AV", "A09AF", "B12CJ", "C07CL", "C16CL", "F06BB", "F07CP", "F08AM", 
    "F08AP", "F08AR", "F09AV", "F11AE", "F12AT", "J06CU", "J15BD", "J17CG", 
    "K05BE", "K08AR", "K12BG", "K15AK", "K16CH", "K16CV", "K18CN", "L20BJ", 
    "M12CC", "M12CD", "N21BC", "R06CH", "R12AJ", "S09CF", "V15BC", "V15AG"
  ];

  const unitsRows = unitList.map(u => {
    const tower = u.charAt(0);
    const floor = u.substring(1, 3);
    const status = (u === "A09AF") ? "Dipakai Pemilik" : (u === "F09AV") ? "Kosong Siap Huni" : "Tersewa";
    return [
      u, 
      `Tower ${tower}`, 
      `Lantai ${floor}`, 
      "2 Bedroom", 
      status, 
      "-", 
      "3.500.000", 
      "Full Furnished", 
      "AC, TV, Kulkas, Kitchen Set, Water Heater, Queen Bed", 
      ""
    ];
  });

  function createOrUpdateSheet(sheetName, headers, rows) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    } else {
      sheet.clear();
    }
    const allData = rows.length > 0 ? [headers, ...rows] : [headers];
    sheet.getRange(1, 1, allData.length, headers.length).setValues(allData);
    sheet.getRange(1, 1, 1, headers.length).setBackground("#1F4E79").setFontColor("#FFFFFF").setFontWeight("bold");
    sheet.setFrozenRows(1);
    
    for (let col = 1; col <= headers.length; col++) {
      if (sheetName === "02_UNITS" && col === 10) {
        sheet.setColumnWidth(10, 450); // Draft iklan marketing lebar
      } else {
        sheet.autoResizeColumn(col);
      }
    }
  }

  createOrUpdateSheet("Settings_Templates", tplHeaders, tplRows);
  createOrUpdateSheet("Master_Pemilik", pemilikHeaders, pemilikRows);
  createOrUpdateSheet("Master_Penyewa_Kontrak", penyewaHeaders, penyewaRows);
  createOrUpdateSheet("Approval_Queue", queueHeaders, []);
  createOrUpdateSheet("08_FINANCIAL_LOGS", financialHeaders, []);
  createOrUpdateSheet("02_UNITS", unitsHeaders, unitsRows);

  Logger.log("Selesai! Tab 02_UNITS telah siap dengan skema Zero Vacancy.");
}