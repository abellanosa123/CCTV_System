import React, { useState, useEffect, useCallback } from 'react';
import { getReviews, createReview, updateReview, deleteReview, releaseFootage } from '../services/api';
import ReviewModal from '../modals/ReviewModal';
import ReleaseModal from '../modals/ReleaseModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';
import { toast } from 'react-toastify';
import { Search, Plus, Edit3, Trash2, FileOutput, FileSearch } from 'lucide-react';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [releaseId, setReleaseId] = useState(null);

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
      const res = await getReviews({ search, page, limit: 15 });
      setReviews(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to fetch reviews');
    }
    setLoading(false);
  }, [search, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleSubmit = async (formData) => {
    try {
      if (editData) {
        await updateReview(editData._id, formData);
        toast.success('Review updated successfully');
      } else {
        await createReview(formData);
        toast.success('Review created successfully');
      }
      setModalOpen(false);
      setEditData(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (review) => {
    setEditData(review);
    setModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteReview(deleteId);
      toast.success('Review deleted successfully');
      setConfirmOpen(false);
      setDeleteId(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  const handleReleaseClick = (id) => {
    setReleaseId(id);
    setReleaseModalOpen(true);
  };

  const handleReleaseSubmit = async (releaseDate) => {
    try {
      await releaseFootage(releaseId, releaseDate);
      toast.success('Footage released successfully! Status updated and recorded in Release Logs.');
      setReleaseModalOpen(false);
      setReleaseId(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to release footage');
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2>Review Logs</h2>
          <p>CCTV playback request records</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditData(null); setModalOpen(true); }}>
          <Plus size={16} /> New Review Request
        </button>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="search-input-wrapper">
              <Search size={16} />
              <input
                className="search-input"
                placeholder="Search by name, location, type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : reviews.length === 0 ? (
          <div className="empty-state">
            <FileSearch size={48} />
            <h4>No review logs found</h4>
            <p>Submit a CCTV review request to get started</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date Requested</th>
                <th>Requestor</th>
                <th>Location</th>
                <th>Incident Date</th>
                <th>Incident Type</th>
                <th>Status</th>
                <th>Reviewed By</th>
                <th>Outcome</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((rev) => (
                <tr key={rev._id}>
                  <td>
                    {rev.dateRequested}<br />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatTimeInfo(rev.timeRequested)}</span>
                  </td>
                  <td>{rev.name}</td>
                  <td>{rev.location}</td>
                  <td>
                    {rev.incidentDate}<br />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatTimeInfo(rev.incidentTime)}</span>
                  </td>
                  <td><span className="badge not-released">{rev.incidentType}</span></td>
                  <td>
                    <span className={`badge ${rev.status && rev.status !== 'Pending' ? rev.status.toLowerCase().replace(' ', '-') : 'not-released'}`}>
                      {rev.status === 'Pending' ? 'Not Released' : (rev.status || 'Not Released')}
                    </span>
                  </td>
                  <td>{rev.reviewedBy || '—'}</td>
                  <td>{rev.outcome || '—'}</td>
                  <td>
                    <div className="table-actions">
                      <button className="action-btn edit" onClick={() => handleEdit(rev)} title="Edit">
                        <Edit3 size={15} />
                      </button>
                      <button className="action-btn release" onClick={() => handleReleaseClick(rev._id)} title="Release Footage" disabled={rev.status === 'Released'}>
                        <FileOutput size={15} />
                      </button>
                      <button className="action-btn delete" onClick={() => handleDeleteClick(rev._id)} title="Delete">
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

      <ReviewModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSubmit={handleSubmit}
        editData={editData}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setConfirmOpen(false); setDeleteId(null); }}
      />

      <ReleaseModal
        isOpen={releaseModalOpen}
        onClose={() => { setReleaseModalOpen(false); setReleaseId(null); }}
        onSubmit={handleReleaseSubmit}
      />
    </div>
  );
}
