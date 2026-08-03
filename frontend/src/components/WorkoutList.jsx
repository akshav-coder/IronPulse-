import React from 'react';
import WorkoutCard from './WorkoutCard';
import { Dumbbell } from 'lucide-react';

const WorkoutList = ({ workouts, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-slate-400 text-sm animate-pulse">Loading workouts...</div>
      </div>
    );
  }

  if (!workouts || workouts.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-12 flex flex-col items-center justify-center text-center gap-3">
        <Dumbbell size={40} className="text-slate-600 opacity-60" />
        <div>
          <h4 className="text-base font-bold text-slate-300">No Workouts Logged</h4>
          <p className="text-slate-500 text-xs mt-1">
            Start tracking your workout routines to see analytics!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {workouts.map((workout) => (
        <WorkoutCard key={workout._id} workout={workout} />
      ))}
    </div>
  );
};

export default WorkoutList;
