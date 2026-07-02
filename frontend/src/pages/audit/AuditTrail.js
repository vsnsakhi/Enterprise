import React, { useState, useEffect, useCallback } from 'react';
import { auditAPI } from '../../api';
import { EmptyState, LoadingSpinner, Pagination } from '../../components/common';
import { format } from 'date-fns';
import { FiSearch, FiRefreshCw, FiShield } from 'react-icons/fi';

const actionColors = {
  CREATE: '#10b981', UPDATE: '#3b82f6', DELETE: '#ef4444', LOGIN: '#6366f1',
  LOGOUT: '#94a3b8', VALIDATE: '#f59e0b', MATCH: '#0ea5e9', SETTLE: '#10b981',
  REJECT: '#ef4444', ESCALATE: '#f59e0b', RESOLVE: '#10b981', EXPORT: '#6366f1', VIEW: '#94a3b8'
};

export default function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ entityType: '', action: '', performedBy: '', dateFrom: '', dateTo: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [expanded, setExpanded] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 50, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
      const res = await auditAPI.getAll(params);
      setLogs(res.data.data);
      setTotalPages(res.data.pages);
      setTotal(res.data.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiShield size={18} style={{ color: 'var(--primary)' }} />
          <div>
            <div style={{ fontWeight: 600 }}>Immutable Audit History</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{total} total records</div>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchLogs}><FiRefreshCw size={13} /> Refresh</button>
      </div>

      <div className="card mb-4">
        <div className="card-body" style={{ paddingBottom: 12 }}>
          <div className="filter-bar">
            <div className="search-bar" style={{ minWidth: 180 }}>
              <FiSearch className="search-icon" />
              <input className="form-control" placeholder="Search by user..." value={filters.performedBy} onChange={e => setFilters(p => ({ ...p, performedBy: e.target.value }))} />
            </div>
            <select className="filter-select" value={filters.entityType} onChange={e => setFilters(p => ({ ...p, entityType: e.target.value }))}>
              <option value="">All Entities</option>
              {['Trade', 'Exception', 'User', 'Report', 'System'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="filter-select" value={filters.action} onChange={e => setFilters(p => ({ ...p, action: e.target.value }))}>
              <option value="">All Actions</option>
              {['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VALIDATE', 'MATCH', 'SETTLE', 'REJECT', 'ESCALATE', 'RESOLVE'].map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <input type="date" className="filter-select" value={filters.dateFrom} onChange={e => setFilters(p => ({ ...p, dateFrom: e.target.value }))} />
            <input type="date" className="filter-select" value={filters.dateTo} onChange={e => setFilters(p => ({ ...p, dateTo: e.target.value }))} />
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? <LoadingSpinner /> : logs.length === 0 ? <EmptyState icon="🔍" title="No audit logs found" /> : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Timestamp</th><th>Action</th><th>Entity</th><th>Entity ID</th><th>Performed By</th><th>Role</th><th>IP Address</th><th>Description</th><th>Details</th></tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <React.Fragment key={log._id}>
                      <tr>
                        <td style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{format(new Date(log.timestamp), 'MMM dd HH:mm:ss')}</td>
                        <td>
                          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: `${actionColors[log.action]}20`, color: actionColors[log.action] }}>
                            {log.action}
                          </span>
                        </td>
                        <td><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.entityType}</span></td>
                        <td><span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--primary)' }}>{log.entityId?.slice(0, 20)}</span></td>
                        <td style={{ fontWeight: 600 }}>{log.performedByName}</td>
                        <td><span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{log.performedByRole?.replace('_', ' ')}</span></td>
                        <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{log.ipAddress}</td>
                        <td style={{ maxWidth: 200 }} className="truncate">{log.description}</td>
                        <td>
                          {log.changes?.length > 0 && (
                            <button className="btn btn-secondary btn-sm" onClick={() => setExpanded(expanded === log._id ? null : log._id)}>
                              {expanded === log._id ? 'Hide' : `${log.changes.length} changes`}
                            </button>
                          )}
                        </td>
                      </tr>
                      {expanded === log._id && log.changes?.length > 0 && (
                        <tr>
                          <td colSpan={9} style={{ background: 'var(--surface2)', padding: '12px 16px' }}>
                            <div style={{ fontSize: 12 }}>
                              {log.changes.map((c, i) => (
                                <div key={i} style={{ marginBottom: 4 }}>
                                  <strong>{c.field}:</strong> <span style={{ color: 'var(--danger)' }}>{JSON.stringify(c.oldVal)}</span> → <span style={{ color: 'var(--success)' }}>{JSON.stringify(c.newVal)}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
