import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, CheckCircle, Clock, Edit3, X, Save } from 'lucide-react';
import { updateMyProfile } from '../services/api';
import { toast } from 'react-toastify';
import PageHeader from '../components/PageHeader';
import cccLogo from '../assets/CCTVUnit_logo.png';

export default function Profile() {
  const { user, login } = useAuth(); // We can use login or just refresh page to update local user state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: user?.name || '', username: user?.username || '', password: '' });
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name: formData.name, username: formData.username };
      if (formData.password) payload.password = formData.password;
      
      await updateMyProfile(payload);
      toast.success('Profile updated. Please log in again if you changed your credentials.');
      setIsEditing(false);
      // Ideally we'd update context, but a refresh ensures safety
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page-container">
      <PageHeader title="User Profile" subtitle="Manage your account settings and preferences" />
      <div className="profile-page" style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
        <div className="profile-card" style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', position: 'relative', border: '1px solid var(--border-color)' }}>
        
        <button 
          onClick={() => setIsEditing(true)}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
          title="Edit Profile"
        >
          <Edit3 size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            width: '80px', height: '80px', margin: '0 auto 1rem', 
            background: 'rgba(139, 92, 246, 0.1)', borderRadius: '20px', 
            padding: '10px', border: '1px solid rgba(139, 92, 246, 0.2)' 
          }}>
            <img src={cccLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.4))' }} />
          </div>
          <h2 style={{ marginBottom: '5px', color: '#fff' }}>Account Information</h2>
          <p style={{ color: 'var(--text-muted)' }}>Registered monitoring system operator</p>
        </div>

        <div className="profile-details" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="detail-row" style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
            <User size={24} color="var(--primary)" />
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Full Name</p>
              <h4 style={{ margin: 0 }}>{user.name}</h4>
            </div>
          </div>

          <div className="detail-row" style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
            <User size={24} color="var(--text-muted)" />
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Username</p>
              <h4 style={{ margin: 0 }}>{user.username}</h4>
            </div>
          </div>

          <div className="detail-row" style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
            <Shield size={24} color={user.role === 'admin' ? '#ef4444' : user.role === 'team_leader' ? '#f59e0b' : '#3b82f6'} />
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>System Role</p>
              <h4 style={{ margin: 0, textTransform: 'capitalize' }}>{user.role === 'team_leader' ? 'Team Leader' : user.role}</h4>
            </div>
          </div>

          <div className="detail-row" style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
            {user.status === 'approved' ? <CheckCircle size={24} color="#10b981" /> : <Clock size={24} color="#f59e0b" />}
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Account Status</p>
              <h4 style={{ margin: 0, textTransform: 'capitalize' }}>{user.status}</h4>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="modal-overlay" onClick={() => setIsEditing(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
              <div className="modal-header">
                <h3>Edit Profile</h3>
                <button className="modal-close" onClick={() => setIsEditing(false)}><X size={18} /></button>
              </div>
              <form onSubmit={handleUpdate}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input 
                      className="form-input" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input 
                      type="text"
                      className="form-input" 
                      value={formData.username} 
                      onChange={(e) => setFormData({...formData, username: e.target.value})} 
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password (optional)</label>
                    <input 
                      type="password"
                      className="form-input" 
                      placeholder="Enter new password"
                      value={formData.password} 
                      onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Updating...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  </div>
  );
}
