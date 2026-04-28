import React, { useState, useEffect } from 'react';
import { X, Clock, Plus, Edit3, Check, XCircle } from 'lucide-react';
import { getDropdownOptions, addDropdownOption, updateDropdownOption } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const DEFAULT_ACTIONS = ['Monitored', 'Noted', '10-5 to 911'];

const initialForm = {
  date: '',
  time: '',
  camera: '',
  street: '',
  purok: '',
  barangay: '',
  location: '', // Compatibility
  incidentType: '',
  actionTaken: '',
  dispatchTo: '',
  dispatchTime: '',
  details: ''
};

export default function ObservationModal({ isOpen, onClose, onSubmit, editData, isReadOnly }) {
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [incidentTypes, setIncidentTypes] = useState([]);
  const [barangayOptions, setBarangayOptions] = useState([]);
  const [showCustomIncident, setShowCustomIncident] = useState(false);
  const [customIncident, setCustomIncident] = useState('');
  const [showCustomBarangay, setShowCustomBarangay] = useState(false);
  const [customBarangay, setCustomBarangay] = useState('');
  const [editingIncident, setEditingIncident] = useState(null);
  const [editIncidentValue, setEditIncidentValue] = useState('');
  const [editingBarangay, setEditingBarangay] = useState(null);
  const [editBarangayValue, setEditBarangayValue] = useState('');
  const [showIncidentManager, setShowIncidentManager] = useState(false);
  const [showBarangayManager, setShowBarangayManager] = useState(false);

  // Action Taken dropdown state
  const [actionOptions, setActionOptions] = useState([]);
  const [showCustomAction, setShowCustomAction] = useState(false);
  const [customAction, setCustomAction] = useState('');
  const [editingAction, setEditingAction] = useState(null);
  const [editActionValue, setEditActionValue] = useState('');
  const [showActionManager, setShowActionManager] = useState(false);

  // Dispatch To dropdown state
  const [dispatchOptions, setDispatchOptions] = useState([]);
  const [showCustomDispatch, setShowCustomDispatch] = useState(false);
  const [customDispatch, setCustomDispatch] = useState('');
  const [editingDispatch, setEditingDispatch] = useState(null);
  const [editDispatchValue, setEditDispatchValue] = useState('');
  const [showDispatchManager, setShowDispatchManager] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDropdownOptions();
      loadActionOptions();
      loadDispatchOptions();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editData) {
      setForm({
        date: editData.date || '',
        time: editData.time || '',
        camera: editData.camera || '',
        street: editData.street || '',
        purok: editData.purok || '',
        barangay: editData.barangay || editData.location || '',
        location: editData.location || '',
        incidentType: editData.incidentType || '',
        actionTaken: editData.actionTaken || '',
        dispatchTo: editData.dispatchTo || '',
        dispatchTime: editData.dispatchTime || '',
        details: editData.details || '',
        observedBy: editData.observedBy || ''
      });
    } else {
      const now = new Date();
      setForm({
        ...initialForm,
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().slice(0, 5),
        observedBy: user?.name || ''
      });
    }
    setShowCustomIncident(false);
    setShowCustomBarangay(false);
    setShowCustomAction(false);
    setShowCustomDispatch(false);
    setCustomIncident('');
    setCustomBarangay('');
    setCustomAction('');
    setCustomDispatch('');
  }, [editData, isOpen]);

  const loadDropdownOptions = async () => {
    try {
      const [incRes, locRes] = await Promise.all([
        getDropdownOptions('incidentType'),
        getDropdownOptions('location')
      ]);
      setIncidentTypes(incRes.data);
      setBarangayOptions(locRes.data);
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

  const loadDispatchOptions = async () => {
    try {
      const res = await getDropdownOptions('dispatchTo');
      setDispatchOptions(res.data);
    } catch (err) {
      setDispatchOptions([]);
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
      toast.success('Incident type added successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add option');
    }
  };

  // Barangay handlers
  const handleBarangayChange = (e) => {
    const val = e.target.value;
    if (val === '__other__') {
      setShowCustomBarangay(true);
      setForm((prev) => ({ ...prev, barangay: '' }));
    } else {
      setShowCustomBarangay(false);
      setForm((prev) => ({ ...prev, barangay: val }));
    }
  };

  const handleAddCustomBarangay = async () => {
    if (!customBarangay.trim()) return;
    try {
      await addDropdownOption('location', customBarangay.trim());
      await loadDropdownOptions();
      setForm((prev) => ({ ...prev, barangay: customBarangay.trim() }));
      setCustomBarangay('');
      setShowCustomBarangay(false);
      toast.success('Barangay added successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add option');
    }
  };

  const handleEditBarangay = async (opt) => {
    if (!editBarangayValue.trim()) return;
    try {
      await updateDropdownOption(opt._id, editBarangayValue.trim());
      if (form.barangay === opt.value) {
        setForm((prev) => ({ ...prev, barangay: editBarangayValue.trim() }));
      }
      await loadDropdownOptions();
      setEditingBarangay(null);
      setEditBarangayValue('');
      toast.success('Barangay updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update option');
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
      toast.success('Incident type updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update option');
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
      toast.success('Action taken option added successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add option');
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
      toast.success('Action taken option updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update option');
    }
  };

  // Dispatch To handlers
  const handleDispatchChange = (e) => {
    const val = e.target.value;
    if (val === '__other__') {
      setShowCustomDispatch(true);
      setForm((prev) => ({ ...prev, dispatchTo: '' }));
    } else {
      setShowCustomDispatch(false);
      setForm((prev) => ({ ...prev, dispatchTo: val, dispatchTime: val ? prev.dispatchTime : '' }));
    }
  };

  const handleAddCustomDispatch = async () => {
    if (!customDispatch.trim()) return;
    try {
      await addDropdownOption('dispatchTo', customDispatch.trim());
      await loadDispatchOptions();
      setForm((prev) => ({ ...prev, dispatchTo: customDispatch.trim() }));
      setCustomDispatch('');
      setShowCustomDispatch(false);
      toast.success('Agency added successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add option');
    }
  };

  const handleEditDispatch = async (opt) => {
    if (!editDispatchValue.trim()) return;
    try {
      await updateDropdownOption(opt._id, editDispatchValue.trim());
      if (form.dispatchTo === opt.value) {
        setForm((prev) => ({ ...prev, dispatchTo: editDispatchValue.trim() }));
      }
      await loadDispatchOptions();
      setEditingDispatch(null);
      setEditDispatchValue('');
      toast.success('Agency updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update option');
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
          <h3>{isReadOnly ? 'Observation Details' : editData ? 'Edit Observation' : 'New CCTV Observation'}</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input type="date" name="date" className="form-input" value={form.date} onChange={handleChange} required disabled={isReadOnly} />
              </div>
              <div className="form-group">
                <label className="form-label">Time *</label>
                <div className="time-input-wrapper">
                  <Clock size={16} className="time-icon" />
                  <input type="time" name="time" className="form-input time-input" value={form.time} onChange={handleChange} required disabled={isReadOnly} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Camera</label>
                <input type="text" name="camera" className="form-input" value={form.camera} onChange={handleChange} placeholder="Camera ID/Name" disabled={isReadOnly} />
              </div>
              <div className="form-group">
                <label className="form-label">Street</label>
                <input type="text" name="street" className="form-input" value={form.street} onChange={handleChange} placeholder="Street" disabled={isReadOnly} />
              </div>
              <div className="form-group">
                <label className="form-label">Purok</label>
                <input type="text" name="purok" className="form-input" value={form.purok} onChange={handleChange} placeholder="Purok" disabled={isReadOnly} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Barangay *</span>
                  {!isReadOnly && (
                    <button type="button" className="dropdown-manage-btn" onClick={() => setShowBarangayManager(!showBarangayManager)}>
                      <Edit3 size={12} /> {showBarangayManager ? 'Close' : 'Edit Choices'}
                    </button>
                  )}
                </label>
                {!showCustomBarangay ? (
                  <select name="barangay" className="form-select" value={form.barangay} onChange={handleBarangayChange} required disabled={isReadOnly}>
                    <option value="">Select barangay</option>
                    {barangayOptions.map((opt) => (
                      <option key={opt._id} value={opt.value}>{opt.value}</option>
                    ))}
                    {!isReadOnly && <option value="__other__">— Others (Add New) —</option>}
                  </select>
                ) : (
                  <div className="custom-input-row">
                    <input type="text" className="form-input" value={customBarangay} onChange={(e) => setCustomBarangay(e.target.value)} placeholder="Type custom barangay..." autoFocus disabled={isReadOnly} />
                    {!isReadOnly && <button type="button" className="btn btn-sm btn-primary" onClick={handleAddCustomBarangay}><Plus size={14} /> Add</button>}
                    {!isReadOnly && <button type="button" className="btn btn-sm btn-secondary" onClick={() => { setShowCustomBarangay(false); setCustomBarangay(''); }}><XCircle size={14} /></button>}
                  </div>
                )}
                {showBarangayManager && (
                  <div className="dropdown-manager">
                    {barangayOptions.map((opt) => (
                      <div key={opt._id} className="dropdown-manager-item">
                        {editingBarangay === opt._id ? (
                          <>
                            <input type="text" className="form-input dm-input" value={editBarangayValue} onChange={(e) => setEditBarangayValue(e.target.value)} autoFocus />
                            <button type="button" className="dm-btn save" onClick={() => handleEditBarangay(opt)}><Check size={14} /></button>
                            <button type="button" className="dm-btn cancel" onClick={() => { setEditingBarangay(null); setEditBarangayValue(''); }}><XCircle size={14} /></button>
                          </>
                        ) : (
                          <>
                            <span className="dm-label">{opt.value}</span>
                            <button type="button" className="dm-btn edit" onClick={() => { setEditingBarangay(opt._id); setEditBarangayValue(opt.value); }}><Edit3 size={13} /></button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group full-width">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Incident Type *</span>
                  {!isReadOnly && (
                    <button type="button" className="dropdown-manage-btn" onClick={() => setShowIncidentManager(!showIncidentManager)}>
                      <Edit3 size={12} /> {showIncidentManager ? 'Close' : 'Edit Choices'}
                    </button>
                  )}
                </label>
                {!showCustomIncident ? (
                  <select name="incidentType" className="form-select" value={form.incidentType} onChange={handleIncidentTypeChange} required disabled={isReadOnly}>
                    <option value="">Select incident type</option>
                    {incidentTypes.map((opt) => (
                      <option key={opt._id} value={opt.value}>{opt.value}</option>
                    ))}
                    {!isReadOnly && <option value="__other__">— Others (Add New) —</option>}
                  </select>
                ) : (
                  <div className="custom-input-row">
                    <input type="text" className="form-input" value={customIncident} onChange={(e) => setCustomIncident(e.target.value)} placeholder="Type custom incident type..." autoFocus disabled={isReadOnly} />
                    {!isReadOnly && <button type="button" className="btn btn-sm btn-primary" onClick={handleAddCustomIncident}><Plus size={14} /> Add</button>}
                    {!isReadOnly && <button type="button" className="btn btn-sm btn-secondary" onClick={() => { setShowCustomIncident(false); setCustomIncident(''); }}><XCircle size={14} /></button>}
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
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Details / Description *</span>
                </label>
                <textarea name="details" className="form-textarea" value={form.details} onChange={handleChange} placeholder="Describe the observed incident..." rows={4} required disabled={isReadOnly} />
              </div>

              {/* Action Taken Field */}
              <div className="form-group full-width">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Action Taken *</span>
                  {!isReadOnly && (
                    <button type="button" className="dropdown-manage-btn" onClick={() => setShowActionManager(!showActionManager)}>
                      <Edit3 size={12} /> {showActionManager ? 'Close' : 'Edit Choices'}
                    </button>
                  )}
                </label>
                {!showCustomAction ? (
                  <select name="actionTaken" className="form-select" value={form.actionTaken} onChange={handleActionChange} required disabled={isReadOnly}>
                    <option value="">Select action taken</option>
                    {actionOptions.map((opt) => (
                      <option key={opt._id} value={opt.value}>{opt.value}</option>
                    ))}
                    {!isReadOnly && <option value="__other__">— Others (Add New) —</option>}
                  </select>
                ) : (
                  <div className="custom-input-row">
                    <input type="text" className="form-input" value={customAction} onChange={(e) => setCustomAction(e.target.value)} placeholder="Type custom action..." autoFocus disabled={isReadOnly} />
                    {!isReadOnly && <button type="button" className="btn btn-sm btn-primary" onClick={handleAddCustomAction}><Plus size={14} /> Add</button>}
                    {!isReadOnly && <button type="button" className="btn btn-sm btn-secondary" onClick={() => { setShowCustomAction(false); setCustomAction(''); }}><XCircle size={14} /></button>}
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

              {/* Dispatch To Field */}
              <div className="form-group full-width">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Dispatch To (Multi-Agency Response)</span>
                  {!isReadOnly && (
                    <button type="button" className="dropdown-manage-btn" onClick={() => setShowDispatchManager(!showDispatchManager)}>
                      <Edit3 size={12} /> {showDispatchManager ? 'Close' : 'Edit Choices'}
                    </button>
                  )}
                </label>
                {!showCustomDispatch ? (
                  <select name="dispatchTo" className="form-select" value={form.dispatchTo} onChange={handleDispatchChange} disabled={isReadOnly}>
                    <option value="">Select agency</option>
                    {dispatchOptions.map((opt) => (
                      <option key={opt._id} value={opt.value}>{opt.value}</option>
                    ))}
                    {!isReadOnly && <option value="__other__">— Others (Add New) —</option>}
                  </select>
                ) : (
                  <div className="custom-input-row">
                    <input type="text" className="form-input" value={customDispatch} onChange={(e) => setCustomDispatch(e.target.value)} placeholder="Type custom dispatch to..." autoFocus disabled={isReadOnly} />
                    {!isReadOnly && <button type="button" className="btn btn-sm btn-primary" onClick={handleAddCustomDispatch}><Plus size={14} /> Add</button>}
                    {!isReadOnly && <button type="button" className="btn btn-sm btn-secondary" onClick={() => { setShowCustomDispatch(false); setCustomDispatch(''); }}><XCircle size={14} /></button>}
                  </div>
                )}
                {showDispatchManager && (
                  <div className="dropdown-manager">
                    {dispatchOptions.map((opt) => (
                      <div key={opt._id} className="dropdown-manager-item">
                        {editingDispatch === opt._id ? (
                          <>
                            <input type="text" className="form-input dm-input" value={editDispatchValue} onChange={(e) => setEditDispatchValue(e.target.value)} autoFocus />
                            <button type="button" className="dm-btn save" onClick={() => handleEditDispatch(opt)}><Check size={14} /></button>
                            <button type="button" className="dm-btn cancel" onClick={() => { setEditingDispatch(null); setEditDispatchValue(''); }}><XCircle size={14} /></button>
                          </>
                        ) : (
                          <>
                            <span className="dm-label">{opt.value}</span>
                            <button type="button" className="dm-btn edit" onClick={() => { setEditingDispatch(opt._id); setEditDispatchValue(opt.value); }}><Edit3 size={13} /></button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dispatch Time Field - shown only when an agency is selected */}
              {form.dispatchTo && (
                <div className="form-group full-width">
                  <label className="form-label">Dispatch Time</label>
                  <div className="time-input-wrapper">
                    <Clock size={16} className="time-icon" />
                    <input
                      type="time"
                      name="dispatchTime"
                      className="form-input time-input"
                      value={form.dispatchTime}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      placeholder="Enter dispatch time"
                    />
                  </div>
                </div>
              )}

              {/* Observed By Field */}
              <div className="form-group full-width">
                <label className="form-label">Observed By</label>
                <input 
                  type="text" 
                  name="observedBy" 
                  className="form-input" 
                  value={form.observedBy || (user?.name || '')} 
                  onChange={handleChange}
                  disabled={!(user?.role === 'admin' && !isReadOnly)}
                  style={!(user?.role === 'admin' && !isReadOnly) ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>{isReadOnly ? 'Close' : 'Cancel'}</button>
            {!isReadOnly && (
              <button type="submit" className="btn btn-primary">
                {editData ? 'Update Observation' : 'Save Observation'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
