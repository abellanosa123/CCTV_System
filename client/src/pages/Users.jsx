import React, { useState, useEffect } from 'react';
import { getUsers, updateUser, deleteUser, createUser, sendNotification } from '../services/api';
import { toast } from 'react-toastify';
import { Check, X, Trash2, Shield, User as UserIcon, Send, Plus } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import PageHeader from '../components/PageHeader';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [msgUser, setMsgUser] = useState(null);
  const [msgText, setMsgText] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editData, setEditData] = useState({ name: '', username: '', password: '', role: 'user', status: 'approved' });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to fetch users');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await updateUser(id, { status });
      toast.success(`User access ${status === 'approved' ? 'approved' : 'rejected'}`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await updateUser(id, { role });
      toast.success(`User role updated to ${role}`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteUser(deleteId);
      toast.success('User deleted successfully');
      setConfirmOpen(false);
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const handleSendMessage = async () => {
    if (!msgText.trim()) return;
    try {
      await sendNotification({
        recipient: msgUser._id,
        title: 'Message from Admin',
        message: msgText.trim()
      });
      toast.success('Message sent');
      setMsgOpen(false);
      setMsgText('');
      setMsgUser(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
      console.error(err);
    }
  };

  const handleEditSave = async () => {
    try {
      const payload = { ...editData };
      
      if (isCreating) {
        if (!payload.name || !payload.username || !payload.password) {
          return toast.error('Please fill in all required fields');
        }
        await createUser(payload);
        toast.success('User created successfully');
      } else {
        if (!payload.password) delete payload.password;
        await updateUser(editUser._id, payload);
        toast.success('User updated successfully');
      }
      
      setEditOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save user');
    }
  };

  const handleCreateClick = () => {
    setIsCreating(true);
    setEditUser(null);
    setEditData({ name: '', username: '', password: '', role: 'user', status: 'approved' });
    setEditOpen(true);
  };

  const handleEditClick = (u) => {
    setIsCreating(false);
    setEditUser(u);
    setEditData({ name: u.name, username: u.username, password: '', role: u.role, status: u.status });
    setEditOpen(true);
  };

  return (
    <div>
      <PageHeader title="Users Management" subtitle="Manage system access and permissions">
        <button className="btn btn-primary" onClick={handleCreateClick} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} />
          <span>Add New User</span>
        </button>
      </PageHeader>

      <div className="table-container">
        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <p>No users found</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.username}</td>
                  <td>
                    {u.username === 'Admin Carl' ? (
                      <span className="badge completed">Admin</span>
                    ) : (
                      <select
                        className="form-select"
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        style={{ width: '140px', padding: '4px 8px' }}
                      >
                        <option value="user">User</option>
                        <option value="team_leader">Team Leader</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${u.status === 'approved' ? 'completed' : u.status === 'pending' ? 'pending' : 'in-progress'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="table-actions">
                      {u.username !== 'Admin Carl' && (
                        <>
                          {u.status === 'pending' && (
                            <>
                              <button className="action-btn" onClick={() => handleStatusChange(u._id, 'approved')} title="Approve" style={{ color: '#10b981' }}>
                                <Check size={16} />
                              </button>
                              <button className="action-btn" onClick={() => handleStatusChange(u._id, 'rejected')} title="Reject" style={{ color: '#ef4444' }}>
                                <X size={16} />
                              </button>
                            </>
                          )}
                          {u.status === 'approved' && (
                            <button className="action-btn" onClick={() => handleStatusChange(u._id, 'rejected')} title="Revoke Access" style={{ color: '#ef4444' }}>
                              <X size={16} />
                            </button>
                          )}
                          {u.status === 'rejected' && (
                            <button className="action-btn" onClick={() => handleStatusChange(u._id, 'approved')} title="Restore Access" style={{ color: '#10b981' }}>
                              <Check size={16} />
                            </button>
                          )}
                          <button className="action-btn" onClick={() => handleEditClick(u)} title="Edit User" style={{ color: '#a855f7' }}>
                            <Shield size={16} />
                          </button>
                          <button className="action-btn" onClick={() => { setMsgUser(u); setMsgOpen(true); }} title="Send Message" style={{ color: '#3b82f6' }}>
                            <Send size={16} />
                          </button>
                          <button className="action-btn delete" onClick={() => handleDeleteClick(u._id)} title="Delete User">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                      {u.username === 'Admin Carl' && (
                         <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Protected Account</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete User"
        message="Are you sure you want to delete this user? This cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setConfirmOpen(false); setDeleteId(null); }}
        confirmLabel="Delete"
      />

      {msgOpen && (
        <div className="modal-overlay" onClick={() => setMsgOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Send Message to {msgUser?.name}</h3>
              <button className="modal-close" onClick={() => setMsgOpen(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea 
                  className="form-textarea" 
                  value={msgText} 
                  onChange={(e) => setMsgText(e.target.value)} 
                  rows={4} 
                  autoFocus 
                  placeholder="Type your message..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setMsgOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}

      {editOpen && (
        <div className="modal-overlay" onClick={() => setEditOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>{isCreating ? 'Add New User' : `Edit User: ${editUser?.name}`}</h3>
              <button className="modal-close" onClick={() => setEditOpen(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  className="form-input" 
                  value={editData.name} 
                  onChange={(e) => setEditData({...editData, name: e.target.value})} 
                  placeholder="Enter full name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input 
                  className="form-input" 
                  value={editData.username} 
                  onChange={(e) => setEditData({...editData, username: e.target.value})} 
                  placeholder="Enter username"
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  {isCreating ? 'Password' : 'New Password (leave blank to keep current)'}
                </label>
                <input 
                  type="password"
                  className="form-input" 
                  value={editData.password} 
                  onChange={(e) => setEditData({...editData, password: e.target.value})} 
                  placeholder="********"
                />
              </div>
              
              {isCreating && (
                <>
                  <div className="form-group">
                    <label className="form-label">Initial Role</label>
                    <select 
                      className="form-select"
                      value={editData.role}
                      onChange={(e) => setEditData({...editData, role: e.target.value})}
                    >
                      <option value="user">User</option>
                      <option value="team_leader">Team Leader</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Initial Status</label>
                    <select 
                      className="form-select"
                      value={editData.status}
                      onChange={(e) => setEditData({...editData, status: e.target.value})}
                    >
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleEditSave}>
                {isCreating ? 'Create User' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
