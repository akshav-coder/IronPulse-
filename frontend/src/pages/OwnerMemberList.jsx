import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Edit2, Trash2, Search, Eye, EyeOff, X, ShieldAlert, Users } from 'lucide-react';

import { useLocation } from 'react-router-dom';

const OwnerMemberList = () => {
  const { user } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialFilter = queryParams.get('filter') || 'all';

  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState(initialFilter);

  // Add Member form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [plan, setPlan] = useState('Monthly Basic');
  const [role, setRole] = useState('member'); // Default role
  const [status, setStatus] = useState('active');
  const [assignedTrainer, setAssignedTrainer] = useState('');
  const [assignedDietitian, setAssignedDietitian] = useState('');
  const [password, setPassword] = useState('123456'); // default password
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [pendingCount, setPendingCount] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editPlan, setEditPlan] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [editTrainer, setEditTrainer] = useState('');
  const [editDietitian, setEditDietitian] = useState('');

  const gymId = user?.gym_id;

  const fetchMembers = async () => {
    if (!gymId) return;
    try {
      setLoading(true);
      const [membersRes, pendingRes, trainersRes] = await Promise.all([
        API.get(`/members/gym/${gymId}`),
        API.get(`/members/gym/${gymId}/pending`),
        API.get(`/staff/gym/${gymId}`),
      ]);
      setMembers(membersRes.data);
      setPendingCount(pendingRes.data.length);
      setTrainers(trainersRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch members list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gymId]);

  useEffect(() => {
    const f = new URLSearchParams(location.search).get('filter');
    if (f) setFilterType(f);
  }, [location.search]);

  const handleCreateMember = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      alert('Name and Email are required');
      return;
    }

    setSubmitting(true);
    try {
      await API.post('/members', {
        name,
        email,
        phone,
        role,
        membership_plan: plan,
        status,
        assigned_trainer_id: assignedTrainer || null,
        assigned_dietitian_id: assignedDietitian || null,
        password,
      });

      setName('');
      setEmail('');
      setPhone('');
      setPlan('Monthly Basic');
      setRole('member');
      setStatus('active');
      setAssignedTrainer('');
      setAssignedDietitian('');
      setPassword('123456');
      setShowAddForm(false);
      fetchMembers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register client');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateMember = async (id) => {
    try {
      await API.put(`/members/${id}`, {
        membership_plan: editPlan,
        status: editStatus,
        assigned_trainer_id: editTrainer || null,
        assigned_dietitian_id: editDietitian || null,
      });
      setEditingId(null);
      fetchMembers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save modifications');
    }
  };

  const handleDeleteMember = async (id, clientName) => {
    if (window.confirm(`Are you sure you want to delete member folder for "${clientName}"? This removes database login credentials.`)) {
      try {
        await API.delete(`/members/${id}`);
        fetchMembers();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to remove member');
      }
    }
  };

  const startEdit = (member) => {
    setEditingId(member._id);
    setEditPlan(member.plan_name || '');
    setEditStatus(member.status);
    setEditTrainer(member.assigned_trainer_id?._id || member.assigned_trainer_id || '');
    setEditDietitian(member.assigned_dietitian_id?._id || member.assigned_dietitian_id || '');
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      (m.user_id?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.user_id?.email || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'unassigned') {
      return !m.assigned_trainer_id;
    }
    if (filterType === 'active') {
      return m.status === 'active';
    }
    if (filterType === 'pending') {
      return m.status === 'pending_approval';
    }
    return true;
  });

  if (loading && members.length === 0) {
    return (
      <div className="main-content flex-center" style={{ minHeight: '60vh' }}>
        <div className="text-slate-400 text-sm">Loading member directory...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white">
            Members <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Directory</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Register, manage, and edit gym member profiles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Search member name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Link
            to="/pending-signups"
            className={`flex items-center gap-2 font-semibold px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
              pendingCount > 0
                ? 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                : 'bg-slate-850 hover:bg-slate-850/80 text-slate-300 border border-slate-800'
            }`}
          >
            <Users size={16} />
            <span>Pending Signups ({pendingCount})</span>
          </Link>

          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer">
            <PlusCircle size={16} />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm mb-6">
          <span>{error}</span>
        </div>
      )}

      {/* Register Member popup Form Card */}
      {showAddForm && (
        <form onSubmit={handleCreateMember} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg mb-8 max-w-2xl">
          <h3 className="text-base font-bold text-slate-100 mb-4">Register Gym Member</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Member Name</label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="+1 555-555-5555"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Default Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 pr-10 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Gym Role</label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="member">Member</option>
                <option value="trainer">Trainer</option>
                <option value="owner">Owner</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Membership Plan</label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="Monthly Basic"
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Status</label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all duration-200 disabled:opacity-50">
              {submitting ? 'Registering...' : 'Register'}
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2 rounded-lg text-sm transition-all duration-200">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Directory Table Card (Owner view is table-based) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
        {filteredMembers.length === 0 ? (
          <div className="text-sm text-slate-500 py-8 text-center">No matching gym members found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-850 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Name / Contact</th>
                  <th className="py-3 px-4">Subscription Plan</th>
                  <th className="py-3 px-4">Assigned Trainer</th>
                  <th className="py-3 px-4">Assigned Dietitian</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member._id} className="border-b border-slate-950 hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-200">{member.user_id?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500">{member.user_id?.email}</div>
                    </td>
                    <td className="py-4 px-4">
                      {editingId === member._id ? (
                        <input
                          type="text"
                          className="bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200 text-xs w-32 focus:outline-none focus:border-indigo-500"
                          value={editPlan}
                          onChange={(e) => setEditPlan(e.target.value)}
                        />
                      ) : (
                        <span className="text-slate-300">{member.plan_name}</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {editingId === member._id ? (
                        <select
                          className="bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                          value={editTrainer}
                          onChange={(e) => setEditTrainer(e.target.value)}
                        >
                          <option value="">-- No Trainer --</option>
                          {trainers.map((t) => (
                            <option key={t._id} value={t._id}>
                              {t.name} ({t.role === 'owner' ? 'Owner' : 'Trainer'})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={member.assigned_trainer_id ? 'text-slate-200 font-semibold' : 'text-amber-400 font-bold text-xs'}>
                          {member.assigned_trainer_id?.name
                            ? `${member.assigned_trainer_id.name}`
                            : '⚠️ Unassigned'}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {editingId === member._id ? (
                        <select
                          className="bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                          value={editDietitian}
                          onChange={(e) => setEditDietitian(e.target.value)}
                        >
                          <option value="">-- No Dietitian --</option>
                          {trainers.map((t) => (
                            <option key={t._id} value={t._id}>
                              {t.name} ({t.role === 'owner' ? 'Owner' : 'Trainer'})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-slate-400 text-xs">
                          {member.assigned_dietitian_id?.name
                            ? `${member.assigned_dietitian_id.name}`
                            : '—'}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {editingId === member._id ? (
                        <select
                          className="bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="pending">Pending</option>
                        </select>
                      ) : (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                          member.status === 'active' 
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                            : 'text-red-400 bg-red-500/10 border-red-500/20'
                        }`}>
                          {member.status}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        {editingId === member._id ? (
                          <>
                            <button
                              onClick={() => handleUpdateMember(member._id)}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-2.5 py-1 rounded text-xs transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="bg-slate-850 hover:bg-slate-800 text-slate-300 font-medium px-2.5 py-1 rounded text-xs transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <Link
                              to={`/owner/members/${member._id}`}
                              className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                              title="View Details"
                            >
                              <Eye size={14} />
                            </Link>
                            <button
                              onClick={() => startEdit(member)}
                              className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                              title="Edit membership"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteMember(member._id, member.user_id?.name)}
                              className="p-1.5 rounded-lg bg-slate-850 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                              title="Delete profile"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerMemberList;
