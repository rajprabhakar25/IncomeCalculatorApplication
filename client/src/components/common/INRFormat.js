import React from 'react';
import { formatINR } from '../../utils/formatCurrency';

/**
 * Renders a formatted INR amount.
 * Usage: <INRFormat amount={100000} />  → ₹1,00,000
 */
function INRFormat({ amount, className }) {
  return <span className={className}>{formatINR(amount)}</span>;
}

export default INRFormat;
