import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Eye,
  FileSearch,
  FileOutput,
  BarChart3,
  Menu,
  LogOut,
  Users,
  Bell,
  User,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import cccLogo from '../assets/CCTVUnit_logo.png';
import { useAuth } from '../context/AuthContext';
import { getUnreadNotificationCount } from '../services/api';
import ConfirmDialog from './ConfirmDialog';
import { toast } from 'react-toastify';

const navItems = [
  { path: '/cctvsystem', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/cctvsystem/observations', label: 'Observations', icon: Eye },
  { path: '/cctvsystem/reviews', label: 'Review Logs', icon: FileSearch },
  { path: '/cctvsystem/releases', label: 'Release Logs', icon: FileOutput },
  { path: '/cctvsystem/reports', label: 'Reports', icon: BarChart3, adminOnly: true },
  { path: '/cctvsystem/users', label: 'Users', icon: Users, adminExclusive: true },
  { path: '/cctvsystem/notifications', label: 'Notifications', icon: Bell, showBadge: true },
  { path: '/cctvsystem/profile', label: 'Profile', icon: User },
];

export default function Sidebar({ collapsed, setCollapsed, onLogout }) {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'admin' || user?.role === 'team_leader';
  const isAdminExclusive = user?.role === 'admin';
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        if (user) {
          const res = await getUnreadNotificationCount();
          setUnreadCount(res.data.count);
        }
      } catch (err) {}
    };
    
    // Fetch notifications initially and then periodically
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [user, location.pathname]);

  const filteredNavItems = navItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header" style={{ padding: collapsed ? '20px 0' : '24px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="sidebar-logo" style={{ width: '36px', height: '36px' }}>
            <img src={cccLogo} alt="CCC Logo" />
          </div>
          {!collapsed && (
            <div className="sidebar-title">
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>CCC</h1>
              <span style={{ fontSize: '10px', color: '#A78BFA', fontWeight: 600, textTransform: 'uppercase' }}>CCTV System</span>
            </div>
          )}
        </div>
        <button
          className="sidebar-collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          style={{ 
            background: 'rgba(255, 255, 255, 0.05)', 
            border: '1px solid rgba(255, 255, 255, 0.1)', 
            borderRadius: '50%',
            width: '24px', height: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {!collapsed && (
        <div className="sidebar-search">
          <div className="sidebar-search-wrapper">
            <Search size={14} color="rgba(196, 181, 253, 0.6)" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      <nav className="sidebar-nav">
        {!collapsed && <div className="sidebar-section-label">Main Menu</div>}
        {filteredNavItems.map((item) => {
          if (item.adminExclusive && !isAdminExclusive) return null;
          if (item.adminOnly && !isAdmin) return null;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={true}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} />
              {!collapsed && (
                <span className="nav-item-text" style={{ flexGrow: 1 }}>{item.label}</span>
              )}
              {item.showBadge && unreadCount > 0 && !collapsed && (
                <span style={{
                  background: 'var(--accent-red)',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  {unreadCount}
                </span>
              )}
              {item.showBadge && unreadCount > 0 && collapsed && (
                <div style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  width: '8px',
                  height: '8px',
                  background: 'var(--accent-red)',
                  borderRadius: '50%'
                }} />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-user">
        {!collapsed ? (
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'Guest'}</div>
              <div className="sidebar-user-role">{user?.role === 'team_leader' ? 'Team Leader' : (user?.role || 'User')}</div>
            </div>
            <button 
              onClick={onLogout}
              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button 
              onClick={onLogout}
              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>

      {!collapsed && (
        <div style={{ padding: '0 20px 20px', textAlign: 'center' }}>
          <p className="sidebar-footer-text" style={{ opacity: 0.5 }}>
            CDRRMO CCTV Unit &copy; 2026
          </p>
        </div>
      )}
    </aside>
  );
}
