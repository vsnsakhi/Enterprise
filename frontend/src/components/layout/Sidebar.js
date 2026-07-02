import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  FiGrid, FiTrendingUp, FiAlertCircle, FiShield, FiFileText,
  FiBarChart2, FiBell, FiSettings, FiLogOut, FiChevronLeft,
  FiChevronRight, FiUsers, FiSun, FiMoon, FiActivity
} from 'react-icons/fi';

const navItems = [
  { section: 'Main', items: [
    { to: '/dashboard', icon: FiGrid, label: 'Dashboard' },
    { to: '/analytics', icon: FiBarChart2, label: 'Analytics' },
  ]},
  { section: 'Trade Operations', items: [
    { to: '/trades', icon: FiTrendingUp, label: 'Trade Lifecycle' },
    { to: '/trades/new', icon: FiActivity, label: 'Capture Trade' },
  ]},
  { section: 'Risk & Compliance', items: [
    { to: '/exceptions', icon: FiAlertCircle, label: 'Exceptions' },
    { to: '/audit', icon: FiShield, label: 'Audit Trail' },
  ]},
  { section: 'Reporting', items: [
    { to: '/reports', icon: FiFileText, label: 'Reports' },
    { to: '/notifications', icon: FiBell, label: 'Notifications' },
  ]},
  { section: 'Administration', items: [
    { to: '/users', icon: FiUsers, label: 'User Management', roles: ['administrator'] },
    { to: '/profile', icon: FiSettings, label: 'Settings' },
  ]},
];

export default function Sidebar({ collapsed, setCollapsed, unreadCount }) {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user ? `${user.firstName?.[0]}${user.lastName?.[0]}` : 'U';
  const roleLabel = { administrator: 'Administrator', team_lead: 'Team Lead', analyst: 'Analyst' }[user?.role] || user?.role;

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">📊</div>
        {!collapsed && (
          <div className="sidebar-logo-text">
            <div>Enterprise <span>Trade</span></div>
            <div style={{ fontSize: 10, opacity: 0.6, fontWeight: 400 }}>Lifecycle Platform</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 4 }}
        >
          {collapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(section => (
          <div key={section.section}>
            {!collapsed && <div className="nav-section">{section.section}</div>}
            {section.items.map(item => {
              if (item.roles && !item.roles.includes(user?.role)) return null;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  title={collapsed ? item.label : ''}
                >
                  <item.icon className="nav-item-icon" />
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && item.to === '/notifications' && unreadCount > 0 && (
                    <span className="nav-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && (
          <div className="sidebar-user" style={{ marginBottom: 12 }}>
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.firstName} {user?.lastName}</div>
              <div className="sidebar-user-role">{roleLabel}</div>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <button onClick={toggleDarkMode} className="nav-item" style={{ padding: '8px', width: 'auto', borderRadius: 6 }} title="Toggle theme">
            {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
          </button>
          <button onClick={handleLogout} className="nav-item" style={{ padding: '8px', width: 'auto', borderRadius: 6, color: '#ef4444' }} title="Logout">
            <FiLogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
