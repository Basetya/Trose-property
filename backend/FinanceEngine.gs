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