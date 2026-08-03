import React, { useState, useEffect } from 'react';
import API from '../api';
import { Calendar, User, Clock, CheckCircle, XCircle } from 'lucide-react';

const TrainerClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  const fetchTrainerClasses = async () => {
    try {
      setLoading(true);
      const res = await API.get('/classes/trainer/me');
      setClasses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch your assigned classes');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainerClasses();
  }, []);

  const handleToggleAttendance = async (bookingId, currentStatus) => {
    setTogglingId(bookingId);
    try {
      await API.put(`/bookings/${bookingId}/attendance`, {
        attended: !currentStatus,
      });
      fetchTrainerClasses(); // Refresh
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update attendance');
    } finally {
      setTogglingId(null);
    }
  };

  if (loading && classes.length === 0) {
    return (
      <div className="main-content flex-center" style={{ minHeight: '60vh' }}>
        <div className="text-slate-400 text-sm">Loading your classes...</div>
      </div>
    );
  }

  // Filter today's classes (optional, but let's show all classes and highlight today's classes clearly!)
  const isToday = (dateStr) => {
    const today = new Date();
    const target = new Date(dateStr);
    return (
      today.getFullYear() === target.getFullYear() &&
      today.getMonth() === target.getMonth() &&
      today.getDate() === target.getDate()
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white">
          My Class <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Schedule</span>
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Review your scheduled fitness sessions and track trainee attendance.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm">
          <span>{error}</span>
        </div>
      )}

      {classes.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-sm">
          No classes assigned to you on the schedule.
        </div>
      ) : (
        <div className="space-y-8">
          {classes.map((c) => {
            const classIsToday = isToday(c.schedule_time);
            return (
              <div 
                key={c._id} 
                className={`bg-slate-900 border rounded-xl p-6 shadow-lg space-y-6 ${
                  classIsToday ? 'border-indigo-500/50' : 'border-slate-800'
                }`}
              >
                {/* Class Details Banner */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-slate-100">{c.class_name}</h3>
                      {classIsToday && (
                        <span className="bg-indigo-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider">
                          Today
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-2">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-indigo-400" />
                        <span>
                          {new Date(c.schedule_time).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          at{' '}
                          {new Date(c.schedule_time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div>•</div>
                      <div>Capacity: {c.capacity} members max</div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400">
                    Booked Trainees: <span className="text-indigo-400 font-bold">{c.bookings.length}</span>
                  </div>
                </div>

                {/* Booked Member List (Trainer view is table-based) */}
                <div className="border-t border-slate-950 pt-4">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    Booked Trainees & Attendance
                  </h4>

                  {c.bookings.length === 0 ? (
                    <div className="text-xs text-slate-500 py-2">No members have booked slots in this session yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-850 text-slate-500 font-semibold uppercase tracking-wider">
                            <th className="py-2 px-3">Trainee Name</th>
                            <th className="py-2 px-3">Email Address</th>
                            <th className="py-2 px-3">Phone</th>
                            <th className="py-2 px-3">Status</th>
                            <th className="py-2 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {c.bookings.map((b) => {
                            const isToggling = togglingId === b.booking_id;
                            return (
                              <tr key={b.booking_id} className="border-b border-slate-950/60 hover:bg-slate-800/20 transition-colors">
                                <td className="py-3 px-3 font-semibold text-slate-200">{b.name}</td>
                                <td className="py-3 px-3 text-slate-400">{b.email}</td>
                                <td className="py-3 px-3 text-slate-400">{b.phone || '—'}</td>
                                <td className="py-3 px-3">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                                    b.attended 
                                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                                      : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                                  }`}>
                                    {b.attended ? 'Present' : 'Absent'}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <button
                                    onClick={() => handleToggleAttendance(b.booking_id, b.attended)}
                                    disabled={isToggling}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-semibold transition-colors border ${
                                      b.attended 
                                        ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20' 
                                        : 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent'
                                    }`}
                                  >
                                    {b.attended ? 'Mark Absent' : 'Mark Present'}
                                  </button>
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
          })}
        </div>
      )}
    </div>
  );
};

export default TrainerClasses;
