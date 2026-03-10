import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';

export default function ReleaseModal({ isOpen, onClose, onSubmit }) {
  const [releaseDate, setReleaseDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(releaseDate);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <h3>Release Footage</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
              Select the release date for this footage. The review status will be updated to "Released" and a copy will be recorded in Release Logs.
            </p>
            <div className="form-group">
              <label className="form-label">Release Date *</label>
              <input
                type="date"
                className="form-input"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-success">
              <Calendar size={16} /> Release Footage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
