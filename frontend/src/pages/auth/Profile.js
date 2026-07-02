import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';
import { FiUser, FiLock, FiSave } from 'react-icons/fi';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', department: user?.department || '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState('');

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading('profile');
    try {
      const res = await authAPI.updateProfile(profileForm);
      updateUser(res.data.data);
      toast.success('Profile updated successfully');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setLoading(''); }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) return toast.error('Passwords do not match');
    if (passForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading('password');
    try {
      await authAPI.updatePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('Password updated successfully');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Password update failed'); }
    finally { setLoading(''); }
  };

  const roleLabels = { administrator: 'Administrator', team_lead: 'Team Lead', analyst: 'Operations Analyst' };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="card mb-4">
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 28, fontWeight: 700 }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{user?.firstName} {user?.lastName}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{user?.email}</div>
            <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
              <span style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(14,165,233,0.1)', color: 'var(--primary)', fontSize: 12, fontWeight: 600 }}>{roleLabels[user?.role]}</span>
              <span style={{ padding: '3px 10px', borderRadius: 20, background: 'var(--surface2)', color: 'var(--text-muted)', fontSize: 12 }}>{user?.department}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header"><span className="card-title"><FiUser size={14} style={{ marginRight: 6 }} />Profile Information</span></div>
        <div className="card-body">
          <form onSubmit={handleProfileUpdate}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input className="form-control" value={profileForm.firstName} onChange={e => setProfileForm(p => ({ ...p, firstName: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-control" value={profileForm.lastName} onChange={e => setProfileForm(p => ({ ...p, lastName: e.target.value }))} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select className="form-control" value={profileForm.department} onChange={e => setProfileForm(p => ({ ...p, department: e.target.value }))}>
                {['Operations', 'Post Trade', 'Reconciliation', 'Settlement', 'Risk', 'Compliance', 'IT Operations'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-control" value={user?.email} disabled style={{ opacity: 0.6 }} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading === 'profile'}><FiSave size={13} /> {loading === 'profile' ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title"><FiLock size={14} style={{ marginRight: 6 }} />Change Password</span></div>
        <div className="card-body">
          <form onSubmit={handlePasswordUpdate}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" className="form-control" value={passForm.currentPassword} onChange={e => setPassForm(p => ({ ...p, currentPassword: e.target.value }))} required />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="form-control" value={passForm.newPassword} onChange={e => setPassForm(p => ({ ...p, newPassword: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" className="form-control" value={passForm.confirmPassword} onChange={e => setPassForm(p => ({ ...p, confirmPassword: e.target.value }))} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading === 'password'}><FiLock size={13} /> {loading === 'password' ? 'Updating...' : 'Update Password'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
