import React, { useEffect, useState } from 'react';
import { useWorkouts } from '../context/WorkoutContext';
import WorkoutList from '../components/WorkoutList';
import WorkoutForm from '../components/WorkoutForm';
import { Search, Activity, Calendar, Trophy } from 'lucide-react';
import { calculateMetrics } from '../utils/format';

const Workouts = () => {
  const { workouts, loading, fetchWorkouts } = useWorkouts();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchWorkouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredWorkouts = workouts.filter((workout) =>
    workout.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const metrics = calculateMetrics(filteredWorkouts);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white">
            Workout <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Tracker</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Log new exercise entries, track sessions, and browse your complete fitness journal.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content Layout - Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form & Filtered Metrics */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
            <WorkoutForm />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-800/80">
              Filtered Totals
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Calendar size={16} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Sessions</div>
                  <div className="text-sm font-bold text-slate-200">{metrics.totalWorkouts}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <Trophy size={16} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Total Lift</div>
                  <div className="text-sm font-bold text-slate-200">{metrics.totalWeight.toLocaleString()} kg</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Activity size={16} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Duration</div>
                  <div className="text-sm font-bold text-slate-200">{metrics.totalDuration} mins</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Workouts List */}
        <div className="lg:col-span-2">
          <WorkoutList workouts={filteredWorkouts} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default Workouts;
