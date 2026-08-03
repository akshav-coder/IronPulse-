import React, { useEffect, useState } from 'react';
import { useDiet } from '../context/DietContext';
import { Search, PlusCircle, Trash2, Calendar, Flame, ShieldAlert, Award } from 'lucide-react';

const DietTracker = () => {
  const { dietLogs, loading, fetchDietLogs, createDietLog, deleteDietLog } = useDiet();
  const [searchTerm, setSearchTerm] = useState('');

  // Add meal form state
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDietLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogCustomMeal = async (e) => {
    e.preventDefault();
    if (!mealName.trim() || !calories) {
      alert('Please enter a meal name and calories count');
      return;
    }

    setSubmitting(true);
    try {
      await createDietLog({
        title: mealName.trim(),
        calories: Number(calories),
        protein: Number(protein || 0),
        carbs: Number(carbs || 0),
        fat: Number(fat || 0),
      });

      setMealName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
    } catch (err) {
      alert(err.message || 'Failed to log custom meal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLog = async (id) => {
    if (window.confirm('Are you sure you want to delete this nutrition log entry?')) {
      try {
        await deleteDietLog(id);
      } catch (err) {
        alert(err.message || 'Failed to delete log entry');
      }
    }
  };

  const filteredLogs = dietLogs.filter((log) =>
    log.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals
  const totalCalories = filteredLogs.reduce((acc, curr) => acc + (curr.calories || 0), 0);
  const totalProtein = filteredLogs.reduce((acc, curr) => acc + (curr.protein || 0), 0);
  const totalCarbs = filteredLogs.reduce((acc, curr) => acc + (curr.carbs || 0), 0);
  const totalFat = filteredLogs.reduce((acc, curr) => acc + (curr.fat || 0), 0);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white">
            Diet <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Tracker</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Log custom meals, track macro intake history, and check daily nutritional totals.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="Search logged meals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Log Form & Daily Totals Card */}
        <div className="space-y-6">
          {/* Add Custom Meal Form */}
          <form onSubmit={handleLogCustomMeal} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-2">
              <PlusCircle size={18} className="text-indigo-400" />
              Log Custom Meal
            </h3>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Meal Name</label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="e.g. Oatmeal with Protein Powder"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Calories (kcal)</label>
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="350"
                  min="0"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Protein (g)</label>
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="25"
                  min="0"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Carbs (g)</label>
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="40"
                  min="0"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Fat (g)</label>
                <input
                  type="number"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="10"
                  min="0"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-4 shadow-lg shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Logging...' : 'Log Meal'}
            </button>
          </form>

          {/* Daily Totals Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-800/80">
              Nutritional Summary
            </h4>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Flame size={16} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Total Calories</div>
                  <div className="text-sm font-bold text-slate-200">{totalCalories.toLocaleString()} kcal</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-slate-850 pt-3">
                <div>
                  <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Protein</div>
                  <div className="text-xs font-extrabold text-slate-300">{totalProtein}g</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Carbs</div>
                  <div className="text-xs font-extrabold text-slate-300">{totalCarbs}g</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Fat</div>
                  <div className="text-xs font-extrabold text-slate-300">{totalFat}g</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Nutrition Logs List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-base font-bold text-slate-100 mb-4">Meal History logs</h3>

            {loading ? (
              <div className="text-xs text-slate-500 py-4 animate-pulse">Loading diet logs...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center">No meals logged yet. Log meals using the form or click "Log This Meal" on your Diet Plan!</div>
            ) : (
              <div className="space-y-3">
                {filteredLogs.map((log) => (
                  <div
                    key={log._id}
                    className="flex justify-between items-center bg-slate-950/60 hover:bg-slate-950 border border-slate-850 p-4 rounded-xl transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-200">{log.title}</span>
                        {log.plan_id && (
                          <span className="text-[8px] font-extrabold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full">
                            From Plan
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 text-[10px] text-slate-400 font-medium">
                        <span className="text-indigo-400 font-bold">🔥 {log.calories} kcal</span>
                        <span>• P: {log.protein}g</span>
                        <span>• C: {log.carbs}g</span>
                        <span>• F: {log.fat}g</span>
                      </div>
                      <span className="text-[9px] text-slate-500 block">
                        Logged: {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteLog(log._id)}
                      className="p-2 rounded bg-slate-900 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete Meal Log"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DietTracker;
