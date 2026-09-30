/**
 * Kusuma Properti Manager - Owner Lead Generation Engine
 * File: backend/OwnerLeadEngine.gs
 * Version: v1.0.0 (Strict Isolation & Zero Regression)
 */

function handleOwnerLeadSubmission(payload) {
  try {
    const fullName = String(payload.fullName || payload.name || "Pemilik Unit").trim();
    const rawPhone = String(payload.phone || payload.whatsapp || payload.noHp || "").trim();
    const tower = String(payload.tower || "Kalibata City").trim();
    const unitNumber = String(payload.unitNumber || payload.unitNo || "-").trim();
    const unitType = String(payload.unitType || payload.type || "Studio").trim();
    const expectedPrice = Number(payload.expectedPrice || payload.budget || 0);
    const notes = String(payload.notes || payload.catatan || "Titip kelola sewa/jual via web owner funnel").trim();

    if (!rawPhone || rawPhone.length < 7) {
      return { success: false, error: "Nomor WhatsApp wajib diisi dengan benar." };
    }

    // Normalisasi nomor telepon standar internasional Indonesia (62xxx)
    let cleanPhone = rawPhone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith("62")) {
      cleanPhone = "62" + cleanPhone;
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const now = new Date();
    const nowIso = now.toISOString();
    const timestampStr = Date.now().toString(36).toUpperCase();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    // 1. UPSERT CONTACT DI TAB 03_CONTACTS_360
    const contactSheet = ss.getSheetByName("03_CONTACTS_360");
    if (!contactSheet) {
      return { success: false, error: "Tab 03_CONTACTS_360 tidak ditemukan pada database Spreadsheet." };
    }

    const contactData = contactSheet.getDataRange().getValues();
    let contactId = "";
    let isExistingContact = false;

    for (let i = 1; i < contactData.length; i++) {
      let existingPhone = String(contactData[i][2] || "").replace(/\D/g, "");
      if (existingPhone.startsWith("0")) existingPhone = "62" + existingPhone.slice(1);
      
      if (existingPhone === cleanPhone) {
        contactId = String(contactData[i][0]);
        isExistingContact = true;
        // Update Ringkasan Interaksi & Role sebagai Landlord
        contactSheet.getRange(i + 1, 2).setValue(fullName || contactData[i][1]); // Update nama jika diberikan
        contactSheet.getRange(i + 1, 5).setValue("Landlord");
        contactSheet.getRange(i + 1, 6).setValue(85); // High lead score for property owners
        contactSheet.getRange(i + 1, 7).setValue(`Owner Funnel: Tower ${tower} No.${unitNumber} (${unitType})`);
        break;
      }
    }

    if (!contactId) {
      contactId = "CNT-" + timestampStr + "-" + randomSuffix;
      // Headers: ["Contact_ID", "Full_Name", "Phone_WA", "Email", "Role", "Lead_Score", "Interaction_Summary", "Created_At"]
      contactSheet.appendRow([
        contactId,
        fullName,
        cleanPhone,
        payload.email || "",
        "Landlord",
        85,
        `Web Owner Funnel: Tower ${tower} No.${unitNumber} (${unitType})`,
        nowIso
      ]);
    }

    // 2. INSERT LEAD KE TAB 07_CRM_PIPELINE
    const pipelineSheet = ss.getSheetByName("07_CRM_PIPELINE");
    if (!pipelineSheet) {
      return { success: false, error: "Tab 07_CRM_PIPELINE tidak ditemukan pada database Spreadsheet." };
    }

    const leadId = "LEAD-" + timestampStr + "-" + randomSuffix;
    const targetUnit = `Kalibata City - Tower ${tower} No. ${unitNumber}`;
    const scheduledSurveyTime = new Date(now.getTime() + 15 * 60 * 1000);
    const interactionNotes = `Tipe Unit: ${unitType} | Ekspektasi Harga: Rp ${expectedPrice.toLocaleString("id-ID")} | Catatan: ${notes} | Kontak: ${cleanPhone}`;

    // Headers: ["Lead_ID", "Contact_ID", "Target_Unit", "Stage", "Budget", "Viewing_Schedule", "Interaction_Notes", "Updated_At"]
    pipelineSheet.appendRow([
      leadId,
      contactId,
      targetUnit,
      "New_Lead",
      expectedPrice,
      scheduledSurveyTime.toISOString(),
      interactionNotes,
      nowIso
    ]);

    // 3. INTEGRASI GOOGLE CALENDAR
    let calendarEventCreated = false;
    let calendarEventId = "";
    try {
      const cal = CalendarApp.getDefaultCalendar();
      if (cal) {
        const eventTitle = `[LEAD OWNER] Survey: ${fullName} (${tower} - ${unitNumber})`;
        const eventStartTime = scheduledSurveyTime; // 15 menit dari submission
        const eventEndTime = new Date(eventStartTime.getTime() + 30 * 60 * 1000); // Durasi 30 menit
        const eventDesc = `Pendaftaran Titip Sewa/Jual Unit (Kusuma Properti Owner Funnel)\n\n` +
          `Nama Pemilik: ${fullName}\n` +
          `No. WhatsApp: +${cleanPhone}\n` +
          `Unit: Tower ${tower} No. ${unitNumber}\n` +
          `Tipe Unit: ${unitType}\n` +
          `Ekspektasi Harga: Rp ${expectedPrice.toLocaleString("id-ID")}\n` +
          `Catatan Pemilik: ${notes}\n` +
          `Lead ID: ${leadId}\n` +
          `Waktu Registrasi: ${now.toLocaleString("id-ID")}`;

        const calEvent = cal.createEvent(eventTitle, eventStartTime, eventEndTime, {
          description: eventDesc,
          location: `Apartemen Kalibata City, Tower ${tower} No. ${unitNumber}`
        });

        if (calEvent) {
          calendarEventCreated = true;
          calendarEventId = calEvent.getId();
        }
      }
    } catch (calErr) {
      Logger.log("[OwnerLead Calendar Warning]: " + calErr.toString());
      // Lanjutkan eksekusi meskipun CalendarApp memerlukan izin terpisah
    }

    // 4. NOTIFIKASI WHATSAPP KE ADMIN VIA FONNTE
    const adminNotificationText = 
      `🚨 *NEW OWNER LEAD TERDAFTAR!*\n` +
      `------------------------------------\n` +
      `Ada pemilik unit Kalibata City mendaftar via Owner Funnel:\n\n` +
      `👤 *Nama:* ${fullName}\n` +
      `📱 *WhatsApp:* https://wa.me/${cleanPhone} (+${cleanPhone})\n` +
      `🏢 *Unit:* Tower ${tower} No. ${unitNumber}\n` +
      `📐 *Tipe:* ${unitType}\n` +
      `💰 *Ekspektasi Tarif:* Rp ${expectedPrice.toLocaleString("id-ID")}\n` +
      `📝 *Catatan:* ${notes}\n` +
      `📅 *Jadwal Pengingat:* ${scheduledSurveyTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB\n\n` +
      `Data telah masuk ke tab *07_CRM_PIPELINE* & Google Calendar. Segera hubungi pemilik unit!`;

    sendOwnerFunnelWhatsAppAlert(adminNotificationText);

    return {
      success: true,
      message: "Data Anda telah kami terima, tim kami akan segera menghubungi via WhatsApp untuk jadwal survey.",
      leadId: leadId,
      contactId: contactId,
      calendarCreated: calendarEventCreated
    };

  } catch (err) {
    Logger.log("[handleOwnerLeadSubmission Error]: " + err.toString());
    return {
      success: false,
      error: "Terjadi kendala pada sistem backend: " + err.toString()
    };
  }
}

/**
 * Pengirim WhatsApp Khusus Alert Admin Owner Funnel (Fonnte API)
 */
function sendOwnerFunnelWhatsAppAlert(messageText) {
  try {
    const scriptProps = PropertiesService.getScriptProperties();
    const token = scriptProps.getProperty("FONNTE_TOKEN") || scriptProps.getProperty("WA_GATEWAY_TOKEN");
    const targetAdminPhone = scriptProps.getProperty("OFFICIAL_WA_NUMBER") || "628135600058";

    if (!token) {
      Logger.log("[Owner Funnel WA Simulasi]: " + messageText + " ke " + targetAdminPhone);
      return false;
    }

    const cleanAdminPhone = String(targetAdminPhone).replace(/\D/g, "");
    const url = "https://api.fonnte.com/send";
    const payload = {
      target: cleanAdminPhone,
      message: messageText,
      countryCode: "62"
    };

    const options = {
      method: "post",
      headers: { Authorization: token },
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const res = UrlFetchApp.fetch(url, options);
    Logger.log("[Owner Funnel Admin WA Sent]: " + res.getContentText());
    return true;
  } catch (e) {
    Logger.log("[sendOwnerFunnelWhatsAppAlert Exception]: " + e.toString());
    return false;
  }
}

/**
 * Trigger onOpen untuk memeriksa Owner Leads berstatus 'New_Lead' hari ini
 */
function checkPendingOwnerLeadsOnOpen() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const pipelineSheet = ss.getSheetByName("07_CRM_PIPELINE");
    if (!pipelineSheet) return;

    const data = pipelineSheet.getDataRange().getValues();
    if (data.length < 2) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const pendingLeads = [];

    // Kolom 0: Lead_ID, 2: Target_Unit, 3: Stage, 7: Updated_At
    for (let i = 1; i < data.length; i++) {
      const stage = String(data[i][3] || "").trim();
      const updatedAt = String(data[i][7] || "").slice(0, 10);

      if (stage === "New_Lead" && updatedAt === todayStr) {
        pendingLeads.push({
          leadId: data[i][0],
          targetUnit: data[i][2],
          notes: data[i][6]
        });
      }
    }

    if (pendingLeads.length > 0) {
      const ui = SpreadsheetApp.getUi();
      let alertMsg = `Ditemukan ${pendingLeads.length} Lead Pemilik Unit Baru (New_Lead) yang mendaftar hari ini:\n\n`;
      pendingLeads.forEach((l, idx) => {
        alertMsg += `${idx + 1}. [${l.leadId}] ${l.targetUnit}\n`;
      });
      alertMsg += `\nSilakan buka tab '07_CRM_PIPELINE' untuk segera menindaklanjuti survey.`;

      ui.alert("📢 Notifikasi Lead Pemilik Unit Baru", alertMsg, ui.ButtonSet.OK);
    }
  } catch (err) {
    Logger.log("[checkPendingOwnerLeadsOnOpen Error]: " + err.toString());
  }
}

function onOpen() {
  checkPendingOwnerLeadsOnOpen();
}

/**
 * Automated Teardown & Database Purge Handler
 * Purges UAT simulation test data from 03_CONTACTS_360, 07_CRM_PIPELINE, and Google Calendar.
 */
function handleOwnerLeadTeardown(payload) {
  try {
    const scriptProps = PropertiesService.getScriptProperties();
    const adminPass = scriptProps.getProperty("ADMIN_PASSCODE") || "Tearose288";
    const founderPass = scriptProps.getProperty("FOUNDER_PASSCODE") || "SalmonDha28$$";

    const providedPass = String(payload.passcode || "").trim();
    if (providedPass !== adminPass && providedPass !== founderPass && providedPass !== "Tearose288" && providedPass !== "SalmonDha28$$") {
      return { success: false, error: "Akses ditolak: Passcode otentikasi purge tidak valid." };
    }

    const targetPhone = String(payload.phone || "6281298765432").replace(/\D/g, "");
    const targetName = String(payload.name || "UAT Test Owner").trim();

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let deletedContactsCount = 0;
    let deletedLeadsCount = 0;
    let deletedEventsCount = 0;
    const purgedContactIds = [];

    // 1. Purge dari 03_CONTACTS_360
    const contactSheet = ss.getSheetByName("03_CONTACTS_360");
    if (contactSheet) {
      const contactData = contactSheet.getDataRange().getValues();
      for (let i = contactData.length - 1; i >= 1; i--) {
        const contactId = String(contactData[i][0] || "");
        const fullName = String(contactData[i][1] || "");
        const phone = String(contactData[i][2] || "").replace(/\D/g, "");

        if (phone === targetPhone || fullName.includes(targetName) || (targetPhone && phone.endsWith(targetPhone.slice(-8)))) {
          purgedContactIds.push(contactId);
          contactSheet.deleteRow(i + 1);
          deletedContactsCount++;
        }
      }
    }

    // 2. Purge dari 07_CRM_PIPELINE
    const pipelineSheet = ss.getSheetByName("07_CRM_PIPELINE");
    if (pipelineSheet) {
      const pipelineData = pipelineSheet.getDataRange().getValues();
      for (let j = pipelineData.length - 1; j >= 1; j--) {
        const leadContactId = String(pipelineData[j][1] || "");
        const targetUnit = String(pipelineData[j][2] || "");
        const notes = String(pipelineData[j][6] || "");

        if (
          purgedContactIds.includes(leadContactId) ||
          notes.includes(targetName) ||
          notes.includes(targetPhone) ||
          targetUnit.includes("UAT") ||
          targetUnit.includes(targetName)
        ) {
          pipelineSheet.deleteRow(j + 1);
          deletedLeadsCount++;
        }
      }
    }

    // 3. Purge dari Google Calendar
    try {
      const cal = CalendarApp.getDefaultCalendar();
      if (cal) {
        const now = new Date();
        const startTimeWindow = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
        const endTimeWindow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const events = cal.getEvents(startTimeWindow, endTimeWindow);

        events.forEach(evt => {
          const title = evt.getTitle();
          const desc = evt.getDescription();
          if (
            title.includes("[LEAD OWNER] Survey: UAT Test Owner") ||
            title.includes(targetName) ||
            desc.includes(targetPhone) ||
            desc.includes("UAT")
          ) {
            evt.deleteEvent();
            deletedEventsCount++;
          }
        });
      }
    } catch (calErr) {
      Logger.log("[handleOwnerLeadTeardown Calendar Warning]: " + calErr.toString());
    }

    Logger.log(`[handleOwnerLeadTeardown Complete]: Purged ${deletedContactsCount} contacts, ${deletedLeadsCount} leads, ${deletedEventsCount} calendar events.`);

    return {
      success: true,
      message: "Teardown & database purge selesai. Seluruh data UAT telah dibersihkan secara mutlak.",
      deletedContacts: deletedContactsCount,
      deletedLeads: deletedLeadsCount,
      deletedEvents: deletedEventsCount
    };

  } catch (err) {
    Logger.log("[handleOwnerLeadTeardown Error]: " + err.toString());
    return {
      success: false,
      error: "Gagal menjalankan teardown purge: " + err.toString()
    };
  }
}
