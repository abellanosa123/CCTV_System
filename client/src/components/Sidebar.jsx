import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Eye,
  FileSearch,
  FileOutput,
  BarChart3,
  Menu
} from 'lucide-react';
import cccLogo from '../assets/ccc-logo.png';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/observations', label: 'Observations', icon: Eye },
  { path: '/reviews', label: 'Review Logs', icon: FileSearch },
  { path: '/releases', label: 'Release Logs', icon: FileOutput },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header" style={{ position: 'relative' }}>
        <div className="sidebar-logo">
          <img src={cccLogo} alt="CCC Logo" />
        </div>
        {!collapsed && (
          <div className="sidebar-title">
            <h1>CDRRMO CCTV</h1>
            <span>Monitoring System</span>
          </div>
        )}
        <button 
          className="btn-icon sidebar-collapse-btn" 
          onClick={() => setCollapsed(!collapsed)}
          style={{ position: 'absolute', right: collapsed ? '0' : '10px', top: '20px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', margin: collapsed ? '0 auto' : '0', left: collapsed ? '0' : 'auto' }}
        >
          <Menu size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {!collapsed && <div className="sidebar-section-label">Main Menu</div>}
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} />
            {!collapsed && <span className="nav-item-text">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {!collapsed ? (
          <p className="sidebar-footer-text">
            CDRRMO CCTV Unit &copy; 2026<br />
            Communication Command Central
          </p>
        ) : (
          <p className="sidebar-footer-text" style={{ fontSize: '10px', textAlign: 'center' }}>&copy;</p>
        )}
      </div>
    </aside>
  );
}
