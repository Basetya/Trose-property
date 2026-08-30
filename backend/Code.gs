/**
 * Kusuma Properti Manager - Master Backend Router, AI, Fonnte Gateway & Security Engine
 * File: backend/Code.gs
 * Version: v46.0.0 (Dynamic Passcode Management + Official WA Sync + Human Handover + Gemini 3.6 Flash)
 */

// ==============================================================================
// 1. HTTP GET ROUTER (Public Endpoints, Landing Page & Dashboard Sync)
// ==============================================================================
function doGet(e) {
  const params = (e && e.parameter) ? e.parameter : {};

  // A. Chatbot AI Landing Page
  if (params.action === "aiChatbot") {
    const userMsg = params.message || "";
    const sender = params.senderPhone || "Web_Visitor";
    const res = handleGeminiAiChat(userMsg, sender);
    return createJsonResponse(res);
  }

  // B. Ambil Data Unit Aktif (02_UNITS)
  if (params.action === "getUnits") {
    try {
      const units = getSheetDataAsJson("02_UNITS");
      return createJsonResponse({ success: true, units: units });
    } catch (err) {
      return createJsonResponse({ success: false, error: err.toString() });
    }
  }

  // C. Ambil Pengaturan Publik (Nomor WA Admin Resmi)
  if (params.action === "getPublicSettings") {
    try {
      const scriptProps = PropertiesService.getScriptProperties();
      const waNumber = scriptProps.getProperty("OFFICIAL_WA_NUMBER") || "628135600058";
      return createJsonResponse({
        success: true,
        settings: { waNumber: waNumber }
      });
    } catch (err) {
      return createJsonResponse({ success: false, error: err.toString() });
    }
  }

  // D. Ambil Data Statistik Dashboard Cockpit
  if (params.action === "getDashboardData") {
    try {
      const units = getSheetDataAsJson("02_UNITS");
      const leases = getSheetDataAsJson("03_LEASES");
      const invoices = getSheetDataAsJson("04_INVOICES");

      const totalUnits = units.length;
      const occupiedUnits = units.filter(u => String(u.Status).trim().toLowerCase() === "occupied").length;
      const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) + "%" : "0%";

      let totalRevenueDue = 0;
      let totalOutstanding = 0;

      invoices.forEach(inv => {
        const amt = Number(inv.Total_Amount || 0);
        totalRevenueDue += amt;
        if (String(inv.Status).trim().toLowerCase() !== "paid") {
          totalOutstanding += amt;
        }
      });

      return createJsonResponse({
        success: true,
        stats: {
          totalUnits: totalUnits,
          occupiedUnits: occupiedUnits,
          occupancyRate: occupancyRate,
          totalRevenueDue: totalRevenueDue,
          totalOutstanding: totalOutstanding,
          activeLeads: leases.filter(l => String(l.Status).trim().toLowerCase() === "active").length,
          openMaintenance: 0
        },
        recentInvoices: invoices.slice(-5).reverse()
      });
    } catch (err) {
      return createJsonResponse({ success: false, error: err.toString() });
    }
  }

  return createJsonResponse({
    status: "online",
    gateway: "Fonnte WhatsApp AI (Kusuma Properti)",
    version: "v46.0.0",
    timestamp: new Date().toISOString()
  });
}

// ==============================================================================
// 2. HTTP POST ROUTER (Inbound Webhook & Authenticated Admin Mutations)
// ==============================================================================
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput("NO_DATA").setMimeType(ContentService.MimeType.TEXT);
    }

    const payload = JSON.parse(e.postData.contents);
    Logger.log(`[doPost Inbound Raw]: ${JSON.stringify(payload)}`);

    // --- JALUR A: INBOUND FONNTE WHATSAPP GATEWAY ---
    if (payload.sender || payload.message) {
      const sender = payload.sender;
      const userMessage = (payload.message || "").trim();
      const fromMe = payload.fromMe === true || payload.fromMe === "true";

      // 1. Auto-Mute 30 Menit jika Admin membalas manual dari WhatsApp ponsel
      if (fromMe && sender) {
        setMuteTimer(sender, 30);
        Logger.log(`[Human Takeover]: Admin membalas manual ke ${sender}. Bot AI di-pause 30 menit.`);
        return createJsonResponse({ status: "human_active" });
      }

      // 2. Perintah Kontrol Manual Admin via Chat (#stop / #bot)
      if (userMessage.toLowerCase() === "#stop" || userMessage.toLowerCase() === "#manual") {
        setMuteTimer(sender, 120);
        sendFonnteMessage(sender, "Mode manual aktif. Bot AI dijeda untuk nomor ini.");
        return createJsonResponse({ status: "bot_muted" });
      }

      if (userMessage.toLowerCase() === "#bot" || userMessage.toLowerCase() === "#start") {
        clearMuteTimer(sender);
        sendFonnteMessage(sender, "Bot AI kembali aktif melayani nomor ini.");
        return createJsonResponse({ status: "bot_resumed" });
      }

      // 3. Lewati jika mode manual aktif
      if (isMuted(sender)) {
        Logger.log(`[Handover Active]: Pesan dari ${sender} diabaikan bot.`);
        return createJsonResponse({ status: "ignored_muted" });
      }

      // 4. Proses respon AI Gemini untuk calon penyewa
      if (sender && userMessage && !fromMe) {
        const aiResponse = handleGeminiAiChat(userMessage, sender);
        const replyText = (aiResponse && aiResponse.success) 
          ? aiResponse.reply 
          : "Halo! Terima kasih telah menghubungi Kusuma Properti Kalibata City. Silakan tanyakan seputar unit sewa yang Anda butuhkan.";

        sendFonnteMessage(sender, replyText);
        return createJsonResponse({ status: "success", reply: replyText });
      }

      return createJsonResponse({ status: "ignored" });
    }

    // --- JALUR B: MUTASI PANEL ADMIN TEROTENTIKASI ---
    const action = payload.action;
    const providedPasscode = String(payload.passcode || "").trim();
    const scriptProps = PropertiesService.getScriptProperties();
    
    // Default Passcode: Trose288
    const currentPasscode = String(scriptProps.getProperty("ADMIN_PASSCODE") || "Trose288").trim();

    // Verifikasi Passcode Admin
    if (providedPasscode !== currentPasscode) {
      return createJsonResponse({ success: false, error: "Passcode Admin salah atau tidak sah." });
    }

    // 1. Mutasi: Simpan Nomor WhatsApp Admin Resmi
    if (action === "savePublicSettings") {
      const cleanNumber = String(payload.waNumber || "628135600058").replace(/\D/g, "");
      scriptProps.setProperty("OFFICIAL_WA_NUMBER", cleanNumber);
      return createJsonResponse({
        success: true,
        message: "Nomor WhatsApp Admin resmi berhasil diperbarui ke: " + cleanNumber
      });
    }

    // 2. Mutasi: Ubah Passcode Admin (Dinamis)
    if (action === "updateAdminPasscode") {
      const newPasscode = String(payload.newPasscode || "").trim();
      if (!newPasscode || newPasscode.length < 4) {
        return createJsonResponse({ success: false, error: "Passcode baru minimal harus 4 karakter." });
      }
      scriptProps.setProperty("ADMIN_PASSCODE", newPasscode);
      return createJsonResponse({
        success: true,
        message: "Passcode Admin berhasil diperbarui! Silakan gunakan passcode baru untuk sesi berikutnya."
      });
    }

    // 3. Mutasi: Simpan Konfigurasi Prompt AI
    if (action === "saveAiConfig") {
      scriptProps.setProperty("AI_KNOWLEDGE_BASE", payload.knowledgeBase || "");
      scriptProps.setProperty("AI_GUARDRAILS", payload.guardrails || "");
      return createJsonResponse({
        success: true,
        message: "Basis pengetahuan AI berhasil diperbarui!"
      });
    }

    // 4. Mutasi: Bersihkan Data Mockup
    if (action === "wipeAllMockupData") {
      return handleDatabaseWipe();
    }

    return createJsonResponse({ success: false, error: "Action POST tidak dikenal." });

  } catch (err) {
    Logger.log(`[doPost Exception]: ${err.toString()}`);
    return ContentService.createTextOutput("ERROR: " + err.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}

// ==============================================================================
// 3. HUMAN TAKEOVER HELPERS (Cache Memory Layer)
// ==============================================================================
function setMuteTimer(phone, minutes) {
  const cache = CacheService.getScriptCache();
  const cleanPhone = String(phone).replace(/\D/g, "");
  cache.put("MUTE_" + cleanPhone, "true", minutes * 60);
}

function clearMuteTimer(phone) {
  const cache = CacheService.getScriptCache();
  const cleanPhone = String(phone).replace(/\D/g, "");
  cache.remove("MUTE_" + cleanPhone);
}

function isMuted(phone) {
  const cache = CacheService.getScriptCache();
  const cleanPhone = String(phone).replace(/\D/g, "");
  return cache.get("MUTE_" + cleanPhone) !== null;
}

// ==============================================================================
// 4. GEMINI AI ENGINE
// ==============================================================================
function handleGeminiAiChat(userMessage, senderPhone) {
  try {
    const scriptProps = PropertiesService.getScriptProperties();
    const apiKey = scriptProps.getProperty("GEMINI_API_KEY");

    if (!apiKey) {
      return { success: false, error: "GEMINI_API_KEY belum disetel di Script Properties." };
    }

    const units = getSheetDataAsJson("02_UNITS");
    const customKB = scriptProps.getProperty("AI_KNOWLEDGE_BASE") || "Fokus pada penyewaan unit apartemen Kalibata City.";
    const customGuardrails = scriptProps.getProperty("AI_GUARDRAILS") || "Jawab ramah, informatif, dan tawarkan survei unit secara santun.";

    const systemPrompt = `Anda adalah asisten konsultan resmi Kusuma Properti untuk Apartemen Kalibata City.
Data Unit Tersedia Saat Ini:
${JSON.stringify(units)}

Petunjuk Tambahan:
${customKB}

Batasan & Gaya Bahasa:
${customGuardrails}

Jawab pertanyaan calon penyewa secara ringkas, jelas, ramah, dan tawarkan jadwal survei.`;

    const activeModels = ["gemini-3.6-flash", "gemini-3.1-pro-preview"];
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\nPertanyaan Calon Penyewa (${senderPhone}): ${userMessage}` }]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500
      }
    };

    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    for (let i = 0; i < activeModels.length; i++) {
      const modelName = activeModels[i];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const res = UrlFetchApp.fetch(url, options);

      if (res.getResponseCode() === 200) {
        const data = JSON.parse(res.getContentText());
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          return { success: true, reply: data.candidates[0].content.parts[0].text };
        }
      }
    }

    return { success: false, error: "AI sedang mengalami antrean trafik." };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

// ==============================================================================
// 5. FONNTE OUTBOUND SENDER
// ==============================================================================
function sendFonnteMessage(toPhone, messageText) {
  try {
    const scriptProps = PropertiesService.getScriptProperties();
    const token = scriptProps.getProperty("FONNTE_TOKEN");

    if (!token) {
      Logger.log("FONNTE_TOKEN belum disetel di Script Properties.");
      return { success: false, error: "Fonnte Token belum diatur." };
    }

    const cleanPhone = String(toPhone).replace(/\D/g, "");
    const url = "https://api.fonnte.com/send";

    const payload = {
      target: cleanPhone,
      message: messageText,
      countryCode: "62"
    };

    const options = {
      method: "post",
      headers: {
        Authorization: token
      },
      payload: payload,
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());

    Logger.log(`[Fonnte Outbound Response]: ${JSON.stringify(result)}`);
    return { success: true, result: result };
  } catch (err) {
    Logger.log(`[Fonnte Outbound Error]: ${err.toString()}`);
    return { success: false, error: err.toString() };
  }
}

// ==============================================================================
// 6. DATABASE SPREADSHEET HELPERS
// ==============================================================================
function getSheetDataAsJson(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const headers = data[0].map(h => String(h).trim());
  const rows = data.slice(1);

  return rows.map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleDatabaseWipe() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ["02_UNITS", "03_LEASES", "04_INVOICES"].forEach(name => {
      const sheet = ss.getSheetByName(name);
      if (sheet && sheet.getLastRow() > 1) {
        sheet.deleteRows(2, sheet.getLastRow() - 1);
      }
    });
    return createJsonResponse({ success: true, message: "Database mockup berhasil dibersihkan." });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}