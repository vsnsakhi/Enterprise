import React, { useState, useEffect } from 'react';
import { reportAPI } from '../../api';
import { LoadingSpinner, EmptyState } from '../../components/common';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { FiPlus, FiDownload, FiFileText } from 'react-icons/fi';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'Settlement', period: 'Daily', dateFrom: '', dateTo: '', name: '' });

  useEffect(() => {
    reportAPI.getAll().then(r => setReports(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.dateFrom || !form.dateTo) return toast.error('Select date range');
    setGenerating(true);
    try {
      const res = await reportAPI.generate(form);
      setReports(prev => [res.data.data, ...prev]);
      toast.success('Report generated successfully!');
      setShowForm(false);
    } catch (err) { toast.error('Failed to generate report'); }
    finally { setGenerating(false); }
  };

  const downloadReport = (report) => {
    const data = JSON.stringify(report.data, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.reportId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded');
  };

  const typeColors = { Settlement: '#10b981', Exception: '#ef4444', Validation: '#f59e0b', Trade: '#3b82f6', Analytics: '#6366f1' };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{reports.length} reports generated</div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}><FiPlus size={13} /> Generate Report</button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header"><span className="card-title">📊 Generate New Report</span></div>
          <div className="card-body">
            <form onSubmit={handleGenerate}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Report Name</label>
                  <input className="form-control" placeholder="Optional custom name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Report Type *</label>
                  <select className="form-control" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                    {['Settlement', 'Exception', 'Validation', 'Trade', 'Analytics'].map(t => <option key={t} value={t}>{t} Report</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Period *</label>
                  <select className="form-control" value={form.period} onChange={e => setForm(p => ({ ...p, period: e.target.value }))}>
                    {['Daily', 'Weekly', 'Monthly', 'Custom'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date From *</label>
                  <input type="date" className="form-control" value={form.dateFrom} onChange={e => setForm(p => ({ ...p, dateFrom: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Date To *</label>
                  <input type="date" className="form-control" value={form.dateTo} onChange={e => setForm(p => ({ ...p, dateTo: e.target.value }))} required />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={generating}>{generating ? 'Generating...' : 'Generate Report'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <LoadingSpinner /> : reports.length === 0 ? <EmptyState icon="📄" title="No reports yet" subtitle="Generate your first report" /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {reports.map(report => (
            <div key={report._id} className="card">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: `${typeColors[report.type]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                      <FiFileText style={{ color: typeColors[report.type] }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{report.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{report.reportId}</div>
                    </div>
                  </div>
                  <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: `${typeColors[report.type]}20`, color: typeColors[report.type] }}>{report.type}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  {[
                    ['Total Trades', report.summary?.totalTrades || 0],
                    ['Settled', report.summary?.settledTrades || 0],
                    ['Failed', report.summary?.failedTrades || 0],
                    ['Settlement Rate', `${report.summary?.settlementRate || 0}%`],
                  ].map(([label, value]) => (
                    <div key={label} style={{ padding: '8px', background: 'var(--surface2)', borderRadius: 6 }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
                  {format(new Date(report.dateFrom), 'MMM dd')} – {format(new Date(report.dateTo), 'MMM dd, yyyy')} · {report.period}
                </div>

                <div className="flex gap-2">
                  <button className="btn btn-secondary btn-sm flex-1" onClick={() => downloadReport(report)}><FiDownload size={12} /> Download JSON</button>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    {format(new Date(report.createdAt), 'MMM dd, HH:mm')}
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
