import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { Award, PlusCircle, Edit, Trash2, Power, PowerOff, Check, X, AlertCircle } from 'lucide-react';

const OwnerPlanList = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);

  // Form fields
  const [name, setName] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const gymId = user?.gym_id;

  const fetchData = async () => {
    if (!gymId) return;
    try {
      setLoading(true);
      const [plansRes, membersRes] = await Promise.all([
        API.get('/plans'),
        API.get(`/members/gym/${gymId}`),
      ]);
      setPlans(plansRes.data);
      setMembers(membersRes.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch membership data.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [gymId]);

  // Compute member count per plan
  const memberCounts = {};
  members.forEach((m) => {
    if (m.plan_id) {
      const pid = typeof m.plan_id === 'object' ? m.plan_id._id : m.plan_id;
      if (pid) {
        memberCounts[pid] = (memberCounts[pid] || 0) + 1;
      }
    }
  });

  const handleAddPlan = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await API.post('/plans', {
        name,
        duration_days: Number(durationDays),
        price: Number(price),
        description,
      });
      setShowAddModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create plan.');
    }
  };

  const handleEditPlan = async (e) => {
    e.preventDefault();
    if (!currentPlan) return;
    try {
      setError('');
      await API.put(`/plans/${currentPlan._id}`, {
        name,
        duration_days: Number(durationDays),
        price: Number(price),
        description,
        is_active: isActive,
      });
      setShowEditModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update plan.');
    }
  };

  const handleToggleActive = async (plan) => {
    try {
      setError('');
      await API.put(`/plans/${plan._id}`, {
        is_active: !plan.is_active,
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle plan status.');
    }
  };

  const resetForm = () => {
    setName('');
    setDurationDays('');
    setPrice('');
    setDescription('');
    setIsActive(true);
    setCurrentPlan(null);
  };

  const openEditModal = (plan) => {
    setCurrentPlan(plan);
    setName(plan.name);
    setDurationDays(plan.duration_days);
    setPrice(plan.price);
    setDescription(plan.description || '');
    setIsActive(plan.is_active);
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Award className="text-indigo-400" />
            Membership <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Plans</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Configure your facility membership schemes, pricing rates, and deactivation rules.
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-750 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md hover:shadow-lg self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle size={16} />
          Create New Plan
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm flex items-center gap-2 max-w-xl">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Plans list */}
      {plans.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
          No membership plans created yet. Click "Create New Plan" to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const count = memberCounts[plan._id] || 0;
            return (
              <div
                key={plan._id}
                className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6 relative transition-all ${
                  plan.is_active ? 'border-slate-800' : 'border-slate-800/40 opacity-70 bg-slate-900/10'
                }`}
              >
                <div className="space-y-4">
                  {/* Status Badge */}
                  <div className="flex justify-between items-start">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                        plan.is_active
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                          : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                      }`}
                    >
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </span>

                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-850 border border-slate-800 px-2 py-0.5 rounded">
                      {count} Members
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-200 truncate">{plan.name}</h3>
                    <div className="flex items-baseline text-slate-200">
                      <span className="text-3xl font-black">₹{plan.price}</span>
                      <span className="ml-1 text-xs text-slate-400">/ {plan.duration_days} days</span>
                    </div>
                  </div>

                  {plan.description && (
                    <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-850 pt-3">
                      {plan.description}
                    </p>
                  )}
                </div>

                {/* Card action controls */}
                <div className="flex gap-2 border-t border-slate-850 pt-4">
                  <button
                    onClick={() => openEditModal(plan)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-800 text-slate-400 bg-white hover:bg-slate-850 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
                  >
                    <Edit size={13} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(plan)}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm border ${
                      plan.is_active
                        ? 'border-rose-500/20 text-rose-400 bg-white hover:bg-rose-500/5'
                        : 'border-emerald-500/20 text-emerald-400 bg-white hover:bg-emerald-500/5'
                    }`}
                  >
                    {plan.is_active ? (
                      <>
                        <PowerOff size={13} />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Power size={13} />
                        Activate
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddPlan}
            className="bg-white border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200"
          >
            <div className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">Create New Membership Plan</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3 Months Premium"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Duration (Days)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="90"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="4500"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea
                  rows="3"
                  placeholder="List of features included..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-slate-900 px-6 py-4 flex gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-800 text-slate-400 hover:bg-slate-850 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md cursor-pointer text-center"
              >
                Save Plan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleEditPlan}
            className="bg-white border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200"
          >
            <div className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">Edit Membership Plan</h3>
              <button type="button" onClick={() => setShowEditModal(false)} className="text-white/80 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Plan Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Duration (Days)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea
                  rows="3"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* is_active toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-850 border border-slate-800 rounded-xl mt-2">
                <div>
                  <span className="block text-xs font-bold text-slate-200">Plan Status</span>
                  <span className="text-[10px] text-slate-500">Enable/disable for new signups</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isActive ? 'bg-indigo-600' : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="bg-slate-900 px-6 py-4 flex gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-800 text-slate-400 hover:bg-slate-850 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md cursor-pointer text-center"
              >
                Update Plan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default OwnerPlanList;
