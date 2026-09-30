// ===================================================================
// CRM KALIBATA CITY - FONNTE WEBHOOK & ORCHESTRATION PIPELINE
// Kusuma Properti Management
// ===================================================================

var sysCfg = typeof getSystemConfig === "function" ? getSystemConfig() : {};

var HITL_CONFIG = HITL_CONFIG || {
  FONNTE_TOKEN: sysCfg.fonnteToken || "KMF4w9jSpsG3igSwbkxS",
  ADMIN_PHONE: sysCfg.waNumber || "628135600058",
  SHEET_PENYEWA: "Master Penyewa Aktif & Tagihan"
};

// 1. ENTRY POINT: WEBHOOK PENERIMA PESAN DARI FONNTE
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput("NO_DATA");
    }

    const postData = JSON.parse(e.postData.contents);
    const sender = String(postData.sender || "").replace(/\D/g, "");
    const message = String(postData.message || "").trim();

    const adminPhone = String(HITL_CONFIG.ADMIN_PHONE).replace(/\D/g, "");

    // JALUR 1: PERINTAH KHUSUS ADMIN (Approval, Rollover, Reject)
    if (adminPhone && (sender === adminPhone || sender.endsWith(adminPhone))) {
      handleAdminCommands(message);
      return ContentService.createTextOutput("ADMIN_COMMAND_PROCESSED");
    }

    // JALUR 2: PERINTAH MENU KAKU / KEYWORD STATIS
    const upperMsg = message.toUpperCase();
    if (upperMsg === "MENU" || upperMsg === "HELP") {
      sendFonnteMessage(sender, "Halo! Layanan bantuan Kusuma Properti Management. Tim kami akan segera menindaklanjuti pesan Anda.");
      return ContentService.createTextOutput("MENU_PROCESSED");
    }

    // JALUR 3: PERCAKAPAN ALAMI (AI Inbound Parser - Groq Qwen)
    if (typeof processInboundWhatsAppMessage === 'function') {
      processInboundWhatsAppMessage(sender, message);
    } else {
      Logger.log("Peringatan: processInboundWhatsAppMessage belum terpasang di GeminiInboundParser.gs");
    }

    return ContentService.createTextOutput("AI_INBOUND_SUCCESS");
  } catch (err) {
    Logger.log("Galat Webhook Fonnte: " + err.message);
    return ContentService.createTextOutput("ERROR: " + err.message);
  }
}

// 2. LOGIKA PENANGANAN PERINTAH ADMIN (HITL APPROVAL & ROLLOVER)
function handleAdminCommands(commandText) {
  const cleanCmd = commandText.trim();
  const parts = cleanCmd.split(/\s+/);
  const action = parts[0].toUpperCase();
  const targetUnit = parts[1] ? parts[1].toUpperCase() : "";

  Logger.log("Eksekusi perintah Admin: " + cleanCmd);

  switch (action) {
    case "APPROVE":
    case "YES":
      if (targetUnit && typeof executeRolloverApproval === 'function') {
        executeRolloverApproval(targetUnit);
      } else {
        sendFonnteMessage(HITL_CONFIG.ADMIN_PHONE, "Format APPROVE salah atau modul Rollover belum aktif. Contoh: APPROVE C16CL");
      }
      break;

    case "REJECT":
    case "NO":
      sendFonnteMessage(HITL_CONFIG.ADMIN_PHONE, "Tindakan untuk unit " + targetUnit + " telah dibatalkan.");
      break;

    default:
      // Perintah admin tidak terdaftar
      Logger.log("Perintah admin tidak dikenali: " + cleanCmd);
      break;
  }
}

// 3. SERVICE PENGIRIM PESAN FONNTE
function sendFonnteMessage(targetPhone, messageContent) {
  if (!targetPhone || !messageContent) return;

  const url = "https://api.fonnte.com/send";
  const payload = {
    target: String(targetPhone).replace(/\D/g, ""),
    message: messageContent
  };

  const options = {
    method: "post",
    headers: {
      "Authorization": HITL_CONFIG.FONNTE_TOKEN.trim()
    },
    payload: payload,
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    Logger.log("Kirim WA [" + targetPhone + "]: " + response.getContentText());
  } catch (err) {
    Logger.log("Gagal kirim Fonnte ke " + targetPhone + ": " + err.message);
  }
}

// 4. TEST RUNNER WEBHOOK (SIMULASI PESAN MASUK)
function testDoPostSimulation() {
  const dummyPayload = {
    postData: {
      contents: JSON.stringify({
        sender: "6289988776655",
        message: "Mbak, saya anak Pak Hasan yang sewa unit C16CL. Mau minta nomor rekening untuk pembayaran sewa."
      })
    }
  };

  Logger.log("Menjalankan simulasi doPost...");
  const res = doPost(dummyPayload);
  Logger.log("Status respons webhook: " + res.getContent());
}