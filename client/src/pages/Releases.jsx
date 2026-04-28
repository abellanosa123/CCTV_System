import React, { useState, useEffect, useCallback } from 'react';
import { getReleases, deleteRelease } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';
import { toast } from 'react-toastify';
import { Search, Trash2, FileOutput, Eye } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import ReviewModal from '../modals/ReviewModal';

export default function Releases() {
  const [releases, setReleases] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();

  const canEditEntry = (entry) => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'team_leader') return true;
    return entry.userId === user._id;
  };

  const formatTimeInfo = (t) => {
    if (!t) return '';
    try {
      let [h, m] = t.split(':');
      h = parseInt(h, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return `${h}:${m} ${ampm}`;
    } catch { return t; }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getReleases({ search, page, limit: 15 });
      setReleases(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to fetch releases');
    }
    setLoading(false);
  }, [search, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteRelease(deleteId);
      toast.success('Release record deleted successfully');
      setConfirmOpen(false);
      setDeleteId(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to delete release');
    }
  };
  const handleRowClick = (rel) => {
    // Map release fields back to review-like fields for the modal
    const mappedData = {
      ...rel,
      name: rel.requestedBy || rel.name,
      barangay: rel.barangay || rel.location
    };
    setViewData(mappedData);
    setModalOpen(true);
  };
  return (
    <div>
      <PageHeader title="Release Footage Logs" subtitle="Records of released CCTV footage" />

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="search-input-wrapper">
              <Search size={16} />
              <input
                className="search-input"
                placeholder="Search by location, type, requestor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : releases.length === 0 ? (
          <div className="empty-state">
            <FileOutput size={48} />
            <h4>No released footage logs</h4>
            <p>Release footage from Review Logs to see records here</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Release Date</th>
                <th>Requested By</th>
                <th>Phone</th>
                <th>Camera</th>
                <th>Street</th>
                <th>Purok</th>
                <th>Barangay</th>
                <th>Incident Date</th>
                <th>Incident Type</th>
                <th>Description</th>
                <th>Captured</th>
                <th>Operator</th>
                <th>Result</th>
                <th>Outcome</th>
                <th>Comments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {releases.map((rel) => (
                <tr key={rel._id} onClick={() => handleRowClick(rel)} style={{ cursor: 'pointer' }}>
                  <td>
                    {rel.releaseDate && rel.releaseDate.includes('T')
                      ? new Date(rel.releaseDate).toLocaleString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: 'numeric', minute: '2-digit', hour12: true
                      })
                      : rel.releaseDate}
                  </td>
                  <td>{rel.requestedBy || rel.name}</td>
                  <td>{rel.phoneNumber || '—'}</td>
                  <td>{rel.camera || '—'}</td>
                  <td>{rel.street || '—'}</td>
                  <td>{rel.purok || '—'}</td>
                  <td>{rel.barangay || rel.location || '—'}</td>
                  <td>
                    {rel.incidentDate || '—'}<br />
                    {rel.incidentTime && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatTimeInfo(rel.incidentTime)}</span>}
                  </td>
                  <td><span className="badge released">{rel.incidentType}</span></td>
                  <td className="cell-long" title={rel.description}>{rel.description}</td>
                  <td>{rel.caughtOnCam || '—'}</td>
                  <td>{rel.releaserName || rel.reviewedBy || '—'}</td>
                  <td>{rel.result || '—'}</td>
                  <td>{rel.outcome || '—'}</td>
                  <td className="cell-long" title={rel.comments}>{rel.comments || '—'}</td>
                  <td>
                    <div className="table-actions" onClick={(e) => e.stopPropagation()}>
                      {canEditEntry(rel) && (
                        <button className="action-btn delete" onClick={() => handleDeleteClick(rel._id)} title="Delete">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      <ReviewModal 
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setViewData(null); }}
        editData={viewData}
        isReadOnly={true}
        onSubmit={() => {}}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Release Record"
        message="Are you sure you want to delete this release record? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setConfirmOpen(false); setDeleteId(null); }}
        confirmLabel="Delete"
      />
    </div>
  );
}
