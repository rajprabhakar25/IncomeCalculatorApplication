import React, { useState, useMemo } from 'react';
import { calcEligibility } from '../../utils/calculations';
import { formatINR, formatINRDecimal, formatLakhs, formatPercent } from '../../utils/formatCurrency';
import WarningBadge from '../common/WarningBadge';
import { SAMPLE_DATA } from '../../constants/sampleData';

// Helper: return null when the right panel has no valid calc
const BLANK = '—';

function EligibilityModule({ caseData, onSave }) {
  const netMonthlyIncome = caseData.pnl?.netMonthlyIncome || 0;
  const savedElig = caseData.eligibility || {};
  const sampleElig = SAMPLE_DATA[caseData.businessType]?.eligibility || {};

  // Controlled inputs — seeded from saved → sample → nothing
  const [iirThreshold, setIirThreshold]   = useState(savedElig.iirThreshold   ?? sampleElig.iirThreshold   ?? '');
  const [roiPercent,   setRoiPercent]     = useState(savedElig.roiPercent      ?? sampleElig.roiPercent     ?? '');
  const [tenureYears,  setTenureYears]    = useState(savedElig.tenureYears     ?? sampleElig.tenureYears    ?? '');
  const [existingEMI,  setExistingEMI]   = useState(savedElig.existingEMI     ?? sampleElig.existingEMI    ?? 0);
  const [recommendedLoan, setRecommendedLoan] = useState(savedElig.recommendedLoan ?? sampleElig.recommendedLoan ?? 0);
  const [saving, setSaving] = useState(false);

  // ── Validation for the three REQUIRED fields ──────────────────────────────
  const iirNum    = iirThreshold === '' ? null : Number(iirThreshold);
  const roiNum    = roiPercent   === '' ? null : Number(roiPercent);
  const tenureNum = tenureYears  === '' ? null : Number(tenureYears);

  const errors = {
    iir:    (iirNum === null || iirNum <= 0 || iirNum > 100) ? 'Required — enter a value between 1 and 100' : null,
    roi:    (roiNum === null || roiNum <= 0)                 ? 'Required — enter the rate of interest'      : null,
    tenure: (tenureNum === null || tenureNum < 1)            ? 'Required — enter at least 1 year'           : null,
  };
  const hasErrors = errors.iir || errors.roi || errors.tenure;

  // ── Calculations — only run when all required fields are valid ────────────
  // Validation is re-derived inside useMemo from the same state deps so ESLint is satisfied
  const calc = useMemo(() => {
    const iirN    = iirThreshold === '' ? null : Number(iirThreshold);
    const roiN    = roiPercent   === '' ? null : Number(roiPercent);
    const tenN    = tenureYears  === '' ? null : Number(tenureYears);
    if (!iirN || iirN <= 0 || iirN > 100) return null;
    if (!roiN || roiN <= 0)               return null;
    if (!tenN || tenN < 1)                return null;
    return calcEligibility({
      netMonthlyIncome,
      iirThreshold:    iirN,
      roiPercent:      roiN,
      tenureYears:     tenN,
      existingEMI:     Number(existingEMI)     || 0,
      recommendedLoan: Number(recommendedLoan) || 0,
    });
  }, [netMonthlyIncome, iirThreshold, roiPercent, tenureYears, existingEMI, recommendedLoan]);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      netIncome:       netMonthlyIncome,
      iirThreshold:    iirNum,
      incomeForLoan:   calc.incomeForLoan,
      roiPercent:      roiNum,
      tenureYears:     tenureNum,
      tenureMonths:    calc.tenureMonths,
      emiPerLakh:      calc.emiPerLakh,
      loanEligibility: calc.loanEligibility,
      existingEMI:     Number(existingEMI)     || 0,
      recommendedLoan: Number(recommendedLoan) || 0,
      finalEMI:        calc.finalEMI,
      iirCurrent:      calc.iirCurrent,
      iirCombined:     calc.iirCombined,
    });
    setSaving(false);
  };

  const iirLimit = iirNum || 50;
  const iirWarning = calc && calc.iirCombined > iirLimit
    ? `IIR (Combined) is ${formatPercent(calc.iirCombined)} — exceeds ${iirLimit}% threshold`
    : calc && calc.iirCurrent > iirLimit
    ? `IIR (Current) is ${formatPercent(calc.iirCurrent)} — exceeds ${iirLimit}% threshold`
    : null;

  // Inline style for invalid fields
  const invalidStyle = { borderColor: '#c81e1e' };

  return (
    <div>
      <div className="card">
        <div className="card-title">Loan Eligibility Calculator</div>

        {netMonthlyIncome === 0 && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            Please complete and save the P&L tab first to carry over Net Monthly Income.
          </div>
        )}

        {iirWarning && <WarningBadge message={iirWarning} type="danger" />}

        <div className="grid-2" style={{ gap: 24 }}>
          {/* LEFT: Inputs */}
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#374151' }}>Assessment Parameters</h3>

            {/* Net Monthly Income — read-only, flows from P&L */}
            <div className="form-group">
              <label className="form-label">Net Monthly Income (from P&L)</label>
              <input className="form-control" value={formatINR(netMonthlyIncome)} readOnly />
            </div>

            {/* IIR Threshold — required */}
            <div className="form-group">
              <label className="form-label">IIR Threshold % <span style={{ color: '#c81e1e' }}>*</span></label>
              <input
                className="form-control"
                type="number"
                min="1"
                max="100"
                style={errors.iir ? invalidStyle : undefined}
                value={iirThreshold}
                onChange={e => setIirThreshold(e.target.value)}
              />
              {errors.iir
                ? <small style={{ color: '#c81e1e' }}>{errors.iir}</small>
                : <small style={{ color: '#6b7280' }}>Income considered for EMI repayment</small>
              }
            </div>

            {/* Rate of Interest — required */}
            <div className="form-group">
              <label className="form-label">Rate of Interest (% per annum) <span style={{ color: '#c81e1e' }}>*</span></label>
              <input
                className="form-control"
                type="number"
                min="0"
                step="0.1"
                style={errors.roi ? invalidStyle : undefined}
                value={roiPercent}
                onChange={e => setRoiPercent(e.target.value)}
              />
              {errors.roi && <small style={{ color: '#c81e1e' }}>{errors.roi}</small>}
            </div>

            {/* Loan Tenure — required */}
            <div className="form-group">
              <label className="form-label">Loan Tenure (Years) <span style={{ color: '#c81e1e' }}>*</span></label>
              <input
                className="form-control"
                type="number"
                min="1"
                max="30"
                style={errors.tenure ? invalidStyle : undefined}
                value={tenureYears}
                onChange={e => setTenureYears(e.target.value)}
              />
              {errors.tenure && <small style={{ color: '#c81e1e' }}>{errors.tenure}</small>}
            </div>

            {/* Existing EMI — optional, defaults to 0 */}
            <div className="form-group">
              <label className="form-label">Existing EMI Obligations (₹/month)</label>
              <input
                className="form-control"
                type="number"
                min="0"
                value={existingEMI}
                onChange={e => setExistingEMI(e.target.value)}
              />
            </div>

            {/* Recommended Loan — optional */}
            <div className="form-group">
              <label className="form-label">Recommended Loan Amount (₹)</label>
              <input
                className="form-control"
                type="number"
                min="0"
                value={recommendedLoan}
                onChange={e => setRecommendedLoan(e.target.value)}
              />
              <small style={{ color: '#6b7280' }}>
                {calc
                  ? <>Loan eligibility: {formatLakhs(calc.loanEligibility * 100000)}</>
                  : 'Fill required fields above to see eligibility'
                }
              </small>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#374151' }}>Eligibility Results</h3>

            {hasErrors && (
              <div className="alert alert-error" style={{ marginBottom: 12, fontSize: 13 }}>
                Fill in all required fields (*) on the left to see results.
              </div>
            )}

            <div className="totals-section" style={{ marginTop: 0 }}>
              <div className="totals-row">
                <span className="totals-label">Net Monthly Income</span>
                <span className="totals-value">{formatINR(netMonthlyIncome)}</span>
              </div>
              <div className="totals-row">
                <span className="totals-label">IIR Threshold</span>
                <span className="totals-value">{calc ? `${iirNum}%` : BLANK}</span>
              </div>
              <div className="totals-row">
                <span className="totals-label">Income Considered for Loan</span>
                <span className="totals-value">{calc ? formatINR(calc.incomeForLoan) : BLANK}</span>
              </div>
              <div className="totals-row">
                <span className="totals-label">Tenure</span>
                <span className="totals-value">
                  {calc ? `${tenureNum} Years (${calc.tenureMonths} Months)` : BLANK}
                </span>
              </div>
              <div className="totals-row">
                <span className="totals-label">
                  EMI per ₹1 Lakh{calc ? ` @ ${roiNum}%` : ''}
                </span>
                <span className="totals-value">{calc ? formatINRDecimal(calc.emiPerLakh) : BLANK}</span>
              </div>
              <div className="totals-row">
                <span className="totals-label" style={{ fontWeight: 700, fontSize: 15 }}>Loan Eligibility</span>
                <span className="totals-value text-success" style={{ fontSize: 17, fontWeight: 700 }}>
                  {calc ? formatLakhs(calc.loanEligibility * 100000) : BLANK}
                </span>
              </div>

              <div style={{ borderTop: '1px dashed #d1d5db', margin: '8px 0' }} />

              <div className="totals-row">
                <span className="totals-label">Recommended Loan</span>
                <span className="totals-value">{formatINR(Number(recommendedLoan) || 0)}</span>
              </div>
              <div className="totals-row">
                <span className="totals-label">Final EMI (on recommended loan)</span>
                <span className="totals-value">{calc ? formatINRDecimal(calc.finalEMI) : BLANK}</span>
              </div>
              <div className="totals-row">
                <span className="totals-label">Existing EMI</span>
                <span className="totals-value">{formatINR(Number(existingEMI) || 0)}</span>
              </div>

              <div style={{ borderTop: '2px solid #374151', marginTop: 8, paddingTop: 8 }}>
                <div className="totals-row">
                  <span className="totals-label">IIR — Current Loan</span>
                  <span className={calc ? (calc.iirCurrent > iirLimit ? 'iir-danger' : 'iir-safe') : ''}>
                    {calc ? formatPercent(calc.iirCurrent) : BLANK}
                  </span>
                </div>
                <div className="totals-row">
                  <span className="totals-label">IIR — Combined (incl. existing)</span>
                  <span className={calc ? (calc.iirCombined > iirLimit ? 'iir-danger' : 'iir-safe') : ''}>
                    {calc ? formatPercent(calc.iirCombined) : BLANK}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || !calc || netMonthlyIncome === 0}
          >
            {saving ? 'Saving...' : 'Save Eligibility'}
          </button>
          {netMonthlyIncome === 0 && (
            <small style={{ color: '#9ca3af' }}>Save P&L first</small>
          )}
          {netMonthlyIncome > 0 && hasErrors && (
            <small style={{ color: '#c81e1e' }}>Fill required fields to enable save</small>
          )}
        </div>
      </div>
    </div>
  );
}

export default EligibilityModule;
