import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { Users, UserCheck, UserX, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

const PendingSignups = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pendingMembers, setPendingMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [selectedPlans, setSelectedPlans] = useState({});
  const [selectedTrainers, setSelectedTrainers] = useState({});
  const [selectedDietitians, setSelectedDietitians] = useState({});
  const [rejectionReasons, setRejectionReasons] = useState({});
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const gymId = user?.gym_id;
  const trainerId = user?.id;
  const isTrainer = user?.role === 'trainer';

  const fetchData = async () => {
    if (!gymId) return;
    try {
      setLoading(true);
      const [pendingRes, trainersRes] = await Promise.all([
        API.get(`/members/gym/${gymId}/pending`),
        API.get(`/staff/gym/${gymId}`),
      ]);

      setPendingMembers(pendingRes.data);
      setTrainers(trainersRes.data);

      // Pre-populate defaults
      const initialTrainers = {};
      pendingRes.data.forEach((m) => {
        if (isTrainer) {
          initialTrainers[m._id] = trainerId;
        } else {
          initialTrainers[m._id] = '';
        }
      });
      setSelectedTrainers(initialTrainers);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pending signups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [gymId]);

  const handleApprove = async (memberId) => {
    const trainerSelectionId = selectedTrainers[memberId];
    const dietitianSelectionId = selectedDietitians[memberId];

    try {
      setError('');
      setSuccess('');
      await API.put(`/members/${memberId}/approve`, {
        assigned_trainer_id: trainerSelectionId || null,
        assigned_dietitian_id: dietitianSelectionId || null,
      });
      setSuccess('Member signup approved successfully!');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve member');
    }
  };

  const handleReject = async (memberId) => {
    const reason = rejectionReasons[memberId];
    try {
      setError('');
      setSuccess('');
      await API.put(`/members/${memberId}/reject`, {
        reason: reason?.trim() || '',
      });
      setSuccess('Member signup rejected.');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject member');
    }
  };

  const handleGoBack = () => {
    if (isTrainer) {
      navigate('/trainer/members');
    } else {
      navigate('/owner/members');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-sm animate-pulse">Loading pending signup requests...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8 min-h-screen">
      {/* Header & Back Button */}
      <div className="space-y-4">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Member Directory</span>
        </button>
        
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Users className="text-indigo-400" />
            New Signups <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Approvals</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Review, approve plans, and assign coaches to members who registered online.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm flex items-center gap-2 max-w-xl">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-sm flex items-center gap-2 max-w-xl">
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Pending list */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
        {pendingMembers.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            All registered signups have been approved or rejected. No pending signups found.
          </div>
        ) : (
          <div className="divide-y divide-slate-850">
            {pendingMembers.map((m) => (
              <div key={m._id} className="py-6 first:pt-0 last:pb-0 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                {/* Profile Meta info */}
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-200">{m.user_id?.name}</h4>
                  <p className="text-xs text-slate-400">Email: {m.user_id?.email}</p>
                  <p className="text-xs text-slate-400">Phone: {m.user_id?.phone || '—'}</p>
                  <p className="text-[10px] text-slate-500">Registration Date: {new Date(m.join_date || m.createdAt).toLocaleDateString()}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-1 rounded-lg text-[10px] font-semibold">
                    <span>Plan: {m.plan_name || 'Generic'}</span>
                    {m.expiry_date && (
                      <span className="text-slate-500">
                        | Paid (Expires: {new Date(m.expiry_date).toLocaleDateString()})
                      </span>
                    )}
                  </div>
                </div>

                {/* Form fields for actions */}
                <div className="flex flex-wrap items-center gap-3">

                  {/* Trainer dropdown */}
                  <div>
                    <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1">Assign Trainer</label>
                    <select
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 w-44"
                      value={selectedTrainers[m._id] || ''}
                      onChange={(e) => setSelectedTrainers({ ...selectedTrainers, [m._id]: e.target.value })}
                    >
                      <option value="">-- No Trainer --</option>
                      {trainers.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name} ({t.role === 'owner' ? 'Owner' : 'Trainer'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dietitian dropdown */}
                  <div>
                    <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1">Assign Dietitian</label>
                    <select
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 w-44"
                      value={selectedDietitians[m._id] || ''}
                      onChange={(e) => setSelectedDietitians({ ...selectedDietitians, [m._id]: e.target.value })}
                    >
                      <option value="">-- No Dietitian --</option>
                      {trainers.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name} ({t.role === 'owner' ? 'Owner' : 'Trainer'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rejection reason */}
                  <div>
                    <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1">Rejection Reason</label>
                    <input
                      type="text"
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 w-44"
                      placeholder="Optional reason"
                      value={rejectionReasons[m._id] || ''}
                      onChange={(e) => setRejectionReasons({ ...rejectionReasons, [m._id]: e.target.value })}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 self-end pt-5">
                    <button
                      onClick={() => handleApprove(m._id)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <UserCheck size={14} />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(m._id)}
                      className="bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 font-semibold px-4 py-2 rounded-lg text-xs transition-colors border border-rose-500/20 flex items-center gap-1 cursor-pointer"
                    >
                      <UserX size={14} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingSignups;
