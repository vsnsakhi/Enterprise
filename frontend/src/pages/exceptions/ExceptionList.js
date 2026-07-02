import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { exceptionAPI, authAPI } from '../../api';
import { StatusBadge, Pagination, EmptyState, LoadingSpinner, Modal } from '../../components/common';
import { format } from 'date-fns';
import { FiSearch, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function ExceptionList() {
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', type: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState('');
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ assignedTo: '', notes: '', resolutionNotes: '', escalatedTo: '', escalationReason: '' });
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchExceptions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
      const res = await exceptionAPI.getAll(params);
      setExceptions(res.data.data);
      setTotalPages(res.data.pages);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load exceptions'); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetchExceptions(); }, [fetchExceptions]);
  useEffect(() => { authAPI.getUsers().then(r => setUsers(r.data.data)).catch(() => {}); }, []);

  const openModal = (exc, type) => { setSelected(exc); setModal(type); setFormData({ assignedTo: '', notes: '', resolutionNotes: '', escalatedTo: '', escalationReason: '' }); };

  const handleAction = async () => {
    try {
      if (modal === 'assign') await exceptionAPI.assign(selected._id, { assignedTo: formData.assignedTo, notes: formData.notes });
      else if (modal === 'resolve') await exceptionAPI.resolve(selected._id, { resolutionNotes: formData.resolutionNotes });
      else if (modal === 'escalate') await exceptionAPI.escalate(selected._id, { escalatedTo: formData.escalatedTo, escalationReason: formData.escalationReason });
      else if (modal === 'close') await exceptionAPI.close(selected._id);
      toast.success(`Exception ${modal}d successfully`);
      setModal('');
      fetchExceptions();
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
  };

  const canManage = ['team_lead', 'administrator'].includes(user?.role);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{total} total exceptions</div>
        <button className="btn btn-secondary btn-sm" onClick={fetchExceptions}><FiRefreshCw size={13} /> Refresh</button>
      </div>

      <div className="card mb-4">
        <div className="card-body" style={{ paddingBottom: 12 }}>
          <div className="filter-bar">
            <div className="search-bar flex-1" style={{ minWidth: 200 }}>
              <FiSearch className="search-icon" />
              <input className="form-control" placeholder="Search exceptions..." value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))} />
            </div>
            {[
              { key: 'status', opts: ['Open', 'In Progress', 'Escalated', 'Resolved', 'Closed'] },
              { key: 'priority', opts: ['Critical', 'High', 'Medium', 'Low'] },
              { key: 'type', opts: ['Price Mismatch', 'Quantity Mismatch', 'Missing Trade', 'Duplicate Trade', 'Validation Failed', 'Settlement Failed'] },
            ].map(({ key, opts }) => (
              <select key={key} className="filter-select" value={filters[key]} onChange={e => { setFilters(p => ({ ...p, [key]: e.target.value })); setPage(1); }}>
                <option value="">All {key.charAt(0).toUpperCase() + key.slice(1)}</option>
                {opts.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? <LoadingSpinner /> : exceptions.length === 0 ? <EmptyState icon="✅" title="No exceptions found" subtitle="All clear!" /> : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Exception ID</th><th>Trade ID</th><th>Type</th><th>Priority</th><th>Status</th><th>Assigned To</th><th>Created</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {exceptions.map(exc => (
                    <tr key={exc._id}>
                      <td><span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--primary)' }}>{exc.exceptionId}</span></td>
                      <td><span style={{ fontFamily: 'monospace', fontSize: 11, cursor: 'pointer', color: 'var(--secondary)' }} onClick={() => navigate(`/trades/${exc.tradeId}`)}>{exc.tradeId}</span></td>
                      <td style={{ maxWidth: 140 }} className="truncate">{exc.type}</td>
                      <td><StatusBadge status={exc.priority} /></td>
                      <td><StatusBadge status={exc.status} /></td>
                      <td>{exc.assignedTo ? `${exc.assignedTo.firstName} ${exc.assignedTo.lastName}` : <span className="text-muted">Unassigned</span>}</td>
                      <td className="text-muted">{format(new Date(exc.createdAt), 'MMM dd, HH:mm')}</td>
                      <td>
                        <div className="flex gap-2">
                          {exc.status === 'Open' && <button className="btn btn-secondary btn-sm" onClick={() => openModal(exc, 'assign')}>Assign</button>}
                          {['Open', 'In Progress'].includes(exc.status) && <button className="btn btn-success btn-sm" onClick={() => openModal(exc, 'resolve')}>Resolve</button>}
                          {canManage && ['Open', 'In Progress'].includes(exc.status) && <button className="btn btn-warning btn-sm" onClick={() => openModal(exc, 'escalate')}>Escalate</button>}
                          {canManage && exc.status === 'Resolved' && <button className="btn btn-secondary btn-sm" onClick={() => { setSelected(exc); setModal('close'); }}>Close</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      <Modal isOpen={modal === 'assign'} onClose={() => setModal('')} title="Assign Exception"
        footer={<><button className="btn btn-secondary" onClick={() => setModal('')}>Cancel</button><button className="btn btn-primary" onClick={handleAction} disabled={!formData.assignedTo}>Assign</button></>}>
        <div className="form-group">
          <label className="form-label">Assign To *</label>
          <select className="form-control" value={formData.assignedTo} onChange={e => setFormData(p => ({ ...p, assignedTo: e.target.value }))}>
            <option value="">Select analyst</option>
            {users.map(u => <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.role})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="form-control" rows={3} value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} />
        </div>
      </Modal>

      <Modal isOpen={modal === 'resolve'} onClose={() => setModal('')} title="Resolve Exception"
        footer={<><button className="btn btn-secondary" onClick={() => setModal('')}>Cancel</button><button className="btn btn-success" onClick={handleAction} disabled={!formData.resolutionNotes}>Resolve</button></>}>
        <div className="form-group">
          <label className="form-label">Resolution Notes *</label>
          <textarea className="form-control" rows={4} placeholder="Describe how the exception was resolved..." value={formData.resolutionNotes} onChange={e => setFormData(p => ({ ...p, resolutionNotes: e.target.value }))} />
        </div>
      </Modal>

      <Modal isOpen={modal === 'escalate'} onClose={() => setModal('')} title="Escalate Exception"
        footer={<><button className="btn btn-secondary" onClick={() => setModal('')}>Cancel</button><button className="btn btn-warning" onClick={handleAction} disabled={!formData.escalatedTo || !formData.escalationReason}>Escalate</button></>}>
        <div className="form-group">
          <label className="form-label">Escalate To *</label>
          <select className="form-control" value={formData.escalatedTo} onChange={e => setFormData(p => ({ ...p, escalatedTo: e.target.value }))}>
            <option value="">Select user</option>
            {users.filter(u => ['team_lead', 'administrator'].includes(u.role)).map(u => <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.role})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Escalation Reason *</label>
          <textarea className="form-control" rows={3} value={formData.escalationReason} onChange={e => setFormData(p => ({ ...p, escalationReason: e.target.value }))} />
        </div>
      </Modal>

      <Modal isOpen={modal === 'close'} onClose={() => setModal('')} title="Close Exception"
        footer={<><button className="btn btn-secondary" onClick={() => setModal('')}>Cancel</button><button className="btn btn-secondary" onClick={handleAction}>Close Exception</button></>}>
        <p className="text-muted">Are you sure you want to close exception <strong>{selected?.exceptionId}</strong>? This action marks it as permanently closed.</p>
      </Modal>
    </div>
  );
}
