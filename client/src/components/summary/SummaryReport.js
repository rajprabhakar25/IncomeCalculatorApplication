import React from 'react';
import { formatINR, formatLakhs, formatPercent } from '../../utils/formatCurrency';
import { BUSINESS_CONFIGS } from '../../constants/businessConfig';
import WarningBadge from '../common/WarningBadge';

function SummaryReport({ caseData }) {
  const config = BUSINESS_CONFIGS[caseData.businessType] || {};
  const turnover = caseData.turnover || {};
  const pnl = caseData.pnl || {};
  const elig = caseData.eligibility || {};

  const iirWarning = elig.iirCombined > 50
    ? `IIR (Combined) is ${formatPercent(elig.iirCombined)} — exceeds 50% threshold`
    : elig.iirCurrent > 50
    ? `IIR (Current) is ${formatPercent(elig.iirCurrent)} — exceeds 50% threshold`
    : null;

  const handlePrint = () => window.print();

  return (
    <div>
      <div className="no-print" style={{ marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={handlePrint}>🖨 Print Summary</button>
      </div>

      {/* ── CUSTOMER DETAILS ─────────────────────── */}
      <div className="card">
        <div className="print-title" style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
          Income Assessment Report
        </div>

        <div className="grid-2">
          <div>
            <table style={{ width: '100%', fontSize: 14 }}>
              <tbody>
                {[
                  ['Customer Name', caseData.customerName],
                  ['Business Name', caseData.businessName],
                  ['Business Type', config.label || caseData.businessType],
                  ['Location', caseData.location || '—'],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td style={{ padding: '5px 0', color: '#6b7280', width: '45%' }}>{label}</td>
                    <td style={{ padding: '5px 0', fontWeight: 500 }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <table style={{ width: '100%', fontSize: 14 }}>
              <tbody>
                {[
                  ['Assessment Date', new Date(caseData.assessmentDate).toLocaleDateString('en-IN')],
                  ['Status', caseData.status],
                  ['Created', new Date(caseData.createdAt).toLocaleDateString('en-IN')],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td style={{ padding: '5px 0', color: '#6b7280', width: '45%' }}>{label}</td>
                    <td style={{ padding: '5px 0', fontWeight: 500, textTransform: 'capitalize' }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── TURNOVER SUMMARY ─────────────────────── */}
      <div className="card">
        <div className="card-title">1. Turnover Summary</div>
        {turnover.items && turnover.items.length > 0 ? (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Item / Garment / Product</th>
                    <th style={{ textAlign: 'right' }}>Monthly Sales (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {turnover.items.map((item, i) => (
                    <tr key={i}>
                      <td>{item.itemName || item.session || `Item ${i + 1}`}</td>
                      <td style={{ textAlign: 'right' }}>{formatINR(item.monthlySales || 0)}</td>
                    </tr>
                  ))}
                  <tr className="table-total-row">
                    <td>Total Monthly Turnover</td>
                    <td style={{ textAlign: 'right', color: '#057a55' }}>{formatINR(turnover.totalMonthlyTurnover || 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', gap: 32, marginTop: 12, fontSize: 14 }}>
              <span>Gross Margin: <strong>{turnover.grossMarginPercent || 0}%</strong></span>
              <span>Gross Profit: <strong style={{ color: '#057a55' }}>{formatINR(turnover.grossProfit || 0)}</strong></span>
            </div>
          </>
        ) : (
          <p style={{ color: '#9ca3af' }}>Turnover data not entered yet.</p>
        )}
      </div>

      {/* ── P&L SUMMARY ──────────────────────────── */}
      <div className="card">
        <div className="card-title">2. Profit & Loss Summary</div>

        <div className="grid-2">
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#374151' }}>Expenses</h4>
            {pnl.expenses && pnl.expenses.length > 0 ? (
              <table style={{ width: '100%', fontSize: 13 }}>
                <tbody>
                  {pnl.expenses.filter(e => e.amount > 0).map((exp, i) => (
                    <tr key={i}>
                      <td style={{ padding: '4px 0', color: '#374151' }}>{exp.name}</td>
                      <td style={{ textAlign: 'right', padding: '4px 0' }}>{formatINR(exp.amount)}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '2px solid #374151', fontWeight: 700 }}>
                    <td style={{ padding: '6px 0' }}>Total Expenses</td>
                    <td style={{ textAlign: 'right', padding: '6px 0', color: '#c81e1e' }}>{formatINR(pnl.totalExpenses || 0)}</td>
                  </tr>
                </tbody>
              </table>
            ) : <p style={{ color: '#9ca3af' }}>P&L not entered yet.</p>}
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#374151' }}>Income Summary</h4>
            <div className="totals-section" style={{ marginTop: 0 }}>
              <div className="totals-row">
                <span>Gross Profit</span>
                <span className="totals-value text-success">{formatINR(turnover.grossProfit || 0)}</span>
              </div>
              <div className="totals-row">
                <span>Total Expenses</span>
                <span className="totals-value text-danger">{formatINR(pnl.totalExpenses || 0)}</span>
              </div>
              <div className="totals-row" style={{ fontWeight: 700 }}>
                <span>Net Monthly Income</span>
                <span className={`totals-value ${(pnl.netMonthlyIncome || 0) >= 0 ? 'text-success' : 'text-danger'}`}
                  style={{ fontSize: 16 }}>
                  {formatINR(pnl.netMonthlyIncome || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ELIGIBILITY SUMMARY ───────────────────── */}
      <div className="card">
        <div className="card-title">3. Loan Eligibility</div>

        {iirWarning && <WarningBadge message={iirWarning} type="danger" />}

        <div className="grid-2">
          <div className="totals-section" style={{ marginTop: 0 }}>
            <div className="totals-row">
              <span>Net Monthly Income</span>
              <span className="totals-value">{formatINR(elig.netIncome || 0)}</span>
            </div>
            <div className="totals-row">
              <span>IIR Threshold</span>
              <span className="totals-value">{elig.iirThreshold || 50}%</span>
            </div>
            <div className="totals-row">
              <span>Income for Loan</span>
              <span className="totals-value">{formatINR(elig.incomeForLoan || 0)}</span>
            </div>
            <div className="totals-row">
              <span>ROI</span>
              <span className="totals-value">{elig.roiPercent || 16.5}% p.a.</span>
            </div>
            <div className="totals-row">
              <span>Tenure</span>
              <span className="totals-value">{elig.tenureYears || 10} Years</span>
            </div>
            <div className="totals-row">
              <span>EMI per Lakh</span>
              <span className="totals-value">{formatINR(Math.round(elig.emiPerLakh || 0))}</span>
            </div>
          </div>

          <div className="totals-section" style={{ marginTop: 0 }}>
            <div className="totals-row" style={{ fontWeight: 700 }}>
              <span style={{ fontSize: 15 }}>Loan Eligibility</span>
              <span className="totals-value text-success" style={{ fontSize: 18 }}>
                {formatLakhs((elig.loanEligibility || 0) * 100000)}
              </span>
            </div>
            <div className="totals-row">
              <span>Recommended Loan</span>
              <span className="totals-value">{formatINR(elig.recommendedLoan || 0)}</span>
            </div>
            <div className="totals-row">
              <span>Final EMI</span>
              <span className="totals-value">{formatINR(Math.round(elig.finalEMI || 0))}</span>
            </div>
            <div className="totals-row">
              <span>Existing EMI</span>
              <span className="totals-value">{formatINR(elig.existingEMI || 0)}</span>
            </div>
            <div className="totals-row">
              <span>IIR — Current Loan</span>
              <span className={elig.iirCurrent > 50 ? 'iir-danger' : 'iir-safe'}>
                {formatPercent(elig.iirCurrent || 0)}
              </span>
            </div>
            <div className="totals-row" style={{ fontWeight: 700 }}>
              <span>IIR — Combined</span>
              <span className={elig.iirCombined > 50 ? 'iir-danger' : 'iir-safe'}>
                {formatPercent(elig.iirCombined || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="no-print" style={{ marginTop: 16 }}>
        <button className="btn btn-primary" onClick={handlePrint}>🖨 Print Summary</button>
      </div>
    </div>
  );
}

export default SummaryReport;
