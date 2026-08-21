/**
 * Trose Property Manager - Rose AI Concierge Engine (v6.7)
 * Policy: Monthly & Annual Rentals Only (No Daily Rentals Available)
 * Knowledge Base: Apartemen Kalibata City Superblock
 * File: backend/GeminiCRM.gs
 */

function handleGeminiAiChat(userMessage, senderIdentifier) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const apiKey = scriptProperties.getProperty("GEMINI_API_KEY");

  // 1. Ambil data inventori unit aktual dari tab 02_UNITS Google Sheets
  let liveUnitInventory = "";
  try {
    const units = getSheetDataAsJson("02_UNITS");
    const availableUnits = units.filter(u => u.Status === "Available");
    if (availableUnits.length > 0) {
      liveUnitInventory = "DAFTAR UNIT TERSEDIA SAAT INI (REAL-TIME SHEETS):\n";
      availableUnits.forEach(u => {
        liveUnitInventory += `- ${u.Tower} No.${u.Unit_No} (${u.Type}): Rp${Number(u.Base_Rent).toLocaleString("id-ID")}/bln (Rute: ${u.Payment_Route}).\n`;
      });
    } else {
      liveUnitInventory = "STATUS UNIT: Semua unit kelolaan saat ini sedang terisi (Full Occupied).\n";
    }
  } catch (e) {
    liveUnitInventory = "Menggunakan katalog standar bulanan & tahunan Kalibata City.\n";
  }

  // 2. Verifikasi Identitas Pengguna (Single ID / WhatsApp)
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
      
      verifiedCustomerContext = `\n[DATA PENYEWA TERVERIFIKASI SISTEM]\n` +
        `- Nama: ${matchedContact.Full_Name}\n` +
        `- Status: ${matchedContact.Role}\n` +
        (userLease ? `- Kontrak Unit: ${userLease.Unit_ID} (Berakhir: ${userLease.End_Date}, Sewa: Rp${Number(userLease.Monthly_Rent).toLocaleString('id-ID')}/bln)\n` : "- Belum memiliki kontrak aktif.\n") +
        `- Tagihan: ${userInvoices.length} total (${userInvoices.filter(i => i.Status === 'Unpaid').length} belum lunas).\n`;
    }
  } catch (err) {
    Logger.log("Customer context resolution error: " + err.toString());
  }

  // Fallback respons lokal jika GEMINI_API_KEY belum terpasang
  if (!apiKey) {
    return {
      success: true,
      reply: generateStructuredOfflineAnswer(userMessage)
    };
  }

  // 3. System Prompt, Knowledge Base & Guardrail Master Directive
  const systemPrompt = `Anda adalah "Rose", Asisten Virtual AI & Leasing Concierge resmi untuk Trose Property di Superblock Apartemen Kalibata City, Jakarta Selatan.

=== KEBIJAKAN UTAMA SEWA (STRICT POLICY) ===
1. KAMI HANYA MENYEDIAKAN SEWA BULANAN DAN TAHUNAN.
2. FASILITAS SEWA HARIAN / TRANSIT / PER MALAM TIDAK TERSEDIA DI TROSE PROPERTY.
   - Jika pengguna menanyakan sewa harian, jawab dengan sopan dan ramah: "Mohon maaf, saat ini kami tidak menyediakan fasilitas sewa harian. Trose Property hanya melayani sewa bulanan dan tahunan demi kenyamanan dan privasi jangka panjang penghuni."
   - Tawarkan alternatif sewa bulanan mulai dari Rp 3 Juta/bulan.

=== KNOWLEDGE BASE KALIBATA CITY SUPERBLOCK ===
1. STRUKTUR TOWER (18 Tower Total):
   - Kalibata Residences (8 Tower): Akasia, Borneo, Cendana, Damar, Ebony, Flamboyan, Gaharu, Hebras.
   - Kalibata Regency (3 Tower): Kemuning, Jasmine, Lotus.
   - Green Palace (7 Tower Premium): Mawar, Nusa Indah, Palem, Raffles, Sakura, Tulip, Viola. (Fasilitas eksklusif: Kolam Renang tematik, Fitness Center/Gym, Lapangan Tenis, Sauna).
2. HARGA & TIPE SEWA RESMI:
   - Sewa Bulanan: Studio 21 m2 (Rp 2.800.000 - Rp 3.500.000/bln), 2BR Standard 33 m2 (Rp 3.800.000 - Rp 4.500.000/bln), 2BR Green Palace (Rp 4.500.000 - Rp 5.500.000/bln).
   - Sewa Tahunan: Mulai Rp 32 Juta - Rp 55 Juta / tahun (Hemat biaya sewa bulanan).
   - Seluruh unit sewa standard dilengkapi AC, kasur springbed, lemari pakaian, kitchen set, kulkas, dan TV.
3. FASILITAS & LOKASI STRATEGIS:
   - Mall Kalibata City Square (KCS) langsung di bawah tower (XXI, Farmers Market, Starbucks, kuliner 24 jam).
   - Stasiun KRL Duren Kalibata hanya 200 meter (2 menit jalan kaki).
   - Akses cepat 10-15 menit ke kawasan bisnis Kuningan (Rasuna Said), Gatot Subroto, SCBD, MT Haryono.
   - Keamanan: Kartu akses lift per lantai, CCTV 24 jam, Masjid Raya Nurullah.

=== LIVE INVENTORY DATA DARI DATABASE ===
${liveUnitInventory}

=== DATA PELANGGAN TERDAFTAR ===
${verifiedCustomerContext || "PENGGUNA SAAT INI: Pengunjung umum / Belum terverifikasi."}

=== 5 GUARDRAILS & ATURAN RESPON ===
1. BOUNDARY & NO DAILY RENT: Tolak sewa harian dengan sopan. Fokus pada sewa bulanan/tahunan.
2. PRIVASI: JANGAN PERNAH membocorkan nama pemilik unit, nomor rekening landlord, atau data sewa orang lain.
3. DATA PERSONAL: Jika pengguna menanyakan masa kontrak / tagihannya:
   - Jika sudah terverifikasi di atas, jelaskan dengan ramah data kontraknya.
   - Jika belum terverifikasi, minta pengguna mengetikkan Single ID (contoh: CNT-XXXX) atau No WhatsApp terdaftar.
4. ACTION ORIENTED: Ajak calon penyewa untuk menjadwalkan survei unit (viewing) atau klik tombol WhatsApp Admin untuk booking cepat.
5. GAYA BICARA: Ramah, profesional, solutif, ringkas (maksimal 2-3 paragraf), bahasa Indonesia yang elegan.`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: systemPrompt + "\n\nPertanyaan Pengguna: " + userMessage }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 400
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
      return { success: true, reply: generateStructuredOfflineAnswer(userMessage) };
    }
  } catch (err) {
    Logger.log("Gemini Live API Error: " + err.toString());
    return { success: true, reply: generateStructuredOfflineAnswer(userMessage) };
  }
}

function generateStructuredOfflineAnswer(userQuery) {
  const q = String(userQuery || '').toLowerCase();
  
  if (q.includes("harian") || q.includes("hari") || q.includes("malam") || q.includes("transit") || q.includes("short stay")) {
    return "Mohon maaf, saat ini kami tidak menyediakan fasilitas sewa harian. Trose Property berfokus melayani sewa bulanan (mulai Rp 3 Jt/bln) dan sewa tahunan demi kenyamanan, keamanan, serta privasi optimal bagi seluruh penghuni. Apakah Anda ingin mengetahui pilihan unit bulanan kami?";
  }
  if (q.includes("studio") || q.includes("harga") || q.includes("biaya") || q.includes("tarif") || q.includes("rate") || q.includes("sewa")) {
    return "Berikut pilihan sewa bulanan resmi di Kalibata City:\n- Studio Deluxe (21 m2): Mulai Rp 3.000.000/bulan\n- 2 Bedroom Standard (33 m2): Mulai Rp 4.200.000/bulan\n- 2 Bedroom Green Palace (Pool Access): Mulai Rp 5.500.000/bulan\nSemua unit Full Furnished siap huni. Kami juga melayani sewa tahunan dengan tarif lebih hemat.";
  }
  if (q.includes("fasilitas") || q.includes("kolam") || q.includes("gym") || q.includes("mall") || q.includes("green palace")) {
    return "Fasilitas lengkap di kawasan Superblock Kalibata City:\n- Mall Kalibata City Square (KCS) langsung di bawah hunian (Farmers Market, XXI, kuliner 24 jam).\n- Kolam renang tematik (Adult & Kids Pool) dan Gym Center di Green Palace.\n- Lapangan Tenis, Basket, Futsal, Jogging Track, dan Masjid Raya Nurullah.\n- Keamanan kartu akses lift 24 jam & CCTV.";
  }
  if (q.includes("lokasi") || q.includes("stasiun") || q.includes("krl") || q.includes("alamat") || q.includes("peta")) {
    return "Lokasi sangat strategis di Jl. Raya Kalibata No.1, Pancoran, Jakarta Selatan. Hanya 2 menit (200m) jalan kaki ke Stasiun KRL Duren Kalibata, dan 10-15 menit ke kawasan perkantoran Kuningan (Rasuna Said) serta Gatot Subroto.";
  }
  if (q.includes("survei") || q.includes("viewing") || q.includes("lihat") || q.includes("jadwal")) {
    return "Tentu! Jadwal survei unit (viewing) tersedia setiap hari (Senin-Minggu, 09.00 - 18.00 WIB). Silakan klik tombol 'WhatsApp Admin' untuk konfirmasi jam kunjungan Anda bersama tim konsultan kami.";
  }

  return "Halo! Saya Rose, AI Concierge resmi Apartemen Kalibata City. Kami siap membantu informasi sewa unit bulanan dan tahunan, fasilitas Superblock, maupun jadwal survei lokasi. Ada yang bisa saya bantu?";
}