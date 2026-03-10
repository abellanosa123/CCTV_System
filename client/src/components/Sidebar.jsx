import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Eye,
  FileSearch,
  FileOutput,
  BarChart3
} from 'lucide-react';
import cccLogo from '../assets/ccc-logo.png';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/observations', label: 'Observations', icon: Eye },
  { path: '/reviews', label: 'Review Logs', icon: FileSearch },
  { path: '/releases', label: 'Release Logs', icon: FileOutput },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src={cccLogo} alt="CCC Logo" />
        </div>
        <div className="sidebar-title">
          <h1>CDRRMO CCTV</h1>
          <span>Monitoring System</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main Menu</div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-footer-text">
          CDRRMO CCTV Unit &copy; 2026<br />
          Communication Command Central
        </p>
      </div>
    </aside>
  );
}
