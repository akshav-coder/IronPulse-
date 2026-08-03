import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { Users, Clock, Shield, Award, Activity, ArrowRight } from 'lucide-react';

const TrainerDashboard = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [attendanceToday, setAttendanceToday] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [selectedPlans, setSelectedPlans] = useState({});
  const [selectedTrainers, setSelectedTrainers] = useState({});
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const gymId = user?.gym_id;
  const trainerId = user?._id || user?.id;

  const fetchDashboardData = async () => {
    if (!gymId) return;
    try {
      setLoading(true);
      const todayStr = new Date().toISOString().split('T')[0];
      
      const [membersRes, attendanceRes, pendingRes, trainersRes] = await Promise.all([
        API.get(`/members/gym/${gymId}`),
        API.get(`/attendance/gym/${gymId}?date=${todayStr}`),
        API.get(`/members/gym/${gymId}/pending`),
        API.get(`/staff/gym/${gymId}`),
      ]);

      setMembers(membersRes.data);
      setAttendanceToday(attendanceRes.data);
      setPendingMembers(pendingRes.data);
      setTrainers(trainersRes.data.filter((t) => t.role === 'trainer'));

      // Pre-populate trainer selection with current trainer's ID
      const initialTrainers = {};
      pendingRes.data.forEach((m) => {
        initialTrainers[m._id] = trainerId;
      });
      setSelectedTrainers(initialTrainers);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch trainer dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [gymId]);

  const handleApprove = async (memberId) => {
    const trainerId = selectedTrainers[memberId];

    try {
      await API.put(`/members/${memberId}/approve`, {
        assigned_trainer_id: trainerId || null,
      });
      alert('Member registration approved!');
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve member');
    }
  };

  const handleReject = async (memberId) => {
    const reason = rejectionReasons[memberId];
    try {
      await API.put(`/members/${memberId}/reject`, {
        reason: reason?.trim() || '',
      });
      alert('Member registration rejected.');
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject member');
    }
  };

  // Filter members assigned to this trainer (as trainer or dietitian)
  const assignedMembers = members.filter((m) => {
    const tId = m.assigned_trainer_id?._id || m.assigned_trainer_id;
    const dId = m.assigned_dietitian_id?._id || m.assigned_dietitian_id;
    return (tId && tId.toString() === trainerId?.toString()) || (dId && dId.toString() === trainerId?.toString());
  });

  if (loading) {
    return (
      <div className="main-content flex-center" style={{ minHeight: '60vh' }}>
        <div className="text-slate-400 text-sm">Loading dashboard analytics...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-white">
          Welcome back, <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Coach {user?.name}</span>!
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Monitor your assigned trainees, log daily attendance, and review client fitness progress.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm mb-6">
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 shadow-md flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">My Clients</span>
            <div className="text-2xl font-extrabold text-slate-100">{assignedMembers.length}</div>
            <span className="text-xs text-slate-500 block">Direct training roster</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Users size={18} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 shadow-md flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Checked In Today</span>
            <div className="text-2xl font-extrabold text-slate-100">{attendanceToday.length}</div>
            <span className="text-xs text-slate-500 block">Active gym sessions</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Clock size={18} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 shadow-md flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Total Members</span>
            <div className="text-2xl font-extrabold text-slate-100">{members.length}</div>
            <span className="text-xs text-slate-500 block">Registered at branch</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Award size={18} />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Shortcuts Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
              <Activity size={18} className="text-indigo-400" />
              Trainer Shortcuts
            </h3>
            <Link 
              to="/trainer/members" 
              className="flex justify-between items-center bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
            >
              <span>Manage Clients & Attendance</span>
              <ArrowRight size={16} className="text-indigo-400" />
            </Link>
          </div>
        </div>

        {/* Daily Attendance Checklist Table */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-base font-bold text-slate-100 mb-4">Checked-In Members Today</h3>

            {attendanceToday.length === 0 ? (
              <div className="text-sm text-slate-500 py-4">No check-ins logged today.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="py-2.5 px-3">Member</th>
                      <th className="py-2.5 px-3">Arrival Time</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceToday.map((log) => (
                      <tr key={log._id} className="border-b border-slate-950 hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-200">{log.member_id?.user_id?.name || 'Unknown User'}</td>
                        <td className="py-3 px-3 text-slate-400">
                          {new Date(log.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                            log.check_out_time 
                              ? 'text-slate-500 bg-slate-500/10 border-slate-500/20' 
                              : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                          }`}>
                            {log.check_out_time ? 'Checked Out' : 'Active'}
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

      </div>
    </div>
  );
};

export default TrainerDashboard;
