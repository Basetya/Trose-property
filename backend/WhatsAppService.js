function myFunction() {
  /**
 * Kusuma Properti Manager - WhatsApp Cloud API Service (Meta Official)
 * File: backend/WhatsAppService.gs
 */

/**
 * Mengirim pesan balasan WhatsApp ke pengguna via Meta Graph API
 * @param {string} recipientPhone Nomor tujuan format internasional tanpa '+' (contoh: 628123456789)
 * @param {string} messageText Teks balasan cerdas dari AI
 */
function sendWhatsAppTextMessage(recipientPhone, messageText) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const waToken = scriptProperties.getProperty("WHATSAPP_ACCESS_TOKEN");
  const phoneId = scriptProperties.getProperty("WHATSAPP_PHONE_NUMBER_ID");

  if (!waToken || !phoneId) {
    Logger.log("[WhatsApp Service Error]: WHATSAPP_ACCESS_TOKEN atau WHATSAPP_PHONE_NUMBER_ID belum disetel di Script Properties.");
    return false;
  }

  const endpoint = `https://graph.facebook.com/v19.0/${phoneId}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipientPhone,
    type: "text",
    text: {
      preview_url: false,
      body: messageText
    }
  };

  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${waToken}`
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(endpoint, options);
    const code = response.getResponseCode();
    const body = response.getContentText();
    Logger.log(`[WhatsApp Sent Status]: ${code} - ${body}`);
    return code === 200 || code === 201;
  } catch (err) {
    Logger.log(`[WhatsApp Exception]: ${err.toString()}`);
    return false;
  }
}
}
