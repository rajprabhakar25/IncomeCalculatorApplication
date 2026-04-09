import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { caseApi } from '../../api/caseApi';
import { BUSINESS_TYPE_OPTIONS, BUSINESS_CONFIGS } from '../../constants/businessConfig';
import { SAMPLE_DATA } from '../../constants/sampleData';

const defaultForm = {
  customerName: '',
  businessName: '',
  businessType: '',
  location: '',
  assessmentDate: new Date().toISOString().slice(0, 10),
};

function CaseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      caseApi.getById(id).then(res => {
        const c = res.data;
        setForm({
          customerName: c.customerName || '',
          businessName: c.businessName || '',
          businessType: c.businessType || '',
          location: c.location || '',
          assessmentDate: c.assessmentDate
            ? new Date(c.assessmentDate).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10),
        });
      }).catch(() => setError('Failed to load case.'));
    }
  }, [id, isEdit]);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e, saveAndContinue = false) => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.businessName.trim() || !form.businessType) {
      setError('Customer Name, Business Name, and Business Type are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      let saved;
      if (isEdit) {
        saved = await caseApi.update(id, form);
      } else {
        // Pre-populate turnover items, P&L expenses, and eligibility defaults from sample data
        const config = BUSINESS_CONFIGS[form.businessType];
        const sample = SAMPLE_DATA[form.businessType];
        const pnlExpenses = config ? config.defaultExpenses.map(e => ({ ...e })) : [];
        const payload = {
          ...form,
          turnover: {
            items: sample?.turnoverItems ? sample.turnoverItems.map(i => ({ ...i })) : [],
            grossMarginPercent: config?.defaultGrossMargin || 0,
          },
          pnl: { expenses: pnlExpenses },
          eligibility: sample?.eligibility ? { ...sample.eligibility } : {},
        };
        saved = await caseApi.create(payload);
      }
      if (saveAndContinue) {
        navigate(`/cases/${saved.data._id}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save case.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Case' : 'New Assessment'}</h1>
          <p className="page-subtitle">Enter the basic customer and business details</p>
        </div>
        <Link to="/" className="btn btn-secondary">← Back</Link>
      </div>

      <div className="card">
        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={e => handleSubmit(e, false)}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Customer Name *</label>
              <input
                className="form-control"
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                placeholder="e.g. Ravi Kumar"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Business Name *</label>
              <input
                className="form-control"
                name="businessName"
                value={form.businessName}
                onChange={handleChange}
                placeholder="e.g. Sri Ram Stores"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Business Type *</label>
            <select
              className="form-control"
              name="businessType"
              value={form.businessType}
              onChange={handleChange}
              required
              disabled={isEdit}
            >
              <option value="">— Select Business Type —</option>
              {BUSINESS_TYPE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {isEdit && (
              <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                Business type cannot be changed after creation.
              </p>
            )}
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                className="form-control"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Coimbatore"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assessment Date</label>
              <input
                className="form-control"
                type="date"
                name="assessmentDate"
                value={form.assessmentDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              type="button"
              className="btn btn-primary"
              disabled={loading}
              onClick={e => handleSubmit(e, true)}
            >
              {loading ? 'Saving...' : (isEdit ? 'Save & Continue' : 'Save & Start Assessment')}
            </button>
            <button type="submit" className="btn btn-secondary" disabled={loading}>
              Save as Draft
            </button>
            <Link to="/" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CaseForm;
