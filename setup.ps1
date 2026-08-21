# ==============================================================================
# Trose-property - 1-Click Setup (AI Knowledge Base Purge & Clear Feature v7.1)
# ==============================================================================

Write-Host "Scaffolding v7.1: Implementing Clear/Purge AI Knowledge Base & Guardrails..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "backend", "frontend/css", "frontend/js", "frontend/img", "scripts" | Out-Null

$Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False

Write-Host "Updating backend/Code.gs (With clearAiConfig action)..." -ForegroundColor Yellow
$codeGs = @'
/**
 * Trose Property Manager - Production Controller with AI Studio & Purge (v7.1)
 * File: backend/Code.gs
 */

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "getDashboardData";
  let responseData = {};

  try {
    if (action === "getAiConfig") {
      const sp = PropertiesService.getScriptProperties();
      const kb = sp.getProperty("AI_KNOWLEDGE_BASE");
      const gr = sp.getProperty("AI_GUARDRAILS");
      // Jika bernilai null (belum pernah di-set), kembalikan default. Jika string "" (telah di-clear), kembalikan "".
      responseData = { 
        success: true, 
        knowledgeBase: kb !== null ? kb : getDefaultKnowledgeBase(), 
        guardrails: gr !== null ? gr : getDefaultGuardrails() 
      };
    } else if (action === "verifyPasscode") {
      const inputPasscode = e.parameter.passcode || "";
      const expectedPasscode = PropertiesService.getScriptProperties().getProperty("ADMIN_PASSCODE") || "trose288";
      if (inputPasscode === expectedPasscode) {
        responseData = { success: true, message: "Authentication successful." };
      } else {
        responseData = { success: false, error: "Passcode salah! Akses ditolak." };
      }
    } else if (action === "getPublicSettings") {
      const sp = PropertiesService.getScriptProperties();
      const waNumber = sp.getProperty("LANDING_WA_NUMBER") || "+6281221559000";
      responseData = { success: true, settings: { waNumber: waNumber } };
    } else if (action === "getDashboardData") {
      responseData = fetchDashboardOverview();
    } else if (action === "getFinancials") {
      responseData = generateFinancialStatements();
    } else if (action === "getUnits") {
      responseData = { success: true, units: getSheetDataAsJson("02_UNITS") };
    } else if (action === "getLeases") {
      responseData = fetchLeasesList();
    } else if (action === "getInvoices") {
      responseData = { success: true, invoices: getSheetDataAsJson("05_INVOICES") };
    } else if (action === "getInvoiceDetail") {
      const invId = e.parameter.invoiceId;
      responseData = fetchInvoiceById(invId);
    } else if (action === "getOwnerStatement") {
      const ownerName = e.parameter.ownerName;
      responseData = fetchOwnerStatementDetails(ownerName);
    } else if (action === "getLeads") {
      responseData = fetchCrmPipeline();
    } else if (action === "getMaintenance") {
      responseData = fetchMaintenanceTickets();
    } else if (action === "getInspections") {
      responseData = { success: true, inspections: getSheetDataAsJson("09_INSPECTIONS") };
    } else {
      responseData = { success: false, error: "Invalid GET action: " + action };
    }
  } catch (err) {
    responseData = { success: false, error: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(responseData))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let responseData = {};

  try {
    let postData;
    if (e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      postData = e.parameter;
    } else {
      throw new Error("No payload found");
    }

    const action = postData.action;
    const publicActions = ["submitProof", "whatsappWebhook", "aiChatbot", "verifyPasscode", "getPublicSettings", "getAiConfig"];

    if (!publicActions.includes(action)) {
      const expectedPasscode = PropertiesService.getScriptProperties().getProperty("ADMIN_PASSCODE") || "trose288";
      if (expectedPasscode && postData.passcode !== expectedPasscode) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: "Unauthorized: Invalid or missing Admin Passcode"
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    if (action === "saveAiConfig") {
      const sp = PropertiesService.getScriptProperties();
      sp.setProperty("AI_KNOWLEDGE_BASE", String(postData.knowledgeBase || "").trim());
      sp.setProperty("AI_GUARDRAILS", String(postData.guardrails || "").trim());
      responseData = { success: true, message: "Knowledge Base & Guardrails Rose AI berhasil diperbarui!" };
    } else if (action === "clearAiConfig") {
      const sp = PropertiesService.getScriptProperties();
      sp.setProperty("AI_KNOWLEDGE_BASE", "");
      sp.setProperty("AI_GUARDRAILS", "");
      responseData = { success: true, message: "Seluruh Knowledge Base & Guardrails lama berhasil DIKOSONGKAN (dihapus)." };
    } else if (action === "updatePublicSettings") {
      const sp = PropertiesService.getScriptProperties();
      if (postData.waNumber) {
        sp.setProperty("LANDING_WA_NUMBER", String(postData.waNumber).trim());
      }
      responseData = { success: true, message: "Pengaturan WhatsApp Landing Page berhasil diperbarui!" };
    } else if (action === "verifyPasscode") {
      const expectedPasscode = PropertiesService.getScriptProperties().getProperty("ADMIN_PASSCODE") || "trose288";
      if (postData.passcode === expectedPasscode) {
        responseData = { success: true, message: "Authentication successful." };
      } else {
        responseData = { success: false, error: "Passcode salah! Akses ditolak." };
      }
    } else if (action === "createUnit") {
      responseData = handleCreateUnit(postData.data);
    } else if (action === "updateUnitStatus") {
      responseData = handleUpdateUnitStatus(postData.unitId, postData.status);
    } else if (action === "createLease") {
      responseData = handleCreateLease(postData.data);
    } else if (action === "createInvoice") {
      responseData = handleCreateInvoice(postData.data);
    } else if (action === "verifyPayment") {
      responseData = handleVerifyPayment(postData.invoiceId);
    } else if (action === "submitProof") {
      responseData = handleSubmitProof(postData.invoiceId, postData.proofUrl);
    } else if (action === "createMaintenance") {
      responseData = handleCreateMaintenance(postData.data);
    } else if (action === "updateMaintenanceStatus") {
      responseData = handleUpdateMaintenanceStatus(postData.ticketId, postData.status);
    } else if (action === "createInspection") {
      responseData = handleCreateInspection(postData.data);
    } else if (action === "triggerDunning") {
      responseData = runDailyDunningScheduler();
    } else if (action === "createLead") {
      responseData = handleCreateLead(postData.data);
    } else if (action === "updateLeadStage") {
      responseData = handleUpdateLeadStage(postData.leadId, postData.stage, postData.notes);
    } else if (action === "whatsappWebhook") {
      responseData = handleIncomingWhatsAppWebhook(postData);
    } else if (action === "aiChatbot") {
      responseData = handleGeminiAiChat(postData.message, postData.senderPhone);
    } else {
      responseData = { success: false, error: "Invalid POST action: " + action };
    }
  } catch (err) {
    responseData = { success: false, error: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(responseData))
    .setMimeType(ContentService.MimeType.JSON);
}

function getDefaultKnowledgeBase() {
  return "SUPERBLOCK KALIBATA CITY INFORMATION:\n" +
    "- 18 Tower Total: Akasia, Borneo, Cendana, Damar, Ebony, Flamboyan, Gaharu, Hebras, Kemuning, Jasmine, Lotus, Mawar, Nusa Indah, Palem, Raffles, Sakura, Tulip, Viola.\n" +
    "- Tower Green Palace (Mawar s/d Viola) memiliki akses kolam renang tematik & gym indoor.\n" +
    "- Tarif Sewa Bulanan: Studio (Rp 2.8Jt - 3.5Jt/bln), 2BR Standard (Rp 3.8Jt - 4.5Jt/bln), 2BR Green Palace (Rp 4.5Jt - 5.5Jt/bln).\n" +
    "- Seluruh unit Full Furnished (AC, springbed, lemari, kitchen set, kulkas, TV).\n" +
    "- Mall Kalibata City Square (KCS), XXI, Farmers Market di bawah hunian.\n" +
    "- Stasiun KRL Duren Kalibata berjarak 200m (2 menit jalan kaki).";
}

function getDefaultGuardrails() {
  return "1. NO DAILY RENTALS: Tolak dengan sopan pertanyaan sewa harian/transit/per malam. Jelaskan bahwa Trose Property hanya menyediakan sewa bulanan dan tahunan demi keamanan & kenyamanan.\n" +
    "2. STRICT PROPERTY DOMAIN: Hanya jawab seputar properti, fasilitas, sewa, dan jadwal viewing di Kalibata City.\n" +
    "3. PRIVACY PROTECTION: Dilarang membeberkan nama pemilik unit atau nomor rekening pribadi landlord kepada publik.\n" +
    "4. VERIFICATION PROTOCOL: Data privat penyewa (masa sewa, sisa tagihan) hanya boleh dijawab jika Single ID (CNT-XXXX) atau No WA cocok di database.\n" +
    "5. LEAD CAPTURE: Arahkan pengguna menjadwalkan survei unit (viewing) atau klik tombol WhatsApp Admin.";
}

function getColumnMap(sheet) {
  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) return {};
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const map = {};
  headers.forEach((h, idx) => {
    map[String(h).trim()] = idx + 1;
  });
  return map;
}

function getSheetDataAsJson(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const results = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    results.push(obj);
  }
  return results;
}

function fetchDashboardOverview() {
  const units = getSheetDataAsJson("02_UNITS");
  const invoices = getSheetDataAsJson("05_INVOICES");
  const leases = getSheetDataAsJson("04_LEASES");
  const leads = getSheetDataAsJson("07_CRM_PIPELINE");
  const maintenance = getSheetDataAsJson("06_MAINTENANCE");

  let occupied = 0;
  let available = 0;
  units.forEach(u => {
    if (u.Status === "Occupied") occupied++;
    if (u.Status === "Available") available++;
  });

  let totalDue = 0;
  let totalCollected = 0;
  let totalPending = 0;
  let directLandlordTotal = 0;
  let centralMgmtTotal = 0;

  invoices.forEach(inv => {
    const amt = Number(inv.Total_Amount) || 0;
    totalDue += amt;
    if (inv.Status === "Paid") {
      totalCollected += amt;
    } else {
      totalPending += amt;
    }

    if (inv.Payment_Route === "Direct_Landlord") {
      directLandlordTotal += amt;
    } else {
      centralMgmtTotal += amt;
    }
  });

  const sp = PropertiesService.getScriptProperties();
  const waNumber = sp.getProperty("LANDING_WA_NUMBER") || "+6281221559000";

  return {
    success: true,
    stats: {
      totalUnits: units.length,
      occupiedUnits: occupied,
      availableUnits: available,
      occupancyRate: units.length > 0 ? ((occupied / units.length) * 100).toFixed(1) + "%" : "0%",
      activeLeases: leases.filter(l => l.Status === "Active").length,
      totalRevenueDue: totalDue,
      totalCollected: totalCollected,
      totalOutstanding: totalPending,
      directLandlordDue: directLandlordTotal,
      centralManagementDue: centralMgmtTotal,
      activeLeads: leads.length,
      openMaintenance: maintenance.filter(m => m.Status !== "Resolved").length,
      landingWaNumber: waNumber
    },
    recentInvoices: invoices.slice(-8).reverse(),
    recentLeads: leads.slice(-5).reverse(),
    recentMaintenance: maintenance.slice(-5).reverse()
  };
}

function handleCreateUnit(data) {
  if (!data || !data.unitNo || !data.tower) {
    return { success: false, error: "Tower dan Nomor Unit wajib diisi." };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("02_UNITS");
  const unitId = "UNT-" + String(data.tower).substring(0, 3).toUpperCase() + "-" + String(data.unitNo);

  sheet.appendRow([
    unitId,
    "PROP-001",
    data.tower,
    data.floor || "-",
    data.unitNo,
    data.type || "Studio Deluxe",
    "Available",
    Number(data.baseRent) || 0,
    Number(data.iplFee) || 0,
    Number(data.mgmtPercent) || 10,
    data.landlordName || "Management Pool",
    data.landlordPhone || "-",
    data.paymentRoute || "Central_Management",
    data.bankName || "BCA",
    data.bankAccountNo || "-",
    data.bankHolderName || "-"
  ]);

  return { success: true, message: "Unit baru berhasil ditambahkan!", unitId: unitId };
}

function handleUpdateUnitStatus(unitId, status) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("02_UNITS");
  const colMap = getColumnMap(sheet);
  const data = sheet.getDataRange().getValues();

  const idCol = colMap["Unit_ID"] || 1;
  const statusCol = colMap["Status"] || 7;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol - 1]).trim() === String(unitId).trim()) {
      sheet.getRange(i + 1, statusCol).setValue(status);
      return { success: true, message: "Status unit " + unitId + " diubah menjadi " + status };
    }
  }
  return { success: false, error: "Unit tidak ditemukan" };
}

function fetchLeasesList() {
  const leases = getSheetDataAsJson("04_LEASES");
  const contacts = getSheetDataAsJson("03_CONTACTS_360");
  const units = getSheetDataAsJson("02_UNITS");

  const results = leases.map(l => {
    const contact = contacts.find(c => String(c.Contact_ID).trim() === String(l.Tenant_ID).trim()) || {};
    const unit = units.find(u => String(u.Unit_ID).trim() === String(l.Unit_ID).trim()) || {};
    return {
      ...l,
      tenantName: contact.Full_Name || "Tenant",
      tenantPhone: contact.Phone_WA || "-",
      unitDisplay: unit.Unit_No ? (unit.Tower + " #" + unit.Unit_No) : l.Unit_ID
    };
  });

  return { success: true, leases: results };
}

function handleCreateLease(data) {
  if (!data || !data.unitId || !data.tenantName || !data.tenantPhone) {
    return { success: false, error: "Unit, Nama Penyewa, dan WhatsApp wajib diisi." };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const contactSheet = ss.getSheetByName("03_CONTACTS_360");
  const leaseSheet = ss.getSheetByName("04_LEASES");
  const unitSheet = ss.getSheetByName("02_UNITS");

  const cleanPhone = String(data.tenantPhone).replace(/[^0-9]/g, '');
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  
  const contactId = "CNT-" + timestamp + "-" + randomSuffix;
  const leaseId = "LS-" + new Date().getFullYear() + "-" + randomSuffix;

  contactSheet.appendRow([
    contactId,
    String(data.tenantName).trim(),
    cleanPhone,
    data.tenantEmail || "",
    "Tenant",
    100,
    "Active Lease for unit " + data.unitId,
    new Date().toISOString()
  ]);

  leaseSheet.appendRow([
    leaseId,
    data.unitId,
    contactId,
    data.startDate || "",
    data.endDate || "",
    Number(data.depositAmount) || 0,
    Number(data.monthlyRent) || 0,
    Number(data.commissionFee) || (Number(data.monthlyRent) || 0),
    data.paymentRoute || "Direct_Landlord",
    "Active",
    new Date().toISOString()
  ]);

  const unitColMap = getColumnMap(unitSheet);
  const unitData = unitSheet.getDataRange().getValues();
  const uIdCol = unitColMap["Unit_ID"] || 1;
  const uStatusCol = unitColMap["Status"] || 7;

  for (let i = 1; i < unitData.length; i++) {
    if (String(unitData[i][uIdCol - 1]).trim() === String(data.unitId).trim()) {
      unitSheet.getRange(i + 1, uStatusCol).setValue("Occupied");
      break;
    }
  }

  return { success: true, message: "Kontrak sewa berhasil dibuat!", leaseId: leaseId };
}

function handleCreateInvoice(data) {
  if (!data || !data.unitId || !data.rentFee) {
    return { success: false, error: "Unit ID dan Biaya Sewa wajib diisi." };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const invSheet = ss.getSheetByName("05_INVOICES");

  const units = getSheetDataAsJson("02_UNITS");
  const targetUnit = units.find(u => String(u.Unit_ID).trim() === String(data.unitId).trim()) || {};

  const rentFee = Number(data.rentFee) || 0;
  const utilityFee = Number(data.utilityFee) || 0;
  const iplFee = Number(data.iplFee || targetUnit.IPL_Fee || 0);
  const uniqueCode = Math.floor(100 + Math.random() * 899);
  const totalAmount = rentFee + utilityFee + iplFee + uniqueCode;

  const invSuffix = Math.floor(1000 + Math.random() * 9000);
  const invoiceId = "INV-" + new Date().getFullYear() + "-" + invSuffix;

  invSheet.appendRow([
    invoiceId,
    data.leaseId || "-",
    data.unitId,
    data.period || "Periode Berjalan",
    rentFee,
    utilityFee,
    iplFee,
    uniqueCode,
    totalAmount,
    "Unpaid",
    targetUnit.Payment_Route || "Direct_Landlord",
    targetUnit.Bank_Name || "BCA",
    targetUnit.Bank_Account_No || "-",
    targetUnit.Bank_Holder_Name || "-",
    "",
    new Date().toISOString(),
    ""
  ]);

  return { success: true, message: "Tagihan invoice berhasil diterbitkan!", invoiceId: invoiceId };
}

function fetchInvoiceById(invoiceId) {
  if (!invoiceId) return { success: false, error: "Missing invoice ID" };

  const invoices = getSheetDataAsJson("05_INVOICES");
  const inv = invoices.find(i => String(i.Invoice_ID).trim() === String(invoiceId).trim());
  if (!inv) return { success: false, error: "Invoice not found: " + invoiceId };

  const units = getSheetDataAsJson("02_UNITS");
  const unit = units.find(u => String(u.Unit_ID).trim() === String(inv.Unit_ID).trim()) || {};

  return { success: true, invoice: inv, unit: unit };
}

function handleVerifyPayment(invoiceId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("05_INVOICES");
  const colMap = getColumnMap(sheet);
  const data = sheet.getDataRange().getValues();

  const idCol = colMap["Invoice_ID"] || 1;
  const statusCol = colMap["Status"] || 10;
  const paidDateCol = colMap["Paid_Date"] || 17;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol - 1]).trim() === String(invoiceId).trim()) {
      sheet.getRange(i + 1, statusCol).setValue("Paid");
      sheet.getRange(i + 1, paidDateCol).setValue(new Date().toISOString());
      return { success: true, message: "Invoice " + invoiceId + " berhasil diverifikasi sebagai LUNAS." };
    }
  }
  return { success: false, error: "Invoice tidak ditemukan" };
}

function handleSubmitProof(invoiceId, proofUrl) {
  if (!invoiceId || !proofUrl) {
    return { success: false, error: "Missing invoice ID or proof URL" };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("05_INVOICES");
  const colMap = getColumnMap(sheet);
  const data = sheet.getDataRange().getValues();

  const idCol = colMap["Invoice_ID"] || 1;
  const statusCol = colMap["Status"] || 10;
  const proofCol = colMap["Proof_URL"] || 15;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol - 1]).trim() === String(invoiceId).trim()) {
      sheet.getRange(i + 1, statusCol).setValue("Verifying");
      sheet.getRange(i + 1, proofCol).setValue(String(proofUrl).trim());
      return { success: true, message: "Bukti transfer berhasil dikirim. Menunggu verifikasi pengelola." };
    }
  }
  return { success: false, error: "Invoice tidak ditemukan" };
}

function fetchMaintenanceTickets() {
  const tickets = getSheetDataAsJson("06_MAINTENANCE");
  const units = getSheetDataAsJson("02_UNITS");

  const results = tickets.map(t => {
    const unit = units.find(u => String(u.Unit_ID).trim() === String(t.Unit_ID).trim()) || {};
    return {
      ...t,
      unitDisplay: unit.Unit_No ? (unit.Tower + " #" + unit.Unit_No) : t.Unit_ID
    };
  });

  return { success: true, maintenance: results };
}

function handleCreateMaintenance(data) {
  if (!data || !data.unitId || !data.issueDescription) {
    return { success: false, error: "Unit dan Deskripsi Kendala wajib diisi." };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("06_MAINTENANCE");
  const ticketId = "MNT-" + Math.floor(1000 + Math.random() * 9000);

  sheet.appendRow([
    ticketId,
    data.unitId,
    data.tenantId || "Tenant",
    data.issueDescription,
    data.photoUrl || "",
    data.priority || "Medium",
    "In_Progress",
    Number(data.estimatedCost) || 0,
    data.assignedVendor || "Tim Teknisi In-House",
    new Date().toISOString(),
    ""
  ]);

  return { success: true, message: "Tiket maintenance berhasil dibuat!", ticketId: ticketId };
}

function handleUpdateMaintenanceStatus(ticketId, status) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("06_MAINTENANCE");
  const colMap = getColumnMap(sheet);
  const data = sheet.getDataRange().getValues();

  const idCol = colMap["Ticket_ID"] || 1;
  const statusCol = colMap["Status"] || 7;
  const resolvedCol = colMap["Resolved_At"] || 11;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol - 1]).trim() === String(ticketId).trim()) {
      sheet.getRange(i + 1, statusCol).setValue(status);
      if (status === "Resolved") {
        sheet.getRange(i + 1, resolvedCol).setValue(new Date().toISOString());
      }
      return { success: true, message: "Tiket " + ticketId + " diubah menjadi " + status };
    }
  }
  return { success: false, error: "Tiket tidak ditemukan" };
}

function handleCreateInspection(data) {
  if (!data || !data.unitId || !data.type) {
    return { success: false, error: "Unit dan Tipe Inspeksi wajib diisi." };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("09_INSPECTIONS");
  const inspectionId = "INSP-" + Math.floor(1000 + Math.random() * 9000);

  sheet.appendRow([
    inspectionId,
    data.unitId,
    data.leaseId || "-",
    data.type,
    data.livingRoom || "Good",
    data.bedroom || "Good",
    data.bathroom || "Good",
    data.ac || "Good",
    data.photoUrls || "",
    Number(data.depositDeduction) || 0,
    data.notes || "-",
    new Date().toISOString()
  ]);

  return { success: true, message: "Data inspeksi unit berhasil disimpan!", inspectionId: inspectionId };
}

function fetchOwnerStatementDetails(ownerName) {
  const fin = generateFinancialStatements();
  const statements = fin.data.landlordStatements || [];
  const found = statements.find(s => String(s.ownerName).toLowerCase().trim() === String(ownerName).toLowerCase().trim());

  if (!found) {
    return { success: false, error: "Statement untuk pemilik tersebut tidak ditemukan." };
  }

  return { success: true, statement: found };
}

function fetchCrmPipeline() {
  const leads = getSheetDataAsJson("07_CRM_PIPELINE");
  const contacts = getSheetDataAsJson("03_CONTACTS_360");
  const units = getSheetDataAsJson("02_UNITS");

  const fullPipeline = leads.map(lead => {
    const contact = contacts.find(c => String(c.Contact_ID).trim() === String(lead.Contact_ID).trim()) || {};
    const unit = units.find(u => String(u.Unit_ID).trim() === String(lead.Target_Unit).trim()) || {};
    return {
      ...lead,
      contactName: contact.Full_Name || "Lead",
      phone: contact.Phone_WA || "-",
      leadScore: Number(contact.Lead_Score) || 50,
      unitDetails: unit.Unit_No ? (unit.Tower + " #" + unit.Unit_No) : (lead.Target_Unit || "-")
    };
  });

  return { success: true, pipeline: fullPipeline };
}

function handleUpdateLeadStage(leadId, stage, notes) {
  if (!leadId || !stage) return { success: false, error: "Missing leadId or stage" };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("07_CRM_PIPELINE");
  const colMap = getColumnMap(sheet);
  const data = sheet.getDataRange().getValues();

  const idCol = colMap["Lead_ID"] || 1;
  const stageCol = colMap["Stage"] || 4;
  const notesCol = colMap["Interaction_Notes"] || 7;
  const updateCol = colMap["Updated_At"] || 8;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol - 1]).trim() === String(leadId).trim()) {
      sheet.getRange(i + 1, stageCol).setValue(stage);
      if (notes) {
        const existing = data[i][notesCol - 1] ? data[i][notesCol - 1] + " | " : "";
        sheet.getRange(i + 1, notesCol).setValue(existing + notes);
      }
      sheet.getRange(i + 1, updateCol).setValue(new Date().toISOString());
      return { success: true, message: "Lead " + leadId + " stage updated to " + stage };
    }
  }
  return { success: false, error: "Lead ID not found: " + leadId };
}

function handleCreateLead(data) {
  if (!data || !data.fullName || !data.phone) {
    return { success: false, error: "Full Name and WhatsApp Phone are required" };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const contactSheet = ss.getSheetByName("03_CONTACTS_360");
  const pipelineSheet = ss.getSheetByName("07_CRM_PIPELINE");

  const cleanPhone = String(data.phone).replace(/[^0-9]/g, '');
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  
  const contactId = "CNT-" + timestamp + "-" + randomSuffix;
  const leadId = "LEAD-" + timestamp + "-" + randomSuffix;

  contactSheet.appendRow([
    contactId,
    String(data.fullName).trim(),
    cleanPhone,
    data.email ? String(data.email).trim() : "",
    "Lead",
    Number(data.leadScore) || 60,
    data.notes ? String(data.notes).trim() : "Created via Web Dashboard",
    new Date().toISOString()
  ]);

  pipelineSheet.appendRow([
    leadId,
    contactId,
    data.targetUnit || "UNT-101",
    data.stage || "Inquiry",
    Number(data.budget) || 0,
    data.viewingSchedule || "",
    data.notes || "Initial lead submission",
    new Date().toISOString()
  ]);

  return { success: true, message: "Lead successfully created", leadId: leadId, contactId: contactId };
}
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/backend/Code.gs", $codeGs, $Utf8NoBomEncoding)

Write-Host "Updating backend/GeminiCRM.gs (Context Sanitization for Purged KB)..." -ForegroundColor Yellow
$geminiGs = @'
/**
 * Trose Property Manager - Rose AI Concierge Engine (v7.1)
 * Dynamic Knowledge Base & Purge / Context Sanitization
 * File: backend/GeminiCRM.gs
 */

function handleGeminiAiChat(userMessage, senderIdentifier) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const apiKey = scriptProperties.getProperty("GEMINI_API_KEY");

  // 1. Ambil Knowledge Base & Guardrails Dinamis
  const storedKb = scriptProperties.getProperty("AI_KNOWLEDGE_BASE");
  const storedGr = scriptProperties.getProperty("AI_GUARDRAILS");

  const customKnowledgeBase = storedKb !== null ? storedKb : getDefaultKnowledgeBase();
  const customGuardrails = storedGr !== null ? storedGr : getDefaultGuardrails();

  // 2. Ambil data inventori unit aktual dari tab 02_UNITS Google Sheets
  let liveUnitInventory = "";
  try {
    const units = getSheetDataAsJson("02_UNITS");
    const availableUnits = units.filter(u => u.Status === "Available");
    if (availableUnits.length > 0) {
      liveUnitInventory = "DAFTAR UNIT TERSEDIA SAAT INI (REAL-TIME SHEETS DATABASE):\n";
      availableUnits.forEach(u => {
        liveUnitInventory += `- ${u.Tower} No.${u.Unit_No} (${u.Type}): Rp${Number(u.Base_Rent).toLocaleString("id-ID")}/bln (Rute: ${u.Payment_Route}).\n`;
      });
    } else {
      liveUnitInventory = "STATUS UNIT: Semua unit kelolaan saat ini sedang terisi (Full Occupied).\n";
    }
  } catch (e) {
    liveUnitInventory = "Katalog sewa bulanan dan tahunan Kalibata City aktif.\n";
  }

  // 3. Verifikasi Identitas Pengguna (Single ID / WhatsApp)
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
      reply: generateStructuredOfflineAnswer(userMessage, customKnowledgeBase, customGuardrails)
    };
  }

  // 4. Master Directive Prompt
  const systemPrompt = `Anda adalah "Rose", Asisten Virtual AI & Leasing Concierge resmi untuk Trose Property di Superblock Apartemen Kalibata City, Jakarta Selatan.

${customKnowledgeBase ? '=== KNOWLEDGE BASE AKTIF DARI PENGELOLA ===\n' + customKnowledgeBase : '=== KNOWLEDGE BASE: Default Clean Property Context ==='}

=== LIVE INVENTORY DARI GOOGLE SHEETS ===
${liveUnitInventory}

${customGuardrails ? '=== ATURAN GUARDRAILS & KEBIJAKAN RESPON ===\n' + customGuardrails : '=== GUARDRAILS: Strict Professional Property Guidelines ==='}

=== DATA PELANGGAN TERDAFTAR ===
${verifiedCustomerContext || "PENGGUNA SAAT INI: Pengunjung umum / Belum terverifikasi."}

Panduan Respon:
1. Bersikap ramah, sopan, profesional, ringkas (maksimal 2-3 paragraf), bahasa Indonesia elegan.
2. JANGAN PERNAH membocorkan nama pemilik unit, nomor rekening landlord, atau data sewa penyewa lain.
3. Selalu prioritaskan jawaban berdasarkan data aktif di atas.`;

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
      return { success: true, reply: generateStructuredOfflineAnswer(userMessage, customKnowledgeBase, customGuardrails) };
    }
  } catch (err) {
    Logger.log("Gemini Live API Error: " + err.toString());
    return { success: true, reply: generateStructuredOfflineAnswer(userMessage, customKnowledgeBase, customGuardrails) };
  }
}

function generateStructuredOfflineAnswer(userQuery, kb, gr) {
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
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/backend/GeminiCRM.gs", $geminiGs, $Utf8NoBomEncoding)

Write-Host "Updating frontend/dashboard.html (Adding Clear / Delete Button to Studio)..." -ForegroundColor Yellow
$dashboardHtml = @'
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trose Property Manager - Admin Cockpit</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/custom.css">
</head>
<body class="bg-slate-950 text-slate-100 bg-kalibata min-h-screen">
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar Navigation -->
    <aside class="w-64 glass-panel border-r border-slate-800/80 p-5 flex flex-col justify-between hidden md:flex">
      <div>
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-rose-500/30">T</div>
          <div>
            <h1 class="font-bold text-base text-white leading-tight">Trose</h1>
            <p class="text-xs text-rose-400 font-medium">Kalibata City Admin</p>
          </div>
        </div>
        <nav class="space-y-1 text-sm font-medium">
          <a href="dashboard.html" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-rose-600 text-white font-semibold shadow-md shadow-rose-600/20">
            <span>Dashboard Cockpit</span>
          </a>
          <a href="index.html" target="_blank" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition">
            <span>Landing Page &rarr;</span>
          </a>
          <a href="inspections.html" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition">
            <span>Inspeksi Unit</span>
          </a>
          <a href="finance.html" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition">
            <span>Laporan Keuangan</span>
          </a>
          <a href="units.html" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition">
            <span>Unit Inventory</span>
          </a>
          <a href="leases.html" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition">
            <span>Lease & Tenants</span>
          </a>
          <a href="billing.html" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition">
            <span>Billing & Invoices</span>
          </a>
          <a href="maintenance.html" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition">
            <span>Maintenance</span>
          </a>
          <a href="crm.html" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition">
            <span>CRM & Acquisition</span>
          </a>
        </nav>
      </div>
      <div class="space-y-2">
        <div class="glass-card p-3 rounded-xl text-xs">
          <p class="text-slate-400 font-medium">Kalibata City Engine:</p>
          <p class="font-mono text-emerald-400 font-bold mt-0.5">Google Sheets Active</p>
        </div>
        <button onclick="logoutAdminSession()" class="w-full text-xs text-slate-400 hover:text-rose-400 p-2 text-center rounded-lg hover:bg-slate-900 transition flex items-center justify-center gap-1.5 font-semibold">
          Clear Passcode Session
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto p-6 md:p-10 space-y-8">
      <div class="max-w-7xl mx-auto space-y-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-black text-white">Kalibata City Cockpit</h2>
            <p class="text-sm text-slate-300">Portofolio & Operasional Apartemen Kalibata City</p>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="fetchDashboard()" class="px-3.5 py-2 glass-card hover:bg-slate-800 text-slate-200 text-sm font-bold rounded-xl transition">
              Refresh Data
            </button>
            <a href="crm.html" class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold rounded-xl shadow-lg transition">
              + New CRM Lead
            </a>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="glass-card p-5 rounded-3xl">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Occupancy Rate</span>
            <h3 id="stat-occupancy" class="text-2xl md:text-3xl font-extrabold text-white mt-1">0%</h3>
            <p id="stat-units" class="text-xs text-rose-400 mt-1 font-medium">0 Units</p>
          </div>
          <div class="glass-card p-5 rounded-3xl">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Rent Due</span>
            <h3 id="stat-due" class="text-2xl md:text-3xl font-extrabold text-white mt-1">Rp 0</h3>
            <p id="stat-breakdown" class="text-xs text-slate-400 mt-1 truncate">Direct vs Mgmt</p>
          </div>
          <div class="glass-card p-5 rounded-3xl">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Outstanding</span>
            <h3 id="stat-outstanding" class="text-2xl md:text-3xl font-extrabold text-amber-400 mt-1">Rp 0</h3>
            <p class="text-xs text-amber-500/80 mt-1">Menunggu Verifikasi</p>
          </div>
          <div class="glass-card p-5 rounded-3xl">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Pipeline</span>
            <h3 id="stat-leads" class="text-2xl md:text-3xl font-extrabold text-emerald-400 mt-1">0</h3>
            <p id="stat-maintenance" class="text-xs text-slate-400 mt-1">0 Open Tickets</p>
          </div>
        </div>

        <!-- PANEL AI KNOWLEDGE BASE & GUARDRAILS STUDIO -->
        <div class="glass-panel p-6 md:p-8 rounded-3xl space-y-6 border border-rose-500/30">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 class="font-extrabold text-xl text-white flex items-center gap-2.5">
                <span class="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span>
                Rose AI Knowledge Base & Guardrails Studio
              </h3>
              <p class="text-xs text-slate-400 mt-1">Kelola pengetahuan sewa, fasilitas, rincian tower, atau kosongkan (clear) data usang agar AI selalu up-to-date.</p>
            </div>
            <div class="flex items-center gap-2">
              <label class="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-2xl border border-slate-700 transition flex items-center gap-1.5">
                <span>Unggah File Dokumen (.txt/.md)</span>
                <input type="file" id="ai-file-upload" accept=".txt,.md,.json" onchange="handleAiFileUpload(event)" class="hidden">
              </label>
              <button type="button" onclick="handleClearAiConfig()" class="px-4 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-bold rounded-2xl border border-rose-800/80 transition flex items-center gap-1.5 shadow">
                <span>Hapus / Clear All Context</span>
              </button>
            </div>
          </div>

          <form id="form-ai-config" onsubmit="handleSaveAiConfig(event)" class="space-y-4">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <!-- Knowledge Base Editor -->
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider">Knowledge Base (Informasi Sewa, Tower & Fasilitas)</label>
                  <span class="text-[10px] text-slate-500 font-mono">Dinamis</span>
                </div>
                <textarea id="ai-kb-text" rows="8" placeholder="Tuliskan detail fasilitas, nama tower, jam operasional, promo sewa, dan informasi apartemen..." class="w-full px-4 py-3 bg-slate-950/90 border border-slate-700 rounded-2xl text-xs font-mono text-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none leading-relaxed"></textarea>
              </div>

              <!-- Guardrails Editor -->
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <label class="block text-xs font-bold text-rose-400 uppercase tracking-wider">Guardrails & Batasan Kebijakan (Aturan AI)</label>
                  <span class="text-[10px] text-rose-400/80 font-mono">Strict Policy</span>
                </div>
                <textarea id="ai-guardrail-text" rows="8" placeholder="1. NO DAILY RENT: Tolak dengan sopan pertanyaan sewa harian...&#10;2. PRIVASI: Dilarang membeberkan rekening landlord..." class="w-full px-4 py-3 bg-slate-950/90 border border-slate-700 rounded-2xl text-xs font-mono text-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none leading-relaxed"></textarea>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
              <div class="flex items-center gap-4">
                <button type="button" onclick="loadAiConfig()" class="text-xs text-slate-400 hover:text-slate-200 font-bold underline">
                  Muat Ulang Data Server
                </button>
                <button type="button" onclick="resetToStandardDefaults()" class="text-xs text-amber-400 hover:text-amber-300 font-bold underline">
                  Kembalikan Template Default Kalibata
                </button>
              </div>
              <button type="submit" id="btn-save-ai" class="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-rose-600/30 transition flex items-center gap-2">
                <span>Simpan Knowledge & Guardrails</span>
                <span>&rarr;</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Panel Pengaturan WhatsApp Landing Page -->
        <div class="glass-panel p-6 rounded-3xl space-y-4 border border-emerald-500/30">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h3 class="font-extrabold text-lg text-white flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                Pengaturan Nomor WhatsApp Landing Page
              </h3>
              <p class="text-xs text-slate-400">Nomor ini yang akan dihubungi oleh calon penyewa saat mengklik tombol WhatsApp di Landing Page & Widget AI.</p>
            </div>
            <span class="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/80">Real-Time Sync</span>
          </div>

          <form id="form-wa-settings" onsubmit="handleSaveWaSettings(event)" class="flex flex-col sm:flex-row gap-3 pt-2">
            <input type="text" id="admin-wa-input" required placeholder="+6281221559000" class="flex-1 px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none">
            <button type="button" onclick="testWaLink()" class="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-2xl transition border border-slate-700">
              Tes Link WA
            </button>
            <button type="submit" id="btn-save-wa" class="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-600/30 transition">
              Simpan Nomor WA
            </button>
          </form>
        </div>

        <!-- Tagihan & Rekonsiliasi Terkini -->
        <div class="bg-white text-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-extrabold text-lg text-slate-900">Tagihan & Rekonsiliasi Terkini</h3>
              <p class="text-xs text-slate-500">Mendukung Rute Transfer Langsung ke Landlord atau ke Management</p>
            </div>
            <div id="loading-indicator" class="hidden text-xs text-slate-400 animate-pulse">Menghubungkan ke Sheets...</div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="text-xs text-slate-400 uppercase border-b border-slate-200">
                <tr>
                  <th class="py-3 px-4">Invoice ID</th>
                  <th class="py-3 px-4">Unit & Periode</th>
                  <th class="py-3 px-4">Nominal (+Kode Unik)</th>
                  <th class="py-3 px-4">Status</th>
                  <th class="py-3 px-4">Rute Rekening</th>
                  <th class="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody id="table-invoices-body">
                <tr>
                  <td colspan="6" class="py-8 text-center text-slate-400 font-medium">Memuat data invoice Kalibata City...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>

  <script src="js/config.js"></script>
  <script src="js/auth.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/frontend/dashboard.html", $dashboardHtml, $Utf8NoBomEncoding)

Write-Host "Updating frontend/js/app.js (Handlers for Clear & Purge Logic)..." -ForegroundColor Yellow
$appJs = @'
/**
 * Trose Property Manager - Dashboard Logic & AI Studio Handlers (v7.1)
 * File: frontend/js/app.js
 */

async function fetchDashboard() {
  const loadingIndicator = document.getElementById("loading-indicator");
  if (loadingIndicator) loadingIndicator.classList.remove("hidden");

  try {
    const data = await gasApiCall("getDashboardData");
    if (data && data.success) {
      renderDashboard(data);
      if (loadingIndicator) loadingIndicator.classList.add("hidden");
      loadAiConfig();
      return;
    }
  } catch (err) {
    console.warn("Connecting to GAS API...", err);
  }

  if (loadingIndicator) loadingIndicator.classList.add("hidden");
  renderDashboard({
    success: true,
    stats: {
      totalUnits: 0,
      occupiedUnits: 0,
      availableUnits: 0,
      occupancyRate: "0%",
      totalRevenueDue: 0,
      totalCollected: 0,
      totalOutstanding: 0,
      directLandlordDue: 0,
      centralManagementDue: 0,
      activeLeads: 0,
      openMaintenance: 0,
      landingWaNumber: "+6281221559000"
    },
    recentInvoices: []
  });
  loadAiConfig();
}

function renderDashboard(data) {
  const s = data.stats || {};
  document.getElementById("stat-occupancy").innerText = s.occupancyRate || "0%";
  document.getElementById("stat-units").innerText = `${s.occupiedUnits || 0} / ${s.totalUnits || 0} Units`;
  document.getElementById("stat-due").innerText = `Rp ${Number(s.totalRevenueDue || 0).toLocaleString('id-ID')}`;
  document.getElementById("stat-outstanding").innerText = `Rp ${Number(s.totalOutstanding || 0).toLocaleString('id-ID')}`;
  document.getElementById("stat-leads").innerText = s.activeLeads || 0;
  document.getElementById("stat-maintenance").innerText = `${s.openMaintenance || 0} Open Tickets`;

  const waInput = document.getElementById("admin-wa-input");
  if (waInput && s.landingWaNumber) {
    waInput.value = s.landingWaNumber;
  }

  const routeBreakdown = document.getElementById("stat-breakdown");
  if (routeBreakdown) {
    routeBreakdown.innerText = `Direct Landlord: Rp ${Number(s.directLandlordDue || 0).toLocaleString('id-ID')} | Mgmt Pool: Rp ${Number(s.centralManagementDue || 0).toLocaleString('id-ID')}`;
  }

  const invTable = document.getElementById("table-invoices-body");
  if (invTable) {
    if (!data.recentInvoices || data.recentInvoices.length === 0) {
      invTable.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400 font-medium">Belum ada tagihan sewa terdaftar di Google Sheets.</td></tr>`;
      return;
    }

    invTable.innerHTML = data.recentInvoices.map(inv => `
      <tr class="border-b border-slate-100 hover:bg-slate-50 transition">
        <td class="py-3 px-4 font-semibold text-slate-800">${inv.Invoice_ID || "-"}</td>
        <td class="py-3 px-4 text-slate-600">${inv.Unit_ID || "-"} (${inv.Period || "-"})</td>
        <td class="py-3 px-4 font-mono font-medium text-slate-800">Rp ${Number(inv.Total_Amount || 0).toLocaleString('id-ID')}</td>
        <td class="py-3 px-4">
          <span class="px-2.5 py-1 text-xs font-semibold rounded-full ${
            inv.Status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
            inv.Status === 'Verifying' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
          }">
            ${inv.Status || 'Unpaid'}
          </span>
        </td>
        <td class="py-3 px-4 text-xs font-medium text-slate-500">${inv.Payment_Route || "Direct_Landlord"}</td>
        <td class="py-3 px-4 text-right space-x-2">
          ${inv.Status !== 'Paid' ? `
            <button onclick="requestVerifyPayment('${inv.Invoice_ID}')" class="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg transition">
              Verify
            </button>
          ` : ''}
          <a href="invoice-view.html?id=${inv.Invoice_ID}" target="_blank" class="text-rose-600 hover:text-rose-800 text-xs font-bold underline inline-block py-1">
            Buka &rarr;
          </a>
        </td>
      </tr>
    `).join('');
  }
}

// AI KNOWLEDGE BASE & GUARDRAILS LOGIC
async function loadAiConfig() {
  const kbArea = document.getElementById("ai-kb-text");
  const grArea = document.getElementById("ai-guardrail-text");
  if (!kbArea || !grArea) return;

  try {
    const res = await gasApiCall("getAiConfig", {}, "GET");
    if (res && res.success) {
      kbArea.value = res.knowledgeBase || "";
      grArea.value = res.guardrails || "";
      return;
    }
  } catch (err) {
    console.warn("GAS getAiConfig fallback:", err);
  }
}

function resetToStandardDefaults() {
  const kbArea = document.getElementById("ai-kb-text");
  const grArea = document.getElementById("ai-guardrail-text");
  if (kbArea) {
    kbArea.value = "SUPERBLOCK KALIBATA CITY INFORMATION:\n" +
      "- 18 Tower Total: Akasia, Borneo, Cendana, Damar, Ebony, Flamboyan, Gaharu, Hebras, Kemuning, Jasmine, Lotus, Mawar, Nusa Indah, Palem, Raffles, Sakura, Tulip, Viola.\n" +
      "- Tower Green Palace (Mawar s/d Viola) memiliki akses kolam renang tematik & gym indoor.\n" +
      "- Tarif Sewa Bulanan: Studio (Rp 2.8Jt - 3.5Jt/bln), 2BR Standard (Rp 3.8Jt - 4.5Jt/bln), 2BR Green Palace (Rp 4.5Jt - 5.5Jt/bln).\n" +
      "- Seluruh unit Full Furnished (AC, springbed, lemari, kitchen set, kulkas, TV).\n" +
      "- Mall Kalibata City Square (KCS), XXI, Farmers Market di bawah hunian.\n" +
      "- Stasiun KRL Duren Kalibata berjarak 200m (2 menit jalan kaki).";
  }
  if (grArea) {
    grArea.value = "1. NO DAILY RENTALS: Tolak dengan sopan pertanyaan sewa harian/transit/per malam. Jelaskan bahwa Trose Property hanya menyediakan sewa bulanan dan tahunan demi keamanan & kenyamanan.\n" +
      "2. STRICT PROPERTY DOMAIN: Hanya jawab seputar properti, fasilitas, sewa, dan jadwal viewing di Kalibata City.\n" +
      "3. PRIVACY PROTECTION: Dilarang membeberkan nama pemilik unit atau nomor rekening pribadi landlord kepada publik.\n" +
      "4. VERIFICATION PROTOCOL: Data privat penyewa (masa sewa, sisa tagihan) hanya boleh dijawab jika Single ID (CNT-XXXX) atau No WA cocok di database.\n" +
      "5. LEAD CAPTURE: Arahkan pengguna menjadwalkan survei unit (viewing) atau klik tombol WhatsApp Admin.";
  }
  showToast("Template default Kalibata City dimuat ke editor!");
}

async function handleSaveAiConfig(e) {
  e.preventDefault();
  const kbVal = document.getElementById("ai-kb-text").value.trim();
  const grVal = document.getElementById("ai-guardrail-text").value.trim();
  const btn = document.getElementById("btn-save-ai");

  ensureAdminPasscode(async () => {
    btn.disabled = true;
    btn.innerText = "Menyimpan ke AI Engine...";

    try {
      const res = await gasApiCall("saveAiConfig", { knowledgeBase: kbVal, guardrails: grVal }, "POST");
      if (res && res.success) {
        showToast(res.message || "Knowledge Base & Guardrails Rose AI berhasil diperbarui!");
      } else {
        showToast(res.error || "Gagal menyimpan konfigurasi AI", "error");
      }
    } catch (err) {
      showToast("Error menghubungi server Apps Script", "error");
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<span>Simpan Knowledge & Guardrails</span><span>&rarr;</span>`;
    }
  });
}

function handleClearAiConfig() {
  if (!confirm("PERINGATAN: Apakah Anda yakin ingin MENGHAPUS / MENGOSONGKAN seluruh Knowledge Base dan Guardrails yang tersimpan di server? Data lama yang obsolete akan dihapus secara permanen.")) {
    return;
  }

  ensureAdminPasscode(async () => {
    try {
      const res = await gasApiCall("clearAiConfig", {}, "POST");
      if (res && res.success) {
        document.getElementById("ai-kb-text").value = "";
        document.getElementById("ai-guardrail-text").value = "";
        showToast("Seluruh Knowledge Base & Guardrails berhasil dikosongkan!");
      } else {
        showToast(res.error || "Gagal mengosongkan AI Config", "error");
      }
    } catch (err) {
      showToast("Error saat menghubungi server", "error");
    }
  });
}

function handleAiFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const content = e.target.result;
    const kbArea = document.getElementById("ai-kb-text");
    if (kbArea) {
      kbArea.value = content;
      showToast(`File ${file.name} berhasil diunggah ke editor Knowledge Base!`);
    }
  };
  reader.readAsText(file);
}

async function handleSaveWaSettings(e) {
  e.preventDefault();
  const input = document.getElementById("admin-wa-input");
  const val = input.value.trim();
  if (!val) return;

  const btn = document.getElementById("btn-save-wa");
  btn.disabled = true;
  btn.innerText = "Menyimpan...";

  try {
    const res = await gasApiCall("updatePublicSettings", { waNumber: val }, "POST");
    if (res && res.success) {
      showToast(res.message || "Nomor WhatsApp berhasil diperbarui!");
      OFFICIAL_WA_NUMBER = val;
    } else {
      showToast(res.error || "Gagal memperbarui nomor WA", "error");
    }
  } catch (err) {
    showToast("Error saat menghubungi server", "error");
  } finally {
    btn.disabled = false;
    btn.innerText = "Simpan Nomor WA";
  }
}

function testWaLink() {
  const input = document.getElementById("admin-wa-input");
  const val = input ? input.value.trim() : OFFICIAL_WA_NUMBER;
  const url = `https://wa.me/${val.replace(/[^0-9]/g, '')}?text=Tes%20koneksi%20WhatsApp%20Trose%20Property`;
  window.open(url, '_blank');
}

function requestVerifyPayment(invoiceId) {
  ensureAdminPasscode(async () => {
    if (!confirm(`Verifikasi pembayaran untuk invoice ${invoiceId} sebagai LUNAS?`)) return;

    try {
      const res = await gasApiCall("verifyPayment", { invoiceId: invoiceId }, "POST");
      if (res && res.success) {
        showToast(res.message || "Invoice berhasil diverifikasi!");
        fetchDashboard();
      } else {
        showToast(res.error || "Gagal verifikasi pembayaran", "error");
      }
    } catch (err) {
      showToast("Error menghubungi server", "error");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("stat-occupancy")) {
    fetchDashboard();
  }
});
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/frontend/js/app.js", $appJs, $Utf8NoBomEncoding)

Write-Host "`n[SUCCESS] Feature v7.1 applied: Clear/Delete All AI Knowledge & Guardrails is ready!" -ForegroundColor Green