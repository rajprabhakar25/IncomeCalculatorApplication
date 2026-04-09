import React, { useState } from 'react';
import { calcTeaShopItem, calcTurnoverTotals } from '../../utils/calculations';
import { formatINR } from '../../utils/formatCurrency';
import { BUSINESS_CONFIGS } from '../../constants/businessConfig';

// type: 'tea' uses milkLitres×cupsPerLitre×rate; 'snack' uses qtyPerDay×rate
const newRow = (type = 'tea') => ({
  itemType: type,
  itemName: '',
  milkLitres: '',
  cupsPerLitre: '',
  qtyPerDay: '',
  rate: '',
});

function TeaShopTurnover({ caseData, onSave }) {
  const config = BUSINESS_CONFIGS.teaShop;
  const saved = caseData.turnover || {};

  const [items, setItems] = useState(
    saved.items && saved.items.length > 0
      ? saved.items.map(i => ({
          itemType:     Number(i.milkLitres) > 0 ? 'tea' : 'snack',
          itemName:     i.itemName     ?? '',
          milkLitres:   i.milkLitres   ?? '',
          cupsPerLitre: i.cupsPerLitre ?? '',
          qtyPerDay:    i.qtyPerDay    ?? '',
          rate:         i.rate         ?? '',
        }))
      : [newRow('tea')]
  );
  const [grossMargin, setGrossMargin] = useState(
    saved.grossMarginPercent !== undefined ? saved.grossMarginPercent : config.defaultGrossMargin
  );
  const [saving, setSaving] = useState(false);

  const calcItems = items.map(item => {
    const { dailySales, monthlySales } = calcTeaShopItem(item);
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

  const addRow = (type) => setItems(prev => [...prev, newRow(type)]);
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
        <div className="card-title">Turnover — Tea Shop / Snack Bar</div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Milk Litres <small>(tea)</small></th>
                <th>Cups/Litre <small>(tea)</small></th>
                <th>Qty/Day <small>(snack)</small></th>
                <th>Rate (₹)</th>
                <th>Sales/Day (₹)</th>
                <th>Sales/Month (₹)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {calcItems.map((item, i) => (
                <tr key={i}>
                  <td>
                    <input
                      className="table-input"
                      value={item.itemName}
                      onChange={e => handleChange(i, 'itemName', e.target.value)}
                      placeholder={item.itemType === 'tea' ? 'e.g. Tea' : 'e.g. Samosa'}
                    />
                  </td>
                  <td>
                    <select
                      className="table-input"
                      value={item.itemType}
                      onChange={e => handleChange(i, 'itemType', e.target.value)}
                    >
                      <option value="tea">Tea/Coffee</option>
                      <option value="snack">Snack</option>
                    </select>
                  </td>
                  <td>
                    {item.itemType === 'tea' ? (
                      <input
                        className="table-input"
                        type="number" min="0"
                        value={item.milkLitres}
                        onChange={e => handleChange(i, 'milkLitres', e.target.value)}
                      />
                    ) : <span style={{ color: '#9ca3af' }}>—</span>}
                  </td>
                  <td>
                    {item.itemType === 'tea' ? (
                      <input
                        className="table-input"
                        type="number" min="0"
                        value={item.cupsPerLitre}
                        onChange={e => handleChange(i, 'cupsPerLitre', e.target.value)}
                      />
                    ) : <span style={{ color: '#9ca3af' }}>—</span>}
                  </td>
                  <td>
                    {item.itemType === 'snack' ? (
                      <input
                        className="table-input"
                        type="number" min="0"
                        value={item.qtyPerDay}
                        onChange={e => handleChange(i, 'qtyPerDay', e.target.value)}
                      />
                    ) : <span style={{ color: '#9ca3af' }}>—</span>}
                  </td>
                  <td>
                    <input
                      className="table-input"
                      type="number" min="0"
                      value={item.rate}
                      onChange={e => handleChange(i, 'rate', e.target.value)}
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
                <td colSpan={7} style={{ textAlign: 'right' }}>Total Monthly Turnover</td>
                <td style={{ color: '#057a55' }}>{formatINR(totalMonthlyTurnover)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => addRow('tea')}>+ Add Tea/Coffee</button>
          <button className="btn btn-secondary btn-sm" onClick={() => addRow('snack')}>+ Add Snack</button>
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

export default TeaShopTurnover;
