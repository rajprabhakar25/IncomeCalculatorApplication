import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { caseApi } from '../../api/caseApi';
import { BUSINESS_TYPE_OPTIONS } from '../../constants/businessConfig';
import { formatINR } from '../../utils/formatCurrency';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const BT_OPTIONS = [{ value: 'all', label: 'All Types' }, ...BUSINESS_TYPE_OPTIONS];

function BadgeStatus({ status }) {
  const map = { draft: 'badge-draft', 'in-progress': 'badge-in-progress', completed: 'badge-completed' };
  return <span className={`badge ${map[status] || 'badge-draft'}`}>{status}</span>;
}

function CaseList() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [businessType, setBusinessType] = useState('all');
  const [status, setStatus] = useState('all');
  const navigate = useNavigate();

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (businessType !== 'all') params.businessType = businessType;
      if (status !== 'all') params.status = status;
      const res = await caseApi.getAll(params);
      setCases(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load cases. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  }, [search, businessType, status]);

  useEffect(() => {
    const timeout = setTimeout(fetchCases, 300);
    return () => clearTimeout(timeout);
  }, [fetchCases]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this case? This cannot be undone.')) return;
    try {
      await caseApi.delete(id);
      setCases(prev => prev.filter(c => c._id !== id));
    } catch {
      alert('Failed to delete case.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Income Assessment Cases</h1>
          <p className="page-subtitle">{cases.length} case{cases.length !== 1 ? 's' : ''} found</p>
        </div>
        <Link to="/cases/new" className="btn btn-primary">+ New Assessment</Link>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '12px 20px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="form-control"
            style={{ flex: '1 1 200px', maxWidth: 300 }}
            placeholder="Search by customer or business name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="form-control"
            style={{ flex: '0 0 180px' }}
            value={businessType}
            onChange={e => setBusinessType(e.target.value)}
          >
            {BT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            className="form-control"
            style={{ flex: '0 0 140px' }}
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button className="btn btn-secondary btn-sm" onClick={fetchCases}>Refresh</button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading cases...</div>
      ) : cases.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
          <p style={{ fontSize: 16, marginBottom: 12 }}>No cases found.</p>
          <Link to="/cases/new" className="btn btn-primary">Create your first assessment</Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Business Name</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Net Income</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.map(c => (
                  <tr
                    key={c._id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/cases/${c._id}`)}
                  >
                    <td style={{ fontWeight: 500 }}>{c.customerName}</td>
                    <td>{c.businessName}</td>
                    <td style={{ textTransform: 'capitalize' }}>
                      {BT_OPTIONS.find(b => b.value === c.businessType)?.label || c.businessType}
                    </td>
                    <td>{c.location || '—'}</td>
                    <td>{formatINR(c.pnl?.netMonthlyIncome || 0)}</td>
                    <td><BadgeStatus status={c.status} /></td>
                    <td style={{ color: '#6b7280', fontSize: 12 }}>
                      {new Date(c.updatedAt).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ marginRight: 6 }}
                        onClick={e => { e.stopPropagation(); navigate(`/cases/${c._id}/edit`); }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={e => handleDelete(e, c._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default CaseList;
