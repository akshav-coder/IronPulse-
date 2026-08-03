import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api';
import { ArrowLeft, Dumbbell, Clock } from 'lucide-react';

const TrainerMemberDetail = () => {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        setLoading(true);
        const [memberRes, attendanceRes, workoutsRes] = await Promise.all([
          API.get(`/members/${id}`),
          API.get(`/attendance/member/${id}`),
          API.get(`/workouts/member/${id}`),
        ]);

        setMember(memberRes.data);
        setAttendance(attendanceRes.data);
        setWorkouts(workoutsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch member details');
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [id]);

  if (loading) {
    return (
      <div className="main-content flex-center" style={{ minHeight: '60vh' }}>
        <div className="text-slate-400 text-sm">Loading fitness profile details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm mb-4">
          <span>{error}</span>
        </div>
        <Link to="/trainer-dashboard" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-semibold">
          <ArrowLeft size={16} />
          <span>Back to Trainer Panel</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div>
        <Link 
          to="/trainer-dashboard" 
          className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-xs font-semibold mb-4"
        >
          <ArrowLeft size={14} />
          <span>Back to Trainer Panel</span>
        </Link>
        <h2 className="text-3xl font-extrabold text-white">
          Client <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Fitness Folder</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Member Card Profile Details */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg relative overflow-hidden space-y-6">
            <div className={`absolute top-0 left-0 w-full h-[4px] ${
              member?.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'
            }`} />

            <div className="flex flex-col items-center text-center mt-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-500/25 mb-3">
                {member?.user_id?.name ? member.user_id.name.charAt(0) : 'U'}
              </div>
              <h3 className="text-lg font-bold text-slate-100">{member?.user_id?.name}</h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border mt-2 ${
                member?.status === 'active' 
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                  : 'text-red-400 bg-red-500/10 border-red-500/20'
              }`}>
                {member?.status}
              </span>
            </div>

            <div className="space-y-4 border-t border-slate-800/80 pt-6 text-xs">
              <div>
                <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Address</span>
                <span className="text-slate-300 font-medium">{member?.user_id?.email}</span>
              </div>
              {member?.user_id?.phone && (
                <div>
                  <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone Number</span>
                  <span className="text-slate-300 font-medium">{member.user_id.phone}</span>
                </div>
              )}
              <div>
                <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Membership Plan</span>
                <span className="text-slate-300 font-medium">{member?.plan_name}</span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Join Date</span>
                <span className="text-slate-300 font-medium">{new Date(member?.join_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Workouts & Attendance tables */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Client Workouts Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
              <Dumbbell size={18} className="text-indigo-400" />
              Logged Exercises & Workouts
            </h3>
            
            {workouts.length === 0 ? (
              <div className="text-sm text-slate-500 py-4">No recorded exercise sets logged.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Exercise</th>
                      <th className="py-2.5 px-3">Load/Weight</th>
                      <th className="py-2.5 px-3">Reps</th>
                      <th className="py-2.5 px-3 text-right">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workouts.map((w) => (
                      <tr key={w._id} className="border-b border-slate-950 hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-3 text-slate-400">{new Date(w.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-3 font-semibold text-slate-200">{w.title}</td>
                        <td className="py-3 px-3 text-slate-300">{w.load} kg</td>
                        <td className="py-3 px-3 text-slate-300">{w.reps} reps</td>
                        <td className="py-3 px-3 text-right font-bold text-indigo-400">{w.duration} mins</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Attendance History Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
              <Clock size={18} className="text-indigo-400" />
              Attendance Session Logs
            </h3>

            {attendance.length === 0 ? (
              <div className="text-sm text-slate-500 py-4">No attendance sessions logged.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="py-2.5 px-3">Session Date</th>
                      <th className="py-2.5 px-3">Check In</th>
                      <th className="py-2.5 px-3">Check Out</th>
                      <th className="py-2.5 px-3 text-right">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((log) => {
                      const checkIn = new Date(log.check_in_time);
                      const checkOut = log.check_out_time ? new Date(log.check_out_time) : null;
                      const durationMins = checkOut ? Math.round((checkOut - checkIn) / (1000 * 60)) : null;

                      return (
                        <tr key={log._id} className="border-b border-slate-950 hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-3 font-semibold text-slate-200">
                            {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="py-3 px-3 text-slate-400">
                            {checkIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3 px-3 text-slate-400">
                            {checkOut ? checkOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-indigo-400">
                            {durationMins !== null ? `${durationMins} mins` : '—'}
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
      </div>
    </div>
  );
};

export default TrainerMemberDetail;
