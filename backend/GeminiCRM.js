/**
 * Kusuma Properti Manager - Multi-Provider AI Concierge Engine
 * File: backend/GeminiCRM.gs
 * Version: v158.0.0
 * Alur: 1. Groq (openai/gpt-oss-120b) -> 2. Google Gemini 3.6 Flash -> 3. OpenRouter -> 4. Fallback Dinamis
 */

function handleGeminiAiChat(userMessage, senderIdentifier) {
  const props = PropertiesService.getScriptProperties();

  // Ambil teks fallback dinamis dari Script Properties (dengan default jika kosong)
  const hardcodedDefault = "Halo Kak! Terima kasih sudah menghubungi Kusuma Properti di  Kalibata City. Pilihan unit sewa mulai dari tipe Studio dan tipe 2BR. Jam operasional dari 09.00 sd 19.00 WIB. Kantor kami di Tower Kemuning lantai 11/BK. Jika kakak ingin survei show unit, staf kami segera menghubungi Kakak. 🙏";
  const finalFallbackText = props.getProperty("FALLBACK_REPLY_TEMPLATE") || hardcodedDefault;

  const systemPrompt = `Anda adalah "Kusuma AI", asisten konsultan sewa resmi dari Kusuma Properti di Apartemen Kalibata City, Jakarta Selatan.

TONE & GAYA BICARA:
- Profesional, hangat, ramah, sopan, dan persuasif secara halus.
- Berikan jawaban padat dan ringkas dalam 1-2 paragraf. Jangan bertele-tele.

KEUNGGULAN KALIBATA CITY:
- Akses: 5 menit jalan kaki ke Stasiun KRL Duren Kalibata, akses langsung ke Mall Kalibata City Square (KCS), XXI, Farmers Market.
- Fasilitas: Kawasan kuliner 24 jam, jogging track, kolam renang & fitness center (Green Palace), keamanan 24 jam.

TARIF & UNIT SEWA:
- Tipe Studio (LB 21 m²): Rp 2.500.000 – Rp 3.500.000 / bulan.
- Tipe 2 Bedroom / 2BR (LB 33 m²): Rp 3.500.000 – Rp 4.500.000 / bulan.
- Green Palace 3BR: Rp 5.000.000 – Rp 6.500.000 / bulan.

ATURAN WAJIB:
1. Jawab seputar sewa apartemen Kalibata City berdasarkan data di atas secara akurat.
2. Di akhir jawaban, selalu tawarkan jadwal survei fisik ke unit secara ramah.
3. Bila ditanya di luar topik properti Kalibata City, jawab dengan santun bahwa Anda konsultan khusus Kalibata City.`;

  // ============================================================
  // PRIORITAS 1: GROQ API (Model Resmi Playground: openai/gpt-oss-120b)
  // ============================================================
  const groqKey = props.getProperty("GROQ_API_KEY");
  if (groqKey && groqKey.trim() !== "") {
    const groqCandidateModels = [
      "openai/gpt-oss-120b",
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant"
    ];

    for (let m = 0; m < groqCandidateModels.length; m++) {
      const activeModel = groqCandidateModels[m];
      try {
        const endpoint = "https://api.groq.com/openai/v1/chat/completions";
        const payload = {
          model: activeModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: String(userMessage) }
          ],
          max_tokens: 300,
          temperature: 0.7
        };

        const resGroq = UrlFetchApp.fetch(endpoint, {
          method: "post",
          headers: { "Authorization": "Bearer " + groqKey.trim() },
          contentType: "application/json",
          payload: JSON.stringify(payload),
          muteHttpExceptions: true
        });

        if (resGroq.getResponseCode() === 200) {
          const json = JSON.parse(resGroq.getContentText());
          const reply = json?.choices?.[0]?.message?.content;
          if (reply && reply.trim() !== "") {
            Logger.log(`[Primary Success]: Groq (${activeModel})`);
            return { success: true, provider: `Groq (${activeModel})`, reply: reply.trim() };
          }
        }
        Logger.log(`[Groq ${activeModel} Fail ${resGroq.getResponseCode()}]: ${resGroq.getContentText()}`);
      } catch (errGroq) {
        Logger.log(`[Groq ${activeModel} Exception]: ` + errGroq.toString());
      }
    }
  }

  // ============================================================
  // PRIORITAS 2: GOOGLE AI STUDIO (Gemini 3.6 Flash)
  // ============================================================
  const geminiKey = props.getProperty("GEMINI_API_KEY");
  if (geminiKey && geminiKey.trim() !== "") {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiKey.trim()}`;
      const payload = {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: String(userMessage) }] }],
        generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
      };

      const resGemini = UrlFetchApp.fetch(endpoint, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });

      if (resGemini.getResponseCode() === 200) {
        const json = JSON.parse(resGemini.getContentText());
        const reply = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply && reply.trim() !== "") {
          Logger.log("[Secondary Success]: Google Gemini 3.6 Flash");
          return { success: true, provider: "Google Gemini", reply: reply.trim() };
        }
      }
      Logger.log(`[Gemini Fail ${resGemini.getResponseCode()}]: ${resGemini.getContentText()}`);
    } catch (errGemini) {
      Logger.log("[Gemini Exception]: " + errGemini.toString());
    }
  }

  // ============================================================
  // PRIORITAS 3: OPENROUTER API
  // ============================================================
  const openRouterKey = props.getProperty("OPENROUTER_API_KEY");
  if (openRouterKey && openRouterKey.trim() !== "") {
    try {
      const endpoint = "https://openrouter.ai/api/v1/chat/completions";
      const payload = {
        model: "deepseek/deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: String(userMessage) }
        ],
        max_tokens: 300,
        temperature: 0.7
      };

      const resOR = UrlFetchApp.fetch(endpoint, {
        method: "post",
        headers: {
          "Authorization": "Bearer " + openRouterKey.trim(),
          "HTTP-Referer": "https://kusumaproperti.my.id",
          "X-Title": "Kusuma Properti AI"
        },
        contentType: "application/json",
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });

      if (resOR.getResponseCode() === 200) {
        const jsonOR = JSON.parse(resOR.getContentText());
        const replyOR = jsonOR?.choices?.[0]?.message?.content;
        if (replyOR && replyOR.trim() !== "") {
          Logger.log("[Tertiary Success]: OpenRouter DeepSeek");
          return { success: true, provider: "OpenRouter", reply: replyOR.trim() };
        }
      }
      Logger.log(`[OpenRouter Fail ${resOR.getResponseCode()}]: ${resOR.getContentText()}`);
    } catch (eOR) {
      Logger.log("[OpenRouter Exception]: " + eOR.toString());
    }
  }

  // ============================================================
  // PRIORITAS 4: FALLBACK DINAMIS DARI SCRIPT PROPERTIES
  // ============================================================
  Logger.log("[All Providers Failed]: Menggunakan Fallback Dinamis");
  return {
    success: false,
    provider: "Script Properties Fallback",
    reply: finalFallbackText
  };
}

// Fungsi Testing Cepat dari Apps Script Editor
function testChain() {
  const res = handleGeminiAiChat("Berapa sewa tipe studio di Kalibata City?", "TESTER");
  Logger.log("HASIL: " + JSON.stringify(res, null, 2));
}