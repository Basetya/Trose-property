/**
 * Kusuma Properti Manager - Vercel Serverless AI Proxy Engine
 * File: api/chat.js
 * Version: v132.0.0 (Direct Gemini 3.6 Flash Serverless Integration)
 */

export default async function handler(req, res) {
  // Aktifkan CORS untuk seluruh request domain internal
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    let message = "";
    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      message = body?.message || body?.prompt || "";
    } else {
      message = req.query.message || req.query.prompt || "";
    }

    if (!message) {
      message = "Halo, apa saja pilihan unit dan tarif di Kalibata City?";
    }

    // Ambil GEMINI_API_KEY dari Environment Variables Vercel atau Fallback
    const apiKey = process.env.GEMINI_API_KEY || "";

    const systemInstruction = 
      "Anda adalah 'Kusuma AI', Asisten Konsultan Resmi Kusuma Properti di Apartemen Kalibata City, Jakarta Selatan.\n" +
      "Kantor Marketing: Tower Flamboyan Lt. GF (Ground Floor).\n" +
      "WhatsApp Resmi Pengelola: 08135600058.\n\n" +
      "INFORMASI FASILITAS & LOKASI KALIBATA CITY:\n" +
      "- Parkir Mobil: Berada di basement khusus (tersedia tarif harian dan member langganan bulanan khusus penghuni).\n" +
      "- Parkir Motor: Berada di area gedung dan zona khusus roda dua.\n" +
      "- Fasilitas Kawasan: Terhubung ke Mall Kalibata City Square (KCS), Farmers Market, Bioskop Cinema XXI, Food Court, ATM Center, Lapangan Olahraga, Kolam Renang Green Palace, dan 5 menit jalan kaki santai ke Stasiun KRL Duren Kalibata.\n" +
      "- Pilihan Unit & Tarif Rata-rata:\n" +
      "  * Tipe Studio (21 m2): Mulai Rp 2.800.000 - Rp 3.500.000 / bulan (Full Furnished / Siap Huni).\n" +
      "  * Tipe 2 Bedroom (33 m2): Mulai Rp 3.800.000 - Rp 4.800.000 / bulan (Favorit Keluarga/Teman).\n" +
      "  * Tipe 3 Bedroom / Green Palace Resort: Mulai Rp 5.000.000 - Rp 6.500.000 / bulan.\n\n" +
      "ATURAN MENJAWAB:\n" +
      "1. Jawab pertanyaan tamu secara natural, ramah, sopan, dan jelas (maksimal 2-3 paragraf ringkas).\n" +
      "2. Berikan estimasi harga sewa atau info fasilitas secara transparan sesuai data di atas.\n" +
      "3. Selalu tawarkan untuk survei unit langsung di Tower Flamboyan Lt. GF atau hubungi WhatsApp 08135600058.";

    let aiReply = "";

    // Panggil Model Gemini 3.6 Flash dari sisi server
    if (apiKey) {
      const models = ["gemini-3.6-flash", "gemini-1.5-flash"];
      for (const modelName of models) {
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    role: "user",
                    parts: [{ text: `${systemInstruction}\n\nPertanyaan Tamu: ${message}` }]
                  }
                ],
                generationConfig: {
                  temperature: 0.3,
                  maxOutputTokens: 450
                }
              })
            }
          );

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content?.parts?.length > 0) {
              aiReply = data.candidates[0].content.parts[0].text;
              break;
            }
          }
        } catch (e) {
          console.error(`Gemini fetch error on model ${modelName}:`, e);
        }
      }
    }

    // Fallback cerdas jika API key belum diset di Vercel Environment Variables
    if (!aiReply) {
      const lower = message.toLowerCase();
      if (lower.includes("studio") || lower.includes("harga") || lower.includes("tarif") || lower.includes("biaya")) {
        aiReply = "Untuk unit tipe Studio (luas 21 m²) di Apartemen Kalibata City, tarif sewa berkisar antara Rp 2.800.000 hingga Rp 3.500.000 per bulan (kondisi Full Furnished siap huni).\n\nUnit sudah dilengkapi AC, tempat tidur, lemari pakaian, kitchen set, kulkas, dan kamar mandi. Anda dapat melakukan survei unit langsung ke kantor kami di Tower Flamboyan Lt. GF atau menghubungi WhatsApp 08135600058.";
      } else if (lower.includes("parkir") || lower.includes("mobil") || lower.includes("motor")) {
        aiReply = "Fasilitas parkir di Apartemen Kalibata City tersedia di area basement khusus untuk mobil dan gedung parkir terpisah untuk sepeda motor. Tersedia tarif parkir berkala harian maupun sistem kartu member bulanan khusus penghuni.\n\nUntuk pendaftaran member parkir dan survei unit hunian, silakan kunjungi kantor kami di Tower Flamboyan Lt. GF atau hubungi WhatsApp 08135600058.";
      } else if (lower.includes("2br") || lower.includes("2 kamar") || lower.includes("survei")) {
        aiReply = "Unit tipe 2 Bedroom (luas 33 m²) disewakan dengan tarif mulai Rp 3.800.000 hingga Rp 4.800.000 per bulan. Memiliki 2 kamar tidur terpisah, ruang keluarga, dapur lengkap, dan balkon.\n\nKantor kami di Tower Flamboyan Lt. GF buka setiap hari untuk survei unit langsung. Silakan hubungi WhatsApp 08135600058 untuk membuat janji temu.";
      } else {
        aiReply = "Halo! Selamat datang di Kusuma Properti Kalibata City. Kami menyediakan pilihan sewa unit Studio, 2BR, dan 3BR siap huni dengan akses langsung ke Mall Kalibata City Square dan Stasiun KRL.\n\nSilakan tanyakan detail unit, tarif sewa, atau hubungi WhatsApp kami di 08135600058 untuk survei di Tower Flamboyan Lt. GF.";
      }
    }

    return res.status(200).json({
      success: true,
      status: "success",
      reply: aiReply,
      response: aiReply,
      message: aiReply
    });

  } catch (error) {
    console.error("Serverless Handler Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
      reply: "Halo! Terima kasih telah menghubungi Kusuma Properti. Silakan langsung konsultasi via WhatsApp admin di 08135600058."
    });
  }
}