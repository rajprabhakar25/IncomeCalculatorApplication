import React, { useState } from 'react';
import { calcPnL } from '../../utils/calculations';
import { formatINR } from '../../utils/formatCurrency';
import { BUSINESS_CONFIGS } from '../../constants/businessConfig';

function PnLModule({ caseData, onSave }) {
  const config = BUSINESS_CONFIGS[caseData.businessType] || {};
  const savedPnL = caseData.pnl || {};
  const grossProfit = caseData.turnover?.grossProfit || 0;
  const totalMonthlyTurnover = caseData.turnover?.totalMonthlyTurnover || 0;

  // Pre-populate expenses from saved P&L or from business config defaults
  const initExpenses = () => {
    if (savedPnL.expenses && savedPnL.expenses.length > 0) {
      return savedPnL.expenses.map(e => ({ name: e.name, amount: e.amount }));
    }
    return (config.defaultExpenses || []).map(e => ({ name: e.name, amount: e.amount }));
  };

  const [expenses, setExpenses] = useState(initExpenses);
  const [saving, setSaving] = useState(false);

  const handleChange = (index, value) => {
    setExpenses(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], amount: value === '' ? '' : Number(value) };
      return updated;
    });
  };

  const { totalExpenses, netMonthlyIncome } = calcPnL(grossProfit, expenses.map(e => ({ ...e, amount: Number(e.amount) || 0 })));

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      expenses: expenses.map(e => ({ name: e.name, amount: Number(e.amount) || 0 })),
      totalExpenses,
      netMonthlyIncome,
    });
    setSaving(false);
  };

  return (
    <div>
      <div className="card">
        <div className="card-title">Profit & Loss Statement</div>

        {totalMonthlyTurnover === 0 && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            Please complete and save the Turnover tab first to carry over Gross Profit.
          </div>
        )}

        <div className="grid-2" style={{ gap: 24 }}>
          {/* LEFT: Expenses */}
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#374151' }}>
              Monthly Expenses
            </h3>
            <div style={{ maxHeight: 480, overflowY: 'auto' }}>
              {expenses.map((exp, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 12 }}>
                  <label style={{ flex: 1, fontSize: 13, color: '#374151' }}>{exp.name}</label>
                  <input
                    type="number"
                    min="0"
                    style={{ width: 110, padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13, textAlign: 'right' }}
                    value={exp.amount}
                    onChange={e => handleChange(i, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div style={{ borderTop: '2px solid #374151', marginTop: 12, paddingTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14 }}>
                <span>Total Expenses</span>
                <span style={{ color: '#c81e1e' }}>{formatINR(totalExpenses)}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Income Summary */}
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#374151' }}>
              Income Summary
            </h3>
            <div className="totals-section" style={{ marginTop: 0 }}>
              <div className="totals-row">
                <span className="totals-label">Total Monthly Turnover</span>
                <span className="totals-value">{formatINR(totalMonthlyTurnover)}</span>
              </div>
              <div className="totals-row">
                <span className="totals-label">
                  Gross Margin
                </span>
                <span className="totals-value">{caseData.turnover?.grossMarginPercent || 0}%</span>
              </div>
              <div className="totals-row">
                <span className="totals-label">Gross Profit (A)</span>
                <span className="totals-value text-success">{formatINR(grossProfit)}</span>
              </div>
              <div className="totals-row">
                <span className="totals-label">Total Expenses (B)</span>
                <span className="totals-value text-danger">{formatINR(totalExpenses)}</span>
              </div>
              <div className="totals-row" style={{ borderTop: '2px solid #374151', paddingTop: 12 }}>
                <span className="totals-label" style={{ fontSize: 15, fontWeight: 700 }}>Net Monthly Income (A-B)</span>
                <span
                  className={`totals-value ${netMonthlyIncome >= 0 ? 'text-success' : 'text-danger'}`}
                  style={{ fontSize: 18 }}
                >
                  {formatINR(netMonthlyIncome)}
                </span>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save P&L'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PnLModule;
