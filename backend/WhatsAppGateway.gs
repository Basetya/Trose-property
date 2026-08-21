/**
 * Trose Property Manager - Collision-Proof WhatsApp Gateway
 * File: backend/WhatsAppGateway.gs
 */

function handleIncomingWhatsAppWebhook(payload) {
  const senderPhone = payload.sender || payload.from || payload.phone;
  const messageText = payload.message || payload.text || payload.body;

  if (!senderPhone || !messageText) {
    return { success: false, error: "Invalid webhook payload: Missing sender or message" };
  }

  const cleanPhone = String(senderPhone).replace(/[^0-9]/g, '');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const contactSheet = ss.getSheetByName("03_CONTACTS_360");
  const contacts = contactSheet.getDataRange().getValues();
  
  let contactId = "";
  let contactName = "WA Lead (" + cleanPhone.slice(-4) + ")";

  for (let i = 1; i < contacts.length; i++) {
    const existingPhone = String(contacts[i][2]).replace(/[^0-9]/g, '');
    if (existingPhone === cleanPhone) {
      contactId = contacts[i][0];
      contactName = contacts[i][1];
      break;
    }
  }

  if (!contactId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    contactId = "CNT-" + timestamp + "-" + randomSuffix;

    contactSheet.appendRow([
      contactId,
      contactName,
      cleanPhone,
      "",
      "Lead",
      50,
      "Inbound via Trose WA Auto-Registration",
      new Date().toISOString()
    ]);

    const pipelineSheet = ss.getSheetByName("07_CRM_PIPELINE");
    const leadId = "LEAD-" + timestamp + "-" + randomSuffix;
    pipelineSheet.appendRow([
      leadId,
      contactId,
      "UNT-102",
      "Inquiry",
      0,
      "",
      "Chat Masuk: " + String(messageText).slice(0, 150),
      new Date().toISOString()
    ]);
  }

  const aiResult = handleGeminiAiChat(messageText, cleanPhone);
  const replyMessage = aiResult.reply || "Terima kasih telah menghubungi Trose Property Manager. Tim kami akan segera membantu Anda.";

  sendWhatsAppMessage(cleanPhone, replyMessage);

  return {
    success: true,
    contactId: contactId,
    reply: replyMessage
  };
}

function sendWhatsAppMessage(targetPhone, messageText) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const waApiToken = scriptProperties.getProperty("WA_GATEWAY_TOKEN");

  if (!waApiToken) {
    Logger.log("[Trose WA Simulasi]: " + messageText + " ke " + targetPhone);
    return;
  }

  const endpoint = "https://api.fonnte.com/send";
  const payload = {
    target: targetPhone,
    message: messageText
  };

  const options = {
    method: "post",
    headers: { "Authorization": waApiToken },
    payload: JSON.stringify(payload),
    contentType: "application/json",
    muteHttpExceptions: true
  };

  try {
    UrlFetchApp.fetch(endpoint, options);
  } catch (err) {
    Logger.log("Error dispatching WA message: " + err.toString());
  }
}
