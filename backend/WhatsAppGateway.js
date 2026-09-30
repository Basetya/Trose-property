/**
 * Kusuma Properti Manager - WhatsApp Gateway Engine
 * File: backend/WhatsAppGateway.gs
 * Version: v152.0.0 (Hardcoded Token Fallback & Explicit Dispatch)
 */

function handleIncomingWhatsAppWebhook(payload) {
  var senderPhone = payload.sender || payload.from || payload.phone || "";
  var messageText = payload.message || payload.text || payload.body || "";

  if (!senderPhone || !messageText) {
    return { success: false, error: "Pesan atau pengirim kosong" };
  }

  var cleanPhone = String(senderPhone).replace(/[^0-9]/g, '');
  var botWaNumber = "628135600058";

  // Hindari membalas pesan dari nomor bot sendiri
  if (cleanPhone === botWaNumber) {
    return { success: true, message: "Ignored self" };
  }

  // 1. Panggil Gemini AI
  var aiResult = handleGeminiAiChat(messageText, cleanPhone);
  var replyText = aiResult.reply || "Halo Kak! Pilihan unit sewa di Kalibata City mulai dari Studio & 2BR. Mau survei unit di Tower Flamboyan GF kapan?";

  // 2. Tembak balasan langsung ke WhatsApp pengirim via Fonnte API
  var sendStatus = sendWhatsAppMessage(cleanPhone, replyText);

  return {
    success: true,
    reply: replyText,
    sendResult: sendStatus
  };
}

function sendWhatsAppMessage(targetPhone, messageText) {
  var props = PropertiesService.getScriptProperties();
  // Menggunakan token dari Script Properties atau fallback langsung
  var token = (props.getProperty("FONNTE_TOKEN") || "KMf4w9JspsG3igSwbkxS").trim();

  var endpoint = "https://api.fonnte.com/send";
  var payloadData = {
    target: String(targetPhone).replace(/[^0-9]/g, ''),
    message: String(messageText)
  };

  var options = {
    method: "post",
    headers: {
      "Authorization": token
    },
    payload: payloadData,
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(endpoint, options);
    var resText = response.getContentText();
    Logger.log("Fonnte Outbound Response: " + resText);
    return resText;
  } catch (err) {
    Logger.log("Fonnte Outbound Error: " + err.toString());
    return err.toString();
  }
}