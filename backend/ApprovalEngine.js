/**
 * Kusuma Properti - Human-In-The-Loop (HITL) Approval Engine
 * File: ApprovalEngine.gs
 * Versi: v2.3 (Robust Flexible Matching & Fonnte Outbound Gate)
 */

var HITL_CONFIG = HITL_CONFIG || {
  SHEET_TEMPLATES: "Settings_Templates",
  SHEET_QUEUE: "Approval_Queue"
};

// ===================================================================
// HELPER: MENCARI SHEET DENGAN TOLERANSI SPASI & HURUF BESAR/KECIL
// ===================================================================
function getFlexibleSheet(sheetKeyword) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const keyword = sheetKeyword.trim().toLowerCase().replace(/[\s_-]/g, "");

  for (let i = 0; i < sheets.length; i++) {
    const sName = sheets[i].getName().trim().toLowerCase().replace(/[\s_-]/g, "");
    if (sName.includes(keyword)) {
      return sheets[i];
    }
  }
  return null;
}

// ===================================================================
// 1. FUNGSI TEMPLATE RESMI
// ===================================================================
function getMessageTemplate(templateCode) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheetTpl = getFlexibleSheet("Settings_Templates");
  
  if (!sheetTpl) {
    sheetTpl = ss.insertSheet("Settings_Templates");
    const defaultData = [
      ["Template_Code", "Kategori", "Template_Text"],
      [
        "TPL_H30", 
        "Reminder H-30", 
        "Halo {Sapaan} *{Nama_Penyewa}*,\nSalam hangat dari kami di manajemen properti.\n\nSemoga {Sapaan} sekeluarga selalu sehat dan nyaman tinggal di unit *Kalibata City No. {No_Unit}*.\n\nSekadar menginfokan, masa sewa unit {Sapaan} akan berakhir dalam *30 hari* ke depan (jatuh tempo pada *{Tgl_Jatuh_Tempo}*).\n\nApakah {Sapaan} berencana memperpanjang masa sewa untuk periode berikutnya? Mohon kabari kami ya {Sapaan} agar jadwal dan administrasinya bisa kami prioritaskan dengan baik.\n\nTerima kasih banyak 🙏"
      ],
      [
        "TPL_H14", 
        "Reminder H-14", 
        "Halo {Sapaan} *{Nama_Penyewa}*,\nSemoga aktivitas {Sapaan} berjalan lancar.\n\nMengingatkan kembali bahwa masa sewa unit *Kalibata City No. {No_Unit}* tersisa *14 hari lagi* (jatuh tempo pada *{Tgl_Jatuh_Tempo}*).\n\nRincian sewa:\n• Unit: *{No_Unit}*\n• Nilai Sewa: *{Nominal}*\n\nJika {Sapaan} ingin melanjutkan sewa, mohon infokan ke kami agar dokumen konfirmasi disiapkan. Namun jika berencana checkout, mohon infokan jadwal serah terima kunci dan pengecekan unit bersama tim kami ya {Sapaan}.\n\nTerima kasih atas kerja samanya 🙏"
      ],
      [
        "TPL_H7", 
        "Reminder H-7", 
        "Halo {Sapaan} *{Nama_Penyewa}*,\nSemoga dalam keadaan sehat selalu.\n\nKami menginfokan bahwa masa sewa unit *Kalibata City No. {No_Unit}* akan berakhir dalam *7 hari* lagi (jatuh tempo pada *{Tgl_Jatuh_Tempo}*).\n\nUntuk kelancaran administrasi perpanjangan sewa sebesar *{Nominal}*, mohon konfirmasi kelanjutan proses atau bukti transfernya ya {Sapaan}.\n\n_(Abaikan pesan ini apabila {Sapaan} sudah menyelesaikan administrasi dengan Admin sebelumnya)._\n\nTerima kasih banyak atas kerja samanya 🙏"
      ],
      [
        "TPL_WE", 
        "Tagihan WE", 
        "Halo {Sapaan} *{Nama_Penyewa}*,\nSemoga sehat selalu.\n\nBerikut rincian tagihan pemakaian Water & Electricity (Air & Listrik) untuk unit *{No_Unit}* periode berjalan:\n\n💡 *Tagihan WE:* {Nominal_WE}\n💳 *No. VA BCA:* {VA_BCA}\n💳 *No. VA Mandiri:* {VA_Mandiri}\n\nMohon konfirmasi jika pembayaran sudah diselesaikan ya {Sapaan}. Terima kasih atas kerja samanya 🙏"
      ]
    ];
    sheetTpl.getRange(1, 1, defaultData.length, 3).setValues(defaultData);
    sheetTpl.getRange(1, 1, 1, 3).setBackground("#1F4E79").setFontColor("#FFFFFF").setFontWeight("bold");
    sheetTpl.setColumnWidth(1, 120);
    sheetTpl.setColumnWidth(2, 140);
    sheetTpl.setColumnWidth(3, 600);
  }

  const values = sheetTpl.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === templateCode) {
      return values[i][2];
    }
  }
  return "";
}

// ===================================================================
// 2. ENTRY POINT: MENDAFTARKAN DRAF KE APPROVAL QUEUE
// ===================================================================
function submitToApprovalQueue(item) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheetQueue = getFlexibleSheet("Approval_Queue");

  if (!sheetQueue) {
    sheetQueue = ss.insertSheet("Approval_Queue");
    const headers = [
      ["Queue_ID", "Tgl_Queue", "No_Unit", "Nama_Penyewa", "WA_Penyewa", "Tipe_Reminder", "Due_Date", "Nominal", "Draft_Pesan", "Status", "Approve_Action"]
    ];
    sheetQueue.getRange(1, 1, 1, headers[0].length).setValues(headers);
    sheetQueue.getRange(1, 1, 1, headers[0].length).setBackground("#1F4E79").setFontColor("#FFFFFF").setFontWeight("bold");
  }

  const queueId = "Q-" + Utilities.formatDate(new Date(), "GMT+7", "mmss");
  const now = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");

  sheetQueue.appendRow([
    queueId,
    now,
    item.noUnit || "-",
    item.nama || "-",
    item.phone,
    item.kategori || "Reminder Sewa",
    item.dueDate || "-",
    item.nominal || "-",
    item.messageText,
    "PENDING",
    ""
  ]);

  const cfg = typeof getSystemConfig === "function" ? getSystemConfig() : {};
  const fonnteToken = cfg.fonnteToken || PropertiesService.getScriptProperties().getProperty("FONNTE_TOKEN");
  const waAdmin = cfg.waNumber || "628135600058";

  const adminPrompt = 
`🔔 *PERMINTAAN PERSETUJUAN OUTBOUND WA*
ID Antrean: *${queueId}*
Kategori: *${item.kategori || "Outbound"}*

📋 *Data Calon Penerima:*
• Unit: *${item.noUnit || "-"}*
• Nama: *${item.nama || "-"}*
• No. WA: *${item.phone}*
• Nominal: *${item.nominal || "-"}*

📄 *Pratinjau Pesan:*
-------------------------------------
${item.messageText}
-------------------------------------

Balas pesan ini:
👉 Ketik *ACC ${queueId}* (Kirim ke penyewa)
👉 Ketik *TOLAK ${queueId}* (Batalkan)`;

  kirimPesanFonnteEngine(waAdmin, adminPrompt, fonnteToken);
  Logger.log(`[ApprovalEngine] Antrean ${queueId} terdaftar dan dikirim ke Admin.`);
  return queueId;
}

// ===================================================================
// 3. HANDLER EKSEKUSI DARI WA ADMIN (ACC / TOLAK)
// ===================================================================
function handleAdminApprovalCommand(senderPhone, textMessage) {
  const cfg = typeof getSystemConfig === "function" ? getSystemConfig() : {};
  const fonnteToken = cfg.fonnteToken || PropertiesService.getScriptProperties().getProperty("FONNTE_TOKEN");
  const waAdmin = cfg.waNumber || "628135600058";

  const cleanSender = String(senderPhone).replace(/\D/g, "");
  const cleanAdmin = String(waAdmin).replace(/\D/g, "");

  if (!cleanSender.endsWith(cleanAdmin.slice(-9))) {
    return false;
  }

  const rawText = (textMessage || "").trim();
  const parts = rawText.split(/\s+/);
  const command = parts[0].toUpperCase();
  const queueId = parts[1];

  if (!["ACC", "TOLAK"].includes(command) || !queueId) {
    return false;
  }

  const sheetQueue = getFlexibleSheet("Approval_Queue");
  if (!sheetQueue) {
    kirimPesanFonnteEngine(waAdmin, "⚠️ Error: Sheet Approval_Queue tidak ditemukan.", fonnteToken);
    return true;
  }

  const values = sheetQueue.getDataRange().getValues();
  if (values.length < 2) return false;

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const rowQueueId = String(row[0]).trim();

    if (rowQueueId === queueId) {
      const targetPhone = String(row[4]).replace(/\D/g, "");
      let messageContent = String(row[6]).includes("Halo") ? row[6] : (row[8] || row[6]);
      
      const valColH = String(row[7]).trim().toUpperCase();
      const valColJ = String(row[9]).trim().toUpperCase();

      if (valColH !== "PENDING" && valColJ !== "PENDING" && (valColH === "APPROVED" || valColJ === "APPROVED")) {
        kirimPesanFonnteEngine(
          waAdmin, 
          `⚠️ Antrean *${queueId}* sudah disetujui sebelumnya.`, 
          fonnteToken
        );
        return true;
      }

      const execTime = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");

      if (command === "ACC") {
        kirimPesanFonnteEngine(targetPhone, messageContent, fonnteToken);
        sheetQueue.getRange(i + 1, 8).setValue("APPROVED");
        sheetQueue.getRange(i + 1, 10).setValue("APPROVED");
        sheetQueue.getRange(i + 1, 11).setValue("ACC by Admin at " + execTime);

        kirimPesanFonnteEngine(
          waAdmin, 
          `✅ *BERHASIL TERKIRIM*\nID Antrean *${queueId}* telah berhasil dikirim ke nomor penyewa (*${targetPhone}*).`, 
          fonnteToken
        );
      } else if (command === "TOLAK") {
        sheetQueue.getRange(i + 1, 8).setValue("REJECTED");
        sheetQueue.getRange(i + 1, 10).setValue("REJECTED");
        sheetQueue.getRange(i + 1, 11).setValue("REJECTED by Admin at " + execTime);

        kirimPesanFonnteEngine(
          waAdmin, 
          `❌ *DIBATALKAN*\nAntrean *${queueId}* resmi ditolak dan pesan tidak dikirim.`, 
          fonnteToken
        );
      }
      return true;
    }
  }

  kirimPesanFonnteEngine(waAdmin, `⚠️ ID antrean *${queueId}* tidak ditemukan di sheet.`, fonnteToken);
  return true;
}

// ===================================================================
// 4. TEST FUNCTION DIAGNOSTIK & EKSEKUSI LANGSUNG Q-5548
// ===================================================================
function manualTriggerApproveTest() {
  Logger.log("=== MEMULAI APPROVAL MANUAL Q-5548 ===");
  const sheetQueue = getFlexibleSheet("Approval_Queue");
  
  if (!sheetQueue) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    Logger.log("❌ Sheet Approval_Queue tidak ditemukan! Daftar sheet: " + ss.getSheets().map(s => s.getName()).join(", "));
    return;
  }

  Logger.log("✅ Ditemukan sheet antrean: '" + sheetQueue.getName() + "'");

  const values = sheetQueue.getDataRange().getValues();
  const targetId = "Q-5548";
  let found = false;

  const cfg = typeof getSystemConfig === "function" ? getSystemConfig() : {};
  const fonnteToken = cfg.fonnteToken || PropertiesService.getScriptProperties().getProperty("FONNTE_TOKEN");
  const waAdmin = cfg.waNumber || "628135600058";

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const rowId = String(row[0]).trim();

    if (rowId === targetId) {
      found = true;
      Logger.log("Baris ditemukan: Baris ke-" + (i + 1));

      const targetPhone = String(row[4]).replace(/\D/g, "");
      const drafPesan = String(row[6]);

      Logger.log("Nomor Tujuan Penyewa: " + targetPhone);
      Logger.log("Token Fonnte: " + (fonnteToken ? "OK (Terbaca)" : "KOSONG!"));

      kirimPesanFonnteEngine(targetPhone, drafPesan, fonnteToken);

      const waktu = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");
      sheetQueue.getRange(i + 1, 8).setValue("APPROVED");
      sheetQueue.getRange(i + 1, 10).setValue("APPROVED");
      sheetQueue.getRange(i + 1, 11).setValue("ACC Manual at " + waktu);

      kirimPesanFonnteEngine(waAdmin, `✅ *BERHASIL TERKIRIM*\nID Antrean *${targetId}* telah disetujui dan dikirim ke *${targetPhone}*.`, fonnteToken);

      Logger.log("✅ SUKSES! Status di sheet berhasil diubah menjadi APPROVED.");
      break;
    }
  }

  if (!found) {
    Logger.log("❌ ID " + targetId + " tidak ditemukan di kolom A.");
  }
}

// ===================================================================
// 5. HELPER PENGIRIMAN FONNTE TERPUSAT
// ===================================================================
function kirimPesanFonnteEngine(targetPhone, messageText, token) {
  if (!token) {
    Logger.log("[ApprovalEngine] Fonnte token kosong!");
    return false;
  }

  const endpoint = "https://api.fonnte.com/send";
  const payload = {
    target: targetPhone,
    message: messageText,
    countryCode: "62"
  };

  const options = {
    method: "post",
    headers: {
      "Authorization": token.trim()
    },
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const res = UrlFetchApp.fetch(endpoint, options);
    const resText = res.getContentText();
    Logger.log(`[ApprovalEngine] Kirim Fonnte ke ${targetPhone}: ${resText}`);
    return resText.includes('"status":true') || resText.includes('"status":"true"');
  } catch (err) {
    Logger.log(`[ApprovalEngine] Gagal kirim ke ${targetPhone}: ${err.toString()}`);
    return false;
  }
}