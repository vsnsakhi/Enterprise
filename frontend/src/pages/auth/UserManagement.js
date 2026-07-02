import React, { useState, useEffect } from 'react';
import { authAPI } from '../../api';
import { LoadingSpinner, EmptyState, Modal } from '../../components/common';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { FiEdit2 } from 'react-icons/fi';

const roleColors = { administrator: '#ef4444', team_lead: '#f59e0b', analyst: '#10b981' };
const roleLabels = { administrator: 'Administrator', team_lead: 'Team Lead', analyst: 'Operations Analyst' };

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    authAPI.getUsers().then(r => setUsers(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleEdit = (user) => {
    setEditUser(user);
    setEditForm({ firstName: user.firstName, lastName: user.lastName, role: user.role, department: user.department, isActive: user.isActive });
  };

  const handleUpdate = async () => {
    try {
      const res = await authAPI.updateUser(editUser._id, editForm);
      setUsers(prev => prev.map(u => u._id === editUser._id ? res.data.data : u));
      toast.success('User updated successfully');
      setEditUser(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{users.length} users registered</div>
      </div>

      <div className="card">
        {users.length === 0 ? <EmptyState icon="👥" title="No users found" /> : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>User</th><th>Email</th><th>Role</th><th>Department</th><th>Last Login</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <span style={{ fontWeight: 600 }}>{user.firstName} {user.lastName}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{user.email}</td>
                    <td><span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: `${roleColors[user.role]}20`, color: roleColors[user.role] }}>{roleLabels[user.role]}</span></td>
                    <td>{user.department}</td>
                    <td className="text-muted">{user.lastLogin ? format(new Date(user.lastLogin), 'MMM dd, HH:mm') : 'Never'}</td>
                    <td>
                      <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: user.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: user.isActive ? '#059669' : '#dc2626' }}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(user)}><FiEdit2 size={12} /> Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit User"
        footer={<><button className="btn btn-secondary" onClick={() => setEditUser(null)}>Cancel</button><button className="btn btn-primary" onClick={handleUpdate}>Save Changes</button></>}>
        {editUser && (
          <div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input className="form-control" value={editForm.firstName} onChange={e => setEditForm(p => ({ ...p, firstName: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-control" value={editForm.lastName} onChange={e => setEditForm(p => ({ ...p, lastName: e.target.value }))} />
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-control" value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}>
                  <option value="analyst">Operations Analyst</option>
                  <option value="team_lead">Team Lead</option>
                  <option value="administrator">Administrator</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-control" value={editForm.department} onChange={e => setEditForm(p => ({ ...p, department: e.target.value }))}>
                  {['Operations', 'Post Trade', 'Reconciliation', 'Settlement', 'Risk', 'Compliance', 'IT Operations'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={editForm.isActive} onChange={e => setEditForm(p => ({ ...p, isActive: e.target.value === 'true' }))}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
