import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { caseApi } from '../../api/caseApi';
import { BUSINESS_CONFIGS } from '../../constants/businessConfig';
import TurnoverModule from '../turnover/TurnoverModule';
import PnLModule from '../pnl/PnLModule';
import EligibilityModule from '../eligibility/EligibilityModule';
import SummaryReport from '../summary/SummaryReport';

const TABS = ['Turnover', 'P&L', 'Eligibility', 'Summary'];

function BadgeStatus({ status }) {
  const map = { draft: 'badge-draft', 'in-progress': 'badge-in-progress', completed: 'badge-completed' };
  return <span className={`badge ${map[status] || 'badge-draft'}`}>{status}</span>;
}

function CaseDetail() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [activeTab, setActiveTab] = useState('Turnover');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveMsg, setSaveMsg] = useState('');

  const loadCase = useCallback(async () => {
    try {
      setLoading(true);
      const res = await caseApi.getById(id);
      setCaseData(res.data);
      setError('');
    } catch {
      setError('Failed to load case.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCase();
  }, [loadCase]);

  // Persist section updates to the server
  const saveSection = async (section, data) => {
    try {
      const update = { [section]: data };
      // Auto-advance status
      if (section === 'turnover' && caseData.status === 'draft') {
        update.status = 'in-progress';
      }
      if (section === 'eligibility') {
        update.status = 'completed';
      }
      const res = await caseApi.update(id, update);
      setCaseData(res.data);
      setSaveMsg('Saved successfully!');
      setTimeout(() => setSaveMsg(''), 2500);
    } catch {
      alert('Failed to save. Please try again.');
    }
  };

  if (loading) return <div className="loading">Loading case...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!caseData) return null;

  const config = BUSINESS_CONFIGS[caseData.businessType] || {};

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{caseData.customerName}</h1>
          <p className="page-subtitle">
            {caseData.businessName} &nbsp;·&nbsp; {config.label || caseData.businessType}
            &nbsp;·&nbsp; {caseData.location || 'No location'}
            &nbsp;&nbsp;<BadgeStatus status={caseData.status} />
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/cases/${id}/edit`} className="btn btn-secondary btn-sm">Edit Info</Link>
          <Link to="/" className="btn btn-secondary btn-sm">← All Cases</Link>
        </div>
      </div>

      {saveMsg && <div className="alert alert-success">{saveMsg}</div>}

      {/* Tabs */}
      <div className="tabs no-print">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Turnover' && (
        <TurnoverModule caseData={caseData} onSave={data => saveSection('turnover', data)} />
      )}
      {activeTab === 'P&L' && (
        <PnLModule caseData={caseData} onSave={data => saveSection('pnl', data)} />
      )}
      {activeTab === 'Eligibility' && (
        <EligibilityModule caseData={caseData} onSave={data => saveSection('eligibility', data)} />
      )}
      {activeTab === 'Summary' && (
        <SummaryReport caseData={caseData} />
      )}
    </div>
  );
}

export default CaseDetail;
