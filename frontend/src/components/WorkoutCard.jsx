import React, { useState } from 'react';
import { useWorkouts } from '../context/WorkoutContext';
import { formatTimeAgo } from '../utils/format';
import { Trash2, Edit2, Check, X, Weight, RefreshCw, Clock } from 'lucide-react';

const WorkoutCard = ({ workout }) => {
  const { deleteWorkout, updateWorkout } = useWorkouts();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(workout.title);
  const [load, setLoad] = useState(workout.load);
  const [reps, setReps] = useState(workout.reps);
  const [duration, setDuration] = useState(workout.duration);
  const [updating, setUpdating] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${workout.title}"?`)) {
      try {
        await deleteWorkout(workout._id);
      } catch (err) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  const handleUpdate = async () => {
    if (!title || load === '' || reps === '' || duration === '') {
      alert('Please fill out all fields');
      return;
    }

    setUpdating(true);
    try {
      await updateWorkout(workout._id, {
        title,
        load: Number(load),
        reps: Number(reps),
        duration: Number(duration),
      });
      setIsEditing(false);
    } catch (err) {
      alert(err.message || 'Failed to update');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setTitle(workout.title);
    setLoad(workout.load);
    setReps(workout.reps);
    setDuration(workout.duration);
    setIsEditing(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-between items-center shadow-md">
      {isEditing ? (
        <div className="w-full flex flex-col gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <input
              type="text"
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Exercise name"
            />
            <input
              type="number"
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
              value={load}
              onChange={(e) => setLoad(e.target.value)}
              placeholder="Load (kg)"
              min="0"
            />
            <input
              type="number"
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="Reps"
              min="1"
            />
            <input
              type="number"
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Mins"
              min="1"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={handleUpdate}
              disabled={updating}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors"
            >
              <Check size={12} />
              <span>{updating ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={handleCancel}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors"
            >
              <X size={12} />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="text-base font-bold text-slate-100">{workout.title}</div>
              {workout.plan_id && (
                <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  From Plan
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <Weight size={14} className="text-indigo-400" />
                <span>{workout.load} kg</span>
              </div>
              <div className="flex items-center gap-1">
                <RefreshCw size={14} className="text-cyan-400" />
                <span>{workout.reps} reps</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} className="text-emerald-400" />
                <span>{workout.duration} mins</span>
              </div>
              <div className="text-slate-500">
                {formatTimeAgo(workout.createdAt)}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Edit workout"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg bg-slate-850 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
              title="Delete workout"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkoutCard;
