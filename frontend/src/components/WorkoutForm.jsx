import React, { useState } from 'react';
import { useWorkouts } from '../context/WorkoutContext';
import { PlusCircle, Loader2 } from 'lucide-react';

const WorkoutForm = () => {
  const { createWorkout } = useWorkouts();
  const [title, setTitle] = useState('');
  const [load, setLoad] = useState('');
  const [reps, setReps] = useState('');
  const [duration, setDuration] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !load || !reps || !duration) {
      setError('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      await createWorkout({
        title,
        load: Number(load),
        reps: Number(reps),
        duration: Number(duration),
      });

      setTitle('');
      setLoad('');
      setReps('');
      setDuration('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to add workout');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-2">
        <PlusCircle size={18} className="text-indigo-400" />
        Log New Workout
      </h3>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-xs">
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-lg text-xs">
          Workout logged successfully!
        </div>
      )}

      <div>
        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Exercise Name</label>
        <input
          type="text"
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          placeholder="e.g., Bench Press, Squat"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Load (kg)</label>
          <input
            type="number"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="0"
            min="0"
            value={load}
            onChange={(e) => setLoad(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Reps</label>
          <input
            type="number"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="1"
            min="1"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Duration (mins)</label>
        <input
          type="number"
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          placeholder="e.g., 45"
          min="1"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-4 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Logging...</span>
          </>
        ) : (
          <span>Log Workout</span>
        )}
      </button>
    </form>
  );
};

export default WorkoutForm;
