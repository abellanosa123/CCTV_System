import React, { useState, useEffect } from 'react';
import { X, Clock, Plus, Edit3, Check, XCircle } from 'lucide-react';
import { getDropdownOptions, addDropdownOption, updateDropdownOption } from '../services/api';

const DEFAULT_ACTIONS = ['Monitored', 'Noted', '10-5 to 911'];

const initialForm = {
  date: '',
  time: '',
  location: '',
  incidentType: '',
  actionTaken: '',
  details: ''
};

export default function ObservationModal({ isOpen, onClose, onSubmit, editData }) {
  const [form, setForm] = useState(initialForm);
  const [incidentTypes, setIncidentTypes] = useState([]);
  const [showCustomIncident, setShowCustomIncident] = useState(false);
  const [customIncident, setCustomIncident] = useState('');
  const [editingIncident, setEditingIncident] = useState(null);
  const [editIncidentValue, setEditIncidentValue] = useState('');
  const [showIncidentManager, setShowIncidentManager] = useState(false);

  // Action Taken dropdown state
  const [actionOptions, setActionOptions] = useState([]);
  const [showCustomAction, setShowCustomAction] = useState(false);
  const [customAction, setCustomAction] = useState('');
  const [editingAction, setEditingAction] = useState(null);
  const [editActionValue, setEditActionValue] = useState('');
  const [showActionManager, setShowActionManager] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDropdownOptions();
      loadActionOptions();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editData) {
      setForm({
        date: editData.date || '',
        time: editData.time || '',
        location: editData.location || '',
        incidentType: editData.incidentType || '',
        actionTaken: editData.actionTaken || '',
        details: editData.details || ''
      });
    } else {
      const now = new Date();
      setForm({
        ...initialForm,
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().slice(0, 5)
      });
    }
    setShowCustomIncident(false);
    setShowCustomAction(false);
    setCustomIncident('');
    setCustomAction('');
  }, [editData, isOpen]);

  const loadDropdownOptions = async () => {
    try {
      const incRes = await getDropdownOptions('incidentType');
      setIncidentTypes(incRes.data);
    } catch (err) {
      console.error('Failed to load dropdown options:', err);
    }
  };

  const loadActionOptions = async () => {
    try {
      const res = await getDropdownOptions('actionTaken');
      setActionOptions(res.data);
    } catch (err) {
      // If no options exist yet, they'll be seeded on first call
      setActionOptions([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Incident Type handlers
  const handleIncidentTypeChange = (e) => {
    const val = e.target.value;
    if (val === '__other__') {
      setShowCustomIncident(true);
      setForm((prev) => ({ ...prev, incidentType: '' }));
    } else {
      setShowCustomIncident(false);
      setForm((prev) => ({ ...prev, incidentType: val }));
    }
  };

  const handleAddCustomIncident = async () => {
    if (!customIncident.trim()) return;
    try {
      await addDropdownOption('incidentType', customIncident.trim());
      await loadDropdownOptions();
      setForm((prev) => ({ ...prev, incidentType: customIncident.trim() }));
      setCustomIncident('');
      setShowCustomIncident(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add option');
    }
  };

  const handleEditIncident = async (opt) => {
    if (!editIncidentValue.trim()) return;
    try {
      await updateDropdownOption(opt._id, editIncidentValue.trim());
      if (form.incidentType === opt.value) {
        setForm((prev) => ({ ...prev, incidentType: editIncidentValue.trim() }));
      }
      await loadDropdownOptions();
      setEditingIncident(null);
      setEditIncidentValue('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update option');
    }
  };

  // Action Taken handlers
  const handleActionChange = (e) => {
    const val = e.target.value;
    if (val === '__other__') {
      setShowCustomAction(true);
      setForm((prev) => ({ ...prev, actionTaken: '' }));
    } else {
      setShowCustomAction(false);
      setForm((prev) => ({ ...prev, actionTaken: val }));
    }
  };

  const handleAddCustomAction = async () => {
    if (!customAction.trim()) return;
    try {
      await addDropdownOption('actionTaken', customAction.trim());
      await loadActionOptions();
      setForm((prev) => ({ ...prev, actionTaken: customAction.trim() }));
      setCustomAction('');
      setShowCustomAction(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add option');
    }
  };

  const handleEditAction = async (opt) => {
    if (!editActionValue.trim()) return;
    try {
      await updateDropdownOption(opt._id, editActionValue.trim());
      if (form.actionTaken === opt.value) {
        setForm((prev) => ({ ...prev, actionTaken: editActionValue.trim() }));
      }
      await loadActionOptions();
      setEditingAction(null);
      setEditActionValue('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update option');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editData ? 'Edit Observation' : 'New CCTV Observation'}</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input type="date" name="date" className="form-input" value={form.date} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Time *</label>
                <div className="time-input-wrapper">
                  <Clock size={16} className="time-icon" />
                  <input type="time" name="time" className="form-input time-input" value={form.time} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Location *</label>
                <input
                  type="text"
                  name="location"
                  className="form-input"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Enter location"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Incident Type *</span>
                  <button type="button" className="dropdown-manage-btn" onClick={() => setShowIncidentManager(!showIncidentManager)}>
                    <Edit3 size={12} /> {showIncidentManager ? 'Close' : 'Edit Choices'}
                  </button>
                </label>
                {!showCustomIncident ? (
                  <select name="incidentType" className="form-select" value={form.incidentType} onChange={handleIncidentTypeChange} required>
                    <option value="">Select incident type</option>
                    {incidentTypes.map((opt) => (
                      <option key={opt._id} value={opt.value}>{opt.value}</option>
                    ))}
                    <option value="__other__">— Others (Add New) —</option>
                  </select>
                ) : (
                  <div className="custom-input-row">
                    <input type="text" className="form-input" value={customIncident} onChange={(e) => setCustomIncident(e.target.value)} placeholder="Type custom incident type..." autoFocus />
                    <button type="button" className="btn btn-sm btn-primary" onClick={handleAddCustomIncident}><Plus size={14} /> Add</button>
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => { setShowCustomIncident(false); setCustomIncident(''); }}><XCircle size={14} /></button>
                  </div>
                )}
                {showIncidentManager && (
                  <div className="dropdown-manager">
                    {incidentTypes.map((opt) => (
                      <div key={opt._id} className="dropdown-manager-item">
                        {editingIncident === opt._id ? (
                          <>
                            <input type="text" className="form-input dm-input" value={editIncidentValue} onChange={(e) => setEditIncidentValue(e.target.value)} autoFocus />
                            <button type="button" className="dm-btn save" onClick={() => handleEditIncident(opt)}><Check size={14} /></button>
                            <button type="button" className="dm-btn cancel" onClick={() => { setEditingIncident(null); setEditIncidentValue(''); }}><XCircle size={14} /></button>
                          </>
                        ) : (
                          <>
                            <span className="dm-label">{opt.value}</span>
                            <button type="button" className="dm-btn edit" onClick={() => { setEditingIncident(opt._id); setEditIncidentValue(opt.value); }}><Edit3 size={13} /></button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group full-width">
                <label className="form-label">Details / Description *</label>
                <textarea name="details" className="form-textarea" value={form.details} onChange={handleChange} placeholder="Describe the observed incident..." rows={4} required />
              </div>

              {/* Action Taken Field */}
              <div className="form-group full-width">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Action Taken *</span>
                  <button type="button" className="dropdown-manage-btn" onClick={() => setShowActionManager(!showActionManager)}>
                    <Edit3 size={12} /> {showActionManager ? 'Close' : 'Edit Choices'}
                  </button>
                </label>
                {!showCustomAction ? (
                  <select name="actionTaken" className="form-select" value={form.actionTaken} onChange={handleActionChange} required>
                    <option value="">Select action taken</option>
                    {actionOptions.map((opt) => (
                      <option key={opt._id} value={opt.value}>{opt.value}</option>
                    ))}
                    <option value="__other__">— Others (Add New) —</option>
                  </select>
                ) : (
                  <div className="custom-input-row">
                    <input type="text" className="form-input" value={customAction} onChange={(e) => setCustomAction(e.target.value)} placeholder="Type custom action..." autoFocus />
                    <button type="button" className="btn btn-sm btn-primary" onClick={handleAddCustomAction}><Plus size={14} /> Add</button>
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => { setShowCustomAction(false); setCustomAction(''); }}><XCircle size={14} /></button>
                  </div>
                )}
                {showActionManager && (
                  <div className="dropdown-manager">
                    {actionOptions.map((opt) => (
                      <div key={opt._id} className="dropdown-manager-item">
                        {editingAction === opt._id ? (
                          <>
                            <input type="text" className="form-input dm-input" value={editActionValue} onChange={(e) => setEditActionValue(e.target.value)} autoFocus />
                            <button type="button" className="dm-btn save" onClick={() => handleEditAction(opt)}><Check size={14} /></button>
                            <button type="button" className="dm-btn cancel" onClick={() => { setEditingAction(null); setEditActionValue(''); }}><XCircle size={14} /></button>
                          </>
                        ) : (
                          <>
                            <span className="dm-label">{opt.value}</span>
                            <button type="button" className="dm-btn edit" onClick={() => { setEditingAction(opt._id); setEditActionValue(opt.value); }}><Edit3 size={13} /></button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {editData ? 'Update Observation' : 'Save Observation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
