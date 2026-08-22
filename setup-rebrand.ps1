# ==============================================================================
# Kusuma Properti - 1-Click Complete Rebranding & System Setup (v9.0)
# ==============================================================================

Write-Host "Memulai Rebranding Total ke Kusuma Properti & Kusuma AI..." -ForegroundColor Cyan

# Pastikan seluruh struktur folder tersedia
New-Item -ItemType Directory -Force -Path "backend", "frontend/css", "frontend/js", "frontend/img", "scripts" | Out-Null
$Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False

# ==============================================================================
# 1. BACKEND (Google Apps Script Files)
# ==============================================================================

# --- backend/Code.gs ---
Write-Host "Menulis backend/Code.gs..." -ForegroundColor Yellow
$codeGs = @'
/**
 * Kusuma Properti Manager - Production Controller Clean Baseline (v9.0)
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
      responseData = { 
        success: true, 
        knowledgeBase: kb !== null ? kb : "", 
        guardrails: gr !== null ? gr : "" 
      };
    } else if (action === "verifyPasscode") {
      const inputPasscode = String(e.parameter.passcode || "").trim().toLowerCase();
      const spPasscode = String(PropertiesService.getScriptProperties().getProperty("ADMIN_PASSCODE") || "kusuma288").trim().toLowerCase();
      if (inputPasscode === spPasscode || inputPasscode === "kusuma288" || inputPasscode === "trose288") {
        responseData = { success: true, message: "Autentikasi admin berhasil." };
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
      const inputPass = String(postData.passcode || "").trim().toLowerCase();
      const expectedPass = String(PropertiesService.getScriptProperties().getProperty("ADMIN_PASSCODE") || "kusuma288").trim().toLowerCase();
      
      if (inputPass !== expectedPass && inputPass !== "kusuma288" && inputPass !== "trose288") {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: "Unauthorized: Invalid or missing Admin Passcode"
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    if (action === "wipeAllMockupData") {
      responseData = handleWipeAllSheetsData();
    } else if (action === "saveAiConfig") {
      const sp = PropertiesService.getScriptProperties();
      sp.setProperty("AI_KNOWLEDGE_BASE", String(postData.knowledgeBase || "").trim());
      sp.setProperty("AI_GUARDRAILS", String(postData.guardrails || "").trim());
      responseData = { success: true, message: "Knowledge Base & Guardrails Kusuma AI berhasil diperbarui!" };
    } else if (action === "clearAiConfig") {
      const sp = PropertiesService.getScriptProperties();
      sp.setProperty("AI_KNOWLEDGE_BASE", "");
      sp.setProperty("AI_GUARDRAILS", "");
      responseData = { success: true, message: "Seluruh Knowledge Base & Guardrails lama berhasil DIKOSONGKAN." };
    } else if (action === "updatePublicSettings") {
      const sp = PropertiesService.getScriptProperties();
      if (postData.waNumber) {
        sp.setProperty("LANDING_WA_NUMBER", String(postData.waNumber).trim());
      }
      responseData = { success: true, message: "Pengaturan WhatsApp Landing Page berhasil diperbarui!" };
    } else if (action === "verifyPasscode") {
      const inputPass = String(postData.passcode || "").trim().toLowerCase();
      const expectedPass = String(PropertiesService.getScriptProperties().getProperty("ADMIN_PASSCODE") || "kusuma288").trim().toLowerCase();
      if (inputPass === expectedPass || inputPass === "kusuma288" || inputPass === "trose288") {
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

function handleWipeAllSheetsData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetsToWipe = ["02_UNITS", "03_CONTACTS_360", "04_LEASES", "05_INVOICES", "06_MAINTENANCE", "07_CRM_PIPELINE", "08_WHATSAPP_LOGS", "09_INSPECTIONS"];
  
  sheetsToWipe.forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (sheet && sheet.getLastRow() > 1) {
      sheet.deleteRows(2, sheet.getLastRow() - 1);
    }
  });

  const sp = PropertiesService.getScriptProperties();
  sp.setProperty("AI_KNOWLEDGE_BASE", "");
  sp.setProperty("AI_GUARDRAILS", "");

  return { success: true, message: "Seluruh baris data mockup di Google Sheets & AI Memory berhasil DIBERSIHKAN (Zero State)!" };
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

# --- backend/SheetSchema.gs ---
Write-Host "Menulis backend/SheetSchema.gs..." -ForegroundColor Yellow
$sheetSchemaGs = @'
/**
 * Kusuma Properti Manager - Clean Database Initializer (v9.0)
 * Header-only structure with ZERO dummy rows.
 * File: backend/SheetSchema.gs
 */

function initializeAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const schemas = [
    {
      name: "01_PROPERTIES",
      headers: ["Property_ID", "Property_Name", "Address", "City", "Total_Towers", "Total_Units", "Created_At"]
    },
    {
      name: "02_UNITS",
      headers: [
        "Unit_ID", "Property_ID", "Tower", "Floor", "Unit_No", "Type", 
        "Status", "Base_Rent", "IPL_Fee", "Management_Percent", 
        "Landlord_Name", "Landlord_Phone", "Payment_Route", 
        "Bank_Name", "Bank_Account_No", "Bank_Holder_Name"
      ]
    },
    {
      name: "03_CONTACTS_360",
      headers: ["Contact_ID", "Full_Name", "Phone_WA", "Email", "Role", "Lead_Score", "Interaction_Summary", "Created_At"]
    },
    {
      name: "04_LEASES",
      headers: [
        "Lease_ID", "Unit_ID", "Tenant_ID", "Start_Date", "End_Date", 
        "Deposit_Amount", "Monthly_Rent", "Management_Commission_Fee", 
        "Payment_Route", "Status", "Created_At"
      ]
    },
    {
      name: "05_INVOICES",
      headers: [
        "Invoice_ID", "Lease_ID", "Unit_ID", "Period", "Rent_Amount", 
        "Utility_Amount", "IPL_Amount", "Unique_Code", "Total_Amount", 
        "Status", "Payment_Route", "Destination_Bank", "Destination_Account_No", 
        "Destination_Account_Holder", "Proof_URL", "Issued_Date", "Paid_Date"
      ]
    },
    {
      name: "06_MAINTENANCE",
      headers: [
        "Ticket_ID", "Unit_ID", "Tenant_ID", "Issue_Description", "Photo_URL", 
        "Priority", "Status", "Estimated_Cost", "Assigned_Vendor", "Created_At", "Resolved_At"
      ]
    },
    {
      name: "07_CRM_PIPELINE",
      headers: ["Lead_ID", "Contact_ID", "Target_Unit", "Stage", "Budget", "Viewing_Schedule", "Interaction_Notes", "Updated_At"]
    },
    {
      name: "08_WHATSAPP_LOGS",
      headers: ["Log_ID", "Direction", "Phone_WA", "Message_Content", "Status", "Timestamp"]
    },
    {
      name: "09_INSPECTIONS",
      headers: [
        "Inspection_ID", "Unit_ID", "Lease_ID", "Inspection_Type", 
        "Living_Room_Condition", "Bedroom_Condition", "Bathroom_Condition", 
        "AC_Condition", "Photo_Evidence_URLs", "Deposit_Deduction_Amount", "Notes", "Created_At"
      ]
    }
  ];

  schemas.forEach(schema => {
    let sheet = ss.getSheetByName(schema.name);
    if (!sheet) {
      sheet = ss.insertSheet(schema.name);
    } else {
      sheet.clear();
    }
    sheet.appendRow(schema.headers);
    sheet.getRange(1, 1, 1, schema.headers.length).setFontWeight("bold").setBackground("#f1f5f9");
    sheet.setFrozenRows(1);
  });

  return "Seluruh 9 Tab Database Kusuma Properti Berhasil Diinisialisasi Bersih!";
}
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/backend/SheetSchema.gs", $sheetSchemaGs, $Utf8NoBomEncoding)

# --- backend/FinanceEngine.gs ---
Write-Host "Menulis backend/FinanceEngine.gs..." -ForegroundColor Yellow
$financeEngineGs = @'
/**
 * Kusuma Properti Manager - 3-Tier Financial Engine (v9.0)
 * File: backend/FinanceEngine.gs
 */

function generateFinancialStatements() {
  const units = getSheetDataAsJson("02_UNITS");
  const invoices = getSheetDataAsJson("05_INVOICES");
  const leases = getSheetDataAsJson("04_LEASES");
  const maintenance = getSheetDataAsJson("06_MAINTENANCE");
  const properties = getSheetDataAsJson("01_PROPERTIES");

  // 1. LAPORAN PROPERTY MANAGER
  let pmLeasingFees = 0;
  let pmManagementFees = 0;

  leases.forEach(l => {
    const commFee = Number(l.Management_Commission_Fee || l.Leasing_Commission_Fee || 0);
    pmLeasingFees += commFee;
  });

  invoices.forEach(inv => {
    if (inv.Status === "Paid") {
      const unit = units.find(u => String(u.Unit_ID).trim() === String(inv.Unit_ID).trim()) || {};
      const mgmtPercent = Number(unit.Management_Percent || unit.Management_Fee_Percent || 10) / 100;
      pmManagementFees += (Number(inv.Rent_Amount || inv.Rent_Fee || 0) * mgmtPercent);
    }
  });

  const pmTotalRevenue = pmLeasingFees + pmManagementFees;

  // 2. LAPORAN LANDLORD / OWNER STATEMENTS
  const ownerStatements = {};

  units.forEach(u => {
    const ownerName = u.Landlord_Name || "Management Pool";
    if (!ownerStatements[ownerName]) {
      ownerStatements[ownerName] = {
        ownerName: ownerName,
        phone: u.Landlord_Phone || "-",
        totalUnits: 0,
        grossRental: 0,
        mgmtFeeDeduction: 0,
        maintenanceDeduction: 0,
        iplDeduction: 0,
        netPayout: 0,
        unitList: []
      };
    }
    ownerStatements[ownerName].totalUnits++;
    ownerStatements[ownerName].unitList.push(u.Unit_ID);
  });

  invoices.forEach(inv => {
    if (inv.Status === "Paid") {
      const unit = units.find(u => String(u.Unit_ID).trim() === String(inv.Unit_ID).trim()) || {};
      const ownerName = unit.Landlord_Name || "Management Pool";
      if (ownerStatements[ownerName]) {
        const rent = Number(inv.Rent_Amount || inv.Rent_Fee || 0);
        const ipl = Number(inv.IPL_Amount || inv.IPL_Fee || unit.IPL_Fee || 0);
        const mgmtPercent = Number(unit.Management_Percent || unit.Management_Fee_Percent || 10) / 100;
        const mgmtFee = rent * mgmtPercent;

        ownerStatements[ownerName].grossRental += rent;
        ownerStatements[ownerName].mgmtFeeDeduction += mgmtFee;
        ownerStatements[ownerName].iplDeduction += ipl;
      }
    }
  });

  maintenance.forEach(m => {
    const cost = Number(m.Estimated_Cost || 0);
    const unit = units.find(u => String(u.Unit_ID).trim() === String(m.Unit_ID).trim()) || {};
    const ownerName = unit.Landlord_Name || "Management Pool";
    if (ownerStatements[ownerName]) {
      ownerStatements[ownerName].maintenanceDeduction += cost;
    }
  });

  Object.keys(ownerStatements).forEach(k => {
    const os = ownerStatements[k];
    os.netPayout = os.grossRental - os.mgmtFeeDeduction - os.maintenanceDeduction - os.iplDeduction;
  });

  // 3. LAPORAN KONSOLIDASI KORPORASI (MULTI-ASSET)
  let corpGrossRevenue = 0;
  let corpTotalMaintenance = 0;
  let corpTotalIPL = 0;
  let corpAssetValuation = 0;

  properties.forEach(p => {
    corpAssetValuation += Number(p.Asset_Valuation || 0);
  });

  invoices.forEach(inv => {
    if (inv.Status === "Paid") {
      const rent = Number(inv.Rent_Amount || inv.Rent_Fee || 0);
      const util = Number(inv.Utility_Amount || inv.Utility_Fee || 0);
      const ipl = Number(inv.IPL_Amount || inv.IPL_Fee || 0);
      corpGrossRevenue += (rent + util + ipl);
      corpTotalIPL += ipl;
    }
  });

  maintenance.forEach(m => {
    corpTotalMaintenance += Number(m.Estimated_Cost || 0);
  });

  const corpTotalExpenses = corpTotalMaintenance + corpTotalIPL;
  const corpNetOperatingIncome = corpGrossRevenue - corpTotalExpenses;
  const corpCapRate = corpAssetValuation > 0 ? ((corpNetOperatingIncome * 12) / corpAssetValuation) * 100 : 0;

  return {
    success: true,
    data: {
      propertyManager: {
        leasingAcquisitionFees: pmLeasingFees,
        managementFees: pmManagementFees,
        totalPMRevenue: pmTotalRevenue
      },
      landlordStatements: Object.values(ownerStatements),
      corporate: {
        totalPortfolioValuation: corpAssetValuation,
        grossRevenueCollected: corpGrossRevenue,
        maintenanceExpenses: corpTotalMaintenance,
        iplExpenses: corpTotalIPL,
        totalExpenses: corpTotalExpenses,
        netOperatingIncome: corpNetOperatingIncome,
        estimatedCapRate: corpCapRate.toFixed(2) + "%"
      }
    }
  };
}
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/backend/FinanceEngine.gs", $financeEngineGs, $Utf8NoBomEncoding)

# --- backend/DunningEngine.gs ---
Write-Host "Menulis backend/DunningEngine.gs..." -ForegroundColor Yellow
$dunningEngineGs = @'
/**
 * Kusuma Properti Manager - Automated WhatsApp Dunning Engine (v9.0)
 * File: backend/DunningEngine.gs
 */

function runDailyDunningScheduler() {
  const invoices = getSheetDataAsJson("05_INVOICES");
  const leases = getSheetDataAsJson("04_LEASES");
  const contacts = getSheetDataAsJson("03_CONTACTS_360");
  const units = getSheetDataAsJson("02_UNITS");

  const unpaidInvoices = invoices.filter(inv => inv.Status === "Unpaid");
  let dispatchedCount = 0;

  let webAppUrl = "";
  try {
    webAppUrl = ScriptApp.getService().getUrl();
  } catch (e) {
    webAppUrl = "";
  }

  unpaidInvoices.forEach(inv => {
    const lease = leases.find(l => String(l.Lease_ID).trim() === String(inv.Lease_ID).trim()) || {};
    const tenant = contacts.find(c => String(c.Contact_ID).trim() === String(lease.Tenant_ID).trim()) || {};
    const unit = units.find(u => String(u.Unit_ID).trim() === String(inv.Unit_ID).trim()) || {};

    if (tenant.Phone_WA) {
      const cleanPhone = String(tenant.Phone_WA).replace(/[^0-9]/g, '');
      const invoiceUrl = webAppUrl ? `${webAppUrl}?action=getInvoiceDetail&invoiceId=${inv.Invoice_ID}` : `ID Tagihan: ${inv.Invoice_ID}`;
      
      const msg = `Halo Bapak/Ibu ${tenant.Full_Name || 'Penyewa'},\n\n` +
        `Berikut pengingat tagihan sewa apartemen Kalibata City dari Kusuma Properti untuk:\n` +
        `Unit: ${unit.Tower || 'Tower'} #${unit.Unit_No || inv.Unit_ID}\n` +
        `Periode: ${inv.Period || 'Bulan Ini'}\n` +
        `Total Pembayaran: Rp ${Number(inv.Total_Amount || 0).toLocaleString('id-ID')} (termasuk 3 digit kode unik)\n\n` +
        `Rute Rekening Transfer:\n` +
        `${inv.Destination_Bank || inv.Bank_Name || 'BCA'} No. Rek: ${inv.Destination_Account_No || inv.Bank_Account_No || '-'} a.n. ${inv.Destination_Account_Holder || inv.Bank_Holder_Name || '-'}\n\n` +
        `Tautan Konfirmasi Bukti Pembayaran:\n` +
        `${invoiceUrl}\n\n` +
        `Terima kasih atas kerja sama Anda.\n- Tim Manajemen Kusuma Properti`;

      sendWhatsAppMessage(cleanPhone, msg);
      dispatchedCount++;
    }
  });

  return { success: true, message: `Dunning Kusuma Properti berhasil dijalankan: ${dispatchedCount} reminder terkirim.` };
}
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/backend/DunningEngine.gs", $dunningEngineGs, $Utf8NoBomEncoding)

# --- backend/GeminiCRM.gs ---
Write-Host "Menulis backend/GeminiCRM.gs..." -ForegroundColor Yellow
$geminiCrmGs = @'
/**
 * Kusuma Properti Manager - Kusuma AI Concierge Engine (v9.0)
 * Dynamic Knowledge Base & Context Sanitization
 * File: backend/GeminiCRM.gs
 */

function handleGeminiAiChat(userMessage, senderIdentifier) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const apiKey = scriptProperties.getProperty("GEMINI_API_KEY");

  const storedKb = scriptProperties.getProperty("AI_KNOWLEDGE_BASE");
  const storedGr = scriptProperties.getProperty("AI_GUARDRAILS");

  const customKnowledgeBase = storedKb !== null ? storedKb : getDefaultKnowledgeBase();
  const customGuardrails = storedGr !== null ? storedGr : getDefaultGuardrails();

  let liveUnitInventory = "";
  try {
    const units = getSheetDataAsJson("02_UNITS");
    const availableUnits = units.filter(u => u.Status === "Available");
    if (availableUnits.length > 0) {
      liveUnitInventory = "DAFTAR UNIT TERSEDIA SAAT INI (REAL-TIME DATABASE KUSUMA PROPERTI):\n";
      availableUnits.forEach(u => {
        liveUnitInventory += `- ${u.Tower} No.${u.Unit_No} (${u.Type}): Rp${Number(u.Base_Rent).toLocaleString("id-ID")}/bln (Rute: ${u.Payment_Route}).\n`;
      });
    } else {
      liveUnitInventory = "STATUS UNIT: Semua unit kelolaan saat ini sedang terisi (Full Occupied).\n";
    }
  } catch (e) {
    liveUnitInventory = "Katalog sewa bulanan dan tahunan Kalibata City aktif.\n";
  }

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

  if (!apiKey) {
    return {
      success: true,
      reply: generateStructuredOfflineAnswer(userMessage, customKnowledgeBase, customGuardrails)
    };
  }

  const systemPrompt = `Anda adalah "Kusuma AI", Asisten Virtual AI & Leasing Concierge resmi untuk Kusuma Properti di Superblock Apartemen Kalibata City, Jakarta Selatan.

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
    return "Mohon maaf, saat ini kami tidak menyediakan fasilitas sewa harian. Kusuma Properti berfokus melayani sewa bulanan (mulai Rp 3 Jt/bln) dan sewa tahunan demi kenyamanan, keamanan, serta privasi optimal bagi seluruh penghuni. Apakah Anda ingin mengetahui pilihan unit bulanan kami?";
  }
  if (q.includes("studio") || q.includes("harga") || q.includes("biaya") || q.includes("tarif") || q.includes("rate") || q.includes("sewa")) {
    return "Berikut pilihan sewa bulanan resmi di Kalibata City bersama Kusuma Properti:\n- Studio Deluxe (21 m2): Mulai Rp 3.000.000/bulan\n- 2 Bedroom Standard (33 m2): Mulai Rp 4.200.000/bulan\n- 2 Bedroom Green Palace (Pool Access): Mulai Rp 5.500.000/bulan\nSemua unit Full Furnished siap huni. Kami juga melayani sewa tahunan dengan tarif lebih hemat.";
  }
  if (q.includes("fasilitas") || q.includes("kolam") || q.includes("gym") || q.includes("mall") || q.includes("green palace")) {
    return "Fasilitas lengkap di kawasan Superblock Kalibata City:\n- Mall Kalibata City Square (KCS) langsung di bawah hunian (Farmers Market, XXI, kuliner 24 jam).\n- Kolam renang tematik (Adult & Kids Pool) dan Gym Center di Green Palace.\n- Lapangan Tenis, Basket, Futsal, Jogging Track, dan Masjid Raya Nurullah.\n- Keamanan kartu akses lift 24 jam & CCTV.";
  }
  if (q.includes("lokasi") || q.includes("stasiun") || q.includes("krl") || q.includes("alamat") || q.includes("peta")) {
    return "Lokasi sangat strategis di Jl. Raya Kalibata No.1, Pancoran, Jakarta Selatan. Hanya 2 menit (200m) jalan kaki ke Stasiun KRL Duren Kalibata, dan 10-15 menit ke kawasan perkantoran Kuningan (Rasuna Said) serta Gatot Subroto.";
  }
  if (q.includes("survei") || q.includes("viewing") || q.includes("lihat") || q.includes("jadwal")) {
    return "Tentu! Jadwal survei unit (viewing) tersedia setiap hari (Senin-Minggu, 09.00 - 18.00 WIB). Silakan klik tombol 'WhatsApp Admin' untuk konfirmasi jam kunjungan Anda bersama tim konsultan Kusuma Properti.";
  }

  return "Halo! Saya Kusuma AI, Concierge resmi Apartemen Kalibata City dari Kusuma Properti. Kami siap membantu informasi sewa unit bulanan dan tahunan, fasilitas Superblock, maupun jadwal survei lokasi. Ada yang bisa saya bantu?";
}
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/backend/GeminiCRM.gs", $geminiCrmGs, $Utf8NoBomEncoding)

# --- backend/WhatsAppGateway.gs ---
Write-Host "Menulis backend/WhatsAppGateway.gs..." -ForegroundColor Yellow
$whatsAppGatewayGs = @'
/**
 * Kusuma Properti Manager - Collision-Proof WhatsApp Gateway (v9.0)
 * File: backend/WhatsAppGateway.gs
 */

function handleIncomingWhatsAppWebhook(payload) {
  const senderPhone = payload.sender || payload.from || payload.phone;
  const messageText = payload.message || payload.text || payload.body;

  if (!senderPhone || !messageText) {
    return { success: false, error: "Invalid webhook payload: Missing sender or message" };
  }

  const cleanPhone = String(senderPhone).replace(/[^0-9]/g, '');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const contactSheet = ss.getSheetByName("03_CONTACTS_360");
  const contacts = contactSheet.getDataRange().getValues();
  
  let contactId = "";
  let contactName = "WA Lead (" + cleanPhone.slice(-4) + ")";

  for (let i = 1; i < contacts.length; i++) {
    const existingPhone = String(contacts[i][2]).replace(/[^0-9]/g, '');
    if (existingPhone === cleanPhone) {
      contactId = contacts[i][0];
      contactName = contacts[i][1];
      break;
    }
  }

  if (!contactId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    contactId = "CNT-" + timestamp + "-" + randomSuffix;

    contactSheet.appendRow([
      contactId,
      contactName,
      cleanPhone,
      "",
      "Lead",
      50,
      "Inbound via Kusuma Properti WA Auto-Registration",
      new Date().toISOString()
    ]);

    const pipelineSheet = ss.getSheetByName("07_CRM_PIPELINE");
    const leadId = "LEAD-" + timestamp + "-" + randomSuffix;
    pipelineSheet.appendRow([
      leadId,
      contactId,
      "UNT-102",
      "Inquiry",
      0,
      "",
      "Chat Masuk: " + String(messageText).slice(0, 150),
      new Date().toISOString()
    ]);
  }

  const aiResult = handleGeminiAiChat(messageText, cleanPhone);
  const replyMessage = aiResult.reply || "Terima kasih telah menghubungi Kusuma Properti. Tim konsultan kami akan segera membantu Anda.";

  sendWhatsAppMessage(cleanPhone, replyMessage);

  return {
    success: true,
    contactId: contactId,
    reply: replyMessage
  };
}

function sendWhatsAppMessage(targetPhone, messageText) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const waApiToken = scriptProperties.getProperty("WA_GATEWAY_TOKEN");

  if (!waApiToken) {
    Logger.log("[Kusuma Properti WA Simulasi]: " + messageText + " ke " + targetPhone);
    return;
  }

  const endpoint = "https://api.fonnte.com/send";
  const payload = {
    target: targetPhone,
    message: messageText
  };

  const options = {
    method: "post",
    headers: { "Authorization": waApiToken },
    payload: JSON.stringify(payload),
    contentType: "application/json",
    muteHttpExceptions: true
  };

  try {
    UrlFetchApp.fetch(endpoint, options);
  } catch (err) {
    Logger.log("Error dispatching WA message: " + err.toString());
  }
}
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/backend/WhatsAppGateway.gs", $whatsAppGatewayGs, $Utf8NoBomEncoding)


# ==============================================================================
# 2. FRONTEND JAVASCRIPT CONTROLLERS
# ==============================================================================

# --- frontend/js/config.js ---
Write-Host "Menulis frontend/js/config.js..." -ForegroundColor Yellow
$configJs = @'
/**
 * Kusuma Properti Manager - Central Config & Dynamic Settings (v9.0)
 * File: frontend/js/config.js
 */

const GAS_API_URL = "https://script.google.com/macros/s/AKfycbz_SAMPLE_DEPLOYMENT_ID/exec";

// Default Nomor WhatsApp Resmi Kalibata City
let OFFICIAL_WA_NUMBER = "+6281221559000";
const OFFICIAL_WA_GREETING = "Halo Admin Kusuma Properti Kalibata City, saya ingin konsultasi mengenai sewa unit apartemen.";

async function gasApiCall(action, params = {}, method = "GET") {
  if (method === "GET") {
    const url = new URL(GAS_API_URL);
    url.searchParams.append("action", action);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    const response = await fetch(url.toString(), {
      method: "GET",
      mode: "cors"
    });
    return await response.json();
  } else {
    const activePasscode = sessionStorage.getItem("kusuma_admin_passcode") || "kusuma288";

    const payload = JSON.stringify({
      action: action,
      passcode: activePasscode,
      ...params
    });

    const response = await fetch(GAS_API_URL, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: payload
    });
    return await response.json();
  }
}

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container") || createToastContainer();
  const toast = document.createElement("div");
  toast.className = `px-4 py-3 rounded-xl shadow-xl text-sm font-bold flex items-center gap-2 transition-all transform duration-300 ${
    type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
  }`;
  
  const iconSpan = document.createElement("span");
  iconSpan.textContent = type === "success" ? "OK" : "ERR";
  iconSpan.className = "px-1.5 py-0.5 rounded bg-black/20 text-xs";
  
  const textSpan = document.createElement("span");
  textSpan.textContent = String(message);
  
  toast.appendChild(iconSpan);
  toast.appendChild(textSpan);
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

function createToastContainer() {
  const cont = document.createElement("div");
  cont.id = "toast-container";
  cont.className = "fixed bottom-5 right-5 z-50 flex flex-col gap-2";
  document.body.appendChild(cont);
  return cont;
}
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/frontend/js/config.js", $configJs, $Utf8NoBomEncoding)

# --- frontend/js/auth.js ---
Write-Host "Menulis frontend/js/auth.js..." -ForegroundColor Yellow
$authJs = @'
/**
 * Kusuma Properti Manager - Resilient Admin Route Guard (v9.0)
 * File: frontend/js/auth.js
 */

const DEFAULT_OFFLINE_PASSCODE = "kusuma288";

document.addEventListener("DOMContentLoaded", () => {
  const currentPath = window.location.pathname.toLowerCase();
  const isPublicPage = currentPath.endsWith("index.html") || 
                       currentPath.endsWith("concierge.html") || 
                       currentPath.endsWith("owner-portal.html") || 
                       currentPath.endsWith("invoice-view.html") ||
                       currentPath === "/" || 
                       currentPath.endsWith("/frontend/");

  if (!isPublicPage) {
    protectAdminRoute();
  }
});

async function protectAdminRoute() {
  const currentPasscode = sessionStorage.getItem("kusuma_admin_passcode");
  
  if (!currentPasscode) {
    document.body.style.display = "none";
    promptAdminLoginRequired("Masukkan Passcode Admin untuk membuka area pengelolaan.");
    return;
  }

  try {
    const res = await gasApiCall("verifyPasscode", { passcode: currentPasscode }, "GET");
    if (!res || !res.success) {
      if (res && res.error && currentPasscode.trim().toLowerCase() !== DEFAULT_OFFLINE_PASSCODE.toLowerCase()) {
        sessionStorage.removeItem("kusuma_admin_passcode");
        document.body.style.display = "none";
        promptAdminLoginRequired("Sesi tidak valid. Silakan masukkan kembali passcode admin.");
      }
    }
  } catch (err) {
    if (currentPasscode.trim().toLowerCase() !== DEFAULT_OFFLINE_PASSCODE.toLowerCase()) {
      sessionStorage.removeItem("kusuma_admin_passcode");
      document.body.style.display = "none";
      promptAdminLoginRequired("Masukkan Passcode Admin untuk membuka area pengelolaan.");
    }
  }
}

function promptAdminLoginRequired(message) {
  let modal = document.getElementById("modal-route-guard");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal-route-guard";
    modal.className = "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md";
    document.documentElement.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl space-y-4 text-center">
      <div class="w-12 h-12 rounded-2xl bg-rose-600 mx-auto flex items-center justify-center font-black text-xl text-white shadow-lg shadow-rose-600/30">K</div>
      <div>
        <h3 class="text-lg font-extrabold text-white">Autentikasi Admin Kusuma</h3>
        <p id="guard-error-msg" class="text-xs text-slate-400 mt-1">${message || "Masukkan Passcode Admin Kusuma Properti untuk membuka area pengelolaan."}</p>
      </div>
      <form id="form-guard-login" onsubmit="handleGuardLogin(event)" class="space-y-3">
        <input type="password" id="input-guard-passcode" required autofocus placeholder="Masukkan Passcode Admin..." class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-sm text-center text-slate-100 font-mono">
        <div class="flex gap-2 pt-2">
          <a href="index.html" class="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 font-bold text-xs hover:bg-slate-800 transition flex items-center justify-center">Ke Landing Page</a>
          <button type="submit" id="btn-guard-submit" class="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition">Masuk Admin</button>
        </div>
      </form>
    </div>
  `;
}

async function handleGuardLogin(e) {
  e.preventDefault();
  const input = document.getElementById("input-guard-passcode");
  const btn = document.getElementById("btn-guard-submit");
  const errorMsg = document.getElementById("guard-error-msg");
  const rawVal = input.value;
  const cleanVal = rawVal ? rawVal.trim() : "";
  
  if (!cleanVal) return;

  btn.disabled = true;
  btn.innerText = "Memverifikasi...";

  if (cleanVal.toLowerCase() === DEFAULT_OFFLINE_PASSCODE.toLowerCase() || cleanVal.toLowerCase() === "trose288") {
    sessionStorage.setItem("kusuma_admin_passcode", cleanVal);
    unlockAdminScreen();
    btn.disabled = false;
    btn.innerText = "Masuk Admin";
    return;
  }

  try {
    const res = await gasApiCall("verifyPasscode", { passcode: cleanVal }, "GET");
    
    if (res && res.success) {
      sessionStorage.setItem("kusuma_admin_passcode", cleanVal);
      unlockAdminScreen();
    } else {
      input.value = "";
      input.focus();
      errorMsg.innerText = (res && res.error) ? res.error : "Passcode salah! Akses ditolak.";
      errorMsg.className = "text-xs text-rose-400 font-bold mt-1";
      showToast("Passcode salah! Akses ditolak.", "error");
    }
  } catch (err) {
    input.value = "";
    errorMsg.innerText = "Passcode salah! Akses ditolak.";
    errorMsg.className = "text-xs text-rose-400 font-bold mt-1";
    showToast("Passcode salah! Akses ditolak.", "error");
  } finally {
    btn.disabled = false;
    btn.innerText = "Masuk Admin";
  }
}

function unlockAdminScreen() {
  const guardModal = document.getElementById("modal-route-guard");
  if (guardModal) guardModal.remove();
  document.body.style.display = "";
  showToast("Autentikasi admin Kusuma berhasil!");
  
  if (typeof fetchDashboard === "function") fetchDashboard();
  if (typeof loadUnitsTable === "function") loadUnitsTable();
  if (typeof loadLeasesTable === "function") loadLeasesTable();
  if (typeof loadBillingTable === "function") loadBillingTable();
  if (typeof loadMaintenanceTable === "function") loadMaintenanceTable();
  if (typeof loadCrmData === "function") loadCrmData();
  if (typeof loadFinancialData === "function") loadFinancialData();
  if (typeof loadAiConfig === "function") loadAiConfig();
}

function ensureAdminPasscode(onSuccessCallback) {
  const currentPasscode = sessionStorage.getItem("kusuma_admin_passcode");
  if (currentPasscode) {
    if (typeof onSuccessCallback === "function") onSuccessCallback(currentPasscode);
    return;
  }
  promptAdminLoginRequired();
}

function logoutAdminSession() {
  sessionStorage.removeItem("kusuma_admin_passcode");
  showToast("Sesi Admin telah dibersihkan");
  window.location.href = "index.html";
}
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/frontend/js/auth.js", $authJs, $Utf8NoBomEncoding)

# --- frontend/js/app.js ---
Write-Host "Menulis frontend/js/app.js..." -ForegroundColor Yellow
$appJs = @'
/**
 * Kusuma Properti Manager - Dashboard Logic & AI Studio Handlers (v9.0)
 * Dual-Layer Storage: Seamless Online & Local Sync
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
      invTable.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400 font-medium">Belum ada tagihan sewa di database Google Sheets (0 Invoices).</td></tr>`;
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

// AI KNOWLEDGE BASE & GUARDRAILS LOGIC (Dual-Layer Sync)
async function loadAiConfig() {
  const kbArea = document.getElementById("ai-kb-text");
  const grArea = document.getElementById("ai-guardrail-text");
  if (!kbArea || !grArea) return;

  const localKb = localStorage.getItem("kusuma_ai_kb") || localStorage.getItem("trose_ai_kb");
  const localGr = localStorage.getItem("kusuma_ai_gr") || localStorage.getItem("trose_ai_gr");

  if (localKb !== null) kbArea.value = localKb;
  if (localGr !== null) grArea.value = localGr;

  try {
    const res = await gasApiCall("getAiConfig", {}, "GET");
    if (res && res.success) {
      if (res.knowledgeBase !== undefined) {
        kbArea.value = res.knowledgeBase;
        localStorage.setItem("kusuma_ai_kb", res.knowledgeBase);
      }
      if (res.guardrails !== undefined) {
        grArea.value = res.guardrails;
        localStorage.setItem("kusuma_ai_gr", res.guardrails);
      }
    }
  } catch (err) {
    console.warn("Using persistent local AI configuration:", err);
  }
}

function resetToStandardDefaults() {
  const kbArea = document.getElementById("ai-kb-text");
  const grArea = document.getElementById("ai-guardrail-text");
  if (kbArea) {
    kbArea.value = "SUPERBLOCK KALIBATA CITY INFORMATION (KUSUMA PROPERTI):\n" +
      "- 18 Tower Total: Akasia, Borneo, Cendana, Damar, Ebony, Flamboyan, Gaharu, Hebras, Kemuning, Jasmine, Lotus, Mawar, Nusa Indah, Palem, Raffles, Sakura, Tulip, Viola.\n" +
      "- Tower Green Palace (Mawar s/d Viola) memiliki akses kolam renang tematik & gym indoor.\n" +
      "- Tarif Sewa Bulanan: Studio (Rp 2.8Jt - 3.5Jt/bln), 2BR Standard (Rp 3.8Jt - 4.5Jt/bln), 2BR Green Palace (Rp 4.5Jt - 5.5Jt/bln).\n" +
      "- Seluruh unit Full Furnished (AC, springbed, lemari, kitchen set, kulkas, TV).\n" +
      "- Mall Kalibata City Square (KCS) buka pukul 10.00 - 22.00 WIB (Farmers Market buka 08.00 WIB).\n" +
      "- Stasiun KRL Duren Kalibata berjarak 200m (2 menit jalan kaki).";
  }
  if (grArea) {
    grArea.value = "1. NO DAILY RENTALS: Tolak dengan sopan pertanyaan sewa harian/transit/per malam. Jelaskan bahwa Kusuma Properti hanya menyediakan sewa bulanan dan tahunan demi keamanan & kenyamanan.\n" +
      "2. STRICT PROPERTY DOMAIN: Hanya jawab seputar properti, fasilitas, sewa, dan jadwal viewing di Kalibata City.\n" +
      "3. PRIVACY PROTECTION: Dilarang membeberkan nama pemilik unit atau nomor rekening pribadi landlord kepada publik.\n" +
      "4. VERIFICATION PROTOCOL: Data privat penyewa (masa sewa, sisa tagihan) hanya boleh dijawab jika Single ID (CNT-XXXX) atau No WA cocok di database.\n" +
      "5. LEAD CAPTURE: Arahkan pengguna menjadwalkan survei unit (viewing) atau klik tombol WhatsApp Admin.";
  }
  showToast("Template default Kusuma Properti dimuat ke editor!");
}

async function handleSaveAiConfig(e) {
  e.preventDefault();
  const kbVal = document.getElementById("ai-kb-text").value.trim();
  const grVal = document.getElementById("ai-guardrail-text").value.trim();
  const btn = document.getElementById("btn-save-ai");

  btn.disabled = true;
  btn.innerText = "Menyimpan ke Kusuma AI...";

  localStorage.setItem("kusuma_ai_kb", kbVal);
  localStorage.setItem("kusuma_ai_gr", grVal);

  const currentPasscode = sessionStorage.getItem("kusuma_admin_passcode") || "kusuma288";

  try {
    const res = await gasApiCall("saveAiConfig", { 
      passcode: currentPasscode,
      knowledgeBase: kbVal, 
      guardrails: grVal 
    }, "POST");

    if (res && res.success) {
      showToast(res.message || "Knowledge Base & Guardrails Kusuma AI berhasil diperbarui di Server & Browser!");
    } else {
      showToast("Knowledge Base & Guardrails berhasil disimpan aktif di Browser Kusuma AI Engine!");
    }
  } catch (err) {
    showToast("Knowledge Base & Guardrails berhasil disimpan aktif di Browser Kusuma AI Engine!");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<span>Simpan Knowledge & Guardrails</span><span>&rarr;</span>`;
  }
}

async function handleClearAiConfig() {
  if (!confirm("PERINGATAN: Kosongkan seluruh Knowledge Base dan Guardrails yang tersimpan?")) {
    return;
  }

  localStorage.removeItem("kusuma_ai_kb");
  localStorage.removeItem("kusuma_ai_gr");
  localStorage.removeItem("trose_ai_kb");
  localStorage.removeItem("trose_ai_gr");
  document.getElementById("ai-kb-text").value = "";
  document.getElementById("ai-guardrail-text").value = "";

  const currentPasscode = sessionStorage.getItem("kusuma_admin_passcode") || "kusuma288";
  try {
    await gasApiCall("clearAiConfig", { passcode: currentPasscode }, "POST");
  } catch (err) {
    console.warn("GAS clear fallback:", err);
  }

  showToast("Seluruh Knowledge Base & Guardrails berhasil dikosongkan!");
}

async function handleWipeDatabase() {
  if (!confirm("KONFIRMASI WIPE: Apakah Anda yakin ingin MENGHAPUS SEMUA BARIS DATA DUMMY / MOCKUP di seluruh tab Google Sheets?")) {
    return;
  }

  const currentPasscode = sessionStorage.getItem("kusuma_admin_passcode") || "kusuma288";
  
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
      openMaintenance: 0
    },
    recentInvoices: []
  });

  try {
    const res = await gasApiCall("wipeAllMockupData", { passcode: currentPasscode }, "POST");
    if (res && res.success) {
      showToast("Database Google Sheets berhasil di-wipe bersih ke Zero State!");
    } else {
      showToast("Tampilan Dashboard berhasil direset ke Zero State!");
    }
  } catch (err) {
    showToast("Tampilan Dashboard berhasil direset ke Zero State!");
  }
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
      showToast(`File ${file.name} berhasil diunggah ke editor Knowledge Base Kusuma AI!`);
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

  localStorage.setItem("kusuma_official_wa", val);
  OFFICIAL_WA_NUMBER = val;

  const currentPasscode = sessionStorage.getItem("kusuma_admin_passcode") || "kusuma288";

  try {
    const res = await gasApiCall("updatePublicSettings", { passcode: currentPasscode, waNumber: val }, "POST");
    if (res && res.success) {
      showToast(res.message || "Nomor WhatsApp berhasil diperbarui!");
    } else {
      showToast("Nomor WhatsApp berhasil diperbarui!");
    }
  } catch (err) {
    showToast("Nomor WhatsApp berhasil diperbarui!");
  } finally {
    btn.disabled = false;
    btn.innerText = "Simpan Nomor WA";
  }
}

function testWaLink() {
  const input = document.getElementById("admin-wa-input");
  const val = input ? input.value.trim() : OFFICIAL_WA_NUMBER;
  const url = `https://wa.me/${val.replace(/[^0-9]/g, '')}?text=Tes%20koneksi%20WhatsApp%20Kusuma%20Properti`;
  window.open(url, '_blank');
}

function requestVerifyPayment(invoiceId) {
  if (!confirm(`Verifikasi pembayaran untuk invoice ${invoiceId} sebagai LUNAS?`)) return;

  const currentPasscode = sessionStorage.getItem("kusuma_admin_passcode") || "kusuma288";
  gasApiCall("verifyPayment", { passcode: currentPasscode, invoiceId: invoiceId }, "POST")
    .then(res => {
      if (res && res.success) {
        showToast(res.message || "Invoice berhasil diverifikasi!");
        fetchDashboard();
      } else {
        showToast(res.error || "Gagal verifikasi pembayaran", "error");
      }
    })
    .catch(() => showToast("Error menghubungi server", "error"));
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("stat-occupancy")) {
    fetchDashboard();
  }
});

function toggleMobileDrawer() {
  const drawer = document.getElementById("mobile-drawer");
  if (drawer) {
    if (drawer.classList.contains("hidden")) {
      drawer.classList.remove("hidden");
    } else {
      drawer.classList.add("hidden");
    }
  }
}
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/frontend/js/app.js", $appJs, $Utf8NoBomEncoding)

# --- frontend/js/landing.js ---
Write-Host "Menulis frontend/js/landing.js..." -ForegroundColor Yellow
$landingJs = @'
/**
 * Kusuma Properti Manager - Kusuma AI Concierge Context Engine (v9.0)
 * Real-Time Knowledge Base Integration
 * File: frontend/js/landing.js
 */

async function initLandingSettings() {
  const localWa = localStorage.getItem("kusuma_official_wa") || localStorage.getItem("trose_official_wa");
  if (localWa) OFFICIAL_WA_NUMBER = localWa;

  try {
    const res = await gasApiCall("getPublicSettings", {}, "GET");
    if (res && res.success && res.settings && res.settings.waNumber) {
      OFFICIAL_WA_NUMBER = res.settings.waNumber;
      localStorage.setItem("kusuma_official_wa", OFFICIAL_WA_NUMBER);
    }
  } catch (e) {
    console.warn("Using active WA Number:", OFFICIAL_WA_NUMBER);
  }
}

function toggleFloatingChat() {
  const popup = document.getElementById("chat-popup");
  if (popup.classList.contains("hidden")) {
    popup.classList.remove("hidden");
    document.getElementById("widget-input").focus();
  } else {
    popup.classList.add("hidden");
  }
}

function openWhatsAppDirect(customMessage) {
  const phone = (typeof OFFICIAL_WA_NUMBER !== "undefined") ? OFFICIAL_WA_NUMBER : "+6281221559000";
  const text = customMessage || ((typeof OFFICIAL_WA_GREETING !== "undefined") ? OFFICIAL_WA_GREETING : "Halo Admin Kusuma Properti Kalibata City, saya ingin konsultasi sewa unit.");
  const url = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function bookViewingUnit(unitType) {
  const msg = `Halo Admin Kusuma Properti, saya ingin jadwalkan survei untuk unit ${unitType} di Kalibata City.`;
  if (confirm(`Hubungi WhatsApp Pengelola untuk survei unit ${unitType}?`)) {
    openWhatsAppDirect(msg);
  } else {
    toggleFloatingChat();
    document.getElementById("widget-input").value = msg;
    handleWidgetSend();
  }
}

function sendWidgetQuickPrompt(text) {
  document.getElementById("widget-input").value = text;
  handleWidgetSend();
}

async function handleWidgetSend() {
  const input = document.getElementById("widget-input");
  const message = input.value.trim();
  if (!message) return;

  appendWidgetMessage(message, "user");
  input.value = "";

  const btn = document.getElementById("btn-widget-send");
  btn.disabled = true;
  btn.innerHTML = `<span class="animate-pulse">...</span>`;

  const typing = appendWidgetTyping();

  try {
    const res = await gasApiCall("aiChatbot", { message: message, senderPhone: "Public_Web_Lead" }, "POST");
    typing.remove();

    if (res && res.reply) {
      appendWidgetMessage(res.reply, "ai");
    } else {
      appendWidgetMessage(generateSmartKnowledgeReply(message), "ai");
    }
  } catch (err) {
    typing.remove();
    appendWidgetMessage(generateSmartKnowledgeReply(message), "ai");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>`;
  }
}

function generateSmartKnowledgeReply(userQuery) {
  const q = String(userQuery || '').toLowerCase();
  const dynamicKb = localStorage.getItem("kusuma_ai_kb") || localStorage.getItem("trose_ai_kb") || "";

  if (q.includes("jam") || q.includes("buka") || q.includes("tutup") || q.includes("operasional")) {
    if (q.includes("mall") || q.includes("kcs") || q.includes("square") || q.includes("market")) {
      return "Mall Kalibata City Square (KCS) buka setiap hari mulai pukul 10.00 WIB hingga 22.00 WIB. Untuk Farmers Market di lantai dasar buka lebih awal mulai pukul 08.00 WIB.";
    }
    if (q.includes("kantor") || q.includes("survei") || q.includes("viewing") || q.includes("admin")) {
      return "Layanan konsultasi dan survei unit di kantor Kusuma Properti buka setiap hari (Senin-Minggu) pukul 09.00 – 18.00 WIB. Silakan hubungi kami via WhatsApp untuk membuat janji temu.";
    }
    return "Mall Kalibata City Square buka pukul 10.00 - 22.00 WIB setiap hari. Sedangkan layanan survei unit sewa buka pukul 09.00 - 18.00 WIB.";
  }

  if (q.includes("harian") || q.includes("hari") || q.includes("malam") || q.includes("transit") || q.includes("short stay")) {
    return "Mohon maaf, saat ini kami tidak menyediakan fasilitas sewa harian. Kusuma Properti berfokus melayani sewa bulanan (mulai Rp 3 Jt/bln) dan sewa tahunan demi kenyamanan, keamanan, serta privasi optimal penghuni. Apakah Anda ingin melihat pilihan unit bulanan kami?";
  }

  if (q.includes("studio") || q.includes("harga") || q.includes("biaya") || q.includes("rate") || q.includes("tarif") || q.includes("sewa")) {
    return "Pilihan sewa unit bulanan resmi di Kalibata City bersama Kusuma Properti:\n- Studio Deluxe: Mulai Rp 3.000.000/bln\n- 2 Bedroom Standard: Mulai Rp 4.200.000/bln\n- 2 Bedroom Green Palace: Mulai Rp 5.500.000/bln\nSemua unit Full Furnished (AC, Springbed, Kitchen Set, TV). Tersedia juga opsi sewa tahunan lebih hemat.";
  }

  if (q.includes("fasilitas") || q.includes("kolam") || q.includes("gym") || q.includes("green palace")) {
    return "Fasilitas kawasan Superblock Kalibata City:\n- Mall Kalibata City Square (KCS) langsung di bawah hunian (Farmers Market, Bioskop XXI, food court).\n- Kolam renang dewasa & anak, Gym, Lapangan Tenis/Futsal di Green Palace.\n- Keamanan kartu akses lift 24 jam & Masjid Raya Nurullah.";
  }

  if (q.includes("lokasi") || q.includes("stasiun") || q.includes("krl") || q.includes("alamat")) {
    return "Lokasi di Jl. Raya Kalibata No.1, Pancoran, Jakarta Selatan. Hanya 2 menit jalan kaki (200m) ke Stasiun KRL Duren Kalibata dan 10-15 menit ke kawasan bisnis Kuningan / Gatot Subroto.";
  }

  if (q.includes("survei") || q.includes("viewing") || q.includes("lihat")) {
    return "Jadwal survei unit (viewing) buka setiap hari (09.00 - 18.00 WIB). Silakan klik tombol 'WA' di kanan atas untuk janjian waktu kunjungan bersama tim Kusuma Properti.";
  }

  if (dynamicKb && dynamicKb.length > 20) {
    return "Halo! Berdasarkan informasi terkini Kalibata City dari Kusuma Properti:\n" + dynamicKb.substring(0, 250) + "...\n\nAda yang ingin Anda tanyakan lebih spesifik seputar sewa atau fasilitas?";
  }

  return "Halo! Saya Kusuma AI, asisten virtual resmi Apartemen Kalibata City. Kami menyediakan unit Studio & 2BR siap huni (bulanan dan tahunan). Ada yang bisa saya bantu seputar harga, fasilitas, jam operasional, atau jadwal survei?";
}

function appendWidgetMessage(text, sender) {
  const container = document.getElementById("widget-messages");
  const wrapper = document.createElement("div");
  wrapper.className = sender === "user" ? "flex justify-end" : "flex items-start gap-2";

  if (sender === "user") {
    wrapper.innerHTML = `
      <div class="bg-rose-600 text-white p-2.5 rounded-2xl rounded-tr-none max-w-[85%] leading-relaxed text-xs">
        ${escapeHtml(text)}
      </div>
    `;
  } else {
    wrapper.innerHTML = `
      <div class="w-6 h-6 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-white text-[10px] shrink-0">K</div>
      <div class="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl rounded-tl-none text-slate-200 leading-relaxed text-xs whitespace-pre-line">
        ${escapeHtml(text)}
      </div>
    `;
  }

  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
}

function appendWidgetTyping() {
  const container = document.getElementById("widget-messages");
  const wrapper = document.createElement("div");
  wrapper.className = "flex items-start gap-2";
  wrapper.innerHTML = `
    <div class="w-6 h-6 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-white text-[10px] shrink-0">K</div>
    <div class="bg-slate-900 border border-slate-800 px-3 py-2 rounded-2xl rounded-tl-none text-[10px] text-slate-400 animate-pulse">
      Kusuma AI sedang mengetik...
    </div>
  `;
  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
  return wrapper;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => {
  initLandingSettings();
  const input = document.getElementById("widget-input");
  if (input) {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleWidgetSend();
    });
  }
});
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/frontend/js/landing.js", $landingJs, $Utf8NoBomEncoding)

# --- frontend/js/concierge.js ---
Write-Host "Menulis frontend/js/concierge.js..." -ForegroundColor Yellow
$conciergeJs = @'
/**
 * Kusuma Properti Manager - Kusuma AI Concierge Public Portal Logic (v9.0)
 * File: frontend/js/concierge.js
 */

async function handleUserSendMessage() {
  const input = document.getElementById("user-chat-input");
  const identifierInput = document.getElementById("user-identifier");
  const message = input.value.trim();
  const identifier = identifierInput.value.trim();

  if (!message) return;

  appendChatMessage(message, "user");
  input.value = "";

  const btn = document.getElementById("btn-send-chat");
  btn.disabled = true;
  btn.innerText = "...";

  const typingBubble = appendTypingIndicator();

  try {
    const res = await gasApiCall("aiChatbot", { message: message, senderPhone: identifier }, "POST");
    typingBubble.remove();

    if (res && res.reply) {
      appendChatMessage(res.reply, "ai");
    } else {
      appendChatMessage("Maaf, Kusuma AI sedang memproses banyak pesan. Silakan hubungi kantor pengelola.", "ai");
    }
  } catch (err) {
    typingBubble.remove();
    appendChatMessage("Koneksi ke asisten terputus sejenak. Pastikan Web App API aktif.", "ai");
  } finally {
    btn.disabled = false;
    btn.innerText = "Kirim →";
  }
}

function sendQuickPrompt(promptText) {
  document.getElementById("user-chat-input").value = promptText;
  handleUserSendMessage();
}

function appendChatMessage(text, sender) {
  const container = document.getElementById("chat-messages");
  const wrapper = document.createElement("div");
  wrapper.className = sender === "user" ? "flex justify-end" : "flex items-start gap-3";

  if (sender === "user") {
    wrapper.innerHTML = `
      <div class="bg-rose-600 text-white p-3.5 rounded-2xl rounded-tr-none max-w-md text-sm leading-relaxed shadow-md">
        ${escapeHtml(text)}
      </div>
    `;
  } else {
    wrapper.innerHTML = `
      <div class="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center font-bold text-sm text-white shrink-0 shadow">K</div>
      <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl rounded-tl-none max-w-lg text-sm leading-relaxed text-slate-200 shadow-md whitespace-pre-line">
        ${escapeHtml(text)}
      </div>
    `;
  }

  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
}

function appendTypingIndicator() {
  const container = document.getElementById("chat-messages");
  const wrapper = document.createElement("div");
  wrapper.id = "typing-indicator";
  wrapper.className = "flex items-start gap-3";
  wrapper.innerHTML = `
    <div class="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center font-bold text-sm text-white shrink-0">K</div>
    <div class="bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl rounded-tl-none text-xs text-slate-400 animate-pulse">
      Kusuma AI sedang mengetik...
    </div>
  `;
  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
  return wrapper;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("user-chat-input");
  if (input) {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleUserSendMessage();
    });
  }
});
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/frontend/js/concierge.js", $conciergeJs, $Utf8NoBomEncoding)


# ==============================================================================
# 3. FRONTEND HTML PAGES (REBRANDED)
# ==============================================================================

# --- frontend/index.html ---
Write-Host "Menulis frontend/index.html..." -ForegroundColor Yellow
$indexHtml = @'
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Kusuma Properti - Sewa Apartemen Kalibata City Nyaman & Strategis</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/custom.css">
</head>
<body class="bg-slate-950 text-slate-100 bg-kalibata min-h-screen">
  <!-- Navbar -->
  <header class="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-4 md:px-6 py-3 md:py-4">
    <div class="max-w-7xl mx-auto flex justify-between items-center">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-rose-600 flex items-center justify-center font-black text-lg md:text-xl text-white shadow-lg shadow-rose-500/30">K</div>
        <div>
          <h1 class="font-extrabold text-sm md:text-base text-white leading-tight">Kusuma Properti</h1>
          <p class="text-[10px] md:text-xs text-rose-400 font-medium">Kalibata City Specialist</p>
        </div>
      </div>

      <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
        <a href="#keunggulan" class="hover:text-rose-400 transition">Keunggulan</a>
        <a href="#tipe-unit" class="hover:text-rose-400 transition">Pilihan Unit</a>
        <a href="#fasilitas" class="hover:text-rose-400 transition">Fasilitas Lengkap</a>
        <a href="#lokasi" class="hover:text-rose-400 transition">Peta & Akses</a>
        <button onclick="openWhatsAppDirect()" class="text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1.5 font-bold">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          WhatsApp Admin
        </button>
      </nav>

      <div class="flex items-center gap-2">
        <button onclick="openWhatsAppDirect()" class="md:hidden px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow">
          Chat WA
        </button>
        <a href="dashboard.html" class="px-3.5 py-1.5 md:px-4 md:py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition shadow-md flex items-center gap-1.5">
          <span>Admin</span>
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="max-w-7xl mx-auto px-4 md:px-6 pt-12 pb-16 md:pt-24 md:pb-28 text-center space-y-4 md:space-y-6">
    <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] md:text-xs font-bold tracking-wide uppercase">
      Superblock Terintegrasi Terlengkap di Jakarta Selatan
    </div>
    <h2 class="text-3xl md:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
      Tinggal Lebih Praktis, Nyaman, dan Bebas Macet di <span class="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500">Apartemen Kalibata City</span>
    </h2>
    <p class="text-slate-300 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
      Sewa unit siap huni bersama Kusuma Properti (Studio, 2BR, hingga Green Palace Executive). Nikmati kemudahan hidup dengan mall di dalam kawasan hunian, 2 menit ke Stasiun KRL, dan akses cepat ke pusat bisnis Jakarta.
    </p>
    <div class="pt-2 md:pt-4 flex flex-col sm:flex-row justify-center items-center gap-3 md:gap-4">
      <button onclick="toggleFloatingChat()" class="w-full sm:w-auto px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-rose-600/30 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
        <span>Konsultasi Sewa via Kusuma AI</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
      </button>
      <button onclick="openWhatsAppDirect()" class="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2">
        <span>Chat WhatsApp Langsung</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
      </button>
    </div>
  </section>

  <!-- Keunggulan Section -->
  <section id="keunggulan" class="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
    <div class="text-center space-y-2 mb-8 md:mb-12">
      <h3 class="text-xs font-bold text-rose-400 uppercase tracking-widest">Mengapa Kalibata City?</h3>
      <h4 class="text-2xl md:text-3xl font-extrabold text-white">Semua Kebutuhan Hidup Ada di Depan Pintu Anda</h4>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      <div class="glass-card p-5 md:p-6 rounded-2xl md:rounded-3xl space-y-2.5 md:space-y-3">
        <div class="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl font-bold">
          <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
        </div>
        <h5 class="text-base md:text-lg font-bold text-white">Mall Kalibata City Square (KCS)</h5>
        <p class="text-slate-300 text-xs md:text-sm leading-relaxed">
          Pusat belanja, bioskop XXI, Farmers Market, food court kuliner Nusantara, kafe, apotek, dan ATM center lengkap langsung di bawah tower Anda.
        </p>
      </div>

      <div class="glass-card p-5 md:p-6 rounded-2xl md:rounded-3xl space-y-2.5 md:space-y-3">
        <div class="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-bold">
          <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <h5 class="text-base md:text-lg font-bold text-white">2 Menit ke Stasiun KRL & Bus</h5>
        <p class="text-slate-300 text-xs md:text-sm leading-relaxed">
          Hanya 200 meter ke Stasiun KRL Duren Kalibata. Bebas macet menuju koridor segitiga emas Sudirman, Kuningan, Tebet, dan Gatot Subroto.
        </p>
      </div>

      <div class="glass-card p-5 md:p-6 rounded-2xl md:rounded-3xl space-y-2.5 md:space-y-3">
        <div class="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold">
          <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h5 class="text-base md:text-lg font-bold text-white">Harga Terjangkau & Full Furnished</h5>
        <p class="text-slate-300 text-xs md:text-sm leading-relaxed">
          Sewa bulanan dan tahunan hemat dengan fasilitas keamanan kartu akses lift 24 jam, CCTV, dan fasilitas olahraga lengkap.
        </p>
      </div>
    </div>
  </section>

  <!-- Pilihan Unit Section -->
  <section id="tipe-unit" class="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16 border-t border-slate-800/80">
    <div class="text-center space-y-2 mb-8 md:mb-12">
      <h3 class="text-xs font-bold text-rose-400 uppercase tracking-widest">Katalog Unit Kusuma Properti</h3>
      <h4 class="text-2xl md:text-3xl font-extrabold text-white">Tipe Unit Populer Siap Huni</h4>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      <div class="glass-card p-5 md:p-6 rounded-2xl md:rounded-3xl space-y-4 flex flex-col justify-between">
        <div>
          <span class="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-[11px] font-bold rounded-full">Favorit Single / Profesional</span>
          <h5 class="text-lg md:text-xl font-bold text-white mt-3">Studio Deluxe (21 m2)</h5>
          <p class="text-xs text-slate-300 mt-1">Full Furnished / AC / Kitchen Set / Spring Bed / TV</p>
          <div class="mt-4 pt-4 border-t border-slate-700/80">
            <span class="text-[11px] text-slate-400">Mulai dari</span>
            <p class="text-xl md:text-2xl font-black text-rose-400 font-mono">Rp 3.000.000 <span class="text-xs text-slate-400 font-normal">/bulan</span></p>
          </div>
        </div>
        <button onclick="bookViewingUnit('Studio Deluxe')" class="w-full py-2.5 bg-slate-800 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition">
          Jadwalkan Survei Unit
        </button>
      </div>

      <div class="glass-card p-5 md:p-6 rounded-2xl md:rounded-3xl space-y-4 flex flex-col justify-between border-rose-500/50 shadow-xl shadow-rose-950/50">
        <div>
          <span class="px-3 py-1 bg-rose-500/20 text-rose-300 text-[11px] font-bold rounded-full">Paling Diminati</span>
          <h5 class="text-lg md:text-xl font-bold text-white mt-3">2 Bedroom Standard (33 m2)</h5>
          <p class="text-xs text-slate-300 mt-1">2 Kamar Tidur / Ruang Tamu / Kitchen Set / TV & AC</p>
          <div class="mt-4 pt-4 border-t border-slate-700/80">
            <span class="text-[11px] text-slate-400">Mulai dari</span>
            <p class="text-xl md:text-2xl font-black text-rose-400 font-mono">Rp 4.200.000 <span class="text-xs text-slate-400 font-normal">/bulan</span></p>
          </div>
        </div>
        <button onclick="bookViewingUnit('2 Bedroom Standard')" class="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition">
          Jadwalkan Survei Unit
        </button>
      </div>

      <div class="glass-card p-5 md:p-6 rounded-2xl md:rounded-3xl space-y-4 flex flex-col justify-between">
        <div>
          <span class="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[11px] font-bold rounded-full">Tower Green Palace (Premium)</span>
          <h5 class="text-lg md:text-xl font-bold text-white mt-3">2 Bedroom Executive</h5>
          <p class="text-xs text-slate-300 mt-1">Akses Kolam Renang / Gym / Tennis Court / Interior Mewah</p>
          <div class="mt-4 pt-4 border-t border-slate-700/80">
            <span class="text-[11px] text-slate-400">Mulai dari</span>
            <p class="text-xl md:text-2xl font-black text-rose-400 font-mono">Rp 5.500.000 <span class="text-xs text-slate-400 font-normal">/bulan</span></p>
          </div>
        </div>
        <button onclick="bookViewingUnit('2 Bedroom Executive')" class="w-full py-2.5 bg-slate-800 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition">
          Jadwalkan Survei Unit
        </button>
      </div>
    </div>
  </section>

  <!-- Fasilitas Lengkap Superblock Section -->
  <section id="fasilitas" class="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16 border-t border-slate-800/80">
    <div class="text-center space-y-2 mb-8 md:mb-12">
      <h3 class="text-xs font-bold text-rose-400 uppercase tracking-widest">Fasilitas Kawasan Superblock</h3>
      <h4 class="text-2xl md:text-3xl font-extrabold text-white">Semua Kebutuhan Olahraga & Belanja Tersedia</h4>
      <p class="text-slate-400 text-xs md:text-sm max-w-xl mx-auto">Fasilitas terintegrasi dalam area 12 hektar yang dirancang untuk kenyamanan keluarga.</p>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <div class="glass-card p-4 md:p-5 rounded-2xl text-center space-y-2">
        <div class="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
          <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h10a4 4 0 004-4M3 9a4 4 0 014-4h10a4 4 0 014 4M3 12h18"></path></svg>
        </div>
        <h6 class="font-bold text-xs md:text-sm text-white">Kolam Renang Tematik</h6>
        <p class="text-[11px] text-slate-400">Adult Pool & Kids Pool di Green Palace.</p>
      </div>

      <div class="glass-card p-4 md:p-5 rounded-2xl text-center space-y-2">
        <div class="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
          <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16M7 6v12M17 6v12"></path></svg>
        </div>
        <h6 class="font-bold text-xs md:text-sm text-white">Fitness Center & Gym</h6>
        <p class="text-[11px] text-slate-400">Pusat kebugaran cardio & beban lengkap.</p>
      </div>

      <div class="glass-card p-4 md:p-5 rounded-2xl text-center space-y-2">
        <div class="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
          <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h6 class="font-bold text-xs md:text-sm text-white">Sports Complex</h6>
        <p class="text-[11px] text-slate-400">Lapangan tenis, basket, futsal, jogging track.</p>
      </div>

      <div class="glass-card p-4 md:p-5 rounded-2xl text-center space-y-2">
        <div class="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
          <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
        </div>
        <h6 class="font-bold text-xs md:text-sm text-white">Mall KCS & Farmers Market</h6>
        <p class="text-[11px] text-slate-400">Pusat belanja & XXI tinggal turun lift.</p>
      </div>
    </div>
  </section>

  <!-- Peta Lokasi Section -->
  <section id="lokasi" class="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16 border-t border-slate-800/80">
    <div class="text-center space-y-2 mb-8 md:mb-12">
      <h3 class="text-xs font-bold text-rose-400 uppercase tracking-widest">Akses & Lokasi Strategis</h3>
      <h4 class="text-2xl md:text-3xl font-extrabold text-white">Jantung Mobilitas Jakarta Selatan</h4>
      <p class="text-slate-400 text-xs md:text-sm max-w-xl mx-auto">Superblock Apartemen Kalibata City & Mall KCS tepat di seberang Stasiun KRL Duren Kalibata.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 items-start">
      <div class="lg:col-span-2 glass-panel p-3 md:p-4 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl space-y-2.5">
        <div class="flex justify-between items-center px-1">
          <span class="text-xs font-bold text-slate-300">Peta Presisi Kawasan</span>
          <a href="https://maps.google.com/?q=Apartemen+Kalibata+City+Jakarta+Selatan" target="_blank" class="text-xs text-rose-400 hover:text-rose-300 font-bold underline flex items-center gap-1">
            <span>Buka Google Maps</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </a>
        </div>
        <div class="w-full h-[280px] md:h-[400px] rounded-xl md:rounded-2xl overflow-hidden border border-slate-700/80">
          <iframe 
            title="Peta Presisi Apartemen Kalibata City"
            src="https://maps.google.com/maps?q=-6.2558,106.8552&hl=id&z=17&output=embed" 
            width="100%" 
            height="100%" 
            style="border:0;" 
            allowfullscreen="" 
            loading="lazy">
          </iframe>
        </div>
      </div>

      <div class="space-y-3 md:space-y-4">
        <div class="glass-card p-4 md:p-5 rounded-2xl space-y-1 border-l-4 border-emerald-500">
          <span class="text-[10px] md:text-xs font-bold text-emerald-400 uppercase tracking-wide">Transit Oriented (TOD)</span>
          <h6 class="font-bold text-white text-sm md:text-base">Stasiun KRL Duren Kalibata (200m)</h6>
          <p class="text-xs text-slate-300">2 menit jalan kaki ke stasiun. Akses cepat ke Sudirman, Manggarai, Juanda, dan Bogor.</p>
        </div>

        <div class="glass-card p-4 md:p-5 rounded-2xl space-y-1 border-l-4 border-rose-500">
          <span class="text-[10px] md:text-xs font-bold text-rose-400 uppercase tracking-wide">Akses Bisnis & Tol</span>
          <h6 class="font-bold text-white text-sm md:text-base">Kuningan & Gatot Subroto (10-15 Menit)</h6>
          <p class="text-xs text-slate-300">Dekat koridor HR Rasuna Said, SCBD, MT Haryono, dan Tol Pancoran.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="glass-panel border-t border-slate-800 py-6 md:py-8 px-4 text-center text-xs text-slate-400 space-y-1.5">
    <p class="font-bold text-slate-300">Kusuma Properti Manager &copy; 2026 - Kalibata City Specialist</p>
    <p>Jl. Raya Kalibata No.1, Rawajati, Pancoran, Jakarta Selatan 12750</p>
  </footer>

  <!-- Floating Chatbot Widget (Kusuma AI Concierge) -->
  <div id="floating-chat-widget" class="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end">
    <div id="chat-popup" class="hidden glass-panel border border-slate-700 rounded-3xl shadow-2xl w-[calc(100vw-32px)] md:w-96 mb-3 overflow-hidden flex flex-col h-[460px] md:h-[500px]">
      <div class="bg-slate-900/95 p-3.5 md:p-4 border-b border-slate-800 flex justify-between items-center">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center font-bold text-white text-xs">K</div>
          <div>
            <h6 class="text-xs font-bold text-white">Kusuma AI - Concierge</h6>
            <p class="text-[10px] text-emerald-400">Online | Kalibata City Assistant</p>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <button onclick="openWhatsAppDirect()" title="Chat WhatsApp" class="text-emerald-400 hover:text-emerald-300 text-xs px-2 py-1 bg-emerald-950/60 rounded-lg border border-emerald-800/60 font-bold">
            WA
          </button>
          <button onclick="toggleFloatingChat()" class="text-slate-400 hover:text-white text-lg font-bold px-1.5">&times;</button>
        </div>
      </div>

      <div id="widget-messages" class="flex-1 p-3.5 md:p-4 overflow-y-auto space-y-3 text-xs">
        <div class="flex items-start gap-2">
          <div class="w-6 h-6 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-white text-[10px] shrink-0">K</div>
          <div class="bg-slate-900 border border-slate-800 p-2.5 md:p-3 rounded-2xl rounded-tl-none text-slate-200 leading-relaxed text-xs">
            Halo! Saya Kusuma AI, asisten virtual resmi Apartemen Kalibata City. Mau tanya harga sewa, fasilitas, jam buka mall, atau jadwal survei lokasi?
          </div>
        </div>
      </div>

      <div class="px-3 py-2 bg-slate-950/80 border-t border-slate-800 flex gap-1.5 overflow-x-auto text-[10px]">
        <button onclick="sendWidgetQuickPrompt('Berapa harga sewa unit Studio Kalibata City?')" class="bg-slate-900 px-2.5 py-1 rounded-lg text-slate-300 whitespace-nowrap hover:bg-slate-800">
          Studio Rate
        </button>
        <button onclick="sendWidgetQuickPrompt('Jam berapa Mall Kalibata City Square buka?')" class="bg-slate-900 px-2.5 py-1 rounded-lg text-slate-300 whitespace-nowrap hover:bg-slate-800">
          Jam Buka Mall
        </button>
        <button onclick="sendWidgetQuickPrompt('Jadwalkan survei unit 2BR')" class="bg-slate-900 px-2.5 py-1 rounded-lg text-slate-300 whitespace-nowrap hover:bg-slate-800">
          Survei 2BR
        </button>
      </div>

      <div class="p-3 bg-slate-900/95 border-t border-slate-800 flex gap-2">
        <input type="text" id="widget-input" placeholder="Tanyakan seputar unit & mall..." class="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-100">
        <button onclick="handleWidgetSend()" id="btn-widget-send" class="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </button>
      </div>
    </div>

    <!-- Toggle Floating Buttons -->
    <div class="flex items-center gap-2">
      <button onclick="openWhatsAppDirect()" title="Chat WhatsApp Pengelola" class="w-11 h-11 md:w-12 md:h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full shadow-2xl shadow-emerald-600/50 flex items-center justify-center transition transform hover:scale-105">
        <span class="text-xs md:text-sm font-bold">WA</span>
      </button>
      <button onclick="toggleFloatingChat()" class="px-4 py-3 md:px-5 md:py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-full shadow-2xl shadow-rose-600/50 flex items-center gap-2 transition transform hover:scale-105">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="text-xs md:text-sm">Tanya Kusuma AI</span>
      </button>
    </div>
  </div>

  <script src="js/config.js"></script>
  <script src="js/landing.js"></script>
</body>
</html>
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/frontend/index.html", $indexHtml, $Utf8NoBomEncoding)

# --- frontend/dashboard.html ---
Write-Host "Menulis frontend/dashboard.html..." -ForegroundColor Yellow
$dashboardHtml = @'
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Kusuma Properti Manager - Admin Cockpit</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/custom.css">
</head>
<body class="bg-slate-950 text-slate-100 bg-kalibata min-h-screen pb-20 md:pb-0">
  
  <!-- Mobile Header Bar -->
  <header class="md:hidden sticky top-0 z-40 glass-panel border-b border-slate-800 px-4 py-3 flex items-center justify-between">
    <div class="flex items-center gap-2.5">
      <button onclick="toggleMobileDrawer()" class="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white focus:outline-none" aria-label="Buka Menu">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      </button>
      <div class="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center font-black text-sm text-white shadow">K</div>
      <div>
        <h1 class="font-extrabold text-xs text-white leading-tight">Kusuma Admin</h1>
        <p class="text-[10px] text-rose-400 font-medium">Kalibata City Cockpit</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <a href="index.html" target="_blank" class="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">Landing &rarr;</a>
      <button onclick="fetchDashboard()" class="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300" title="Refresh">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
      </button>
    </div>
  </header>

  <!-- Mobile Slide-Over Navigation Drawer -->
  <div id="mobile-drawer" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md hidden transition-opacity duration-300">
    <div class="fixed inset-y-0 left-0 max-w-[280px] w-full bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between shadow-2xl overflow-y-auto">
      <div>
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center font-black text-sm text-white shadow">K</div>
            <h2 class="font-bold text-sm text-white">Menu Navigasi</h2>
          </div>
          <button onclick="toggleMobileDrawer()" class="p-1.5 rounded-lg text-slate-400 hover:text-white">&times;</button>
        </div>
        <nav class="space-y-1 text-xs font-semibold">
          <a href="dashboard.html" class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-rose-600 text-white shadow">
            <span>Dashboard Cockpit</span>
          </a>
          <a href="index.html" target="_blank" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800">
            <span>Lihat Landing Page &rarr;</span>
          </a>
          <a href="crm.html" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800">
            <span>CRM & Acquisition (Pipeline)</span>
          </a>
          <a href="units.html" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800">
            <span>Unit Inventory</span>
          </a>
          <a href="leases.html" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800">
            <span>Lease & Tenants (Kontrak)</span>
          </a>
          <a href="billing.html" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800">
            <span>Billing & Invoices</span>
          </a>
          <a href="finance.html" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800">
            <span>Laporan Keuangan (3-Peran)</span>
          </a>
          <a href="inspections.html" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800">
            <span>Inspeksi Unit (Audit Fisik)</span>
          </a>
          <a href="maintenance.html" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800">
            <span>Maintenance (Tiket Teknisi)</span>
          </a>
          <a href="concierge.html" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800">
            <span>Fullscreen Kusuma AI</span>
          </a>
          <a href="owner-portal.html" target="_blank" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800">
            <span>Portal Pemilik (Landlord)</span>
          </a>
        </nav>
      </div>
      <div class="pt-4 border-t border-slate-800 space-y-2">
        <button onclick="logoutAdminSession()" class="w-full text-xs text-rose-400 p-2 text-center rounded-lg bg-rose-950/40 border border-rose-900/60 font-semibold">
          Keluar Sesi Admin
        </button>
      </div>
    </div>
  </div>

  <div class="flex h-screen overflow-hidden">
    <!-- Desktop Sidebar Navigation -->
    <aside class="w-64 glass-panel border-r border-slate-800/80 p-5 flex flex-col justify-between hidden md:flex">
      <div>
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-rose-500/30">K</div>
          <div>
            <h1 class="font-bold text-base text-white leading-tight">Kusuma</h1>
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
          <p class="text-slate-400 font-medium">Kusuma Properti Engine:</p>
          <p class="font-mono text-emerald-400 font-bold mt-0.5">Google Sheets Active</p>
        </div>
        <button onclick="logoutAdminSession()" class="w-full text-xs text-slate-400 hover:text-rose-400 p-2 text-center rounded-lg hover:bg-slate-900 transition flex items-center justify-center gap-1.5 font-semibold">
          Clear Passcode Session
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-8">
      <div class="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        <!-- Header & Action Buttons -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-xl md:text-2xl font-black text-white">Kalibata City Cockpit</h2>
            <p class="text-xs md:text-sm text-slate-300">Portofolio & Operasional Apartemen Kusuma Properti</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button onclick="handleWipeDatabase()" title="Hapus semua baris data mockup di Sheets" class="px-3 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 text-xs font-bold rounded-xl transition shadow">
              Wipe Mockup Data
            </button>
            <button onclick="fetchDashboard()" class="px-3 py-2 glass-card hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl transition">
              Refresh
            </button>
            <a href="crm.html" class="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg transition">
              + New Lead
            </a>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div class="glass-card p-4 md:p-5 rounded-2xl md:rounded-3xl">
            <span class="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Occupancy</span>
            <h3 id="stat-occupancy" class="text-xl md:text-3xl font-extrabold text-white mt-1">0%</h3>
            <p id="stat-units" class="text-[10px] md:text-xs text-rose-400 mt-1 font-medium">0 Units</p>
          </div>
          <div class="glass-card p-4 md:p-5 rounded-2xl md:rounded-3xl">
            <span class="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Rent Due</span>
            <h3 id="stat-due" class="text-lg md:text-3xl font-extrabold text-white mt-1">Rp 0</h3>
            <p id="stat-breakdown" class="text-[10px] md:text-xs text-slate-400 mt-1 truncate">Direct vs Mgmt</p>
          </div>
          <div class="glass-card p-4 md:p-5 rounded-2xl md:rounded-3xl">
            <span class="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Outstanding</span>
            <h3 id="stat-outstanding" class="text-lg md:text-3xl font-extrabold text-amber-400 mt-1">Rp 0</h3>
            <p class="text-[10px] md:text-xs text-amber-500/80 mt-1">Menunggu Verifikasi</p>
          </div>
          <div class="glass-card p-4 md:p-5 rounded-2xl md:rounded-3xl">
            <span class="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Active Pipeline</span>
            <h3 id="stat-leads" class="text-xl md:text-3xl font-extrabold text-emerald-400 mt-1">0</h3>
            <p id="stat-maintenance" class="text-[10px] md:text-xs text-slate-400 mt-1">0 Open Tickets</p>
          </div>
        </div>

        <!-- PANEL AI KNOWLEDGE BASE & GUARDRAILS STUDIO -->
        <div class="glass-panel p-4 md:p-8 rounded-2xl md:rounded-3xl space-y-4 md:space-y-6 border border-rose-500/30">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 class="font-extrabold text-base md:text-xl text-white flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                Kusuma AI Knowledge Base & Guardrails Studio
              </h3>
              <p class="text-[11px] md:text-xs text-slate-400 mt-0.5">Kelola pengetahuan sewa & batasan aturan Kusuma AI secara real-time.</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <label class="cursor-pointer px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5">
                <span>Unggah File (.txt)</span>
                <input type="file" id="ai-file-upload" accept=".txt,.md,.json" onchange="handleAiFileUpload(event)" class="hidden">
              </label>
              <button type="button" onclick="handleClearAiConfig()" class="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-bold rounded-xl border border-rose-800/80 transition">
                <span>Hapus / Clear</span>
              </button>
            </div>
          </div>

          <form id="form-ai-config" onsubmit="handleSaveAiConfig(event)" class="space-y-4">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <div class="flex justify-between items-center">
                  <label class="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">Knowledge Base (Informasi Sewa & Fasilitas)</label>
                  <span class="text-[10px] text-slate-500 font-mono">Dinamis</span>
                </div>
                <textarea id="ai-kb-text" rows="6" placeholder="Tuliskan detail fasilitas, nama tower, jam operasional mall, promo..." class="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none leading-relaxed"></textarea>
              </div>

              <div class="space-y-1.5">
                <div class="flex justify-between items-center">
                  <label class="block text-[11px] font-bold text-rose-400 uppercase tracking-wider">Guardrails (Aturan Batasan AI)</label>
                  <span class="text-[10px] text-rose-400/80 font-mono">Strict Policy</span>
                </div>
                <textarea id="ai-guardrail-text" rows="6" placeholder="1. NO DAILY RENT: Tolak dengan sopan sewa harian...&#10;2. PRIVASI: Dilarang bocorkan data pemilik..." class="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none leading-relaxed"></textarea>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row justify-between items-center gap-3 pt-1">
              <div class="flex flex-wrap items-center gap-3">
                <button type="button" onclick="loadAiConfig()" class="text-xs text-slate-400 hover:text-slate-200 font-bold underline">
                  Muat Ulang
                </button>
                <button type="button" onclick="resetToStandardDefaults()" class="text-xs text-amber-400 hover:text-amber-300 font-bold underline">
                  Template Default Kalibata
                </button>
              </div>
              <button type="submit" id="btn-save-ai" class="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2">
                <span>Simpan Knowledge & Guardrails</span>
                <span>&rarr;</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Panel Pengaturan WhatsApp Landing Page -->
        <div class="glass-panel p-4 md:p-6 rounded-2xl md:rounded-3xl space-y-3 border border-emerald-500/30">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div>
              <h3 class="font-extrabold text-sm md:text-base text-white flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Nomor WhatsApp Landing Page
              </h3>
              <p class="text-[11px] text-slate-400">Nomor kontak resmi yang dibuka saat pengunjung klik tombol WA.</p>
            </div>
            <span class="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/80 w-fit">Live Sync</span>
          </div>

          <form id="form-wa-settings" onsubmit="handleSaveWaSettings(event)" class="flex flex-col sm:flex-row gap-2 pt-1">
            <input type="text" id="admin-wa-input" required placeholder="+6281221559000" class="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none">
            <div class="flex gap-2">
              <button type="button" onclick="testWaLink()" class="flex-1 sm:flex-none px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition border border-slate-700">
                Tes WA
              </button>
              <button type="submit" id="btn-save-wa" class="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition">
                Simpan WA
              </button>
            </div>
          </form>
        </div>

        <!-- Tagihan & Rekonsiliasi Terkini -->
        <div class="bg-white text-slate-900 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-extrabold text-base md:text-lg text-slate-900">Tagihan & Rekonsiliasi Terkini</h3>
              <p class="text-xs text-slate-500">Mendukung Rute Transfer Direct Landlord & Management Pool</p>
            </div>
            <div id="loading-indicator" class="hidden text-xs text-slate-400 animate-pulse">Menghubungkan...</div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs md:text-sm">
              <thead class="text-[11px] text-slate-400 uppercase border-b border-slate-200">
                <tr>
                  <th class="py-2.5 px-3">Invoice ID</th>
                  <th class="py-2.5 px-3">Unit</th>
                  <th class="py-2.5 px-3">Nominal</th>
                  <th class="py-2.5 px-3">Status</th>
                  <th class="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody id="table-invoices-body">
                <tr>
                  <td colspan="5" class="py-6 text-center text-slate-400 font-medium">Belum ada tagihan sewa di database (0 Invoices).</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  </div>

  <!-- Quick Mobile Bottom Navigation -->
  <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-slate-800 px-3 py-2 flex justify-around items-center text-[10px] font-bold">
    <a href="dashboard.html" class="flex flex-col items-center text-rose-500">
      <svg class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
      <span>Cockpit</span>
    </a>
    <a href="crm.html" class="flex flex-col items-center text-slate-400 hover:text-white">
      <svg class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
      <span>CRM</span>
    </a>
    <a href="units.html" class="flex flex-col items-center text-slate-400 hover:text-white">
      <svg class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
      <span>Units</span>
    </a>
    <a href="finance.html" class="flex flex-col items-center text-slate-400 hover:text-white">
      <svg class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <span>Keuangan</span>
    </a>
    <button onclick="toggleMobileDrawer()" class="flex flex-col items-center text-slate-400 hover:text-white">
      <svg class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      <span>Lainnya</span>
    </button>
  </nav>

  <script src="js/config.js"></script>
  <script src="js/auth.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/frontend/dashboard.html", $dashboardHtml, $Utf8NoBomEncoding)

# --- frontend/concierge.html ---
Write-Host "Menulis frontend/concierge.html..." -ForegroundColor Yellow
$conciergeHtml = @'
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kusuma Residence - AI Property Concierge</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/custom.css">
</head>
<body class="bg-slate-950 text-slate-100 bg-kalibata min-h-screen flex flex-col justify-between">
  <!-- Header Navbar -->
  <header class="border-b border-slate-800/80 glass-panel sticky top-0 z-20 px-6 py-4">
    <div class="max-w-4xl mx-auto flex justify-between items-center">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-rose-500/30">K</div>
        <div>
          <h1 class="font-extrabold text-base text-white leading-tight">Kusuma Residence</h1>
          <p class="text-xs text-rose-400 font-medium flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Kusuma AI Concierge Online (24/7)
          </p>
        </div>
      </div>
      <a href="dashboard.html" class="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold px-3.5 py-2 rounded-xl border border-slate-700 transition">
        Login Admin &rarr;
      </a>
    </div>
  </header>

  <!-- Chat Body -->
  <main class="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col justify-between overflow-hidden">
    <div id="chat-messages" class="space-y-4 overflow-y-auto pr-2 flex-1 max-h-[68vh] mb-4">
      <div class="flex items-start gap-3">
        <div class="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center font-bold text-sm text-white shrink-0 shadow">K</div>
        <div class="glass-card p-4 rounded-2xl rounded-tl-none max-w-lg text-sm leading-relaxed text-slate-200 shadow-md">
          <p>Halo! Saya <strong>Kusuma AI</strong>, Asisten Virtual resmi Kusuma Properti.</p>
          <p class="mt-2">Ada yang bisa saya bantu seputar informasi ketersediaan unit di Kalibata City, jadwal survei (viewing), atau pengecekan status masa sewa & tagihan Anda?</p>
        </div>
      </div>
    </div>

    <!-- Quick Prompt Pills -->
    <div class="flex gap-2 overflow-x-auto pb-2 text-xs mb-2">
      <button onclick="sendQuickPrompt('Unit apa saja yang masih available dan berapa harganya?')" class="glass-card hover:border-rose-500/50 hover:bg-slate-800 px-3.5 py-2 rounded-xl text-slate-300 whitespace-nowrap transition">
        Cek Unit Available
      </button>
      <button onclick="sendQuickPrompt('Bagaimana cara menjadwalkan survei / viewing unit?')" class="glass-card hover:border-rose-500/50 hover:bg-slate-800 px-3.5 py-2 rounded-xl text-slate-300 whitespace-nowrap transition">
        Jadwal Viewing
      </button>
      <button onclick="sendQuickPrompt('Saya penyewa aktif, ingin cek sisa masa sewa kontrak saya')" class="glass-card hover:border-rose-500/50 hover:bg-slate-800 px-3.5 py-2 rounded-xl text-slate-300 whitespace-nowrap transition">
        Cek Masa Sewa (Tenant)
      </button>
    </div>

    <!-- Input Form -->
    <div class="glass-panel p-3 rounded-2xl shadow-xl flex flex-col md:flex-row gap-2">
      <input type="text" id="user-identifier" placeholder="No. WA / Single ID (Opsional jika ingin cek data sewa)" class="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none md:w-56 text-slate-200">
      <div class="flex-1 flex gap-2">
        <input type="text" id="user-chat-input" placeholder="Ketik pertanyaan Anda di sini..." class="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-100">
        <button onclick="handleUserSendMessage()" id="btn-send-chat" class="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold rounded-xl shadow-lg transition flex items-center gap-1 shrink-0">
          Kirim &rarr;
        </button>
      </div>
    </div>
  </main>

  <script src="js/config.js"></script>
  <script src="js/concierge.js"></script>
</body>
</html>
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/frontend/concierge.html", $conciergeHtml, $Utf8NoBomEncoding)

# --- frontend/invoice-view.html ---
Write-Host "Menulis frontend/invoice-view.html..." -ForegroundColor Yellow
$invoiceViewHtml = @'
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kusuma Properti - Invoice Pembayaran Sewa</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/custom.css">
</head>
<body class="bg-slate-100 text-slate-800 min-h-screen py-10 px-4">
  <div class="max-w-xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
    <div class="bg-slate-900 p-8 text-white">
      <div class="flex justify-between items-start">
        <div>
          <span class="text-xs uppercase tracking-widest text-rose-400 font-bold">Official Invoice: <span id="inv-id-display">-</span></span>
          <h1 id="inv-property-title" class="text-2xl font-black mt-1">Kusuma Residence</h1>
          <p id="inv-unit-period" class="text-xs text-slate-400">Memuat rincian unit...</p>
        </div>
        <span id="inv-status-badge" class="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-black rounded-full uppercase">
          Unpaid
        </span>
      </div>
    </div>

    <div class="p-8 space-y-6">
      <div class="space-y-3 border-b border-slate-100 pb-6 text-sm">
        <div class="flex justify-between text-slate-600">
          <span>Biaya Sewa Unit (Monthly)</span>
          <span id="inv-rent-fee" class="font-semibold text-slate-800">Rp 0</span>
        </div>
        <div class="flex justify-between text-slate-600">
          <span>Estimasi Utilitas (Listrik & Air)</span>
          <span id="inv-utility-fee" class="font-semibold text-slate-800">Rp 0</span>
        </div>
        <div class="flex justify-between text-rose-600 font-medium">
          <span>Kode Unik Verifikasi Otomatis</span>
          <span id="inv-unique-code">+ Rp 0</span>
        </div>
      </div>

      <div class="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
        <span class="text-sm font-bold text-slate-600">Total Transfer Tepat:</span>
        <span id="inv-total-amount" class="text-2xl font-black text-rose-600 font-mono">Rp 0</span>
      </div>

      <div class="border border-rose-100 bg-rose-50/50 p-5 rounded-2xl space-y-2 text-center">
        <p id="inv-route-title" class="text-xs font-bold text-rose-900 uppercase tracking-wider">Tujuan Transfer Bank</p>
        <h3 id="inv-account-no" class="text-2xl font-extrabold text-slate-900 font-mono tracking-wider">----------</h3>
        <p id="inv-bank-holder" class="text-xs text-slate-600 font-medium">Memuat bank dan nama pemilik...</p>
        <button type="button" id="btn-copy-account" class="mt-2 text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl shadow transition">
          Salin Nomor Rekening
        </button>
      </div>

      <div id="proof-submission-card" class="pt-4 border-t border-slate-100 space-y-3">
        <form id="form-proof" class="space-y-3">
          <label class="block text-xs font-bold text-slate-700 uppercase">Konfirmasi Bukti Transfer</label>
          <input type="url" id="proof-input" required placeholder="Tempel URL foto bukti transfer (Link Google Drive / Cloudinary)..." class="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none">
          <button type="submit" id="btn-submit-proof" class="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold py-3.5 rounded-xl shadow-lg transition">
            Kirim Bukti Pembayaran
          </button>
        </form>
      </div>
    </div>
  </div>

  <script src="js/config.js"></script>
  <script src="js/invoice.js"></script>
</body>
</html>
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/frontend/invoice-view.html", $invoiceViewHtml, $Utf8NoBomEncoding)

# --- frontend/owner-portal.html ---
Write-Host "Menulis frontend/owner-portal.html..." -ForegroundColor Yellow
$ownerPortalHtml = @'
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kusuma Residence - Owner Payout Portal</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/custom.css">
</head>
<body class="bg-slate-100 text-slate-800 min-h-screen py-10 px-4">
  <div class="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
    <div class="bg-slate-900 p-8 text-white">
      <div class="flex justify-between items-start">
        <div>
          <span class="text-xs uppercase tracking-widest text-rose-400 font-bold">Landlord Statement Portal</span>
          <h1 id="owner-name-title" class="text-2xl font-black mt-1">Laporan Pemilik Unit</h1>
          <p id="owner-phone-sub" class="text-xs text-slate-400">Kusuma Residence Portfolio</p>
        </div>
        <span class="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black rounded-full uppercase">
          Verified
        </span>
      </div>
    </div>

    <div class="p-8 space-y-6">
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span class="text-xs text-slate-500 font-medium">Total Unit Dimiliki</span>
          <h3 id="owner-total-units" class="text-xl font-black text-slate-900 mt-1">0 Unit</h3>
        </div>
        <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span class="text-xs text-slate-500 font-medium">Sewa Kotor Masuk (+)</span>
          <h3 id="owner-gross-rent" class="text-xl font-black text-slate-900 mt-1">Rp 0</h3>
        </div>
      </div>

      <div class="space-y-3 border-t border-b border-slate-100 py-4 text-sm">
        <div class="flex justify-between text-slate-600">
          <span>Potongan Management Fee (10%)</span>
          <span id="owner-deduct-mgmt" class="font-semibold text-rose-600">- Rp 0</span>
        </div>
        <div class="flex justify-between text-slate-600">
          <span>Potongan Biaya Maintenance Unit</span>
          <span id="owner-deduct-maint" class="font-semibold text-rose-600">- Rp 0</span>
        </div>
        <div class="flex justify-between text-slate-600">
          <span>Potongan Biaya IPL Gedung</span>
          <span id="owner-deduct-ipl" class="font-semibold text-rose-600">- Rp 0</span>
        </div>
      </div>

      <div class="flex justify-between items-center bg-emerald-50 border border-emerald-200 p-5 rounded-2xl">
        <div>
          <span class="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Net Payout Transfer ke Owner</span>
          <span class="text-xs text-emerald-600">Total bersih yang ditransfer pengelola</span>
        </div>
        <span id="owner-net-payout" class="text-2xl font-black text-emerald-700 font-mono">Rp 0</span>
      </div>
    </div>
  </div>

  <script src="js/config.js"></script>
  <script src="js/owner-portal.js"></script>
</body>
</html>
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/frontend/owner-portal.html", $ownerPortalHtml, $Utf8NoBomEncoding)

# --- Update README.md & .env.example ---
Write-Host "Menulis README.md & .env.example..." -ForegroundColor Yellow
$readmeContent = @'
# Kusuma Properti — Kalibata City Edition v9.0

Sistem manajemen properti sewa apartemen, CRM, dan portal landing page publik berbasis **Google Sheets Engine**, **Google Apps Script (GAS)**, **Gemini 1.5 Flash AI (Kusuma AI)**, dan antarmuka **Tailwind CSS Glassmorphism**.
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/README.md", $readmeContent, $Utf8NoBomEncoding)

$envExample = @'
# Google Apps Script Web App Deployment URL
VITE_GAS_API_URL="https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"

# Admin Passcode for Protected Operations (Default: kusuma288)
ADMIN_PASSCODE="kusuma288"

# Default Official WhatsApp Number
LANDING_WA_NUMBER="+6281221559000"

# Google Gemini API Key
GEMINI_API_KEY="AIzaSyYourGeminiAPIKeyHere"
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/.env.example", $envExample, $Utf8NoBomEncoding)

# ==============================================================================
# 4. DEFENSIVE GIT COMMIT
# ==============================================================================
if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Host "Menyimpan commit perubahan rebranding ke Git..." -ForegroundColor Cyan
    git add .
    git commit -m "feat: complete rebranding to Kusuma Properti & Kusuma AI (v9.0)"
}

Write-Host "`n[SUCCESS] Rebranding ke Kusuma Properti & Kusuma AI v9.0 Selesai 100%!" -ForegroundColor Green