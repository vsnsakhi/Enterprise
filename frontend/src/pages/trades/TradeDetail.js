import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tradeAPI, auditAPI } from '../../api';
import { StatusBadge, Modal, LoadingSpinner } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiRefreshCw, FiShield } from 'react-icons/fi';

export default function TradeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trade, setTrade] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [matchModal, setMatchModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [matchData, setMatchData] = useState({
    frontOffice: { price: '', quantity: '', tradeId: '' },
    middleOffice: { price: '', quantity: '', tradeId: '' },
    settlementSystem: { price: '', quantity: '', tradeId: '' }
  });

  const fetchTrade = async () => {
    try {
      const [tradeRes, auditRes] = await Promise.all([tradeAPI.getOne(id), auditAPI.getByEntity(id)]);
      setTrade(tradeRes.data.data);
      setAuditLogs(auditRes.data.data);
    } catch { toast.error('Trade not found'); navigate('/trades'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTrade(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAction = async (action, data) => {
    setActionLoading(action);
    try {
      let res;
      if (action === 'validate') res = await tradeAPI.validate(trade._id);
      else if (action === 'match') res = await tradeAPI.match(trade._id, matchData);
      else if (action === 'settle') res = await tradeAPI.settle(trade._id);
      else if (action === 'reject') res = await tradeAPI.reject(trade._id, { reason: rejectReason });
      toast.success(`Trade ${action}d successfully`);
      setTrade(res.data.data);
      setMatchModal(false);
      setRejectModal(false);
      const auditRes = await auditAPI.getByEntity(id);
      setAuditLogs(auditRes.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} trade`);
    } finally { setActionLoading(''); }
  };

  const prefillMatch = () => {
    if (trade) {
      const d = { price: trade.price, quantity: trade.quantity, tradeId: trade.tradeId };
      setMatchData({ frontOffice: { ...d }, middleOffice: { ...d }, settlementSystem: { ...d } });
    }
    setMatchModal(true);
  };

  if (loading) return <LoadingSpinner />;
  if (!trade) return null;

  const canValidate = trade.status === 'Pending';
  const canMatch = trade.status === 'Validated';
  const canSettle = trade.status === 'Matched' && ['team_lead', 'administrator'].includes(user?.role);
  const canReject = !['Settled', 'Rejected'].includes(trade.status) && ['team_lead', 'administrator'].includes(user?.role);

  const statusFlow = ['Pending', 'Validated', 'Matched', 'Settled'];
  const currentIdx = statusFlow.indexOf(trade.status);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/trades')}><FiArrowLeft size={13} /> Back</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace' }}>{trade.tradeId}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Created {format(new Date(trade.createdAt), 'MMM dd, yyyy HH:mm')}</div>
        </div>
        <div className="flex gap-2">
          {canValidate && <button className="btn btn-primary btn-sm" onClick={() => handleAction('validate')} disabled={!!actionLoading}><FiCheckCircle size={13} /> Validate</button>}
          {canMatch && <button className="btn btn-secondary btn-sm" onClick={prefillMatch} disabled={!!actionLoading}><FiRefreshCw size={13} /> Match</button>}
          {canSettle && <button className="btn btn-success btn-sm" onClick={() => handleAction('settle')} disabled={!!actionLoading}><FiCheckCircle size={13} /> Settle</button>}
          {canReject && <button className="btn btn-danger btn-sm" onClick={() => setRejectModal(true)} disabled={!!actionLoading}><FiXCircle size={13} /> Reject</button>}
        </div>
      </div>

      {/* Settlement Progress */}
      <div className="card mb-4">
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {statusFlow.map((s, i) => (
              <React.Fragment key={s}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: i <= currentIdx && trade.status !== 'Failed' && trade.status !== 'Rejected' ? 'var(--primary)' : trade.status === 'Failed' || trade.status === 'Rejected' ? (i === currentIdx ? 'var(--danger)' : 'var(--border)') : 'var(--border)',
                    color: i <= currentIdx ? '#fff' : 'var(--text-muted)', fontSize: 14, fontWeight: 700, marginBottom: 6
                  }}>
                    {i < currentIdx ? '✓' : i + 1}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: i <= currentIdx ? 'var(--text)' : 'var(--text-muted)' }}>{s}</div>
                </div>
                {i < statusFlow.length - 1 && (
                  <div style={{ flex: 2, height: 2, background: i < currentIdx ? 'var(--primary)' : 'var(--border)', marginBottom: 20 }} />
                )}
              </React.Fragment>
            ))}
          </div>
          {(trade.status === 'Failed' || trade.status === 'Rejected') && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: 6, color: 'var(--danger)', fontSize: 12 }}>
              ❌ Trade {trade.status}: {trade.notes || trade.validationErrors?.join(', ')}
            </div>
          )}
        </div>
      </div>

      <div className="grid-2 mb-4">
        <div className="card">
          <div className="card-header"><span className="card-title">📋 Trade Details</span></div>
          <div className="card-body">
            {[
              ['Trade ID', trade.tradeId], ['Asset Symbol', trade.assetSymbol], ['Asset Name', trade.assetName],
              ['Asset Type', <StatusBadge status={trade.assetType} />],
              ['Price', `$${trade.price?.toLocaleString()} ${trade.currency}`],
              ['Quantity', trade.quantity?.toLocaleString()],
              ['Total Value', <strong>${(trade.totalValue || 0).toLocaleString()}</strong>],
              ['Status', <StatusBadge status={trade.status} />],
              ['Risk Level', <StatusBadge status={trade.riskLevel} />],
              ['Source', trade.source],
            ].map(([label, value]) => (
              <div key={label} className="info-row">
                <span className="info-label">{label}</span>
                <span className="info-value">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">🏦 Counterparty & Dates</span></div>
          <div className="card-body">
            {[
              ['Buyer', trade.buyer], ['Seller', trade.seller],
              ['Counterparty', trade.counterparty], ['Broker', trade.broker],
              ['Trade Date', format(new Date(trade.tradeDate), 'MMM dd, yyyy')],
              ['Settlement Date', format(new Date(trade.settlementDate), 'MMM dd, yyyy')],
              ['Validation', <StatusBadge status={trade.validationStatus} />],
              ['Match Status', <StatusBadge status={trade.matchStatus} />],
              ['Created By', `${trade.createdBy?.firstName} ${trade.createdBy?.lastName}`],
            ].map(([label, value]) => (
              <div key={label} className="info-row">
                <span className="info-label">{label}</span>
                <span className="info-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {trade.validationErrors?.length > 0 && (
        <div className="card mb-4">
          <div className="card-header"><span className="card-title">⚠️ Validation Errors</span></div>
          <div className="card-body">
            {trade.validationErrors.map((err, i) => (
              <div key={i} style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 6, marginBottom: 6, color: 'var(--danger)', fontSize: 13 }}>❌ {err}</div>
            ))}
          </div>
        </div>
      )}

      {trade.settlementDetails?.settledAt && (
        <div className="card mb-4">
          <div className="card-header"><span className="card-title">✅ Settlement Details</span></div>
          <div className="card-body">
            <div className="form-grid">
              {[
                ['Settlement Ref', trade.settlementDetails.settlementRef],
                ['Settled At', format(new Date(trade.settlementDetails.settledAt), 'MMM dd, yyyy HH:mm')],
                ['Processing Time', `${trade.settlementDetails.processingTime} minutes`],
              ].map(([label, value]) => (
                <div key={label} className="info-row">
                  <span className="info-label">{label}</span>
                  <span className="info-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header"><span className="card-title"><FiShield size={14} style={{ marginRight: 6 }} />Audit Trail</span></div>
        <div className="card-body">
          {auditLogs.length === 0 ? <div className="text-muted text-sm">No audit logs</div> : (
            <div className="timeline">
              {auditLogs.map(log => (
                <div key={log._id} className="timeline-item completed">
                  <div className="timeline-time">{format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')} · {log.performedByName} ({log.performedByRole})</div>
                  <div className="timeline-content"><strong>{log.action}</strong> — {log.description}</div>
                  {log.ipAddress && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>IP: {log.ipAddress}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Match Modal */}
      <Modal isOpen={matchModal} onClose={() => setMatchModal(false)} title="🔄 Trade Matching" size="modal-lg"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setMatchModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => handleAction('match')} disabled={!!actionLoading}>
            {actionLoading === 'match' ? 'Matching...' : 'Run Match'}
          </button>
        </>}
      >
        <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: 13 }}>Compare trade data across Front Office, Middle Office, and Settlement System.</p>
        {['frontOffice', 'middleOffice', 'settlementSystem'].map(system => (
          <div key={system} style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, textTransform: 'capitalize' }}>{system.replace(/([A-Z])/g, ' $1')}</div>
            <div className="form-grid-3">
              {['price', 'quantity', 'tradeId'].map(field => (
                <div key={field} className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{field}</label>
                  <input className="form-control" value={matchData[system][field]} onChange={e => setMatchData(prev => ({ ...prev, [system]: { ...prev[system], [field]: field === 'tradeId' ? e.target.value : Number(e.target.value) } }))} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={rejectModal} onClose={() => setRejectModal(false)} title="❌ Reject Trade"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setRejectModal(false)}>Cancel</button>
          <button className="btn btn-danger" onClick={() => handleAction('reject')} disabled={!rejectReason || !!actionLoading}>Reject Trade</button>
        </>}
      >
        <div className="form-group">
          <label className="form-label">Rejection Reason *</label>
          <textarea className="form-control" rows={4} placeholder="Provide reason for rejection..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
}
