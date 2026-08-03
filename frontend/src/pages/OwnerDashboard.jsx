import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { Users, DollarSign, AlertCircle, Shield, ArrowRight, Activity, Calendar } from 'lucide-react';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [recentMembers, setRecentMembers] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [unassignedMembers, setUnassignedMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const gymId = user?.gym_id;

  const fetchDashboardData = async () => {
    if (!gymId) return;
    try {
      setLoading(true);
      const [metricsRes, membersRes, paymentsRes, pendingRes, unassignedRes, trainersRes] = await Promise.all([
        API.get(`/dashboard/owner/${gymId}`),
        API.get(`/members/gym/${gymId}`),
        API.get(`/payments/gym/${gymId}`),
        API.get(`/members/gym/${gymId}/pending`),
        API.get(`/members/gym/${gymId}/unassigned`),
        API.get(`/staff/gym/${gymId}`),
      ]);

      setMetrics(metricsRes.data);
      setRecentMembers(membersRes.data.slice(0, 4));
      setRecentPayments(paymentsRes.data.slice(0, 4));
      setPendingMembers(pendingRes.data);
      setUnassignedMembers(unassignedRes.data);
      setTrainers(trainersRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [gymId]);

  const ownerDirectTrainees = recentMembers.filter(
    (m) => m.assigned_trainer_id?._id === user?.id || m.assigned_trainer_id === user?.id
  );

  if (loading) {
    return (
      <div className="main-content flex-center" style={{ minHeight: '60vh' }}>
        <div className="text-slate-400 text-sm">Loading owner analytics...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-white">
          Welcome back, <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">{user?.name}</span>!
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Overview of gym memberships, monthly revenue streams, and staff management.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm mb-6">
          <span>{error}</span>
        </div>
      )}

      {/* Alert Banner for Unassigned Members */}
      {unassignedMembers.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-4 rounded-xl text-sm mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-amber-400 shrink-0" size={20} />
            <div>
              <span className="font-bold">{unassignedMembers.length} member(s) are currently unassigned!</span>
              <p className="text-xs text-amber-400/80">Trainer deletion or new registration left these members without a coach.</p>
            </div>
          </div>
          <Link
            to="/owner/members?filter=unassigned"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-colors shrink-0"
          >
            Reassign Now
          </Link>
        </div>
      )}

      {/* KPI Stats Grid */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 shadow-md flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Total Members</span>
              <div className="text-2xl font-extrabold text-slate-100">{metrics.totalMembers}</div>
              <span className="text-xs text-slate-500 block">Signed-up users</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 shadow-md flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Active Staff</span>
              <div className="text-2xl font-extrabold text-slate-100">{metrics.activeTrainers || 0}</div>
              <span className="text-xs text-slate-500 block">Coaches & Staff</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>

          <Link
            to="/owner/members?filter=unassigned"
            className="bg-slate-900 border border-amber-500/30 hover:border-amber-500/60 rounded-xl p-5 shadow-md flex justify-between items-start transition-colors group cursor-pointer"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block">Unassigned</span>
              <div className="text-2xl font-extrabold text-amber-300">{unassignedMembers.length}</div>
              <span className="text-xs text-amber-400/70 block">Needs trainer</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertCircle size={18} />
            </div>
          </Link>

          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 shadow-md flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Monthly Revenue</span>
              <div className="text-2xl font-extrabold text-slate-100">${metrics.monthlyRevenue.toLocaleString()}</div>
              <span className="text-xs text-slate-500 block">Paid invoices sum</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 shadow-md flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Pending Dues</span>
              <div className="text-2xl font-extrabold text-slate-100">{metrics.pendingPaymentsCount}</div>
              <span className="text-xs text-slate-500 block">Pending invoices</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
              <AlertCircle size={18} />
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Management Shortcuts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Shortcuts & Recent Payments */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Shortcuts */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
              <Activity size={18} className="text-indigo-400" />
              Management Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Link 
                to="/owner/members" 
                className="flex justify-between items-center bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
              >
                <span>Manage Members Directory</span>
                <ArrowRight size={16} className="text-indigo-400" />
              </Link>
              <Link 
                to="/owner/payments" 
                className="flex justify-between items-center bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
              >
                <span>Manage Invoices Ledger</span>
                <ArrowRight size={16} className="text-indigo-400" />
              </Link>
            </div>
          </div>

          {/* Recent Payments Table (Owner dashboard is table-based) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-100">Recent Payment Logs</h3>
              <Link to="/owner/payments" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">View all &rarr;</Link>
            </div>

            {recentPayments.length === 0 ? (
              <div className="text-sm text-slate-500 py-4">No payments ledger logs recorded.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="py-2.5 px-3">Member</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Due Date</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.map((p) => (
                      <tr key={p._id} className="border-b border-slate-950 hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-200">{p.member_id?.user_id?.name || 'Unknown User'}</div>
                          <div className="text-[10px] text-slate-500">{p.payment_method.toUpperCase()}</div>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-200">${p.amount}</td>
                        <td className="py-3 px-3 text-slate-400">{new Date(p.due_date).toLocaleDateString()}</td>
                        <td className="py-3 px-3 text-right">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                            p.status === 'paid' 
                              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                              : 'text-red-400 bg-red-500/10 border-red-500/20'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Recent Joined Members Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-slate-100">Recent Joinings</h3>
            <Link to="/owner/members" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">View all &rarr;</Link>
          </div>

          {recentMembers.length === 0 ? (
            <div className="text-sm text-slate-500 py-4">No registered members found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3 text-right">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMembers.map((m) => (
                    <tr key={m._id} className="border-b border-slate-950 hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[10px] text-white">
                          {m.user_id?.name ? m.user_id.name.charAt(0) : 'U'}
                        </div>
                        <span className="font-semibold text-slate-200">{m.user_id?.name}</span>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500">
                        {new Date(m.join_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default OwnerDashboard;
