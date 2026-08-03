import React, { useState, useEffect } from 'react';
import API from '../api';
import { Dumbbell, Calendar, User, Zap } from 'lucide-react';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_DAY_SUBTITLES = {
  Monday: 'Chest & Triceps Focus',
  Tuesday: 'Back & Biceps Focus',
  Wednesday: 'Legs & Core Focus',
  Thursday: 'Shoulders & Arms Focus',
  Friday: 'Upper Body Hypertrophy',
  Saturday: 'Lower Body & Conditioning',
};

const MemberWorkoutPlan = () => {
  const [plans, setPlans] = useState([]);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loggingId, setLoggingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchMyPlan = async () => {
      try {
        setLoading(true);
        // 1. Resolve own Member profile details
        const profileRes = await API.get('/members/profile/me');
        const memberData = profileRes.data;
        setMember(memberData);

        // 2. Fetch own Workout Plan using Member ID
        const planRes = await API.get(`/workout-plans/member/${memberData._id}`);
        setPlans(planRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch your workout plan');
      } finally {
        setLoading(false);
      }
    };

    fetchMyPlan();
  }, []);

  const handleLogFromPlan = async (item) => {
    try {
      setLoggingId(item._id);
      await API.post('/workouts', {
        title: item.exercise_name,
        load: 20, // default target load
        reps: Number(item.reps) || 10,
        duration: 15, // default duration
        plan_id: item._id,
      });
      setSuccessMsg(`Logged "${item.exercise_name}" (${item.day_of_week || 'Today'}) against your plan successfully!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to log workout');
    } finally {
      setLoggingId(null);
    }
  };

  if (loading) {
    return (
      <div className="main-content flex-center" style={{ minHeight: '60vh' }}>
        <div className="text-slate-400 text-sm">Loading your training schedule...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white">
          My Workout <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Plan</span>
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Review your Monday to Saturday muscle focus routines (e.g. Chest & Triceps, Back & Biceps) and log exercises directly.
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-sm font-semibold flex items-center gap-2">
          <Zap size={18} className="text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {plans.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-sm flex flex-col items-center gap-3">
          <Dumbbell size={40} className="text-slate-600 opacity-60 animate-bounce" />
          <div>
            <h4 className="text-base font-bold text-slate-300">No Workout Schedule Assigned</h4>
            <p className="text-slate-500 text-xs mt-1">
              Ask your trainer ({member?.assigned_trainer_id?.name || 'Assigned Coach'}) to assign a Monday–Saturday workout plan to your profile!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DAYS_OF_WEEK.map((day) => {
            const dayExercises = plans.filter(
              (p) => (p.day_of_week || 'Monday').toLowerCase() === day.toLowerCase()
            );

            // Find explicit day_subtitle or default focus
            const daySub =
              dayExercises.find((item) => item.day_subtitle)?.day_subtitle ||
              DEFAULT_DAY_SUBTITLES[day] ||
              'Muscle Focus';

            return (
              <div
                key={day}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Day Header & Subtitle */}
                  <div className="border-b border-slate-850 pb-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 font-extrabold text-indigo-400 text-xs uppercase tracking-wider">
                        <Calendar size={13} />
                        <span>{day}</span>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                        {dayExercises.length} Exercises
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100 mt-1">
                      {daySub}
                    </h3>
                  </div>

                  {/* Day Exercises List */}
                  {dayExercises.length === 0 ? (
                    <div className="text-xs text-slate-600 italic py-6 text-center">
                      Rest & Active Recovery Day 🧘
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dayExercises.map((item) => (
                        <div
                          key={item._id}
                          className="bg-slate-950/80 border border-slate-850 p-3 rounded-lg space-y-2.5"
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-sm text-slate-200">{item.exercise_name}</span>
                            <div className="flex gap-2 text-[10px] font-bold text-slate-300">
                              <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                                {item.sets} sets
                              </span>
                              <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                                {item.reps} reps
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleLogFromPlan(item)}
                            disabled={loggingId === item._id}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-1.5 rounded-md text-xs transition-colors shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
                          >
                            {loggingId === item._id ? 'Logging...' : '⚡ Log This Exercise'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-950 pt-3 flex justify-between items-center text-[10px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <User size={11} className="text-indigo-400" />
                    Trainer: {member?.assigned_trainer_id?.name || 'IronPulse Coach'}
                  </span>
                  <span>Routine Schedule</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MemberWorkoutPlan;
