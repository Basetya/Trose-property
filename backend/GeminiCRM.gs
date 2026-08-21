/**
 * Trose Property Manager - Robust AI Concierge Engine (v5.2)
 * File: backend/GeminiCRM.gs
 */

function handleGeminiAiChat(userMessage, senderIdentifier) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const apiKey = scriptProperties.getProperty("GEMINI_API_KEY");

  // 1. Data Inventori Aktual dari Google Sheets
  let unitContext = "";
  try {
    const units = getSheetDataAsJson("02_UNITS");
    const availableUnits = units.filter(u => u.Status === "Available");
    if (availableUnits.length > 0) {
      unitContext = "Daftar unit TERSEDIA di Apartemen Kalibata City saat ini:\n";
      availableUnits.forEach(u => {
        unitContext += `- ${u.Tower} No.${u.Unit_No} (${u.Type}): Rp${Number(u.Base_Rent).toLocaleString("id-ID")}/bln.\n`;
      });
    } else {
      unitContext = "Semua unit kelolaan saat ini sedang terisi (penuh).\n";
    }
  } catch (e) {
    unitContext = "Tersedia tipe Studio (mulai Rp3 Jt/bln) dan 2BR (mulai Rp4.2 Jt/bln).\n";
  }

  // 2. Data Pelanggan Terverifikasi (Single ID / WhatsApp)
  const cleanId = String(senderIdentifier || '').replace(/[^a-zA-Z0-9-]/g, '');
  let verifiedCustomerContext = "";

  try {
    const contacts = getSheetDataAsJson("03_CONTACTS_360");
    const leases = getSheetDataAsJson("04_LEASES");
    const invoices = getSheetDataAsJson("05_INVOICES");

    let matchedContact = contacts.find(c => 
      (c.Phone_WA && String(c.Phone_WA).replace(/[^0-9]/g, '') === cleanId) ||
      (c.Contact_ID && String(c.Contact_ID).trim().toLowerCase() === cleanId.toLowerCase())
    );

    if (matchedContact) {
      const userLease = leases.find(l => String(l.Tenant_ID).trim() === String(matchedContact.Contact_ID).trim() && l.Status === "Active");
      const userInvoices = invoices.filter(inv => userLease && String(inv.Lease_ID).trim() === String(userLease.Lease_ID).trim());
      
      verifiedCustomerContext = `\nSTATUS DATA PELANGGAN TERVERIFIKASI:\n` +
        `- Nama: ${matchedContact.Full_Name}\n` +
        `- Role: ${matchedContact.Role}\n` +
        (userLease ? `- Unit Sewa: ${userLease.Unit_ID} (Berakhir: ${userLease.End_Date}, Biaya: Rp${Number(userLease.Monthly_Rent).toLocaleString('id-ID')}/bln)\n` : "- Belum ada kontrak aktif.\n") +
        `- Status Invoice: ${userInvoices.length} tagihan (${userInvoices.filter(i => i.Status === 'Unpaid').length} belum bayar).\n`;
    }
  } catch (err) {
    Logger.log("Customer context error: " + err.toString());
  }

  // Fallback respons lokal jika API Key Gemini belum diatur
  if (!apiKey) {
    return {
      success: true,
      reply: "Halo! Saya Rose, AI Concierge Apartemen Kalibata City. " +
             "Saat ini kami menyediakan tipe unit Studio (Rp3 Jt/bln) dan 2 Bedroom (Rp4.2 Jt/bln) full furnished. " +
             "Apakah Anda ingin menjadwalkan survei unit atau konsultasi sewa lebih lanjut?"
    };
  }

  const systemInstruction = `Anda adalah 'Rose', AI Concierge & Leasing Consultant resmi untuk Trose Property di Apartemen Kalibata City, Jakarta Selatan.
Keunggulan Kalibata City yang wajib Anda ketahui:
- Terintegrasi langsung dengan Mall Kalibata City Square (bioskop, kuliner, supermarket di bawah hunian).
- Hanya 2 menit jalan kaki ke Stasiun KRL Duren Kalibata (akses cepat ke Sudirman/Kuningan/Thamrin).
- Fasilitas lengkap: Keamanan 24 jam, kartu akses lift, taman bermain, food court tematik.

Panduan Respon:
1. Bersikap ramah, sopan, persuasif, dan ringkas (maksimal 2-3 paragraf).
2. Gunakan data inventori aktual berikut saat menjawab ketersediaan unit:
${unitContext}
3. Jika pengguna menanyakan data sewa pribadi (masa berlaku kontrak, tagihan invoice, deposit):
   - Jika TERVERIFIKASI (${verifiedCustomerContext ? 'ADA' : 'TIDAK ADA'}), berikan info privatnya:
   ${verifiedCustomerContext}
   - Jika BELUM TERVERIFIKASI, minta pengguna menyebutkan Single ID (CNT-XXXX) atau Nomor WhatsApp terdaftar demi keamanan data.`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: systemInstruction + "\n\nPertanyaan: " + userMessage }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 350
    }
  };

  const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(endpoint, options);
    const json = JSON.parse(response.getContentText());

    if (json.candidates && json.candidates.length > 0 &&
        json.candidates[0].content &&
        json.candidates[0].content.parts &&
        json.candidates[0].content.parts[0] &&
        json.candidates[0].content.parts[0].text) {
      return { success: true, reply: json.candidates[0].content.parts[0].text };
    } else {
      return {
        success: true,
        reply: "Halo! Unit apartemen Kalibata City siap huni tersedia tipe Studio dan 2 Bedroom. Tim marketing kami siap membantu jadwal survei Anda!"
      };
    }
  } catch (err) {
    return {
      success: true,
      reply: "Halo! Terima kasih atas ketertarikan Anda pada Apartemen Kalibata City. Silakan hubungi admin kami via WhatsApp untuk respon instan."
    };
  }
}