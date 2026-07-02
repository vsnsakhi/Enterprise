import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { reportAPI } from '../../api';
import { LoadingSpinner } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useTheme();

  useEffect(() => {
    reportAPI.getAnalytics().then(r => setData(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  const gridColor = darkMode ? '#1f2937' : '#f1f5f9';
  const textColor = darkMode ? '#94a3b8' : '#64748b';
  const baseOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: textColor, font: { size: 11 } } } },
    scales: { x: { ticks: { color: textColor, font: { size: 10 } }, grid: { color: gridColor } }, y: { ticks: { color: textColor, font: { size: 10 } }, grid: { color: gridColor } } }
  };
  const noScaleOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: textColor, font: { size: 11 }, padding: 12 } } } };

  const volumeData = {
    labels: data.volumeTrend.map(d => format(new Date(d._id), 'MMM dd')),
    datasets: [
      { label: 'Trade Count', data: data.volumeTrend.map(d => d.count), borderColor: '#0ea5e9', backgroundColor: 'rgba(14,165,233,0.1)', fill: true, tension: 0.4, yAxisID: 'y' },
      { label: 'Value ($M)', data: data.volumeTrend.map(d => (d.value / 1000000).toFixed(2)), borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4, yAxisID: 'y1' }
    ]
  };
  const volumeOpts = { ...baseOpts, scales: { ...baseOpts.scales, y: { ...baseOpts.scales.y, position: 'left' }, y1: { position: 'right', ticks: { color: textColor, font: { size: 10 } }, grid: { drawOnChartArea: false } } } };

  const statusColors = { Pending: '#f59e0b', Validated: '#3b82f6', Matched: '#6366f1', Settled: '#10b981', Failed: '#ef4444', Rejected: '#6b7280' };
  const settlementData = {
    labels: data.settlementPerf.map(s => s._id),
    datasets: [{ data: data.settlementPerf.map(s => s.count), backgroundColor: data.settlementPerf.map(s => statusColors[s._id] || '#94a3b8'), borderWidth: 0 }]
  };

  const assetColors = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b'];
  const assetData = {
    labels: data.assetBreakdown.map(a => a._id),
    datasets: [{ label: 'Trades', data: data.assetBreakdown.map(a => a.count), backgroundColor: assetColors, borderRadius: 6 }]
  };

  const excTrendData = {
    labels: data.exceptionTrend.map(d => format(new Date(d._id), 'MMM dd')),
    datasets: [{ label: 'Exceptions', data: data.exceptionTrend.map(d => d.count), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4 }]
  };

  const procData = {
    labels: data.processingTimes.map(p => p._id),
    datasets: [{ label: 'Avg Processing Time (min)', data: data.processingTimes.map(p => p.avgProcessingTime?.toFixed(1)), backgroundColor: assetColors, borderRadius: 6 }]
  };

  return (
    <div>
      <div className="grid-2 mb-4">
        <div className="card">
          <div className="card-header"><span className="card-title">📈 Trade Volume & Value Trend</span><span className="text-sm text-muted">30 days</span></div>
          <div className="card-body"><div className="chart-container"><Line data={volumeData} options={volumeOpts} /></div></div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">🔄 Settlement Performance</span></div>
          <div className="card-body"><div className="chart-container"><Doughnut data={settlementData} options={noScaleOpts} /></div></div>
        </div>
      </div>

      <div className="grid-2 mb-4">
        <div className="card">
          <div className="card-header"><span className="card-title">📦 Asset Type Distribution</span></div>
          <div className="card-body"><div className="chart-container"><Bar data={assetData} options={{ ...baseOpts, plugins: { ...baseOpts.plugins, legend: { display: false } } }} /></div></div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">⚠️ Exception Trend</span><span className="text-sm text-muted">30 days</span></div>
          <div className="card-body"><div className="chart-container"><Line data={excTrendData} options={baseOpts} /></div></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">⏱️ Average Processing Time by Asset</span></div>
        <div className="card-body"><div className="chart-container" style={{ height: 200 }}><Bar data={procData} options={{ ...baseOpts, plugins: { ...baseOpts.plugins, legend: { display: false } } }} /></div></div>
      </div>
    </div>
  );
}
