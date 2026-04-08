/**
 * Format a number as Indian Rupees using the en-IN locale.
 * e.g. 100000 → "₹1,00,000"
 */
export function formatINR(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  const num = Number(amount);
  return '₹' + num.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
}

/**
 * Format as lakhs with 2 decimal places.
 * e.g. 1106000 → "₹11.06 Lakhs"
 */
export function formatLakhs(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0 Lakhs';
  const lakhs = Number(amount) / 100000;
  return '₹' + lakhs.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }) + ' Lakhs';
}

/**
 * Format a decimal percentage value.
 * e.g. 16.5 → "16.50%"
 */
export function formatPercent(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return Number(value).toFixed(decimals) + '%';
}
