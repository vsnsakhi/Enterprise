import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const creds = {
      admin: { email: 'admin@enterprise.com', password: 'Admin@123' },
      lead: { email: 'sarah.mitchell@enterprise.com', password: 'Lead@123' },
      analyst: { email: 'james.chen@enterprise.com', password: 'Analyst@123' },
    };
    setForm(creds[role]);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">📊</div>
          <div className="auth-title">Enterprise Trade Platform</div>
          <div className="auth-subtitle">Trade Lifecycle & Reconciliation System</div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
              <input
                type="email"
                className="form-control"
                style={{ paddingLeft: 36 }}
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
              <input
                type={showPass ? 'text' : 'password'}
                className="form-control"
                style={{ paddingLeft: 36, paddingRight: 36 }}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                {showPass ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 20, padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Demo Accounts</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[['admin', 'Administrator', '#ef4444'], ['lead', 'Team Lead', '#f59e0b'], ['analyst', 'Analyst', '#10b981']].map(([role, label, color]) => (
              <button key={role} onClick={() => fillDemo(role)}
                style={{ padding: '5px 10px', borderRadius: 6, border: `1px solid ${color}30`, background: `${color}15`, color, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
          Don't have an account? <Link to="/register" className="auth-link">Register</Link>
        </div>
      </div>
    </div>
  );
}
