import React, { useState, useEffect, useCallback } from 'react';
import { notificationAPI } from '../../api';
import { LoadingSpinner, EmptyState } from '../../components/common';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { FiBell, FiCheck, FiTrash2 } from 'react-icons/fi';

const typeIcons = {
  trade_settled: '✅', trade_failed: '❌', exception_raised: '⚠️',
  escalation_alert: '🚨', validation_failed: '🔴', match_failed: '🔶',
  sla_breach: '⏰', system_alert: '🔔'
};
const priorityColors = { Critical: '#ef4444', High: '#f59e0b', Medium: '#3b82f6', Low: '#10b981' };

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter === 'unread' ? { isRead: false } : {};
      const res = await notificationAPI.getAll({ ...params, limit: 50 });
      setNotifications(res.data.data);
      setUnreadCount(res.data.unreadCount);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markRead = async (id) => {
    await notificationAPI.markRead(id);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await notificationAPI.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    toast.success('All notifications marked as read');
  };

  const deleteNotif = async (id) => {
    await notificationAPI.delete(id);
    setNotifications(prev => prev.filter(n => n._id !== id));
    toast.success('Notification deleted');
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiBell size={18} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 600 }}>{unreadCount} unread</span>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1">
            {['all', 'unread'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          {unreadCount > 0 && <button className="btn btn-secondary btn-sm" onClick={markAllRead}><FiCheck size={12} /> Mark All Read</button>}
        </div>
      </div>

      {loading ? <LoadingSpinner /> : notifications.length === 0 ? <EmptyState icon="🔔" title="No notifications" subtitle="You're all caught up!" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map(notif => (
            <div key={notif._id} className="card" style={{ opacity: notif.isRead ? 0.7 : 1, borderLeft: `3px solid ${priorityColors[notif.priority] || 'var(--border)'}` }}>
              <div className="card-body" style={{ padding: '14px 16px' }}>
                <div className="flex items-center gap-3">
                  <div style={{ fontSize: 24, flexShrink: 0 }}>{typeIcons[notif.type] || '🔔'}</div>
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{notif.title}</span>
                      {!notif.isRead && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />}
                      <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>{format(new Date(notif.createdAt), 'MMM dd, HH:mm')}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{notif.message}</div>
                    <div style={{ marginTop: 4 }}>
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: `${priorityColors[notif.priority]}20`, color: priorityColors[notif.priority], fontWeight: 600 }}>
                        {notif.priority}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!notif.isRead && (
                      <button className="btn btn-secondary btn-sm btn-icon" onClick={() => markRead(notif._id)} title="Mark as read"><FiCheck size={12} /></button>
                    )}
                    <button className="btn btn-secondary btn-sm btn-icon" onClick={() => deleteNotif(notif._id)} title="Delete"><FiTrash2 size={12} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
