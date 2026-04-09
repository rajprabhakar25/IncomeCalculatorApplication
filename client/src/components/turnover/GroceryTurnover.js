import React, { useState } from 'react';
import { calcGroceryItem, calcTurnoverTotals } from '../../utils/calculations';
import { formatINR } from '../../utils/formatCurrency';
import { BUSINESS_CONFIGS } from '../../constants/businessConfig';

const newRow = () => ({ itemName: '', qtyPerDay: '', salePrice: '', dailySales: 0, monthlySales: 0 });

function GroceryTurnover({ caseData, onSave }) {
  const config = BUSINESS_CONFIGS.grocery;
  const saved = caseData.turnover || {};

  const [items, setItems] = useState(
    saved.items && saved.items.length > 0
      ? saved.items.map(i => ({ ...i }))
      : [newRow()]
  );
  const [grossMargin, setGrossMargin] = useState(
    saved.grossMarginPercent !== undefined ? saved.grossMarginPercent : config.defaultGrossMargin
  );
  const [saving, setSaving] = useState(false);

  // Auto-calculate each row
  const calcItems = items.map(item => {
    const { dailySales, monthlySales } = calcGroceryItem(item);
    return { ...item, dailySales, monthlySales };
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

  const removeRow = (index) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
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
        <div className="card-title">Turnover — Grocery / Kirana</div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}>S.No</th>
                <th>Item Name</th>
                <th>Qty/Day (Kg/Pcs)</th>
                <th>Sale Price (₹)</th>
                <th>Per Day Sales (₹)</th>
                <th>Per Month Sales (₹)</th>
                <th style={{ width: 40 }}></th>
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
                      placeholder="e.g. Salt"
                    />
                  </td>
                  <td>
                    <input
                      className="table-input"
                      type="number"
                      min="0"
                      value={item.qtyPerDay}
                      onChange={e => handleChange(i, 'qtyPerDay', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="table-input"
                      type="number"
                      min="0"
                      value={item.salePrice}
                      onChange={e => handleChange(i, 'salePrice', e.target.value)}
                    />
                  </td>
                  <td style={{ color: '#1a56db', fontWeight: 500 }}>{formatINR(item.dailySales)}</td>
                  <td style={{ color: '#057a55', fontWeight: 600 }}>{formatINR(item.monthlySales)}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => removeRow(i)}>✕</button>
                  </td>
                </tr>
              ))}
              <tr className="table-total-row">
                <td colSpan={5} style={{ textAlign: 'right' }}>Total Monthly Turnover</td>
                <td style={{ color: '#057a55' }}>{formatINR(totalMonthlyTurnover)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={addRow} style={{ marginBottom: 16 }}>
          + Add Item
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
                type="number"
                min="0"
                max="100"
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

export default GroceryTurnover;
