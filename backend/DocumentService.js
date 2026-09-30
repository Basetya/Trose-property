// ===================================================================
// DOCUMENT SERVICE ENGINE - KUSUMA PROPERTI (CLEAN & ROBUST)
// ===================================================================

const DOC_CONFIG = {
  OUTPUT_FOLDER_NAME: 'Arsip_Perpanjangan_Sewa_Kalibata',
  SHEET_PENYEWA: 'Master_Penyewa_Kontrak',
  SHEET_PEMILIK: 'Master_Pemilik'
};

// 1. DAPATKAN ATAU BUAT FOLDER PENYIMPANAN PDF DI GOOGLE DRIVE
function getOrCreatePdfFolder() {
  const folders = DriveApp.getFoldersByName(DOC_CONFIG.OUTPUT_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(DOC_CONFIG.OUTPUT_FOLDER_NAME);
}

// 2. DAPATKAN ATAU BUAT MASTER TEMPLATE RESMI DI DRIVE
function getValidTemplateFile() {
  const folder = getOrCreatePdfFolder();
  const existingFiles = folder.getFilesByName("Template_Surat_Perpanjangan_Master");
  if (existingFiles.hasNext()) {
    return existingFiles.next();
  }

  // Buat Master Template Dokumen Baru
  const newDoc = DocumentApp.create("Template_Surat_Perpanjangan_Master");
  const body = newDoc.getBody();
  
  const title = body.appendParagraph("SURAT KONFIRMASI PERPANJANGAN SEWA APARTEMEN");
  title.setHeading(DocumentApp.ParagraphHeading.HEADING1);
  title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  body.appendParagraph("KUSUMA PROPERTI MANAGEMENT - KALIBATA CITY\nNo. Dokumen: KP/RENEWAL/{NO_UNIT}/{TANGGAL_HARI_INI}\n");
  body.appendParagraph("Pada hari ini, tanggal {TANGGAL_HARI_INI}, dibuat surat konfirmasi perpanjangan sewa unit hunian apartemen dengan ketentuan sebagai berikut:\n");
  
  body.appendParagraph("I. IDENTITAS UNIT & PENYEWA");
  body.appendParagraph("Nama Penyewa        : {NAMA_PENYEWA}");
  body.appendParagraph("Nomor WhatsApp      : {WA_PENYEWA}");
  body.appendParagraph("Nomor Unit          : Kalibata City Tower/Unit {NO_UNIT}\n");

  body.appendParagraph("II. KETENTUAN MASA SEWA & BIAYA");
  body.appendParagraph("Periode Perpanjangan: {PERIODE_BULAN} Bulan");
  body.appendParagraph("Jatuh Tempo Baru    : {TGL_JATUH_TEMPO}");
  body.appendParagraph("Nilai Sewa          : {NOMINAL}\n");

  body.appendParagraph("III. INSTRUKSI PEMBAYARAN");
  body.appendParagraph("Pembayaran sewa dapat ditransfer ke rekening penampungan resmi:");
  body.appendParagraph("Bank                : {NAMA_BANK}");
  body.appendParagraph("Nomor Rekening      : {NO_REKENING}");
  body.appendParagraph("Atas Nama           : {ATAS_NAMA}\n");

  body.appendParagraph("Demikian surat konfirmasi perpanjangan sewa ini dibuat agar dapat dipergunakan sebagaimana mestinya.\n\nJakarta, {TANGGAL_HARI_INI}\n\nHormat kami,\nKusuma Properti Management");

  newDoc.saveAndClose();

  const createdFile = DriveApp.getFileById(newDoc.getId());
  folder.addFile(createdFile);
  DriveApp.getRootFolder().removeFile(createdFile);

  return createdFile;
}

// 3. GENERATE PDF PERPANJANGAN SEWA UNTUK UNIT
function generateRenewalPdfForUnit(targetUnit) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetPenyewa = ss.getSheetByName(DOC_CONFIG.SHEET_PENYEWA);
  const sheetPemilik = ss.getSheetByName(DOC_CONFIG.SHEET_PEMILIK);

  if (!sheetPenyewa || !sheetPemilik) return null;

  const cleanUnit = String(targetUnit).trim().toUpperCase();
  const penyewaData = sheetPenyewa.getDataRange().getValues();
  const pemilikData = sheetPemilik.getDataRange().getValues();

  // 1. Data Penyewa
  let tenant = null;
  for (let i = 1; i < penyewaData.length; i++) {
    if (String(penyewaData[i][0]).trim().toUpperCase() === cleanUnit) {
      tenant = {
        unit: penyewaData[i][0],
        nama: penyewaData[i][1],
        wa: penyewaData[i][2],
        periode: penyewaData[i][3],
        dueDate: penyewaData[i][4],
        nominal: penyewaData[i][6]
      };
      break;
    }
  }

  if (!tenant) {
    Logger.log(`Unit ${cleanUnit} tidak ditemukan.`);
    return null;
  }

  // 2. Data Pemilik
  let owner = { bank: "BCA", rekening: "860274132", an: "ATMADJI WISESO" };
  for (let j = 1; j < pemilikData.length; j++) {
    if (String(pemilikData[j][0]).trim().toUpperCase() === cleanUnit) {
      if (pemilikData[j][5] && !String(pemilikData[j][5]).includes("[KOSONG]")) {
        owner.bank = pemilikData[j][5];
        owner.rekening = pemilikData[j][6];
        owner.an = pemilikData[j][7];
      }
      break;
    }
  }

  const today = new Date();
  const todayStr = Utilities.formatDate(today, "Asia/Jakarta", "dd MMMM yyyy");
  
  let formattedDueDate = tenant.dueDate;
  if (tenant.dueDate instanceof Date) {
    formattedDueDate = Utilities.formatDate(tenant.dueDate, "Asia/Jakarta", "dd MMMM yyyy");
  }

  const formattedNominal = (!isNaN(tenant.nominal) && Number(tenant.nominal) > 0) 
    ? "Rp " + Number(tenant.nominal).toLocaleString('id-ID') 
    : "-";

  // 3. Salin Template & Isi Variabel
  const templateDriveFile = getValidTemplateFile();
  const targetFolder = getOrCreatePdfFolder();
  const newDocTitle = `Surat_Perpanjangan_${cleanUnit}_${tenant.nama}`;

  const copiedFile = templateDriveFile.makeCopy(newDocTitle, targetFolder);
  const newDoc = DocumentApp.openById(copiedFile.getId());
  const body = newDoc.getBody();

  body.replaceText('\\{NO_UNIT\\}', String(tenant.unit));
  body.replaceText('\\{NAMA_PENYEWA\\}', String(tenant.nama));
  body.replaceText('\\{WA_PENYEWA\\}', String(tenant.wa));
  body.replaceText('\\{PERIODE_BULAN\\}', String(tenant.periode));
  body.replaceText('\\{TGL_JATUH_TEMPO\\}', String(formattedDueDate));
  body.replaceText('\\{NOMINAL\\}', String(formattedNominal));
  body.replaceText('\\{NAMA_BANK\\}', String(owner.bank));
  body.replaceText('\\{NO_REKENING\\}', String(owner.rekening));
  body.replaceText('\\{ATAS_NAMA\\}', String(owner.an));
  body.replaceText('\\{TANGGAL_HARI_INI\\}', todayStr);

  newDoc.saveAndClose();

  // 4. Konversi Dokumen ke PDF
  const pdfBlob = copiedFile.getAs('application/pdf').setName(`${newDocTitle}.pdf`);
  const pdfFile = targetFolder.createFile(pdfBlob);
  pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  copiedFile.setTrashed(true);

  return {
    unit: cleanUnit,
    nama: tenant.nama,
    wa: tenant.wa,
    pdfUrl: pdfFile.getUrl()
  };
}

// 4. PENGUJIAN LANGSUNG DARI EDITOR
function testGenerateRenewalPdf() {
  const unitUjiCoba = "C16CL";
  Logger.log(`Memulai proses untuk unit: ${unitUjiCoba}...`);
  
  const hasil = generateRenewalPdfForUnit(unitUjiCoba);
  
  if (hasil) {
    Logger.log(`BERHASIL SEPENUHNYA!\nFile PDF tersimpan di Drive:\n${hasil.pdfUrl}`);
  } else {
    Logger.log(`Gagal memproses unit ${unitUjiCoba}.`);
  }
}