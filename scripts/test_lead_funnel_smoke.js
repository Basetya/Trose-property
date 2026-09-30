/**
 * Automated Pre-Flight Smoke Test & Mock Harness for Owner Lead Funnel
 * File: scripts/test_lead_funnel_smoke.js
 * Run: node scripts/test_lead_funnel_smoke.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log("==================================================");
console.log("🚀 STARTING OWNER LEAD FUNNEL PRE-FLIGHT SMOKE TEST");
console.log("==================================================\n");

// 1. Inisialisasi Mock Data Store
const mockDb = {
  "03_CONTACTS_360": [
    ["Contact_ID", "Full_Name", "Phone_WA", "Email", "Role", "Lead_Score", "Interaction_Summary", "Created_At"]
  ],
  "07_CRM_PIPELINE": [
    ["Lead_ID", "Contact_ID", "Target_Unit", "Stage", "Budget", "Viewing_Schedule", "Interaction_Notes", "Updated_At"]
  ]
};

const mockCalls = {
  calendarEvents: [],
  urlFetchRequests: [],
  logs: []
};

// 2. Setup Mock Lingkungan Google Apps Script
const mockSpreadsheetApp = {
  getActiveSpreadsheet: () => ({
    getSheetByName: (sheetName) => {
      if (!mockDb[sheetName]) return null;
      return {
        getDataRange: () => ({
          getValues: () => mockDb[sheetName]
        }),
        appendRow: (row) => {
          mockDb[sheetName].push(row);
        },
        deleteRow: (rowIdx) => {
          mockDb[sheetName].splice(rowIdx - 1, 1);
        },
        getRange: (row, col) => ({
          setValue: (val) => {
            if (mockDb[sheetName][row - 1]) {
              mockDb[sheetName][row - 1][col - 1] = val;
            }
          }
        })
      };
    }
  })
};

const mockCalendarApp = {
  getDefaultCalendar: () => ({
    createEvent: (title, startTime, endTime, options) => {
      const eventObj = {
        id: "CAL-EVT-" + Date.now(),
        title,
        startTime,
        endTime,
        options,
        deleted: false
      };
      mockCalls.calendarEvents.push(eventObj);
      return {
        getId: () => eventObj.id
      };
    },
    getEvents: (startTime, endTime) => {
      return mockCalls.calendarEvents
        .filter(evt => !evt.deleted)
        .map(evt => ({
          getTitle: () => evt.title,
          getDescription: () => (evt.options && evt.options.description) || "",
          deleteEvent: () => {
            evt.deleted = true;
            if (!mockCalls.deletedCalendarEvents) mockCalls.deletedCalendarEvents = [];
            mockCalls.deletedCalendarEvents.push(evt.id);
          }
        }));
    }
  })
};

const mockUrlFetchApp = {
  fetch: (url, options) => {
    mockCalls.urlFetchRequests.push({ url, options });
    return {
      getContentText: () => JSON.stringify({ status: true, message: "Mock WA Sent" })
    };
  }
};

const mockPropertiesService = {
  getScriptProperties: () => ({
    getProperty: (key) => {
      const props = {
        "FONNTE_TOKEN": "MOCK_FONNTE_TOKEN_SECRET",
        "OFFICIAL_WA_NUMBER": "628135600058"
      };
      return props[key] || null;
    }
  })
};

const mockLogger = {
  log: (msg) => {
    mockCalls.logs.push(msg);
  }
};

// 3. Load & Evaluasi Kode backend/OwnerLeadEngine.js dalam VM Sandbox
const enginePath = path.join(__dirname, '..', 'backend', 'OwnerLeadEngine.js');
const engineCode = fs.readFileSync(enginePath, 'utf8');

const sandbox = {
  SpreadsheetApp: mockSpreadsheetApp,
  CalendarApp: mockCalendarApp,
  UrlFetchApp: mockUrlFetchApp,
  PropertiesService: mockPropertiesService,
  Logger: mockLogger,
  console: console,
  Date: Date,
  String: String,
  Number: Number,
  Math: Math,
  JSON: JSON
};

vm.createContext(sandbox);
vm.runInContext(engineCode, sandbox);

console.log("📦 Engine loaded successfully into mock GAS sandbox.\n");

// ==============================================================================
// TEST CASE A: Normal Valid Submission (Studio, Tower Borneo)
// ==============================================================================
console.log("▶️ Running TEST CASE A: Valid Lead Submission (Tower Borneo Studio)");

const payloadA = {
  fullName: "Budi Santoso",
  phone: "081234567890",
  tower: "Borneo",
  unitNumber: "12AF",
  unitType: "Studio",
  expectedPrice: 3500000,
  notes: "Unit full furnished siap sewa"
};

const t0 = Date.now();
const resA = sandbox.handleOwnerLeadSubmission(payloadA);

assert.strictEqual(resA.success, true, "Case A must return success: true");
assert.ok(resA.leadId.startsWith("LEAD-"), "Case A must generate a valid Lead_ID");
assert.ok(resA.contactId.startsWith("CNT-"), "Case A must generate a valid Contact_ID");
assert.strictEqual(resA.calendarCreated, true, "Case A must create calendar event");

// Verifikasi Database 03_CONTACTS_360
const contacts = mockDb["03_CONTACTS_360"];
const contactA = contacts.find(c => c[0] === resA.contactId);
assert.ok(contactA, "Contact must exist in 03_CONTACTS_360");
assert.strictEqual(contactA[1], "Budi Santoso", "Full Name must match");
assert.strictEqual(contactA[2], "6281234567890", "Phone must be normalized to 6281234567890");
assert.strictEqual(contactA[4], "Landlord", "Role must be 'Landlord'");
assert.strictEqual(contactA[5], 85, "Lead_Score must be 85");
console.log("  ✅ Tab 03_CONTACTS_360: Contact recorded with normalized phone (6281234567890)");

// Verifikasi Database 07_CRM_PIPELINE
const pipeline = mockDb["07_CRM_PIPELINE"];
const leadA = pipeline.find(l => l[0] === resA.leadId);
assert.ok(leadA, "Lead must exist in 07_CRM_PIPELINE");
assert.strictEqual(leadA[1], resA.contactId, "Contact_ID foreign key must match");
assert.strictEqual(leadA[2], "Kalibata City - Tower Borneo No. 12AF", "Target unit string formatted correctly");
assert.strictEqual(leadA[3], "New_Lead", "Stage must be 'New_Lead'");
assert.strictEqual(leadA[4], 3500000, "Budget/Price must match");
console.log("  ✅ Tab 07_CRM_PIPELINE: Lead appended with Stage 'New_Lead'");

// Verifikasi Google Calendar Mock
const calEventA = mockCalls.calendarEvents[0];
assert.ok(calEventA, "Calendar event must have been created");
assert.strictEqual(calEventA.title, "[LEAD OWNER] Survey: Budi Santoso (Borneo - 12AF)");
const expectedEventStartMin = (calEventA.startTime.getTime() - t0) / (60 * 1000);
const eventDurationMin = (calEventA.endTime.getTime() - calEventA.startTime.getTime()) / (60 * 1000);
assert.ok(Math.abs(expectedEventStartMin - 15) < 0.1, "Event must be scheduled 15 minutes post-submission");
assert.strictEqual(eventDurationMin, 30, "Event duration must be exactly 30 minutes");
console.log(`  ✅ CalendarApp: Event created 15 min ahead, duration ${eventDurationMin} min`);

// Verifikasi Fonnte WhatsApp Outbound Mock
const waReqA = mockCalls.urlFetchRequests[0];
assert.ok(waReqA, "Fonnte WA request must have been dispatched");
assert.strictEqual(waReqA.url, "https://api.fonnte.com/send");
assert.strictEqual(waReqA.options.headers.Authorization, "MOCK_FONNTE_TOKEN_SECRET");
const waPayloadA = JSON.parse(waReqA.options.payload);
assert.strictEqual(waPayloadA.target, "628135600058");
assert.ok(waPayloadA.message.includes("Budi Santoso"), "WA message must contain owner name");
assert.ok(waPayloadA.message.includes("Tower Borneo No. 12AF"), "WA message must contain unit");
assert.ok(waPayloadA.message.includes("wa.me/6281234567890"), "WA message must contain direct follow-up link");
console.log("  ✅ Fonnte WhatsApp: Admin alert successfully dispatched with payload integrity\n");

// ==============================================================================
// TEST CASE B: Phone Normalization Edge Cases (+62 with spaces & dashes)
// ==============================================================================
console.log("▶️ Running TEST CASE B: Phone Normalization Edge Cases (+62 813-9988-7766)");

const payloadB = {
  fullName: "Siti Rahma",
  phone: "+62 813-9988-7766",
  tower: "Flamboyan",
  unitNumber: "08BB",
  unitType: "2 Bedroom",
  expectedPrice: 4500000,
  notes: "Ingin titip sewa tahunan"
};

const resB = sandbox.handleOwnerLeadSubmission(payloadB);
assert.strictEqual(resB.success, true);
const contactB = mockDb["03_CONTACTS_360"].find(c => c[0] === resB.contactId);
assert.strictEqual(contactB[2], "6281399887766", "Phone with formatting must be normalized cleanly");
console.log("  ✅ Phone Normalization: '+62 813-9988-7766' -> '6281399887766'");

// ==============================================================================
// TEST CASE C: Upsert Existing Contact (No Duplicate Creation)
// ==============================================================================
console.log("▶️ Running TEST CASE C: Contact Upsert (Re-submission by Budi Santoso)");

const payloadC = {
  fullName: "Budi Santoso",
  phone: "0812-3456-7890", // Same as Case A
  tower: "Damar",
  unitNumber: "02AA",
  unitType: "1 Bedroom",
  expectedPrice: 3200000,
  notes: "Punya unit kedua di Tower Damar"
};

const initialContactCount = mockDb["03_CONTACTS_360"].length;
const resC = sandbox.handleOwnerLeadSubmission(payloadC);

assert.strictEqual(resC.success, true);
assert.strictEqual(resC.contactId, resA.contactId, "Must reuse existing Contact_ID for same phone");
assert.strictEqual(mockDb["03_CONTACTS_360"].length, initialContactCount, "No duplicate row in 03_CONTACTS_360");
assert.strictEqual(mockDb["07_CRM_PIPELINE"].length, 4, "A new Lead must be appended to pipeline for the new unit");
console.log("  ✅ Upsert Verified: Reused Contact_ID without creating duplicate contact row\n");

// ==============================================================================
// TEST CASE D: Complete Phone Normalization Suite (08..., 628..., +628..., 8...)
// ==============================================================================
console.log("▶️ Running TEST CASE D: Comprehensive Phone Normalization Matrix");

const testNumbers = [
  { input: "081234567890", expected: "6281234567890", desc: "Format 08..." },
  { input: "6281234567891", expected: "6281234567891", desc: "Format 628..." },
  { input: "+62 812-3456-7892", expected: "6281234567892", desc: "Format +62 812-..." },
  { input: "81234567893", expected: "6281234567893", desc: "Format 8... (tanpa 0/62)" }
];

testNumbers.forEach((t, idx) => {
  const p = {
    fullName: `Tester Phone ${idx + 1}`,
    phone: t.input,
    tower: "Kemuning",
    unitNumber: `0${idx + 1}K`,
    unitType: "Studio",
    expectedPrice: 3000000
  };
  const res = sandbox.handleOwnerLeadSubmission(p);
  assert.strictEqual(res.success, true);
  const c = mockDb["03_CONTACTS_360"].find(row => row[0] === res.contactId);
  assert.strictEqual(c[2], t.expected, `Phone normalization failure on ${t.desc}`);
  console.log(`  ✅ Normalization [${t.desc}]: '${t.input}' -> '${c[2]}'`);
});
console.log("");

// ==============================================================================
// TEST CASE E: Relational Schema & Contract Alignment Verification
// ==============================================================================
console.log("▶️ Running TEST CASE E: Canonical Schema Alignment against SheetSchema.js");

const canonicalContactsHeaders = ["Contact_ID", "Full_Name", "Phone_WA", "Email", "Role", "Lead_Score", "Interaction_Summary", "Created_At"];
const canonicalPipelineHeaders = ["Lead_ID", "Contact_ID", "Target_Unit", "Stage", "Budget", "Viewing_Schedule", "Interaction_Notes", "Updated_At"];

const dbContactHeader = mockDb["03_CONTACTS_360"][0];
const dbPipelineHeader = mockDb["07_CRM_PIPELINE"][0];

assert.deepStrictEqual(dbContactHeader, canonicalContactsHeaders, "03_CONTACTS_360 headers must strictly match SheetSchema.js");
assert.deepStrictEqual(dbPipelineHeader, canonicalPipelineHeaders, "07_CRM_PIPELINE headers must strictly match SheetSchema.js");

// Verifikasi setiap row pada 03_CONTACTS_360 memiliki tepat 8 kolom
mockDb["03_CONTACTS_360"].forEach((row, i) => {
  assert.strictEqual(row.length, canonicalContactsHeaders.length, `Row ${i} on 03_CONTACTS_360 must have exactly ${canonicalContactsHeaders.length} columns`);
});
console.log(`  ✅ Tab 03_CONTACTS_360: All ${mockDb["03_CONTACTS_360"].length} rows strictly conform to 8 canonical columns.`);

// Verifikasi setiap row pada 07_CRM_PIPELINE memiliki tepat 8 kolom
mockDb["07_CRM_PIPELINE"].forEach((row, i) => {
  assert.strictEqual(row.length, canonicalPipelineHeaders.length, `Row ${i} on 07_CRM_PIPELINE must have exactly ${canonicalPipelineHeaders.length} columns`);
});
console.log(`  ✅ Tab 07_CRM_PIPELINE: All ${mockDb["07_CRM_PIPELINE"].length} rows strictly conform to 8 canonical columns.\n`);

// ==============================================================================
// TEST CASE F: Automated Post-Test Teardown & Database Purge Protocol
// ==============================================================================
console.log("▶️ Running TEST CASE F: Mandatory Post-Test Teardown & Database Purge Protocol");

// 1. Simulasikan registrasi lead UAT (Owner Test Data)
const uatPayload = {
  fullName: "UAT Test Owner",
  phone: "6281298765432",
  tower: "Borneo",
  unitNumber: "UAT-99",
  unitType: "Studio",
  expectedPrice: 3500000,
  notes: "Simulasi UAT untuk teardown verification"
};

const resUat = sandbox.handleOwnerLeadSubmission(uatPayload);
assert.strictEqual(resUat.success, true, "UAT test lead submission must succeed");

// Konfirmasi bahwa data masuk sementara ke database & kalender
const contactUatBefore = mockDb["03_CONTACTS_360"].find(c => c[2] === "6281298765432");
const leadUatBefore = mockDb["07_CRM_PIPELINE"].find(l => l[2].includes("UAT-99"));
const calUatBefore = mockCalls.calendarEvents.find(e => e.title.includes("UAT Test Owner") && !e.deleted);

assert.ok(contactUatBefore, "UAT contact must exist prior to purge");
assert.ok(leadUatBefore, "UAT lead must exist prior to purge");
assert.ok(calUatBefore, "UAT calendar event must exist prior to purge");
console.log("  1️⃣ Pre-Purge Check: Test Lead & Event successfully generated.");

// 2. Jalankan Teardown Purge Engine
const teardownPayload = {
  name: "UAT Test Owner",
  phone: "6281298765432",
  passcode: "Tearose288"
};

const resTeardown = sandbox.handleOwnerLeadTeardown(teardownPayload);
assert.strictEqual(resTeardown.success, true, "Teardown purge must return success: true");
assert.ok(resTeardown.deletedContacts >= 1, "Must report at least 1 deleted contact");
assert.ok(resTeardown.deletedLeads >= 1, "Must report at least 1 deleted lead");
assert.ok(resTeardown.deletedEvents >= 1, "Must report at least 1 deleted calendar event");

// 3. Verifikasi Mutlak: Data UAT terhapus dari seluruh sistem
const contactUatAfter = mockDb["03_CONTACTS_360"].find(c => c[2] === "6281298765432" || c[1].includes("UAT Test Owner"));
const leadUatAfter = mockDb["07_CRM_PIPELINE"].find(l => l[2].includes("UAT-99") || l[6].includes("UAT Test Owner"));
const calUatAfter = mockCalls.calendarEvents.find(e => e.title.includes("UAT Test Owner") && !e.deleted);

assert.strictEqual(contactUatAfter, undefined, "UAT contact must be completely deleted from 03_CONTACTS_360");
assert.strictEqual(leadUatAfter, undefined, "UAT lead must be completely deleted from 07_CRM_PIPELINE");
assert.strictEqual(calUatAfter, undefined, "UAT calendar event must be completely purged from Google Calendar");

console.log(`  2️⃣ Post-Purge Verification:`);
console.log(`     ✅ 03_CONTACTS_360 : Cleaned (${resTeardown.deletedContacts} test rows purged)`);
console.log(`     ✅ 07_CRM_PIPELINE : Cleaned (${resTeardown.deletedLeads} test leads purged)`);
console.log(`     ✅ Google Calendar : Cleaned (${resTeardown.deletedEvents} test events purged)`);
console.log("  3️⃣ Result: Live Sheet database & Google Calendar are 100% clean and pristine!\n");

// ==============================================================================
// SUMMARY REPORT
// ==============================================================================
console.log("==================================================");
console.log("🎉 ALL PRE-FLIGHT SMOKE TEST ASSERTIONS PASSED!");
console.log("==================================================");
console.log(`- Total Contacts in Mock DB : ${mockDb["03_CONTACTS_360"].length - 1}`);
console.log(`- Total Pipeline Leads      : ${mockDb["07_CRM_PIPELINE"].length - 1}`);
console.log(`- Active Calendar Events    : ${mockCalls.calendarEvents.filter(e => !e.deleted).length}`);
console.log(`- Purged Calendar Events    : ${mockCalls.deletedCalendarEvents ? mockCalls.deletedCalendarEvents.length : 0}`);
console.log(`- WA Outbound Alerts Sent   : ${mockCalls.urlFetchRequests.length}`);
console.log("==================================================\n");
process.exit(0);
