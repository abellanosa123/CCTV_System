import React, { useState, useEffect, useCallback } from 'react';
import { getObservations, createObservation, updateObservation, deleteObservation } from '../services/api';
import ObservationModal from '../modals/ObservationModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';
import { toast } from 'react-toastify';
import { Search, Plus, Edit3, Trash2, Eye } from 'lucide-react';

export default function Observations() {
  const [observations, setObservations] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getObservations({ search, page, limit: 15 });
      setObservations(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to fetch observations');
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
        await updateObservation(editData._id, formData);
        toast.success('Observation updated successfully');
      } else {
        await createObservation(formData);
        toast.success('Observation created successfully');
      }
      setModalOpen(false);
      setEditData(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (obs) => {
    setEditData(obs);
    setModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteObservation(deleteId);
      toast.success('Observation deleted successfully');
      setConfirmOpen(false);
      setDeleteId(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to delete observation');
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2>Observation Logs</h2>
          <p>CCTV operator-generated incident observations</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditData(null); setModalOpen(true); }}>
          <Plus size={16} /> New Observation
        </button>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="search-input-wrapper">
              <Search size={16} />
              <input
                className="search-input"
                placeholder="Search by location, type, details..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : observations.length === 0 ? (
          <div className="empty-state">
            <Eye size={48} />
            <h4>No observations found</h4>
            <p>Create your first observation entry to get started</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Location</th>
                <th>Incident Type</th>
                <th>Details</th>
                <th>Action Taken</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {observations.map((obs) => (
                <tr key={obs._id}>
                  <td>{obs.date}</td>
                  <td>{obs.time}</td>
                  <td>{obs.location}</td>
                  <td><span className="badge pending">{obs.incidentType}</span></td>
                  <td title={obs.details}>{obs.details}</td>
                  <td><span className="badge reviewed">{obs.actionTaken || '—'}</span></td>
                  <td>
                    <div className="table-actions">
                      <button className="action-btn edit" onClick={() => handleEdit(obs)} title="Edit">
                        <Edit3 size={15} />
                      </button>
                      <button className="action-btn delete" onClick={() => handleDeleteClick(obs._id)} title="Delete">
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

      <ObservationModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSubmit={handleSubmit}
        editData={editData}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Observation"
        message="Are you sure you want to delete this observation? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setConfirmOpen(false); setDeleteId(null); }}
      />
    </div>
  );
}
