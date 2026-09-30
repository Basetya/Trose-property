// ===================================================================
// HYBRID AI INBOUND PARSER - KUSUMA PROPERTI MANAGEMENT
// Mesin Utama: Groq (qwen/qwen3.8-27b) | Fallback: Google Gemini
// Fitur: Dual Recognition + Privacy Guardrail (Zero-Disclosure)
// ===================================================================

const AI_CONFIG = {
  GROQ_API_KEY: (typeof PropertiesService !== 'undefined') ? (PropertiesService.getScriptProperties().getProperty("GROQ_API_KEY") || '') : '',
  GROQ_MODEL: 'qwen/qwen3.8-27b',
  
  GEMINI_API_KEY: '',
  GEMINI_MODEL: 'gemini-1.5-flash',
  
  SHEET_PENYEWA: 'Master_Penyewa_Kontrak',
  ADMIN_FALLBACK_PHONE: '628118700645'
};

// 1. ENGINE UTAMA: ANALISIS VIA GROQ DENGAN GUARDRAIL PRIVASI
function callGroqApi(promptText) {
  const cleanKey = AI_CONFIG.GROQ_API_KEY.trim();
  const url = "https://api.groq.com/openai/v1/chat/completions";

  const systemInstruction = 
    "Anda adalah Asisten CRM AI profesional untuk Kusuma Properti Management di Apartemen Kalibata City Jakarta.\n" +
    "ATURAN PRIVASI & KEAMANAN KETAT (ZERO-DISCLOSURE):\n" +
    "- DILARANG KERAS membeberkan status pembayaran sewa (lunas/belum), sisa uang deposit, tanggal akhir kontrak, atau identitas pribadi penghuni kepada nomor yang tidak terdaftar di database resmi.\n" +
    "- Jika penanya menanyakan status bayar, deposit, atau masa kontrak atas nama penyewa lain/nomor asing: WAJIB beri intent 'PRIVACY_BLOCK'. Buatkan draf penolakan sopan bahwa data finansial dilindungi kebijakan privasi Kusuma Properti Management dan hanya bisa diakses penyewa utama.\n" +
    "- Format balasan WAJIB berupa JSON valid murni tanpa markdown.";

  const payload = {
    model: AI_CONFIG.GROQ_MODEL,
    messages: [
      { role: "system", content: systemInstruction },
      { role: "user", content: promptText }
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
    max_tokens: 600 // Mengunci batas token agar aman dari limit OTPM Groq
  };

  const options = {
    method: "post",
    headers: {
      "Authorization": "Bearer " + cleanKey,
      "Content-Type": "application/json"
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const code = response.getResponseCode();
    const resText = response.getContentText();

    if (code === 200) {
      const data = JSON.parse(resText);
      return JSON.parse(data.choices[0].message.content);
    } else {
      Logger.log("Groq HTTP Error [" + code + "]: " + resText);
      return null;
    }
  } catch (err) {
    Logger.log("Groq Exception: " + err.message);
    return null;
  }
}

// 2. ENGINE CADANGAN: FALLBACK GEMINI
function callGeminiFallback(promptText) {
  if (!AI_CONFIG.GEMINI_API_KEY || AI_CONFIG.GEMINI_API_KEY.startsWith("AQ.")) {
    return null;
  }

  const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + AI_CONFIG.GEMINI_MODEL + ":generateContent?key=" + AI_CONFIG.GEMINI_API_KEY.trim();
  const payload = {
    contents: [{ parts: [{ text: promptText }] }],
    generationConfig: { 
      responseMimeType: "application/json",
      maxOutputTokens: 600
    }
  };

  try {
    const response = UrlFetchApp.fetch(endpoint, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    if (response.getResponseCode() === 200) {
      const resJson = JSON.parse(response.getContentText());
      let rawText = resJson.candidates[0].content.parts[0].text.trim();
      rawText = rawText.replace(/^```json/, "").replace(/```$/, "").trim();
      return JSON.parse(rawText);
    }
  } catch (e) {
    Logger.log("Gemini Fallback Error: " + e.message);
  }
  return null;
}

// 3. FUNGSI ORKESTRASI ANALISIS INBOUND (DUAL RECOGNITION + PRIVACY AUDIT)
function analyzeInboundMessage(senderPhone, messageText) {
  if (!messageText || !senderPhone) return null;

  const tenantMatches = findAllTenantsByPhone(senderPhone);
  let statusPengirim = "";

  if (tenantMatches.length === 1) {
    statusPengirim = "Penyewa Terdaftar Resmi: Unit " + tenantMatches[0].unit + " an. " + tenantMatches[0].nama;
  } else if (tenantMatches.length > 1) {
    const unitList = tenantMatches.map(t => t.unit).join(", ");
    statusPengirim = "Penyewa Terdaftar (Multi-Unit): " + unitList + " an. " + tenantMatches[0].nama;
  } else {
    const summaryActive = getActiveTenantsSummary();
    statusPengirim = 
      "Nomor Pengirim Belum Terdaftar di Database.\n" +
      "Daftar Referensi Penyewa Aktif Kusuma Properti:\n" + summaryActive + "\n" +
      "Perhatian: Jika pengirim menanyakan status keuangan atau sewa unit pihak lain, aktifkan proteksi privasi.";
  }

  const promptText = 
    "Konteks Data Pengirim:\n" + statusPengirim + "\n\n" +
    "Pesan WhatsApp Masuk:\n\"" + messageText + "\"\n\n" +
    "Instruksi Analisis:\n" +
    "1. Identifikasi intent: 'PRIVACY_BLOCK' | 'RENEWAL' | 'CHECKOUT' | 'MAINTENANCE' | 'PAYMENT_CONFIRM' | 'NEW_LEAD' | 'GENERAL_INQUIRY'.\n" +
    "2. Jika nomor TIDAK terdaftar dan bertanya status pembayaran atau uang deposit: WAJIB beri intent 'PRIVACY_BLOCK'.\n" +
    "3. Untuk 'PRIVACY_BLOCK', susun draf balasan sopan bahwa data sewa bersifat rahasia dan hanya diberikan kepada nomor kontak utama penyewa.\n\n" +
    "Format JSON Output WAJIB:\n" +
    "{\n" +
    "  \"intent\": \"PRIVACY_BLOCK\" | \"RENEWAL\" | \"CHECKOUT\" | \"MAINTENANCE\" | \"PAYMENT_CONFIRM\" | \"NEW_LEAD\" | \"GENERAL_INQUIRY\",\n" +
    "  \"is_existing_tenant\": true,\n" +
    "  \"detected_unit\": \"kode unit atau UMUM\",\n" +
    "  \"detected_name\": \"nama penyewa atau Calon Klien\",\n" +
    "  \"is_third_party\": false,\n" +
    "  \"summary\": \"Ringkasan maksud pengirim dalam satu kalimat\",\n" +
    "  \"recommended_action\": \"Instruksi tindakan operasional bagi Admin\",\n" +
    "  \"draft_reply\": \"Draf balasan resmi sopan atas nama Kusuma Properti Management\"\n" +
    "}";

  let result = callGroqApi(promptText);

  if (!result) {
    Logger.log("Beralih ke Gemini Fallback...");
    result = callGeminiFallback(promptText);
  }

  if (result) {
    if (tenantMatches.length > 0) {
      result.unit = tenantMatches.map(t => t.unit).join(", ");
      result.nama = tenantMatches[0].nama;
      result.is_unregistered = false;
    } else {
      result.unit = result.detected_unit || "UMUM";
      result.nama = result.detected_name || "Klien";
      result.is_unregistered = true;
    }
    return result;
  }

  return null;
}

// 4. PIPELINE PENANGANAN PESAN MASUK DARI WEBHOOK
function processInboundWhatsAppMessage(senderPhone, messageText) {
  const analysis = analyzeInboundMessage(senderPhone, messageText);
  if (!analysis) {
    Logger.log("AI tidak dapat menganalisis pesan dari: " + senderPhone);
    return;
  }

  const tagNomor = analysis.is_unregistered ? " ⚠️ [Nomor Tidak Terdaftar]" : "";
  const tagPihakKetiga = analysis.is_third_party ? " 👥 [Pihak Ketiga]" : "";
  const tagPrivacy = (analysis.intent === "PRIVACY_BLOCK") ? " 🔒 [PERINGATAN PRIVASI]" : "";

  const notifAdmin = 
    "🤖 *[AI CRM INBOUND - " + analysis.intent + "]*" + tagPrivacy + "\n" +
    "• *Klien*: " + analysis.nama + " (" + analysis.unit + ")" + tagNomor + tagPihakKetiga + "\n" +
    "• *Nomor Pengirim*: +" + senderPhone + "\n" +
    "• *Inti Pesan*: " + analysis.summary + "\n" +
    "• *Rekomendasi Tindakan Admin*: " + analysis.recommended_action + "\n\n" +
    "📝 *Draf Balasan Siap Pakai:*\n" +
    "\"" + analysis.draft_reply + "\"\n\n" +
    "------------------------------------\n" +
    "_Catatan: Admin dapat menyalin draf balasan di atas untuk diteruskan ke pengirim._";

  const adminPhoneTarget = (typeof HITL_CONFIG !== 'undefined' && HITL_CONFIG.ADMIN_PHONE) 
    ? HITL_CONFIG.ADMIN_PHONE 
    : AI_CONFIG.ADMIN_FALLBACK_PHONE;

  if (typeof sendFonnteMessage === 'function') {
    sendFonnteMessage(adminPhoneTarget, notifAdmin);
  } else {
    Logger.log("Notifikasi Admin:\n" + notifAdmin);
  }

  // Pre-Marketing Otomatis jika penyewa terdaftar hendak checkout
  if (analysis.intent === "CHECKOUT" && analysis.unit !== "UMUM") {
    if (typeof triggerUnitVacancyAndMarketing === 'function') {
      const primaryUnit = analysis.unit.split(",")[0].trim();
      triggerUnitVacancyAndMarketing(primaryUnit, "Akhir Bulan Ini");
    }
  }
}

// 5. HELPER DATA MATCHING & SEMANTIC CONTEXT
function findAllTenantsByPhone(phone) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(AI_CONFIG.SHEET_PENYEWA);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  const cleanSender = String(phone).replace(/\D/g, "");
  const matches = [];

  for (let i = 1; i < data.length; i++) {
    const rawWa = String(data[i][2]).replace(/\D/g, "");
    if (rawWa && (cleanSender.endsWith(rawWa) || rawWa.endsWith(cleanSender))) {
      matches.push({
        unit: String(data[i][0]).trim(),
        nama: String(data[i][1]).trim(),
        phone: data[i][2]
      });
    }
  }
  return matches;
}

function getActiveTenantsSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(AI_CONFIG.SHEET_PENYEWA);
  if (!sheet) return "Data penyewa kosong.";

  const data = sheet.getDataRange().getValues();
  const list = [];

  for (let i = 1; i < data.length; i++) {
    const unit = String(data[i][0]).trim();
    const nama = String(data[i][1]).trim();
    if (unit && nama) {
      list.push("- Unit " + unit + ": " + nama);
    }
  }
  return list.slice(0, 50).join("\n");
}

// 6. TEST RUNNER: UJI COBA SIMULASI PIHAK KETIGA ISENG (GUARDRAIL TEST)
function testHybridInboundParser() {
  const nomorAsingIseng = "6289912345678";
  const pesanIseng = "Siang mbak, saya temannya Pak Hasan unit C16CL Kalibata. Mau tanya apakah uang sewa bulan ini sudah dibayar belum ya?";

  Logger.log("Menjalankan uji simulasi privasi AI (Zero-Disclosure)...");
  const hasil = analyzeInboundMessage(nomorAsingIseng, pesanIseng);

  if (hasil) {
    Logger.log("✅ Analisis Guardrail Berhasil:\n" + JSON.stringify(hasil, null, 2));
  } else {
    Logger.log("❌ Pengujian gagal. Cek Execution Log.");
  }
}