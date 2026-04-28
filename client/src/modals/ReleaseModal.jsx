import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ReleaseModal({ isOpen, onClose, onSubmit }) {
  const { user } = useAuth();
  const [releaseDate, setReleaseDate] = useState('');
  const [releaserName, setReleaserName] = useState(user?.name || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ releaseDate, releaserName });
    // Reset name for next time, but maybe keep it? Usually better to reset.
    setReleaserName('');
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
              Enter the release details below. The review status will be updated to "Released" and a record will be added to Release Logs.
            </p>
            <div className="form-group">
              <label className="form-label">Release Date & Time *</label>
              <input
                type="datetime-local"
                className="form-input"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Released By (Name of Releaser) *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter name of person releasing footage"
                value={releaserName || (user?.name || '')}
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
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
