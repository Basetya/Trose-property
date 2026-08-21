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