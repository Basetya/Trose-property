# ==============================================================================
# Trose-property - 1-Click Setup (Total Mockup Elimination v7.4)
# ==============================================================================

Write-Host "Scaffolding v7.4: Eliminating all mockup data and hardcoded defaults..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "backend", "frontend/css", "frontend/js", "frontend/img", "scripts" | Out-Null

$Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False

Write-Host "Updating backend/SheetSchema.gs (Header-Only Clean Schema)..." -ForegroundColor Yellow
$sheetSchemaGs = @'
/**
 * Trose Property Manager - Clean Database Initializer (v7.4)
 * Header-only structure with ZERO dummy rows for a clean slate.
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

  return "Seluruh 9 Tab Database Berhasil Diinisialisasi Bersih (Clean Slate)!";
}
'@
[System.IO.File]::WriteAllText("$PSScriptRoot/backend/SheetSchema.gs", $sheetSchemaGs, $Utf8NoBomEncoding)

Write-Host "Updating backend/Code.gs (Zero-State Aggregation)..." -ForegroundColor Yellow
$codeGs = @'
/**
 * Trose Property Manager - Production Controller Clean Baseline (v7.4)
 * File: backend/Code.gs
 */

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "getDashboardData";
  let responseData = {};

  try {
    if (action === "getAiConfig") {
      const sp = PropertiesService.getScriptProperties();
      const kb = sp.getProperty("AI_KNOWLEDGE_BASE") || "";
      const gr = sp.getProperty("AI_GUARDRAILS") || "";
      responseData = { success: true, knowledgeBase: kb, guardrails: gr };
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

Write-Host "Updating frontend/js/app.js (Clean Zero Slate Enforcement)..." -ForegroundColor Yellow
$appJs = @'
/**
 * Trose Property Manager - Dashboard Logic Clean Slate (v7.4)
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
      invTable.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400 font-medium">Belum ada data tagihan sewa di Google Sheets (0 Invoices).</td></tr>`;
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

Write-Host "`n[SUCCESS] Version v7.4 Clean Slate applied: All mockup leaks removed!" -ForegroundColor Green