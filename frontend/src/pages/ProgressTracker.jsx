import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Scale, Calendar, AlertCircle, Plus, Sparkles, Layers, List } from 'lucide-react';

const ProgressTracker = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]); // For trainers
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [history, setHistory] = useState([]);
  const [weight, setWeight] = useState('');
  const [measurements, setMeasurements] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isTrainer = user?.role === 'trainer';
  const gymId = user?.gym_id;

  // 1. Fetch Trainees (Trainer) or own profile (Member)
  useEffect(() => {
    const fetchTraineesOrProfile = async () => {
      try {
        setLoading(true);
        if (isTrainer) {
          const res = await API.get(`/members/gym/${gymId}`);
          const assigned = res.data.filter(
            (m) => m.assigned_trainer_id?._id === user.id || m.assigned_trainer_id === user.id
          );
          setMembers(assigned);
          if (assigned.length > 0) {
            setSelectedMemberId(assigned[0]._id);
            fetchProgressHistory(assigned[0]._id);
          } else {
            setLoading(false);
          }
        } else {
          const res = await API.get('/members/profile/me');
          setSelectedMemberId(res.data._id);
          fetchProgressHistory(res.data._id);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load progress details');
        setLoading(false);
      }
    };

    if (gymId) {
      fetchTraineesOrProfile();
    }
  }, [gymId, isTrainer, user.id]);

  const fetchProgressHistory = async (memberId) => {
    if (!memberId) return;
    try {
      setLoadingHistory(true);
      const res = await API.get(`/progress/member/${memberId}`);
      // Format recorded dates chronologically
      const formatted = res.data.map((item) => ({
        ...item,
        dateLabel: new Date(item.recorded_date).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        }),
      }));
      setHistory(formatted);
    } catch (err) {
      console.error('Failed to load progress history:', err);
    } finally {
      setLoadingHistory(false);
      setLoading(false);
    }
  };

  const handleMemberChange = (e) => {
    const id = e.target.value;
    setSelectedMemberId(id);
    setSuccess('');
    setError('');
    fetchProgressHistory(id);
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!selectedMemberId || !weight.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setSuccess('');
    setError('');

    try {
      await API.post('/progress', {
        member_id: selectedMemberId,
        weight: Number(weight),
        measurements,
        notes,
      });
      setSuccess('Progress logged successfully!');
      setWeight('');
      setMeasurements('');
      setNotes('');
      // Refresh timeline
      fetchProgressHistory(selectedMemberId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit progress entry');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="main-content flex-center" style={{ minHeight: '60vh' }}>
        <div className="text-slate-400 text-sm">Loading tracker panel...</div>
      </div>
    );
  }

  // Custom tooltips matching dark theme colors
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg shadow-xl text-xs">
          <p className="font-bold text-slate-300 mb-1">{`Date: ${label}`}</p>
          <p className="font-extrabold text-indigo-400">{`Weight: ${payload[0].value} kg`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white">
          Body Progress <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Tracker</span>
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {isTrainer
            ? 'Monitor and log weight progress and body check metrics for your trainees.'
            : 'Track your body weight logs and custom metrics trends over time.'}
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm flex items-center gap-2 max-w-xl">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-sm flex items-center gap-2 max-w-xl">
          <Sparkles size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Trainee Selector (Trainer only) */}
      {isTrainer && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md max-w-md">
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Select Trainee Profile
          </label>
          <select
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            value={selectedMemberId}
            onChange={handleMemberChange}
          >
            {members.length === 0 ? (
              <option value="">No Trainees Assigned</option>
            ) : (
              members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.user_id?.name} ({m.user_id?.email})
                </option>
              ))
            )}
          </select>
        </div>
      )}

      {selectedMemberId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Charts & Table section (takes 2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recharts Line Trend */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-6 flex items-center gap-2">
                <Scale size={16} className="text-indigo-400" />
                Weight Progression Trend
              </h3>

              <div className="w-full h-80">
                {loadingHistory ? (
                  <div className="h-full flex-center text-xs text-slate-500 animate-pulse">Loading progress history...</div>
                ) : history.length === 0 ? (
                  <div className="h-full flex-center text-xs text-slate-500">No progress points logged yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#3c3c3c" vertical={false} />
                      <XAxis dataKey="dateLabel" stroke="#8c8c8c" fontSize={11} tickLine={false} />
                      <YAxis stroke="#8c8c8c" fontSize={11} tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#333333', strokeWidth: 1 }} />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#FBAB57" // Accent Orange
                        strokeWidth={3}
                        dot={{ fill: '#FBAB57', r: 4, strokeWidth: 0 }}
                        activeDot={{ fill: '#FBAB57', r: 6, stroke: '#222222', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Table logs */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-6 flex items-center gap-2">
                <List size={16} className="text-indigo-400" />
                Progress Audit logs
              </h3>

              {loadingHistory ? (
                <div className="text-xs text-slate-500 text-center py-8 animate-pulse">Loading history logs...</div>
              ) : history.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-8">No billing records found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Record Date</th>
                        <th className="py-3 px-4">Body Weight</th>
                        <th className="py-3 px-4">Circumference Measurements</th>
                        <th className="py-3 px-4">Trainee Notes</th>
                        <th className="py-3 px-4">Assigned Coach</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...history].reverse().map((item) => (
                        <tr key={item._id} className="border-b border-slate-850 hover:bg-slate-800/10 transition-colors">
                          <td className="py-4 px-4 font-bold text-slate-300">
                            {new Date(item.recorded_date).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4 font-extrabold text-slate-200">{item.weight} kg</td>
                          <td className="py-4 px-4 text-slate-300 leading-relaxed font-mono text-[10px]">
                            {item.measurements || '—'}
                          </td>
                          <td className="py-4 px-4 text-slate-400 leading-relaxed max-w-xs truncate" title={item.notes}>
                            {item.notes || '—'}
                          </td>
                          <td className="py-4 px-4 text-slate-400">{item.trainer_id?.name || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Form to log entries (Trainer only) */}
          {isTrainer && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-850 pb-3">
                <Plus size={16} className="text-indigo-400" />
                Add Progress Entry
              </h3>

              <form onSubmit={handleAddLog} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Body Weight (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="e.g. 78.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Body Measurements
                  </label>
                  <textarea
                    className="w-full h-24 bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
                    placeholder="e.g. Chest: 98cm, Waist: 82cm"
                    value={measurements}
                    onChange={(e) => setMeasurements(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Training Notes
                  </label>
                  <textarea
                    className="w-full h-24 bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
                    placeholder="e.g. Trainee completed full conditioning cycle successfully."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg text-xs transition-all duration-200 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  <span>{submitting ? 'Logging...' : 'Submit Entry'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
