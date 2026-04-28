import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getNotifications, 
  markNotificationRead, 
  markAllNotificationsRead, 
  bulkMarkNotificationsRead,
  deleteNotification,
  bulkDeleteNotifications
} from '../services/api';
import { Bell, CheckCircle, CheckCircle2, Info, Trash2, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmDialog from '../components/ConfirmDialog';
import PageHeader from '../components/PageHeader';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // null = bulk, id = single

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      setNotifications(res.data);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      toast.error('Failed to update notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success(`Marked ${res.data.count} notifications as read`);
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleMarkSelectedAsRead = async () => {
    if (selected.size === 0) return;
    try {
      const ids = Array.from(selected);
      await bulkMarkNotificationsRead(ids);
      setNotifications(notifications.map(n => 
        selected.has(n._id) ? { ...n, isRead: true } : n
      ));
      setSelected(new Set());
      toast.success(`Marked ${ids.length} notifications as read`);
    } catch (err) {
      toast.error('Failed to mark selected as read');
    }
  };

  const handleDeleteSingle = (id) => {
    setDeleteTarget(id);
    setConfirmOpen(true);
  };

  const handleDeleteSelected = () => {
    if (selected.size === 0) return;
    setDeleteTarget(null);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteTarget) {
        // Single delete
        await deleteNotification(deleteTarget);
        setNotifications(notifications.filter(n => n._id !== deleteTarget));
        toast.success('Notification deleted');
      } else {
        // Bulk delete
        const ids = Array.from(selected);
        await bulkDeleteNotifications(ids);
        setNotifications(notifications.filter(n => !selected.has(n._id)));
        setSelected(new Set());
        toast.success(`Deleted ${ids.length} notifications`);
      }
    } catch (err) {
      toast.error('Failed to delete notification(s)');
    } finally {
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === notifications.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(notifications.map(n => n._id)));
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const allSelected = notifications.length > 0 && selected.size === notifications.length;

  return (
    <div className="notifications-page">
      <PageHeader title="Notifications" subtitle={<>System alerts and messages {unreadCount > 0 && <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>({unreadCount} unread)</span>}</>}>
        {notifications.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {unreadCount > 0 && (
              <button className="btn btn-outline" onClick={handleMarkAllAsRead} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                <CheckCircle2 size={15} /> Mark All as Read
              </button>
            )}
            {selected.size > 0 && (
              <>
                <button className="btn btn-outline" onClick={handleMarkSelectedAsRead} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                  <Check size={15} /> Mark Selected Read ({selected.size})
                </button>
                <button className="btn btn-danger-outline" onClick={handleDeleteSelected} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                  <Trash2 size={15} /> Delete Selected ({selected.size})
                </button>
              </>
            )}
          </div>
        )}
      </PageHeader>
      
      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <Bell size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p>No notifications at the moment.</p>
        </div>
      ) : (
        <>
          {/* Select All Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 16px',
            marginBottom: '10px',
            background: 'var(--bg-card)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <input 
                type="checkbox" 
                checked={allSelected} 
                onChange={toggleSelectAll}
                style={{ 
                  width: '16px', height: '16px', cursor: 'pointer',
                  accentColor: 'var(--primary)'
                }}
              />
              Select All ({notifications.length})
            </label>
          </div>

          <div className="notifications-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.map((n) => (
              <div 
                key={n._id} 
                className={`notification-card ${!n.isRead ? 'unread' : ''}`}
                style={{
                  background: 'var(--bg-card)', 
                  padding: '1rem 1.5rem', 
                  borderRadius: '8px', 
                  borderLeft: !n.isRead ? '4px solid var(--primary)' : '4px solid transparent',
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '14px',
                  transition: 'all 0.2s ease',
                  opacity: n.isRead ? 0.7 : 1
                }}
              >
                {/* Checkbox */}
                <input 
                  type="checkbox" 
                  checked={selected.has(n._id)} 
                  onChange={() => toggleSelect(n._id)}
                  style={{ 
                    width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0,
                    accentColor: 'var(--primary)'
                  }}
                />
                
                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Info size={16} color="var(--primary)" />
                    {n.title}
                  </h4>
                  <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>{n.message}</p>
                  <small style={{ color: 'var(--text-muted)' }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </small>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  {!n.isRead && (
                    <button 
                      className="btn btn-sm btn-outline" 
                      onClick={() => handleMarkAsRead(n._id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                      title="Mark as Read"
                    >
                      <CheckCircle size={14} /> Read
                    </button>
                  )}
                  <button 
                    className="action-btn delete" 
                    onClick={() => handleDeleteSingle(n._id)}
                    title="Delete notification"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Notification(s)"
        message={deleteTarget 
          ? "Are you sure you want to delete this notification?" 
          : `Are you sure you want to delete ${selected.size} selected notification(s)?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setConfirmOpen(false); setDeleteTarget(null); }}
        confirmLabel="Delete"
      />

      <style>{`
        .btn-outline {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 6px 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 13px;
        }
        .btn-outline:hover {
          border-color: var(--primary);
          color: var(--primary);
          background: rgba(139, 92, 246, 0.05);
        }
        .btn-danger-outline {
          background: transparent;
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #ef4444;
          padding: 6px 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 13px;
        }
        .btn-danger-outline:hover {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.08);
        }
        .notification-card:hover {
          background: var(--bg-card-hover, var(--bg-card)) !important;
        }
      `}</style>
    </div>
  );
}
