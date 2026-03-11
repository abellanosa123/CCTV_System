import React, { useState, useEffect, useCallback } from 'react';
import { getReleases, deleteRelease } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';
import { toast } from 'react-toastify';
import { Search, Trash2, FileOutput } from 'lucide-react';

export default function Releases() {
  const [releases, setReleases] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

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

  return (
    <div>
      <div className="page-header">
        <h2>Release Footage Logs</h2>
        <p>Records of released CCTV footage</p>
      </div>

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
                <th>Location</th>
                <th>Incident Date</th>
                <th>Incident Type</th>
                <th>Description</th>
                <th>Reviewed By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {releases.map((rel) => (
                <tr key={rel._id}>
                  <td>
                    {rel.releaseDate && rel.releaseDate.includes('T') 
                      ? new Date(rel.releaseDate).toLocaleString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                          hour: 'numeric', minute: '2-digit', hour12: true
                        })
                      : rel.releaseDate}
                  </td>
                  <td>{rel.requestedBy || rel.name}</td>
                  <td>{rel.location}</td>
                  <td>
                    {rel.incidentDate || '—'}<br />
                    {rel.incidentTime && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatTimeInfo(rel.incidentTime)}</span>}
                  </td>
                  <td><span className="badge released">{rel.incidentType}</span></td>
                  <td title={rel.description}>{rel.description}</td>
                  <td>{rel.reviewedBy || '—'}</td>
                  <td>
                    <div className="table-actions">
                      <button className="action-btn delete" onClick={() => handleDeleteClick(rel._id)} title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Release Record"
        message="Are you sure you want to delete this release record? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setConfirmOpen(false); setDeleteId(null); }}
      />
    </div>
  );
}
