import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { tradeAPI, exceptionAPI } from '../api';
import { KpiCard, StatusBadge, LoadingSpinner } from '../components/common';
import { useTheme } from '../context/ThemeContext';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const chartDefaults = (darkMode) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: darkMode ? '#94a3b8' : '#64748b', font: { size: 11 } } } },
  scales: {
    x: { ticks: { color: darkMode ? '#94a3b8' : '#64748b', font: { size: 10 } }, grid: { color: darkMode ? '#1f2937' : '#f1f5f9' } },
    y: { ticks: { color: darkMode ? '#94a3b8' : '#64748b', font: { size: 10 } }, grid: { color: darkMode ? '#1f2937' : '#f1f5f9' } }
  }
});

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [excStats, setExcStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([tradeAPI.getStats(), exceptionAPI.getStats()])
      .then(([tradeRes, excRes]) => {
        setStats(tradeRes.data.data);
        setExcStats(excRes.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const kpis = stats?.kpis || {};
  const dailyVolume = stats?.dailyVolume || [];
  const statusStats = stats?.statusStats || [];
  const assetStats = stats?.assetStats || [];

  const lineData = {
    labels: dailyVolume.map(d => format(new Date(d._id), 'MMM dd')),
    datasets: [{
      label: 'Trades',
      data: dailyVolume.map(d => d.count),
      borderColor: '#0ea5e9',
      backgroundColor: 'rgba(14,165,233,0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
    }]
  };

  const statusColors = { Pending: '#f59e0b', Validated: '#3b82f6', Matched: '#6366f1', Settled: '#10b981', Failed: '#ef4444', Rejected: '#6b7280' };
  const doughnutData = {
    labels: statusStats.map(s => s._id),
    datasets: [{ data: statusStats.map(s => s.count), backgroundColor: statusStats.map(s => statusColors[s._id] || '#94a3b8'), borderWidth: 0 }]
  };

  const assetColors = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b'];
  const barData = {
    labels: assetStats.map(a => a._id),
    datasets: [{ label: 'Trades', data: assetStats.map(a => a.count), backgroundColor: assetColors, borderRadius: 6 }]
  };

  const excByPriority = excStats?.byPriority || [];
  const excColors = { Critical: '#ef4444', High: '#f59e0b', Medium: '#3b82f6', Low: '#10b981' };
  const excData = {
    labels: excByPriority.map(e => e._id),
    datasets: [{ data: excByPriority.map(e => e.count), backgroundColor: excByPriority.map(e => excColors[e._id] || '#94a3b8'), borderWidth: 0 }]
  };

  const chartOpts = chartDefaults(darkMode);
  const doughnutOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: darkMode ? '#94a3b8' : '#64748b', font: { size: 11 }, padding: 12 } } } };

  return (
    <div>
      <div className="kpi-grid">
        <KpiCard label="Total Trades" value={kpis.total || 0} icon="📈" color="blue" change="All time" />
        <KpiCard label="Settlement Rate" value={kpis.settlementRate || 0} icon="✅" color="green" suffix="%" change={`${kpis.settled || 0} settled`} />
        <KpiCard label="Failed Trades" value={kpis.failed || 0} icon="❌" color="red" change="Requires attention" />
        <KpiCard label="Pending Trades" value={kpis.pending || 0} icon="⏳" color="yellow" change="Awaiting processing" />
        <KpiCard label="Match Rate" value={kpis.matchRate || 0} icon="🔗" color="purple" suffix="%" change="Reconciliation" />
        <KpiCard label="Open Exceptions" value={kpis.exceptions || 0} icon="⚠️" color="cyan" change="Active cases" />
      </div>

      <div className="grid-2 mb-4">
        <div className="card">
          <div className="card-header">
            <span className="card-title">📊 Trade Volume Trend</span>
            <span className="text-sm text-muted">Last 30 days</span>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <Line data={lineData} options={chartOpts} />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-title">🔄 Trade Status Distribution</span>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <Doughnut data={doughnutData} options={doughnutOpts} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2 mb-4">
        <div className="card">
          <div className="card-header">
            <span className="card-title">📦 Asset Type Breakdown</span>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <Bar data={barData} options={{ ...chartOpts, plugins: { ...chartOpts.plugins, legend: { display: false } } }} />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-title">⚠️ Exceptions by Priority</span>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <Doughnut data={excData} options={doughnutOpts} />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">🕐 Recent Trades</span>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/trades')}>View All</button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Trade ID</th><th>Asset</th><th>Buyer</th><th>Seller</th>
                <th>Value</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentTrades || []).map(trade => (
                <tr key={trade._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/trades/${trade._id}`)}>
                  <td><span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--primary)' }}>{trade.tradeId}</span></td>
                  <td><StatusBadge status={trade.assetType} /> {trade.assetSymbol}</td>
                  <td>{trade.buyer}</td>
                  <td>{trade.seller}</td>
                  <td style={{ fontWeight: 600 }}>${(trade.totalValue || 0).toLocaleString()}</td>
                  <td><StatusBadge status={trade.status} /></td>
                  <td className="text-muted">{format(new Date(trade.createdAt), 'MMM dd, HH:mm')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
