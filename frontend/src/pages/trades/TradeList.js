import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tradeAPI } from '../../api';
import { StatusBadge, Pagination, EmptyState, LoadingSpinner } from '../../components/common';
import { format } from 'date-fns';
import { FiSearch, FiPlus, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function TradeList() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '', assetType: '', riskLevel: '', dateFrom: '', dateTo: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
      const res = await tradeAPI.getAll(params);
      setTrades(res.data.data);
      setTotalPages(res.data.pages);
      setTotal(res.data.total);
    } catch (err) {
      toast.error('Failed to load trades');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchTrades(); }, [fetchTrades]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{total} total trades</div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm" onClick={fetchTrades}><FiRefreshCw size={13} /> Refresh</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/trades/new')}><FiPlus size={13} /> New Trade</button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body" style={{ paddingBottom: 12 }}>
          <div className="filter-bar">
            <div className="search-bar flex-1" style={{ minWidth: 200 }}>
              <FiSearch className="search-icon" />
              <input className="form-control" placeholder="Search by Trade ID, asset, counterparty..." value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} />
            </div>
            {[
              { key: 'status', opts: ['Pending', 'Validated', 'Matched', 'Failed', 'Settled', 'Rejected'], label: 'Status' },
              { key: 'assetType', opts: ['Stock', 'Bond', 'ETF', 'Currency'], label: 'Asset Type' },
              { key: 'riskLevel', opts: ['Low', 'Medium', 'High', 'Critical'], label: 'Risk Level' },
            ].map(({ key, opts, label }) => (
              <select key={key} className="filter-select" value={filters[key]} onChange={e => handleFilterChange(key, e.target.value)}>
                <option value="">All {label}</option>
                {opts.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ))}
            <input type="date" className="filter-select" value={filters.dateFrom} onChange={e => handleFilterChange('dateFrom', e.target.value)} />
            <input type="date" className="filter-select" value={filters.dateTo} onChange={e => handleFilterChange('dateTo', e.target.value)} />
            {Object.values(filters).some(v => v) && (
              <button className="btn btn-secondary btn-sm" onClick={() => { setFilters({ search: '', status: '', assetType: '', riskLevel: '', dateFrom: '', dateTo: '' }); setPage(1); }}>Clear</button>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? <LoadingSpinner /> : trades.length === 0 ? <EmptyState icon="📊" title="No trades found" subtitle="Try adjusting your filters" /> : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Trade ID</th><th>Asset</th><th>Type</th><th>Buyer</th><th>Seller</th>
                    <th>Price</th><th>Qty</th><th>Total Value</th><th>Status</th><th>Risk</th><th>Trade Date</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map(trade => (
                    <tr key={trade._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/trades/${trade._id}`)}>
                      <td><span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>{trade.tradeId}</span></td>
                      <td><strong>{trade.assetSymbol}</strong><br /><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{trade.assetName}</span></td>
                      <td><StatusBadge status={trade.assetType} /></td>
                      <td style={{ maxWidth: 120 }} className="truncate">{trade.buyer}</td>
                      <td style={{ maxWidth: 120 }} className="truncate">{trade.seller}</td>
                      <td>${trade.price?.toLocaleString()}</td>
                      <td>{trade.quantity?.toLocaleString()}</td>
                      <td style={{ fontWeight: 600 }}>${(trade.totalValue || 0).toLocaleString()}</td>
                      <td><StatusBadge status={trade.status} /></td>
                      <td><StatusBadge status={trade.riskLevel} /></td>
                      <td className="text-muted">{format(new Date(trade.tradeDate), 'MMM dd, yyyy')}</td>
                    </tr>
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
