import React from 'react';

export const StatusBadge = ({ status }) => {
  const map = {
    'Pending': 'badge-pending', 'Validated': 'badge-validated', 'Matched': 'badge-matched',
    'Settled': 'badge-settled', 'Failed': 'badge-failed', 'Rejected': 'badge-rejected',
    'Open': 'badge-open', 'In Progress': 'badge-in-progress', 'Escalated': 'badge-escalated',
    'Resolved': 'badge-resolved', 'Closed': 'badge-closed',
    'Critical': 'badge-critical', 'High': 'badge-high', 'Medium': 'badge-medium', 'Low': 'badge-low',
    'Stock': 'badge-stock', 'Bond': 'badge-bond', 'ETF': 'badge-etf', 'Currency': 'badge-currency',
    'Passed': 'badge-settled', 'Unmatched': 'badge-pending', 'Partial': 'badge-validated',
  };
  return <span className={`badge ${map[status] || 'badge-pending'}`}>{status}</span>;
};

export const Skeleton = ({ lines = 3, card = false }) => (
  <div>
    {card ? <div className="skeleton skeleton-card" /> :
      Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton skeleton-text`} style={{ width: i === 0 ? '60%' : '100%' }} />
      ))
    }
  </div>
);

export const EmptyState = ({ icon = '📭', title = 'No data found', subtitle = '' }) => (
  <div className="empty-state">
    <div className="empty-state-icon">{icon}</div>
    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{title}</div>
    {subtitle && <div className="empty-state-text">{subtitle}</div>}
  </div>
);

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="pagination">
      <button className="page-btn" onClick={() => onPageChange(1)} disabled={currentPage === 1}>«</button>
      <button className="page-btn" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>‹</button>
      {start > 1 && <span style={{ padding: '0 4px', color: 'var(--text-muted)' }}>...</span>}
      {pages.map(p => (
        <button key={p} className={`page-btn ${p === currentPage ? 'active' : ''}`} onClick={() => onPageChange(p)}>{p}</button>
      ))}
      {end < totalPages && <span style={{ padding: '0 4px', color: 'var(--text-muted)' }}>...</span>}
      <button className="page-btn" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>›</button>
      <button className="page-btn" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>»</button>
    </div>
  );
};

export const Modal = ({ isOpen, onClose, title, children, footer, size = '' }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${size}`}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20 }}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', variant = 'danger' }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}
    footer={<>
      <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
      <button className={`btn btn-${variant}`} onClick={onConfirm}>{confirmText}</button>
    </>}
  >
    <p style={{ color: 'var(--text-muted)' }}>{message}</p>
  </Modal>
);

export const KpiCard = ({ label, value, icon, color = 'blue', change, suffix = '' }) => (
  <div className={`kpi-card ${color}`}>
    <div className="kpi-icon">{icon}</div>
    <div className="kpi-label">{label}</div>
    <div className="kpi-value">{value}{suffix}</div>
    {change !== undefined && <div className="kpi-change">{change}</div>}
  </div>
);

export const LoadingSpinner = ({ size = 24 }) => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
    <div style={{ width: size, height: size, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);
