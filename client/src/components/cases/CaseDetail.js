import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { caseApi } from '../../api/caseApi';
import { BUSINESS_CONFIGS } from '../../constants/businessConfig';
import TurnoverModule from '../turnover/TurnoverModule';
import PnLModule from '../pnl/PnLModule';
import EligibilityModule from '../eligibility/EligibilityModule';
import SummaryReport from '../summary/SummaryReport';
import { useToast } from '../common/ToastContext';

const TABS = ['Turnover', 'P&L', 'Eligibility', 'Summary'];

const STATUS_LABELS  = { draft: 'Draft', 'in-progress': 'In Progress', completed: 'Completed' };
const STATUS_CLASSES = { draft: 'badge-draft', 'in-progress': 'badge-in-progress', completed: 'badge-completed' };

// Tab to navigate to after each section is saved successfully
const NEXT_TAB = { turnover: 'P&L', pnl: 'Eligibility', eligibility: 'Summary' };

function BadgeStatus({ status }) {
  return (
    <span className={`badge ${STATUS_CLASSES[status] || 'badge-draft'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function CaseDetail() {
  const { id } = useParams();
  const { addToast } = useToast();

  const [caseData, setCaseData]   = useState(null);
  const [activeTab, setActiveTab] = useState('Turnover');
  const [loading, setLoading]     = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadCase = useCallback(async () => {
    try {
      setLoading(true);
      const res = await caseApi.getById(id);
      setCaseData(res.data);
      setLoadError('');
    } catch {
      setLoadError('Failed to load case. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCase();
  }, [loadCase]);

  // Persist section updates to the server, then advance to the next tab
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
      addToast('Saved successfully!', 'success');
      // Navigate to the next logical tab
      if (NEXT_TAB[section]) {
        setActiveTab(NEXT_TAB[section]);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save. Please try again.', 'error');
    }
  };

  if (loading)   return <div className="loading">Loading case...</div>;
  if (loadError) return <div className="alert alert-error">{loadError}</div>;
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
