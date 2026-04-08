import React, { useState } from 'react';
import { calcHotelItem, calcTurnoverTotals } from '../../utils/calculations';
import { formatINR } from '../../utils/formatCurrency';
import { BUSINESS_CONFIGS } from '../../constants/businessConfig';

const SESSIONS = ['Breakfast', 'Lunch', 'Dinner'];

const newRow = (session) => ({ session, itemName: '', rate: '', unitsPerDay: '', dailySales: 0, monthlySales: 0 });

function HotelTurnover({ caseData, onSave }) {
  const config = BUSINESS_CONFIGS.hotel;
  const saved = caseData.turnover || {};

  // Group saved items by session, or start with empty rows per session
  const initItems = () => {
    if (saved.items && saved.items.length > 0) {
      return saved.items.map(i => ({
        session: i.session || 'Breakfast',
        itemName: i.itemName || '',
        rate: i.rate || '',
        unitsPerDay: i.unitsPerDay || '',
      }));
    }
    return SESSIONS.map(s => newRow(s));
  };

  const [items, setItems] = useState(initItems);
  const [collapsed, setCollapsed] = useState({});
  const [grossMargin, setGrossMargin] = useState(
    saved.grossMarginPercent !== undefined ? saved.grossMarginPercent : config.defaultGrossMargin
  );
  const [saving, setSaving] = useState(false);

  const calcItems = items.map(item => {
    const { dailySales, monthlySales } = calcHotelItem(item);
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

  const addRow = (session) => setItems(prev => [...prev, newRow(session)]);

  const removeRow = (index) => {
    const sessionItems = items.filter(i => i.session === items[index].session);
    if (sessionItems.length <= 1) return; // Keep at least 1 per session
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

  const toggleSession = (session) => {
    setCollapsed(prev => ({ ...prev, [session]: !prev[session] }));
  };

  const sessionTotals = (session) => {
    const sessionItems = calcItems.filter(i => i.session === session);
    return sessionItems.reduce((sum, i) => sum + (i.monthlySales || 0), 0);
  };

  return (
    <div>
      <div className="card">
        <div className="card-title">Turnover — Hotel / Restaurant / Eatery</div>

        {SESSIONS.map(session => {
          const sessionItems = calcItems.map((item, idx) => ({ ...item, _idx: idx })).filter(i => i.session === session);
          return (
            <div key={session} className="session-section">
              <div className="session-header" onClick={() => toggleSession(session)}>
                <span>{session}</span>
                <span style={{ fontSize: 13, color: '#6b7280' }}>
                  {formatINR(sessionTotals(session))}/month
                  &nbsp;&nbsp;{collapsed[session] ? '▶' : '▼'}
                </span>
              </div>
              {!collapsed[session] && (
                <div className="session-body">
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th style={{ width: 40 }}>S.No</th>
                          <th>Food Item</th>
                          <th>Rate (₹)</th>
                          <th>Units/Day</th>
                          <th>Daily Sales (₹)</th>
                          <th>Monthly Sales (₹)</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessionItems.map((item, sIdx) => (
                          <tr key={item._idx}>
                            <td style={{ textAlign: 'center', color: '#6b7280' }}>{sIdx + 1}</td>
                            <td>
                              <input
                                className="table-input"
                                value={item.itemName}
                                onChange={e => handleChange(item._idx, 'itemName', e.target.value)}
                                placeholder="e.g. Idli"
                              />
                            </td>
                            <td>
                              <input
                                className="table-input"
                                type="number" min="0"
                                value={item.rate}
                                onChange={e => handleChange(item._idx, 'rate', e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                className="table-input"
                                type="number" min="0"
                                value={item.unitsPerDay}
                                onChange={e => handleChange(item._idx, 'unitsPerDay', e.target.value)}
                              />
                            </td>
                            <td style={{ color: '#1a56db', fontWeight: 500 }}>{formatINR(item.dailySales)}</td>
                            <td style={{ color: '#057a55', fontWeight: 600 }}>{formatINR(item.monthlySales)}</td>
                            <td>
                              <button className="btn btn-danger btn-sm" onClick={() => removeRow(item._idx)}>✕</button>
                            </td>
                          </tr>
                        ))}
                        <tr className="table-total-row">
                          <td colSpan={5} style={{ textAlign: 'right' }}>{session} Total</td>
                          <td style={{ color: '#057a55' }}>{formatINR(sessionTotals(session))}</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => addRow(session)}
                    style={{ marginTop: 8 }}
                  >
                    + Add {session} Item
                  </button>
                </div>
              )}
            </div>
          );
        })}

        <div className="totals-section" style={{ marginTop: 16 }}>
          <div className="totals-row">
            <span className="totals-label">Total Monthly Turnover (All Sessions)</span>
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

export default HotelTurnover;
