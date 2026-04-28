import React, { useState, useEffect } from 'react';
import { X, Clock, Plus, Edit3, Check, XCircle } from 'lucide-react';
import { getDropdownOptions, addDropdownOption, updateDropdownOption } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const initialForm = {
  dateRequested: '',
  timeRequested: '',
  name: '',
  phoneNumber: '',
  camera: '',
  street: '',
  purok: '',
  barangay: '',
  incidentDate: '',
  incidentTime: '',
  incidentType: '',
  description: '',
  reviewedBy: '',
  result: '',
  outcome: '',
  caughtOnCam: '',
  comments: ''
};

export default function ReviewModal({ isOpen, onClose, onSubmit, editData, isReadOnly }) {
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [incidentTypes, setIncidentTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [showCustomIncident, setShowCustomIncident] = useState(false);
  const [customIncident, setCustomIncident] = useState('');
  const [showCustomLocation, setShowCustomLocation] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [editingIncident, setEditingIncident] = useState(null);
  const [editIncidentValue, setEditIncidentValue] = useState('');
  const [editingLocation, setEditingLocation] = useState(null);
  const [editLocationValue, setEditLocationValue] = useState('');
  const [showIncidentManager, setShowIncidentManager] = useState(false);
  const [showLocationManager, setShowLocationManager] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDropdownOptions();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editData) {
      setForm({
        dateRequested: editData.dateRequested || '',
        timeRequested: editData.timeRequested || '',
        name: editData.name || '',
        phoneNumber: editData.phoneNumber || '',
        camera: editData.camera || '',
        street: editData.street || '',
        purok: editData.purok || '',
        barangay: editData.barangay || editData.location || '',
        incidentDate: editData.incidentDate || '',
        incidentTime: editData.incidentTime || '',
        incidentType: editData.incidentType || '',
        description: editData.description || '',
        reviewedBy: editData.reviewedBy || '',
        result: editData.result || '',
        outcome: editData.outcome || '',
        caughtOnCam: editData.caughtOnCam || '',
        comments: editData.comments || ''
      });
    } else {
      const now = new Date();
      setForm({
        ...initialForm,
        dateRequested: now.toISOString().split('T')[0],
        timeRequested: now.toTimeString().slice(0, 5),
        reviewedBy: user?.name || ''
      });
    }
    setShowCustomIncident(false);
    setShowCustomLocation(false);
    setCustomIncident('');
    setCustomLocation('');
  }, [editData, isOpen]);

  const loadDropdownOptions = async () => {
    try {
      const [incRes, locRes] = await Promise.all([
        getDropdownOptions('incidentType'),
        getDropdownOptions('location')
      ]);
      setIncidentTypes(incRes.data);
      setLocations(locRes.data);
    } catch (err) {
      console.error('Failed to load dropdown options:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

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

  const handleLocationChange = (e) => {
    const val = e.target.value;
    if (val === '__other__') {
      setShowCustomLocation(true);
      setForm((prev) => ({ ...prev, barangay: '' }));
    } else {
      setShowCustomLocation(false);
      setForm((prev) => ({ ...prev, barangay: val }));
    }
  };

  const handleAddCustomLocation = async () => {
    if (!customLocation.trim()) return;
    try {
      await addDropdownOption('location', customLocation.trim());
      await loadDropdownOptions();
      setForm((prev) => ({ ...prev, barangay: customLocation.trim() }));
      setCustomLocation('');
      setShowCustomLocation(false);
      toast.success('Barangay added successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add option');
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

  const handleEditLocation = async (opt) => {
    if (!editLocationValue.trim()) return;
    try {
      await updateDropdownOption(opt._id, editLocationValue.trim());
      if (form.barangay === opt.value) {
        setForm((prev) => ({ ...prev, barangay: editLocationValue.trim() }));
      }
      await loadDropdownOptions();
      setEditingLocation(null);
      setEditLocationValue('');
      toast.success('Barangay updated successfully');
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
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '780px'}}>
        <div className="modal-header">
          <h3>{isReadOnly ? 'Review Request Details' : editData ? 'Edit Review Request' : 'CCTV Review Request Form'}</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              {/* Requesting Party Section */}
              <div className="form-section-title">Requesting Party</div>

              <div className="form-group">
                <label className="form-label">Date Requested *</label>
                <input type="date" name="dateRequested" className="form-input" value={form.dateRequested} onChange={handleChange} required disabled={isReadOnly} />
              </div>
              <div className="form-group">
                <label className="form-label">Time *</label>
                <div className="time-input-wrapper">
                  <Clock size={16} className="time-icon" />
                  <input type="time" name="timeRequested" className="form-input time-input" value={form.timeRequested} onChange={handleChange} required disabled={isReadOnly} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input type="text" name="name" className="form-input" value={form.name} onChange={handleChange} placeholder="Full name" required disabled={isReadOnly} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="text" name="phoneNumber" className="form-input" value={form.phoneNumber} onChange={handleChange} placeholder="09XX-XXX-XXXX" disabled={isReadOnly} />
              </div>

              {/* Requested Playback Section */}
              <div className="form-section-title">Requested Playback</div>

              <div className="form-group">
                <label className="form-label">Camera</label>
                <input type="text" name="camera" className="form-input" value={form.camera} onChange={handleChange} placeholder="Camera ID/Location" disabled={isReadOnly} />
              </div>
              <div className="form-group">
                <label className="form-label">Street</label>
                <input type="text" name="street" className="form-input" value={form.street} onChange={handleChange} placeholder="Street name" disabled={isReadOnly} />
              </div>
              <div className="form-group">
                <label className="form-label">Purok</label>
                <input type="text" name="purok" className="form-input" value={form.purok} onChange={handleChange} placeholder="Purok" disabled={isReadOnly} />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Barangay *</span>
                  {!isReadOnly && (
                    <button type="button" className="dropdown-manage-btn" onClick={() => setShowLocationManager(!showLocationManager)}>
                      <Edit3 size={12} /> {showLocationManager ? 'Close' : 'Edit Choices'}
                    </button>
                  )}
                </label>
                {!showCustomLocation ? (
                  <select name="barangay" className="form-select" value={form.barangay} onChange={handleLocationChange} required disabled={isReadOnly}>
                    <option value="">Select barangay</option>
                    {locations.map((opt) => (
                      <option key={opt._id} value={opt.value}>{opt.value}</option>
                    ))}
                    {!isReadOnly && <option value="__other__">— Others (Add New) —</option>}
                  </select>
                ) : (
                  <div className="custom-input-row">
                    <input type="text" className="form-input" value={customLocation} onChange={(e) => setCustomLocation(e.target.value)} placeholder="Type custom barangay..." autoFocus disabled={isReadOnly} />
                    {!isReadOnly && <button type="button" className="btn btn-sm btn-primary" onClick={handleAddCustomLocation}><Plus size={14} /> Add</button>}
                    {!isReadOnly && <button type="button" className="btn btn-sm btn-secondary" onClick={() => { setShowCustomLocation(false); setCustomLocation(''); }}><XCircle size={14} /></button>}
                  </div>
                )}
                {showLocationManager && (
                  <div className="dropdown-manager">
                    {locations.map((opt) => (
                      <div key={opt._id} className="dropdown-manager-item">
                        {editingLocation === opt._id ? (
                          <>
                            <input type="text" className="form-input dm-input" value={editLocationValue} onChange={(e) => setEditLocationValue(e.target.value)} autoFocus />
                            <button type="button" className="dm-btn save" onClick={() => handleEditLocation(opt)}><Check size={14} /></button>
                            <button type="button" className="dm-btn cancel" onClick={() => { setEditingLocation(null); setEditLocationValue(''); }}><XCircle size={14} /></button>
                          </>
                        ) : (
                          <>
                            <span className="dm-label">{opt.value}</span>
                            <button type="button" className="dm-btn edit" onClick={() => { setEditingLocation(opt._id); setEditLocationValue(opt.value); }}><Edit3 size={13} /></button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Date of Incident *</label>
                <input type="date" name="incidentDate" className="form-input" value={form.incidentDate} onChange={handleChange} required disabled={isReadOnly} />
              </div>
              <div className="form-group">
                <label className="form-label">Time of Incident *</label>
                <div className="time-input-wrapper">
                  <Clock size={16} className="time-icon" />
                  <input type="time" name="incidentTime" className="form-input time-input" value={form.incidentTime} onChange={handleChange} required disabled={isReadOnly} />
                </div>
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
                <label className="form-label">Description of Incident *</label>
                <textarea name="description" className="form-textarea" value={form.description} onChange={handleChange} placeholder="Describe the incident..." rows={3} required disabled={isReadOnly} />
              </div>

              {/* Reviewed By */}
              <div className="form-section-title">Review Info</div>

              <div className="form-group">
                <label className="form-label">Reviewed By</label>
                <input 
                  type="text" 
                  name="reviewedBy" 
                  className="form-input" 
                  value={form.reviewedBy} 
                  onChange={handleChange}
                  disabled={!(user?.role === 'admin' && !isReadOnly)}
                  style={!(user?.role === 'admin' && !isReadOnly) ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Result</label>
                <input type="text" name="result" className="form-input" value={form.result} onChange={handleChange} placeholder="Enter review result" disabled={isReadOnly} />
              </div>
              <div className="form-group">
                <label className="form-label">Caught on Cam</label>
                <div className="checkbox-group">
                  {['Captured', 'Uncaptured'].map((opt) => (
                    <label key={opt} className="checkbox-item">
                      <input type="radio" name="caughtOnCam" value={opt} checked={form.caughtOnCam === opt} onChange={handleChange} disabled={isReadOnly} />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Outcome</label>
                <div className="checkbox-group">
                  {['Useful', 'Somehow Useful', 'Not Useful'].map((opt) => (
                    <label key={opt} className="checkbox-item">
                      <input type="radio" name="outcome" value={opt} checked={form.outcome === opt} onChange={handleChange} disabled={isReadOnly} />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              {/* Client Feedback */}
              <div className="form-section-title">Client Feedback</div>

              <div className="form-group full-width">
                <label className="form-label">Comments</label>
                <textarea name="comments" className="form-textarea" value={form.comments} onChange={handleChange} placeholder="Client comments or feedback..." rows={3} disabled={isReadOnly} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>{isReadOnly ? 'Close' : 'Cancel'}</button>
            {!isReadOnly && (
              <button type="submit" className="btn btn-primary">
                {editData ? 'Update Review' : 'Submit Review'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
