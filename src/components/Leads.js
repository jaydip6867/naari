import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiEdit2, FiEye, FiRefreshCw, FiSearch, FiX } from 'react-icons/fi';
import Sidebar from './Sidebar';
import Pagination from './Pagination';
import { inquiryAPI } from '../services/api';
import { storage } from '../utils/storage';
import '../styles.css';
import './Leads.css';

const EMPTY_FORM = {
  leadName: '',
  company: '',
  phone: '',
  email: '',
  state: '',
  city: '',
  pipelineStage: 'New',
  owner: '',
  lastFollowUp: '',
  nextFollowUp: '',
  leadResponseMessage: '',
};

const dateInputValue = (value) => (value ? String(value).slice(0, 10) : '');

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
};

const Leads = ({ onLogout }) => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState(null);
  const [dialogMode, setDialogMode] = useState('view');
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const itemsPerPage = 10;

  const loadLeads = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      setLeads(await inquiryAPI.getInquiries());
    } catch (loadError) {
      setError(loadError.message || 'Unable to load inquiries.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return leads;

    return leads.filter((lead) => [
      lead.leadName,
      lead.company,
      lead.phone,
      lead.email,
      lead.city,
      lead.state,
      lead.pipelineStage,
    ].some((value) => String(value || '').toLowerCase().includes(query)));
  }, [leads, search]);

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const visibleLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleLogout = () => {
    storage.clearAuthData();
    onLogout();
    navigate('/');
  };

  const openLead = (lead, mode) => {
    setSelectedLead(lead);
    setDialogMode(mode);
    setError('');
    setForm({
      ...EMPTY_FORM,
      ...lead,
      lastFollowUp: dateInputValue(lead.lastFollowUp),
      nextFollowUp: dateInputValue(lead.nextFollowUp),
    });
  };

  const closeDialog = () => {
    if (saving) return;
    setSelectedLead(null);
    setError('');
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!selectedLead) return;

    setSaving(true);
    setError('');

    const updatedLead = {
      id: selectedLead.id,
      ...form,
      lastFollowUp: form.lastFollowUp || null,
      nextFollowUp: form.nextFollowUp || null,
    };

    try {
      await inquiryAPI.updateInquiry(updatedLead);
      setLeads((current) => current.map((lead) => (
        Number(lead.id) === Number(selectedLead.id)
          ? { ...lead, ...updatedLead }
          : lead
      )));
      setNotice('Lead updated successfully.');
      setSelectedLead(null);
    } catch (saveError) {
      setError(saveError.message || 'Unable to update this lead.');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (label, name, options = {}) => (
    <div className={`lead-field ${options.wide ? 'lead-field-wide' : ''}`}>
      <label htmlFor={`lead-${name}`}>{label}{options.required && ' *'}</label>
      {options.select ? (
        <select
          id={`lead-${name}`}
          name={name}
          value={form[name] || ''}
          onChange={handleFieldChange}
          disabled={dialogMode === 'view'}
          required={options.required}
        >
          {['New', 'Contacted', 'Qualified', 'Converted', 'Lost'].map((stage) => (
            <option key={stage} value={stage}>{stage}</option>
          ))}
        </select>
      ) : options.textarea ? (
        <textarea
          id={`lead-${name}`}
          name={name}
          value={form[name] || ''}
          onChange={handleFieldChange}
          disabled={dialogMode === 'view'}
          rows="4"
          required={options.required}
        />
      ) : (
        <input
          id={`lead-${name}`}
          name={name}
          type={options.type || 'text'}
          value={form[name] || ''}
          onChange={handleFieldChange}
          disabled={dialogMode === 'view'}
          required={options.required}
        />
      )}
    </div>
  );

  return (
    <div className="settings-container">
      <Sidebar onLogout={handleLogout} />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Leads</h1>
        </div>

        <section className="content-section leads-content">
          <div className="leads-toolbar">
            <div>
              <h2 className="section-title">Website inquiries</h2>
              <p className="leads-count">{filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'}</p>
            </div>
            <div className="leads-controls">
              <label className="leads-search">
                <FiSearch aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search leads"
                  aria-label="Search leads"
                />
              </label>
              <button
                type="button"
                className="leads-refresh"
                onClick={() => loadLeads(true)}
                disabled={refreshing}
                title="Refresh leads"
                aria-label="Refresh leads"
              >
                <FiRefreshCw className={refreshing ? 'leads-spinning' : ''} />
              </button>
            </div>
          </div>

          {notice && <div className="leads-notice" role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Dismiss message"><FiX /></button></div>}
          {error && !selectedLead && <div className="error-banner" role="alert"><FiAlertCircle /> {error}</div>}

          {loading ? (
            <div className="leads-state" role="status">Loading leads...</div>
          ) : error && leads.length === 0 ? (
            <div className="leads-state leads-error-state">
              <p>{error}</p>
              <button type="button" className="add-btn" onClick={() => loadLeads()}>Retry</button>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="leads-state">
              <h3>{search ? 'No matching leads' : 'No inquiries yet'}</h3>
              <p>{search ? 'Try a different search term.' : 'New website inquiries will appear here.'}</p>
            </div>
          ) : (
            <>
              <div className="leads-table-wrap">
                <table className="leads-table">
                  <thead>
                    <tr>
                      <th scope="col">Lead</th>
                      <th scope="col">Contact</th>
                      <th scope="col">Location</th>
                      <th scope="col">Stage</th>
                      <th scope="col">Received</th>
                      <th scope="col"><span className="visually-hidden">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleLeads.map((lead, index) => (
                      <tr key={lead.id || `${lead.phone}-${index}`}>
                        <td>
                          <strong>{lead.leadName || 'Unnamed lead'}</strong>
                          {lead.company && <span className="lead-company">{lead.company}</span>}
                        </td>
                        <td>
                          <a href={`tel:${lead.phone || ''}`}>{lead.phone || '-'}</a>
                          {lead.email && <a className="lead-email" href={`mailto:${lead.email}`}>{lead.email}</a>}
                        </td>
                        <td>{[lead.city, lead.state].filter(Boolean).join(', ') || '-'}</td>
                        <td><span className={`lead-stage lead-stage-${String(lead.pipelineStage || 'new').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>{lead.pipelineStage || 'New'}</span></td>
                        <td>{formatDate(lead.createdAt)}</td>
                        <td>
                          <div className="lead-actions">
                            <button type="button" className="action-btn view" onClick={() => openLead(lead, 'view')} title="View lead" aria-label={`View ${lead.leadName || 'lead'}`}><FiEye /></button>
                            <button type="button" className="action-btn edit" onClick={() => openLead(lead, 'edit')} title="Edit lead" aria-label={`Edit ${lead.leadName || 'lead'}`}><FiEdit2 /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </>
          )}
        </section>
      </main>

      {selectedLead && (
        <div className="modal-overlay leads-modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && closeDialog()}>
          <section className="modal-content leads-modal" role="dialog" aria-modal="true" aria-labelledby="lead-dialog-title">
            <header className="modal-header">
              <div>
                <h2 id="lead-dialog-title">{dialogMode === 'edit' ? 'Edit lead' : 'Lead details'}</h2>
                <p>{selectedLead.createdAt ? `Received ${formatDate(selectedLead.createdAt)}` : 'Website inquiry'}</p>
              </div>
              <button type="button" className="close-btn" onClick={closeDialog} aria-label="Close dialog"><FiX /></button>
            </header>
            <form onSubmit={handleSave}>
              <div className="leads-form-grid">
                {renderField('Name', 'leadName', { required: true })}
                {renderField('Phone', 'phone', { required: true, type: 'tel' })}
                {renderField('Company', 'company')}
                {renderField('Email', 'email', { type: 'email' })}
                {renderField('State', 'state', { required: true })}
                {renderField('City', 'city', { required: true })}
                {renderField('Pipeline stage', 'pipelineStage', { select: true })}
                {renderField('Owner', 'owner')}
                {renderField('Last follow-up', 'lastFollowUp', { type: 'date' })}
                {renderField('Next follow-up', 'nextFollowUp', { type: 'date' })}
                {renderField('Message', 'leadResponseMessage', { textarea: true, wide: true, required: true })}
              </div>
              {error && <p className="lead-form-error" role="alert">{error}</p>}
              <footer className="modal-footer leads-modal-footer">
                <button type="button" className="btn btn-cancel" onClick={closeDialog} disabled={saving}>Close</button>
                {dialogMode === 'view' ? (
                  <button type="button" className="btn btn-save" onClick={() => setDialogMode('edit')}>Edit lead</button>
                ) : (
                  <button type="submit" className="btn btn-save" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
                )}
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default Leads;