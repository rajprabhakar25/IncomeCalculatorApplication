/**
 * All financial calculation functions for the Income Assessment App.
 */

// ─── Turnover calculations per business type ──────────────────────────────

/**
 * Grocery: daily = qty × salePrice, monthly = daily × 25
 */
export function calcGroceryItem(item) {
  const dailySales = (Number(item.qtyPerDay) || 0) * (Number(item.salePrice) || 0);
  const monthlySales = dailySales * 25;
  return { dailySales, monthlySales };
}

/**
 * Dairy: societyTotal + individualTotal = incomePerDay; incomePerMonth = day × 30
 */
export function calcDairyItem(item) {
  const societyTotal = (Number(item.societyQty) || 0) * (Number(item.societyRate) || 0);
  const individualTotal = (Number(item.individualQty) || 0) * (Number(item.individualRate) || 0);
  const dailySales = societyTotal + individualTotal;
  const monthlySales = dailySales * 30;
  return { societyTotal, individualTotal, dailySales, monthlySales };
}

/**
 * Tea Shop:
 *   - If milkLitres > 0 (tea/coffee): daily = milkLitres × cupsPerLitre × rate
 *   - Else (snacks): daily = qtyPerDay × rate
 *   monthly = daily × 30
 */
export function calcTeaShopItem(item) {
  let dailySales;
  if (Number(item.milkLitres) > 0) {
    dailySales = (Number(item.milkLitres) || 0) * (Number(item.cupsPerLitre) || 0) * (Number(item.rate) || 0);
  } else {
    dailySales = (Number(item.qtyPerDay) || 0) * (Number(item.rate) || 0);
  }
  const monthlySales = dailySales * 30;
  return { dailySales, monthlySales };
}

/**
 * Hotel: daily = rate × unitsPerDay; monthly = daily × 25
 */
export function calcHotelItem(item) {
  const dailySales = (Number(item.rate) || 0) * (Number(item.unitsPerDay) || 0);
  const monthlySales = dailySales * 25;
  return { dailySales, monthlySales };
}

/**
 * Tailoring: monthly = monthlyQty × ratePerPiece (no daily)
 */
export function calcTailoringItem(item) {
  const monthlySales = (Number(item.monthlyQty) || 0) * (Number(item.ratePerPiece) || 0);
  return { monthlySales, dailySales: null };
}

// ─── Aggregation ──────────────────────────────────────────────────────────

/**
 * Compute totals from an array of items with monthlySales values.
 */
export function calcTurnoverTotals(items, grossMarginPercent) {
  const totalMonthlyTurnover = items.reduce((sum, item) => sum + (Number(item.monthlySales) || 0), 0);
  const margin = Number(grossMarginPercent) || 0;
  const grossProfit = totalMonthlyTurnover * (margin / 100);
  return { totalMonthlyTurnover, grossProfit };
}

// ─── P&L ──────────────────────────────────────────────────────────────────

/**
 * Net Monthly Income = Gross Profit - Total Expenses
 */
export function calcPnL(grossProfit, expenses) {
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const netMonthlyIncome = grossProfit - totalExpenses;
  return { totalExpenses, netMonthlyIncome };
}

// ─── Loan Eligibility ─────────────────────────────────────────────────────

/**
 * PMT formula: EMI per ₹1 lakh principal.
 * annualRatePercent: e.g. 16.5 for 16.5%
 * tenureYears: e.g. 10
 */
export function calculateEMIPerLakh(annualRatePercent, tenureYears) {
  const monthlyRate = annualRatePercent / 100 / 12;
  const totalMonths = tenureYears * 12;
  const principal = 100000;
  if (monthlyRate === 0) return principal / totalMonths;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);
  return emi;
}

/**
 * EMI for an arbitrary principal amount.
 */
export function calculateEMI(principal, annualRatePercent, tenureYears) {
  const monthlyRate = annualRatePercent / 100 / 12;
  const totalMonths = tenureYears * 12;
  if (monthlyRate === 0) return principal / totalMonths;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);
  return emi;
}

/**
 * Full eligibility calculation.
 */
export function calcEligibility({ netMonthlyIncome, iirThreshold, roiPercent, tenureYears, existingEMI, recommendedLoan }) {
  const incomeForLoan = netMonthlyIncome * (iirThreshold / 100);
  const tenureMonths = tenureYears * 12;
  const emiPerLakh = calculateEMIPerLakh(roiPercent, tenureYears);
  const loanEligibility = emiPerLakh > 0 ? incomeForLoan / emiPerLakh : 0; // in lakhs

  const recLoan = Number(recommendedLoan) || 0;
  const finalEMI = recLoan > 0 ? calculateEMI(recLoan, roiPercent, tenureYears) : 0;
  const iirCurrent = netMonthlyIncome > 0 ? (finalEMI / netMonthlyIncome) * 100 : 0;
  const iirCombined = netMonthlyIncome > 0 ? ((finalEMI + (Number(existingEMI) || 0)) / netMonthlyIncome) * 100 : 0;

  return {
    incomeForLoan,
    tenureMonths,
    emiPerLakh,
    loanEligibility,      // in lakhs (raw number, e.g. 11.06)
    finalEMI,
    iirCurrent,
    iirCombined,
  };
}
