/**
 * Kusuma Properti Manager - Kusuma AI Concierge Engine (Pure LLM)
 * Architecture: Clean Native System Instruction + Gemini Flash 2.5/3.6 LLM
 * File: backend/GeminiCRM.gs
 */

function handleGeminiAiChat(userMessage, senderIdentifier) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const apiKey = scriptProperties.getProperty("GEMINI_API_KEY");

  if (!apiKey || apiKey.trim() === "") {
    return {
      success: false,
      reply: "[Konfigurasi Diperlukan]: GEMINI_API_KEY belum disetel di Project Settings > Script Properties pada Google Apps Script."
    };
  }

  // 1. Ambil Data Unit Aktual dari Tab 02_UNITS Google Sheets
  let liveUnitInventory = "";
  try {
    const units = getSheetDataAsJson("02_UNITS");
    const availableUnits = units.filter(u => u.Status === "Available");
    if (availableUnits.length > 0) {
      liveUnitInventory = "\nDAFTAR UNIT TERSEDIA SAAT INI DI DATABASE KUSUMA PROPERTI:\n";
      availableUnits.forEach(u => {
        liveUnitInventory += `- ${u.Tower} No.${u.Unit_No} (${u.Type || 'Studio'}): Sewa Rp${Number(u.Base_Rent || 0).toLocaleString("id-ID")}/bln, IPL Rp${Number(u.IPL_Fee || 350000).toLocaleString("id-ID")}/bln.\n`;
      });
    } else {
      liveUnitInventory = "\nSTATUS UNIT: Semua unit kelolaan saat ini terisi penuh (Full Occupied).\n";
    }
  } catch (e) {
    liveUnitInventory = "\nKatalog unit aktif di Apartemen Kalibata City.\n";
  }

  // 2. System Instruction Terstruktur
  const systemPrompt = `Anda adalah "Kusuma AI", asisten virtual dan leasing concierge resmi Kusuma Properti di Apartemen Kalibata City, Jakarta Selatan.

KNOWLEDGE BASE LENGKAP:
- Alamat: Jl. Raya Kalibata No.1, Rawajati, Pancoran, Jakarta Selatan.
- Total 18 Tower: Akasia, Borneo, Cendana, Damar, Ebony, Flamboyan, Gaharu, Hebras, Kemuning, Jasmine, Lotus, Mawar, Nusa Indah, Palem, Raffles, Sakura, Tulip, Viola.
- Tower Green Palace: Memiliki kolam renang tematik dan gym indoor khusus penghuni tower Green Palace.
- Tarif Sewa Rata-rata:
  * Studio (21 m²): Mulai Rp 3.000.000 - Rp 3.500.000/bulan.
  * 2 Bedroom Standard (33 m²): Mulai Rp 4.200.000 - Rp 4.500.000/bulan.
  * 2 Bedroom Green Palace (33-35 m²): Mulai Rp 5.000.000 - Rp 5.500.000/bulan.
- Rincian Biaya IPL (Iuran Pengelolaan Lingkungan / Maintenance Fee):
  * Unit Studio (21 m²): Sekitar Rp 300.000 - Rp 350.000 per bulan.
  * Unit 2 Bedroom (33 m²): Sekitar Rp 450.000 - Rp 500.000 per bulan.
  * Listrik & Air: Menggunakan token/meteran terpisah sesuai pemakaian riil penyewa.
- Fasilitas Sekitar:
  * Mall Kalibata City Square (KCS) di bawah tower (Bioskop XXI, Farmers Market, ATM Center, Restoran 24 jam).
  * Stasiun KRL Duren Kalibata: 5 menit jalan kaki santai (200 meter).
  * Laundry: Tersedia banyak laundry kiloan dan satuan di lantai dasar / area ruko tower.
  * Rumah Sakit Terdekat: RS Brawijaya Duren Tiga (2.5 km), RSUD Budhi Asih (3 km), RS Tebet (3.5 km), serta klinik & apotek 24 jam di dalam Mall KCS.
  * Pendidikan: Universitas Trilogi berada tepat di samping kawasan apartemen (100 meter).
- Kebijakan Sewa: Hanya melayani sewa bulanan dan tahunan (TIDAK menyediakan sewa harian).

${liveUnitInventory}

PANDUAN JAWABAN:
1. Jawab langsung ke inti pertanyaan pengguna dengan nada ramah, sopan, dan informatif dalam 1–2 paragraf ringkas.
2. Jangan mengulang perkenalan diri panjang jika pertanyaan sudah spesifik.
3. Di akhir jawaban, tawarkan bantuan untuk mengatur jadwal survei unit (viewing) atau mengarahkan ke tombol WhatsApp Admin.`;

  // 3. Payload Native System Instruction
  const payload = {
    system_instruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: [
      {
        role: "user",
        parts: [{ text: String(userMessage) }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 600
    }
  };

  const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey.trim();
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    let response = UrlFetchApp.fetch(endpoint, options);
    let responseCode = response.getResponseCode();
    let responseBody = response.getContentText();
    let json = JSON.parse(responseBody);

    if (responseCode === 404) {
      const fallbackEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" + apiKey.trim();
      response = UrlFetchApp.fetch(fallbackEndpoint, options);
      responseCode = response.getResponseCode();
      responseBody = response.getContentText();
      json = JSON.parse(responseBody);
    }

    if (responseCode === 200 && json.candidates && json.candidates.length > 0 &&
        json.candidates[0].content && json.candidates[0].content.parts &&
        json.candidates[0].content.parts[0] && json.candidates[0].content.parts[0].text) {
      return {
        success: true,
        reply: json.candidates[0].content.parts[0].text.trim()
      };
    } else {
      const errorMsg = (json.error && json.error.message) ? json.error.message : responseBody;
      Logger.log("Gemini API Error: " + errorMsg);
      return {
        success: false,
        reply: "[Google AI Error " + responseCode + "]: " + errorMsg
      };
    }
  } catch (err) {
    Logger.log("Exception: " + err.toString());
    return {
      success: false,
      reply: "[Apps Script Fetch Error]: " + err.toString()
    };
  }
}

function testGeminiChatbot() {
  const res = handleGeminiAiChat("berapa menit ke stasiun KRL?", "Test_User");
  Logger.log(JSON.stringify(res, null, 2));
}