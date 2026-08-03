import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { Calendar, User, Clock, ShieldCheck, ShieldAlert, Award } from 'lucide-react';

const MemberClassSchedule = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittingId, setSubmittingId] = useState(null);

  const gymId = user?.gym_id;

  const fetchClasses = async () => {
    if (!gymId) return;
    try {
      setLoading(true);
      const res = await API.get(`/bookings/gym/${gymId}`);
      setClasses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load class schedule');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gymId]);

  const handleBookSlot = async (classId) => {
    setSubmittingId(classId);
    try {
      await API.post('/bookings', { class_id: classId });
      alert('Class slot booked successfully!');
      fetchClasses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to book slot');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleCancelBooking = async (classId) => {
    if (window.confirm('Are you sure you want to cancel your slot booking for this class?')) {
      setSubmittingId(classId);
      try {
        await API.post('/bookings/cancel', { class_id: classId });
        alert('Booking canceled successfully!');
        fetchClasses();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to cancel booking');
      } finally {
        setSubmittingId(null);
      }
    }
  };

  if (loading && classes.length === 0) {
    return (
      <div className="main-content flex-center" style={{ minHeight: '60vh' }}>
        <div className="text-slate-400 text-sm">Loading available sessions...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-white">
          Class <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Schedule</span>
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Explore fitness classes, reserve training slots, and view schedules.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm mb-6">
          <span>{error}</span>
        </div>
      )}

      {/* Class list cards (Member page -> Card-based) */}
      {classes.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-sm">
          No classes scheduled at your gym branch currently.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((c) => {
            const spotsLeft = c.capacity - c.bookedCount;
            const isFull = spotsLeft <= 0;
            const isSubmitting = submittingId === c._id;

            return (
              <div key={c._id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between gap-6 relative overflow-hidden">
                {c.userBooked && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                    Booked
                  </div>
                )}
                
                <div className="space-y-4">
                  {/* Title & Trainer */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 pr-12">{c.class_name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <User size={13} className="text-indigo-400" />
                      <span>Coached by {c.trainer_id?.name || 'Unassigned'}</span>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
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

                  {/* Spot counts */}
                  <div className="text-xs border-t border-slate-950 pt-3">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-500">Occupied Spots</span>
                      <span className="text-slate-300">
                        {c.bookedCount} / {c.capacity} slots filled
                      </span>
                    </div>
                    
                    {/* Capacity Indicator Bar */}
                    <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-850">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          c.userBooked ? 'bg-indigo-500' : isFull ? 'bg-red-500' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${Math.min((c.bookedCount / c.capacity) * 100, 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center mt-3 text-[10px] font-bold uppercase tracking-wider">
                      {c.userBooked ? (
                        <span className="text-indigo-400 flex items-center gap-1">
                          <ShieldCheck size={12} /> Your Spot is Secured
                        </span>
                      ) : isFull ? (
                        <span className="text-red-400 flex items-center gap-1">
                          <ShieldAlert size={12} /> Class is Fully Booked
                        </span>
                      ) : (
                        <span className="text-cyan-400">
                          {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} remaining!
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 border-t border-slate-950 pt-4">
                  {c.userBooked ? (
                    <button
                      onClick={() => handleCancelBooking(c._id)}
                      disabled={isSubmitting}
                      className="w-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 text-rose-400 font-semibold py-2 rounded-lg text-sm transition-all duration-200"
                    >
                      {isSubmitting ? 'Canceling...' : 'Cancel Slot Booking'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBookSlot(c._id)}
                      disabled={isFull || isSubmitting}
                      className={`w-full font-semibold py-2 rounded-lg text-sm transition-all duration-200 border ${
                        isFull 
                          ? 'bg-slate-950 border-slate-850 text-slate-600 cursor-not-allowed' 
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent shadow-lg shadow-indigo-600/10'
                      }`}
                    >
                      {isSubmitting ? 'Booking...' : isFull ? 'Fully Booked' : 'Book Training Slot'}
                    </button>
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

export default MemberClassSchedule;
