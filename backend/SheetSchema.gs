/**
 * Trose Property Manager - Sheet Schema Initializer (v4.0 Phase 2)
 * File: backend/SheetSchema.gs
 */

function initializeAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const schemas = [
    {
      name: "01_PROPERTIES",
      headers: ["Property_ID", "Property_Name", "Address", "Towers", "Manager_Contact", "Asset_Valuation", "Notes"]
    },
    {
      name: "02_UNITS",
      headers: ["Unit_ID", "Property_ID", "Tower", "Floor", "Unit_No", "Type", "Status", "Base_Rent", "IPL_Fee", "Management_Fee_Percent", "Landlord_Name", "Landlord_Phone", "Payment_Route", "Bank_Name", "Bank_Account_No", "Bank_Holder_Name"]
    },
    {
      name: "03_CONTACTS_360",
      headers: ["Contact_ID", "Full_Name", "Phone_WA", "Email", "Role", "Lead_Score", "Notes", "Created_At"]
    },
    {
      name: "04_LEASES",
      headers: ["Lease_ID", "Unit_ID", "Tenant_ID", "Start_Date", "End_Date", "Deposit_Amount", "Monthly_Rent", "Leasing_Commission_Fee", "Payment_Route", "Status", "Created_At"]
    },
    {
      name: "05_INVOICES",
      headers: ["Invoice_ID", "Lease_ID", "Unit_ID", "Period", "Rent_Fee", "Utility_Fee", "IPL_Fee", "Unique_Code", "Total_Amount", "Status", "Payment_Route", "Bank_Name", "Bank_Account_No", "Bank_Holder_Name", "Proof_URL", "Issued_Date", "Paid_Date"]
    },
    {
      name: "06_MAINTENANCE",
      headers: ["Ticket_ID", "Unit_ID", "Tenant_ID", "Issue_Description", "Photo_URL", "Priority", "Status", "Estimated_Cost", "Assigned_Vendor", "Created_At", "Resolved_At"]
    },
    {
      name: "07_CRM_PIPELINE",
      headers: ["Lead_ID", "Contact_ID", "Target_Unit", "Stage", "Budget_Monthly", "Viewing_Schedule", "Interaction_Notes", "Updated_At"]
    },
    {
      name: "08_FINANCIAL_LOGS",
      headers: ["Transaction_ID", "Related_ID", "Unit_ID", "Category", "Role_Target", "Type", "Amount", "Description", "Date_Logged"]
    },
    {
      name: "09_INSPECTIONS",
      headers: ["Inspection_ID", "Unit_ID", "Lease_ID", "Type", "Living_Room_Condition", "Bedroom_Condition", "Bathroom_Condition", "AC_Condition", "Photo_URLs", "Deposit_Deduction_Est", "Inspector_Notes", "Inspection_Date"]
    }
  ];

  schemas.forEach(function(schema) {
    let sheet = ss.getSheetByName(schema.name);
    if (!sheet) {
      sheet = ss.insertSheet(schema.name);
    } else {
      sheet.clear();
    }
    
    sheet.appendRow(schema.headers);
    const headerRange = sheet.getRange(1, 1, 1, schema.headers.length);
    headerRange.setBackground("#0f172a").setFontColor("#ffffff").setFontWeight("bold");
    sheet.setFrozenRows(1);
    
    for (let col = 1; col <= schema.headers.length; col++) {
      sheet.autoResizeColumn(col);
    }
  });

  return { success: true, message: "Trose database 9 tabs initialized successfully for Phase 2!" };
}
