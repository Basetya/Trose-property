/**
 * Kusuma Properti - Scheduled Lease Reminder (H-1 Only)
 * File: ScheduledReminder.gs
 */
function runDailyLeaseReminderScheduler() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = null;
  
  for (let s of ss.getSheets()) {
    const sName = s.getName().trim().toLowerCase();
    if (sName.includes("master penyewa") || sName.includes("master_penyewa")) {
      sheet = s;
      break;
    }
  }

  if (!sheet) {
    Logger.log("❌ Sheet Master Penyewa tidak ditemukan.");
    return;
  }

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let sentCount = 0;

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const noUnit = String(row[0] || "").trim();
    const nama = String(row[1] || "").trim();
    const rawPhone = String(row[2] || "").trim();
    const tagihanWE = row[3] || 0;
    const vaBca = String(row[4] || "").trim();
    const vaMandiri = String(row[5] || "").trim();
    const rawDueDate = row[7];
    const sewaPenyewa = row[9] || 0;
    const statusBayar = String(row[12] || "").trim().toLowerCase();

    // Lewati jika data tidak valid, sudah lunas, atau dipakai pemilik
    if (!noUnit || statusBayar === "lunas" || statusBayar === "dipakai pemilik") {
      continue;
    }

    // Parsing Tanggal Jatuh Tempo
    const dueDate = parseAnyDate(rawDueDate);
    if (!dueDate) continue;

    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // ATURAN BARU: HANYA H-1 (diffDays === 1)
    if (diffDays === 1) {
      const phone = formatPhoneNumber(rawPhone);
      if (!phone) continue;

      const totalTagihan = Number(sewaPenyewa) + Number(tagihanWE);
      
      const message = 
        `Halo Kak *${nama}*,\n\n` +
        `Mengingatkan kembali bahwa sewa unit *${noUnit}* di Apartemen Kalibata City akan jatuh tempo *BESOK*:\n` +
        `📅 *Tanggal:* ${Utilities.formatDate(dueDate, "Asia/Jakarta", "dd MMMM yyyy")}\n` +
        `💵 *Sewa:* Rp${Number(sewaPenyewa).toLocaleString('id-ID')}\n` +
        (Number(tagihanWE) > 0 ? `⚡ *Air & Listrik (WE):* Rp${Number(tagihanWE).toLocaleString('id-ID')}\n` : '') +
        `💰 *Total Pembayaran:* Rp${Number(totalTagihan).toLocaleString('id-ID')}\n\n` +
        `Pembayaran dapat ditransfer melalui:\n` +
        (vaBca ? `• *BCA:* ${vaBca}\n` : '') +
        (vaMandiri ? `• *Mandiri:* ${vaMandiri}\n` : '') +
        `\nMohon konfirmasi dan kirimkan bukti transfer jika sudah melakukan pembayaran ya kak. Terima kasih! 🙏`;

      // Kirim via Fonnte
      const isSent = sendFonnteWhatsApp(phone, message);
      if (isSent) {
        sentCount++;
        Utilities.sleep(1000); // Jeda anti-spam
      }
    }
  }

  Logger.log(`✅ Scheduler selesai: ${sentCount} pengingat H-1 berhasil dikirim.`);
}