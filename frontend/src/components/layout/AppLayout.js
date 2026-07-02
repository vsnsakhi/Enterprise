import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { notificationAPI } from '../../api';

const pageTitles = {
  '/dashboard': { title: 'Operations Dashboard', subtitle: 'Real-time trade lifecycle overview' },
  '/trades': { title: 'Trade Lifecycle', subtitle: 'Manage and monitor all trades' },
  '/trades/new': { title: 'Capture Trade', subtitle: 'Create a new trade entry' },
  '/exceptions': { title: 'Exception Management', subtitle: 'Monitor and resolve trade exceptions' },
  '/audit': { title: 'Audit Trail', subtitle: 'Immutable audit history' },
  '/reports': { title: 'Reports & Analytics', subtitle: 'Generate operational reports' },
  '/analytics': { title: 'Analytics', subtitle: 'Advanced trade analytics' },
  '/notifications': { title: 'Notifications', subtitle: 'System alerts and updates' },
  '/profile': { title: 'Profile Settings', subtitle: 'Manage your account' },
  '/users': { title: 'User Management', subtitle: 'Manage platform users' },
};

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  const pageInfo = pageTitles[location.pathname] || { title: 'Enterprise Trade Platform', subtitle: '' };

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationAPI.getAll({ isRead: false, limit: 1 });
        setUnreadCount(res.data.unreadCount || 0);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  return (
    <div className="app-layout">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} unreadCount={unreadCount} />
      <div className={`main-content ${collapsed ? 'collapsed' : ''}`}>
        <Topbar title={pageInfo.title} subtitle={pageInfo.subtitle} unreadCount={unreadCount} />
        <div className="page-content fade-in">
          <Outlet context={{ setUnreadCount }} />
        </div>
      </div>
    </div>
  );
}
