import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { Eye, LogOut, Search, ShieldCheck, Users } from 'lucide-react';

const TrainerMemberList = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [attendanceToday, setAttendanceToday] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const gymId = user?.gym_id;
  const trainerId = user?._id || user?.id;

  const fetchData = async () => {
    if (!gymId) return;
    try {
      setLoading(true);
      const todayStr = new Date().toISOString().split('T')[0];
      
      const [membersRes, attendanceRes, pendingRes] = await Promise.all([
        API.get(`/members/gym/${gymId}`),
        API.get(`/attendance/gym/${gymId}?date=${todayStr}`),
        API.get(`/members/gym/${gymId}/pending`),
      ]);

      setMembers(membersRes.data);
      setAttendanceToday(attendanceRes.data);
      setPendingCount(pendingRes.data.length);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load client roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gymId, trainerId]);

  const assignedMembers = members.filter((m) => {
    const tId = m.assigned_trainer_id?._id || m.assigned_trainer_id;
    const dId = m.assigned_dietitian_id?._id || m.assigned_dietitian_id;
    return (tId && tId.toString() === trainerId?.toString()) || (dId && dId.toString() === trainerId?.toString());
  });

  const filteredMembers = assignedMembers.filter((m) =>
    (m.user_id?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.user_id?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActiveAttendanceSession = (memberId) => {
    return attendanceToday.find(
      (log) => log.member_id?._id === memberId && log.check_out_time === null
    );
  };

  const handleMarkAttendance = async (memberId, activeSession) => {
    try {
      if (activeSession) {
        await API.put('/attendance/check-out', { member_id: memberId });
        alert('Checkout recorded successfully!');
      } else {
        await API.post('/attendance/check-in', { member_id: memberId });
        alert('Check-in recorded successfully!');
      }
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle attendance status');
    }
  };

  if (loading && members.length === 0) {
    return (
      <div className="main-content flex-center" style={{ minHeight: '60vh' }}>
        <div className="text-slate-400 text-sm">Loading client files...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white">
            Assigned <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Clients</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Monitor training status and check-in/out attendance logs for your trainees.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Search clients..."
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
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm mb-6">
          <span>{error}</span>
        </div>
      )}

      {/* Roster Table Card (Trainer dashboard is table-based) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
        {filteredMembers.length === 0 ? (
          <div className="text-sm text-slate-500 py-8 text-center">No assigned clients found matching query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-850 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Trainee</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Today's Attendance</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => {
                  const activeSession = getActiveAttendanceSession(member._id);
                  return (
                    <tr key={member._id} className="border-b border-slate-950 hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-200">{member.user_id?.name}</td>
                      <td className="py-4 px-4 text-xs text-slate-400">
                        <div>{member.user_id?.email}</div>
                        {member.user_id?.phone && <div className="text-[10px] text-slate-500 mt-0.5">{member.user_id.phone}</div>}
                      </td>
                      <td className="py-4 px-4 text-slate-300">{member.plan_name}</td>
                      <td className="py-4 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                          activeSession 
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                            : 'text-slate-500 bg-slate-500/10 border-slate-500/20'
                        }`}>
                          {activeSession ? 'Checked In' : 'Checked Out'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex gap-2 justify-end items-center">
                          <Link
                            to={`/trainer/members/${member._id}`}
                            className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                            title="View Fitness Folder"
                          >
                            <Eye size={14} />
                          </Link>

                          <button
                            onClick={() => handleMarkAttendance(member._id, activeSession)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors border ${
                              activeSession 
                                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20' 
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent'
                            }`}
                          >
                            {activeSession ? <LogOut size={12} /> : <ShieldCheck size={12} />}
                            <span>{activeSession ? 'Check Out' : 'Check In'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerMemberList;
