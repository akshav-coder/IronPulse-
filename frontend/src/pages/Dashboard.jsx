import React, { useEffect } from 'react';
import { useWorkouts } from '../context/WorkoutContext';
import { useAuth } from '../context/AuthContext';
import { calculateMetrics } from '../utils/format';
import StatCard from '../components/StatCard';
import WorkoutList from '../components/WorkoutList';
import AnalyticsChart from '../components/AnalyticsChart';
import { Dumbbell, Clock, Zap, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { workouts, loading, fetchWorkouts } = useWorkouts();
  const { user } = useAuth();

  useEffect(() => {
    fetchWorkouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metrics = calculateMetrics(workouts);
  const recentWorkouts = workouts.slice(0, 4);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-white">
          Welcome back, <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">{user?.name}</span>!
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Here is your fitness performance overview and recent workout trends.
        </p>
      </div>

      {/* Stats Cards - Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Workouts"
          value={metrics.totalWorkouts}
          desc="Sessions tracked"
          icon={Dumbbell}
          variant="indigo"
        />
        <StatCard
          title="Total Volume"
          value={`${metrics.totalWeight.toLocaleString()} kg`}
          desc="Reps × load volume"
          icon={Award}
          variant="cyan"
        />
        <StatCard
          title="Total Duration"
          value={`${metrics.totalDuration} mins`}
          desc="Spent working out"
          icon={Clock}
          variant="emerald"
        />
        <StatCard
          title="Avg. Duration"
          value={`${metrics.averageDuration} mins`}
          desc="Average time per session"
          icon={Zap}
          variant="rose"
        />
      </div>

      {/* Dashboard Content */}
      <div className="space-y-6">
        {/* Trend Chart Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <AnalyticsChart workouts={workouts} />
        </div>

        {/* Recent Workouts Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-100">Recent Workouts</h3>
            <Link to="/workouts" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View all logs &rarr;
            </Link>
          </div>
          <WorkoutList workouts={recentWorkouts} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;