import React, { useState } from 'react';
import { calcTailoringItem, calcTurnoverTotals } from '../../utils/calculations';
import { formatINR } from '../../utils/formatCurrency';
import { BUSINESS_CONFIGS } from '../../constants/businessConfig';

const newRow = () => ({ itemName: '', monthlyQty: '', ratePerPiece: '', monthlySales: 0 });

function TailoringTurnover({ caseData, onSave }) {
  const config = BUSINESS_CONFIGS.tailoring;
  const saved = caseData.turnover || {};

  const [items, setItems] = useState(
    saved.items && saved.items.length > 0
      ? saved.items.map(i => ({
          itemName: i.itemName || '',
          monthlyQty: i.monthlyQty || '',
          ratePerPiece: i.ratePerPiece || '',
        }))
      : [newRow()]
  );
  const [grossMargin, setGrossMargin] = useState(
    saved.grossMarginPercent !== undefined ? saved.grossMarginPercent : config.defaultGrossMargin
  );
  const [saving, setSaving] = useState(false);

  const calcItems = items.map(item => {
    const { monthlySales } = calcTailoringItem(item);
    return { ...item, monthlySales };
  });

  const { totalMonthlyTurnover, grossProfit } = calcTurnoverTotals(calcItems, grossMargin);

  const handleChange = (index, field, value) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addRow = () => setItems(prev => [...prev, newRow()]);
  const removeRow = (index) => { if (items.length > 1) setItems(prev => prev.filter((_, i) => i !== index)); };

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
        <div className="card-title">Turnover — Tailoring Business</div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}>S.No</th>
                <th>Garment Type</th>
                <th>Stitching/Month (Nos.)</th>
                <th>Rate per Piece (₹)</th>
                <th>Income per Month (₹)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {calcItems.map((item, i) => (
                <tr key={i}>
                  <td style={{ textAlign: 'center', color: '#6b7280' }}>{i + 1}</td>
                  <td>
                    <input
                      className="table-input"
                      value={item.itemName}
                      onChange={e => handleChange(i, 'itemName', e.target.value)}
                      placeholder="e.g. Pant"
                    />
                  </td>
                  <td>
                    <input
                      className="table-input"
                      type="number" min="0"
                      value={item.monthlyQty}
                      onChange={e => handleChange(i, 'monthlyQty', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="table-input"
                      type="number" min="0"
                      value={item.ratePerPiece}
                      onChange={e => handleChange(i, 'ratePerPiece', e.target.value)}
                    />
                  </td>
                  <td style={{ color: '#057a55', fontWeight: 600 }}>{formatINR(item.monthlySales)}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => removeRow(i)}>✕</button>
                  </td>
                </tr>
              ))}
              <tr className="table-total-row">
                <td colSpan={4} style={{ textAlign: 'right' }}>Total Monthly Turnover</td>
                <td style={{ color: '#057a55' }}>{formatINR(totalMonthlyTurnover)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={addRow} style={{ marginBottom: 16 }}>
          + Add Garment
        </button>

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

export default TailoringTurnover;
