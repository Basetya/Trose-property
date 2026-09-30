/**
 * Kusuma Properti Manager - Master Backend & Anti-Loop Engine
 * File: backend/Code.gs
 * Version: v163.0.0 (Integrated HITL Approval & WhatsApp Gateway)
 */

function getSystemConfig() {
  var props = PropertiesService.getScriptProperties();
  return {
    groqApiKey: props.getProperty("GROQ_API_KEY") || "",
    geminiApiKey: props.getProperty("GEMINI_API_KEY") || "",
    openRouterApiKey: props.getProperty("OPENROUTER_API_KEY") || "",
    fonnteToken: props.getProperty("FONNTE_TOKEN") || props.getProperty("WA_GATEWAY_TOKEN") || "",
    founderPass: props.getProperty("FOUNDER_PASSCODE") || "SalmonDha28$$",
    adminPass: props.getProperty("ADMIN_PASSCODE") || "Tearose288",
    waNumber: props.getProperty("WA_NUMBER") || "628135600058",
    fallbackReply: props.getProperty("FALLBACK_REPLY_TEMPLATE") || "Halo Kak! Terima kasih sudah menghubungi Kusuma Properti Kalibata City. Pilihan unit sewa kami mulai dari Studio hingga 2BR siap huni. Staf kami di Tower Flamboyan Lt. GF segera menghubungi Kakak untuk info jadwal survei. 🙏",
    spreadsheetId: SpreadsheetApp.getActiveSpreadsheet().getId()
  };
}

function doGet(e) {
  try {
    var p = (e && e.parameter) ? e.parameter : {};
    var action = p.action || "";
    var userPrompt = p.message || p.prompt || p.query || p.text || "";
    var callback = p.callback || "";

    if (action === "aiChatbot" || action === "chatAI" || action === "askAI" || (userPrompt !== "" && action === "")) {
      var queryText = userPrompt || "Halo, apa saja pilihan unit dan tarif di Kalibata City?";
      var aiResult = typeof handleGeminiAiChat === "function" ? handleGeminiAiChat(queryText, "WEB_GUEST") : { success: true, reply: getSystemConfig().fallbackReply };
      return createFlexibleOutput({
        success: true,
        reply: aiResult.reply
      }, callback);
    }

    return createFlexibleOutput({
      status: "online",
      service: "Kusuma Properti Webhook API",
      timestamp: new Date().toISOString()
    }, callback);
  } catch (err) {
    return createFlexibleOutput({
      success: false,
      error: err.toString()
    }, (e && e.parameter) ? e.parameter.callback : "");
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput("No post data received").setMimeType(ContentService.MimeType.TEXT);
    }

    var payload = JSON.parse(e.postData.contents);

    // ===================================================================
    // 0. GERBANG KHUSUS: INBOUND OWNER LEAD GENERATION FUNNEL (ISOLATED)
    // ===================================================================
    if (payload.action === "submitOwnerLead" && typeof handleOwnerLeadSubmission === "function") {
      var leadResult = handleOwnerLeadSubmission(payload);
      return ContentService.createTextOutput(JSON.stringify(leadResult)).setMimeType(ContentService.MimeType.JSON);
    }

    var sender = String(payload.sender || "").replace(/\D/g, "");
    var incomingText = (payload.message || "").trim();

    // ===================================================================
    // 1. GERBANG UTAMA: INTERCEPT APPROVAL ADMIN (ACC / TOLAK)
    // ===================================================================
    if (typeof handleAdminApprovalCommand === "function") {
      var isApprovalHandled = handleAdminApprovalCommand(sender, incomingText);
      if (isApprovalHandled) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "success",
          handled_by: "approval_engine"
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // ===================================================================
    // 2. LOGIKA CHATBOT INBOUND / RESPON OTOMATIS TAMU
    // ===================================================================
    var cfg = getSystemConfig();
    var replyText = "";

    if (typeof handleGeminiAiChat === "function") {
      var botResponse = handleGeminiAiChat(incomingText, sender);
      replyText = botResponse.reply || cfg.fallbackReply;
    } else {
      replyText = cfg.fallbackReply;
    }

    // Balas kembali ke pengirim jika ada respon
    if (replyText && typeof sendWhatsAppViaFonnte === "function") {
      sendWhatsAppViaFonnte(sender, replyText, cfg.fonnteToken);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Message processed successfully"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log("Error doPost: " + err.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Helper pembungkus JSON / JSONP
 */
function createFlexibleOutput(data, callback) {
  var jsonString = JSON.stringify(data);
  if (callback && callback.trim() !== "") {
    return ContentService.createTextOutput(callback + "(" + jsonString + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(jsonString)
    .setMimeType(ContentService.MimeType.JSON);
}