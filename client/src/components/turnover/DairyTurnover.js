import React, { useState } from 'react';
import { calcDairyItem, calcTurnoverTotals } from '../../utils/calculations';
import { formatINR } from '../../utils/formatCurrency';
import { BUSINESS_CONFIGS } from '../../constants/businessConfig';

const SESSIONS = ['Morning', 'Evening'];

const defaultRow = (session) => ({
  session,
  milkPerDay: '',
  societyQty: '',
  societyRate: '',
  individualQty: '',
  individualRate: '',
});

function DairyTurnover({ caseData, onSave }) {
  const config = BUSINESS_CONFIGS.dairy;
  const saved = caseData.turnover || {};

  // Initialize exactly 2 rows (Morning, Evening)
  const initItems = () => {
    if (saved.items && saved.items.length >= 2) {
      return saved.items.slice(0, 2).map((item, i) => ({
        session: SESSIONS[i],
        milkPerDay:     item.milkPerDay     ?? '',
        societyQty:     item.societyQty     ?? '',
        societyRate:    item.societyRate    ?? '',
        individualQty:  item.individualQty  ?? '',
        individualRate: item.individualRate ?? '',
      }));
    }
    return SESSIONS.map(s => defaultRow(s));
  };

  const [items, setItems] = useState(initItems);
  const [grossMargin, setGrossMargin] = useState(
    saved.grossMarginPercent !== undefined ? saved.grossMarginPercent : config.defaultGrossMargin
  );
  const [saving, setSaving] = useState(false);

  const calcItems = items.map(item => {
    const { societyTotal, individualTotal, dailySales, monthlySales } = calcDairyItem(item);
    return { ...item, societyTotal, individualTotal, dailySales, monthlySales };
  });

  const { totalMonthlyTurnover, grossProfit } = calcTurnoverTotals(calcItems, grossMargin);

  const handleChange = (index, field, value) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      items: calcItems,
      totalMonthlyTurnover,
      grossMarginPercent: Number(grossMargin),
      grossProfit,
    });
    setSaving(false);
  };

  return (
    <div>
      <div className="card">
        <div className="card-title">Turnover — Dairy Business</div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Session</th>
                <th>Milk/Day (Ltrs)</th>
                <th>Society Qty (Ltrs)</th>
                <th>Society Rate (₹/Ltr)</th>
                <th>Society Total (₹)</th>
                <th>Individual Qty (Ltrs)</th>
                <th>Individual Rate (₹/Ltr)</th>
                <th>Individual Total (₹)</th>
                <th>Income/Day (₹)</th>
                <th>Income/Month (₹)</th>
              </tr>
            </thead>
            <tbody>
              {calcItems.map((item, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: '#374151' }}>{item.session}</td>
                  <td>
                    <input
                      className="table-input"
                      type="number" min="0"
                      value={item.milkPerDay}
                      onChange={e => handleChange(i, 'milkPerDay', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="table-input"
                      type="number" min="0"
                      value={item.societyQty}
                      onChange={e => handleChange(i, 'societyQty', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="table-input"
                      type="number" min="0"
                      value={item.societyRate}
                      onChange={e => handleChange(i, 'societyRate', e.target.value)}
                    />
                  </td>
                  <td style={{ color: '#1a56db' }}>{formatINR(item.societyTotal)}</td>
                  <td>
                    <input
                      className="table-input"
                      type="number" min="0"
                      value={item.individualQty}
                      onChange={e => handleChange(i, 'individualQty', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="table-input"
                      type="number" min="0"
                      value={item.individualRate}
                      onChange={e => handleChange(i, 'individualRate', e.target.value)}
                    />
                  </td>
                  <td style={{ color: '#1a56db' }}>{formatINR(item.individualTotal)}</td>
                  <td style={{ fontWeight: 600 }}>{formatINR(item.dailySales)}</td>
                  <td style={{ color: '#057a55', fontWeight: 600 }}>{formatINR(item.monthlySales)}</td>
                </tr>
              ))}
              <tr className="table-total-row">
                <td colSpan={9} style={{ textAlign: 'right' }}>Total Monthly Turnover</td>
                <td style={{ color: '#057a55' }}>{formatINR(totalMonthlyTurnover)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="totals-section">
          <div className="totals-row">
            <span className="totals-label">Total Monthly Turnover</span>
            <span className="totals-value">{formatINR(totalMonthlyTurnover)}</span>
          </div>
          <div className="totals-row">
            <span className="totals-label">
              Gross Margin %&nbsp;
              <input
                type="number" min="0" max="100"
                style={{ width: 60, padding: '2px 6px', border: '1px solid #d1d5db', borderRadius: 4 }}
                value={grossMargin}
                onChange={e => setGrossMargin(e.target.value)}
              />
            </span>
            <span className="totals-value">{grossMargin}%</span>
          </div>
          <div className="totals-row">
            <span className="totals-label" style={{ fontWeight: 700 }}>Gross Profit</span>
            <span className="totals-value text-success" style={{ fontSize: 16 }}>{formatINR(grossProfit)}</span>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Turnover'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DairyTurnover;
