import React, { useState, useMemo } from 'react';
import { calcEligibility } from '../../utils/calculations';
import { formatINR, formatLakhs, formatPercent } from '../../utils/formatCurrency';
import WarningBadge from '../common/WarningBadge';

function EligibilityModule({ caseData, onSave }) {
  const netMonthlyIncome = caseData.pnl?.netMonthlyIncome || 0;
  const savedElig = caseData.eligibility || {};

  const [iirThreshold, setIirThreshold] = useState(savedElig.iirThreshold ?? 50);
  const [roiPercent, setRoiPercent] = useState(savedElig.roiPercent ?? 16.5);
  const [tenureYears, setTenureYears] = useState(savedElig.tenureYears ?? 10);
  const [existingEMI, setExistingEMI] = useState(savedElig.existingEMI ?? 0);
  const [recommendedLoan, setRecommendedLoan] = useState(savedElig.recommendedLoan ?? 0);
  const [saving, setSaving] = useState(false);

  // All calculations are derived (real-time)
  const calc = useMemo(() => calcEligibility({
    netMonthlyIncome,
    iirThreshold: Number(iirThreshold) || 50,
    roiPercent: Number(roiPercent) || 16.5,
    tenureYears: Number(tenureYears) || 10,
    existingEMI: Number(existingEMI) || 0,
    recommendedLoan: Number(recommendedLoan) || 0,
  }), [netMonthlyIncome, iirThreshold, roiPercent, tenureYears, existingEMI, recommendedLoan]);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      netIncome: netMonthlyIncome,
      iirThreshold: Number(iirThreshold),
      incomeForLoan: calc.incomeForLoan,
      roiPercent: Number(roiPercent),
      tenureYears: Number(tenureYears),
      tenureMonths: calc.tenureMonths,
      emiPerLakh: calc.emiPerLakh,
      loanEligibility: calc.loanEligibility,
      existingEMI: Number(existingEMI),
      recommendedLoan: Number(recommendedLoan),
      finalEMI: calc.finalEMI,
      iirCurrent: calc.iirCurrent,
      iirCombined: calc.iirCombined,
    });
    setSaving(false);
  };

  const iirWarning = calc.iirCombined > 50
    ? `IIR (Combined) is ${formatPercent(calc.iirCombined)} — exceeds 50% threshold`
    : calc.iirCurrent > 50
    ? `IIR (Current) is ${formatPercent(calc.iirCurrent)} — exceeds 50% threshold`
    : null;

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

            <div className="form-group">
              <label className="form-label">Net Monthly Income (from P&L)</label>
              <input className="form-control" value={formatINR(netMonthlyIncome)} readOnly />
            </div>

            <div className="form-group">
              <label className="form-label">IIR Threshold %</label>
              <input
                className="form-control"
                type="number" min="1" max="100"
                value={iirThreshold}
                onChange={e => setIirThreshold(e.target.value)}
              />
              <small style={{ color: '#6b7280' }}>Income considered for EMI repayment (default: 50%)</small>
            </div>

            <div className="form-group">
              <label className="form-label">Rate of Interest (% per annum)</label>
              <input
                className="form-control"
                type="number" min="0" step="0.1"
                value={roiPercent}
                onChange={e => setRoiPercent(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Loan Tenure (Years)</label>
              <input
                className="form-control"
                type="number" min="1" max="30"
                value={tenureYears}
                onChange={e => setTenureYears(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Existing EMI Obligations (₹/month)</label>
              <input
                className="form-control"
                type="number" min="0"
                value={existingEMI}
                onChange={e => setExistingEMI(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Recommended Loan Amount (₹) — Officer Override</label>
              <input
                className="form-control"
                type="number" min="0"
                value={recommendedLoan}
                onChange={e => setRecommendedLoan(e.target.value)}
                placeholder="Leave 0 to use eligibility amount"
              />
              <small style={{ color: '#6b7280' }}>
                Loan eligibility: {formatLakhs(calc.loanEligibility * 100000)}
              </small>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#374151' }}>Eligibility Results</h3>

            <div className="totals-section" style={{ marginTop: 0 }}>
              <div className="totals-row">
                <span className="totals-label">Net Monthly Income</span>
                <span className="totals-value">{formatINR(netMonthlyIncome)}</span>
              </div>
              <div className="totals-row">
                <span className="totals-label">IIR Threshold</span>
                <span className="totals-value">{iirThreshold}%</span>
              </div>
              <div className="totals-row">
                <span className="totals-label">Income Considered for Loan</span>
                <span className="totals-value">{formatINR(calc.incomeForLoan)}</span>
              </div>
              <div className="totals-row">
                <span className="totals-label">Tenure</span>
                <span className="totals-value">{tenureYears} Years ({calc.tenureMonths} Months)</span>
              </div>
              <div className="totals-row">
                <span className="totals-label">EMI per ₹1 Lakh @ {roiPercent}%</span>
                <span className="totals-value">{formatINR(Math.round(calc.emiPerLakh))}</span>
              </div>
              <div className="totals-row">
                <span className="totals-label" style={{ fontWeight: 700, fontSize: 15 }}>Loan Eligibility</span>
                <span className="totals-value text-success" style={{ fontSize: 17, fontWeight: 700 }}>
                  {formatLakhs(calc.loanEligibility * 100000)}
                </span>
              </div>

              <div style={{ borderTop: '1px dashed #d1d5db', margin: '8px 0' }} />

              <div className="totals-row">
                <span className="totals-label">Recommended Loan</span>
                <span className="totals-value">{formatINR(Number(recommendedLoan) || 0)}</span>
              </div>
              <div className="totals-row">
                <span className="totals-label">Final EMI (on recommended loan)</span>
                <span className="totals-value">{formatINR(Math.round(calc.finalEMI))}</span>
              </div>
              <div className="totals-row">
                <span className="totals-label">Existing EMI</span>
                <span className="totals-value">{formatINR(Number(existingEMI) || 0)}</span>
              </div>

              <div style={{ borderTop: '2px solid #374151', marginTop: 8, paddingTop: 8 }}>
                <div className="totals-row">
                  <span className="totals-label">IIR — Current Loan</span>
                  <span className={calc.iirCurrent > 50 ? 'iir-danger' : 'iir-safe'}>
                    {formatPercent(calc.iirCurrent)}
                  </span>
                </div>
                <div className="totals-row">
                  <span className="totals-label">IIR — Combined (incl. existing)</span>
                  <span className={calc.iirCombined > 50 ? 'iir-danger' : 'iir-safe'}>
                    {formatPercent(calc.iirCombined)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Eligibility'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EligibilityModule;
