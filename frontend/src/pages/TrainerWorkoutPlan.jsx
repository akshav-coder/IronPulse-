import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Trash2, UserPlus, X, Dumbbell, ShieldCheck, Layers, Calendar, Edit3 } from 'lucide-react';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_DAY_SUBTITLES = {
  Monday: 'Chest & Triceps Focus',
  Tuesday: 'Back & Biceps Focus',
  Wednesday: 'Legs & Core Focus',
  Thursday: 'Shoulders & Arms Focus',
  Friday: 'Upper Body Hypertrophy',
  Saturday: 'Lower Body & Conditioning',
};

const DEFAULT_MASTER_PLANS = [
  {
    id: 'master-1',
    name: '6-Day Hypertrophy & Muscle Split',
    tag: 'Monday – Saturday',
    description: 'Structured 6-day split targeting specific muscle groups from Monday through Saturday.',
    daySubtitles: {
      Monday: 'Chest & Triceps Focus',
      Tuesday: 'Back & Biceps Focus',
      Wednesday: 'Legs & Abs Focus',
      Thursday: 'Shoulders & Arms Focus',
      Friday: 'Upper Body Hypertrophy',
      Saturday: 'Lower Body & Calves Focus',
    },
    exercises: [
      { day_of_week: 'Monday', day_subtitle: 'Chest & Triceps Focus', exercise_name: 'Barbell Flat Bench Press', sets: 4, reps: 8 },
      { day_of_week: 'Monday', day_subtitle: 'Chest & Triceps Focus', exercise_name: 'Triceps Cable Pushdown', sets: 3, reps: 12 },
      { day_of_week: 'Tuesday', day_subtitle: 'Back & Biceps Focus', exercise_name: 'Barbell Lat Rows', sets: 4, reps: 8 },
      { day_of_week: 'Tuesday', day_subtitle: 'Back & Biceps Focus', exercise_name: 'Dumbbell Bicep Curls', sets: 3, reps: 12 },
      { day_of_week: 'Wednesday', day_subtitle: 'Legs & Abs Focus', exercise_name: 'Barbell Back Squats', sets: 4, reps: 8 },
      { day_of_week: 'Wednesday', day_subtitle: 'Legs & Abs Focus', exercise_name: 'Leg Extension', sets: 3, reps: 12 },
      { day_of_week: 'Thursday', day_subtitle: 'Shoulders & Arms Focus', exercise_name: 'Overhead Military Press', sets: 4, reps: 8 },
      { day_of_week: 'Thursday', day_subtitle: 'Shoulders & Arms Focus', exercise_name: 'Lateral Deltoid Raises', sets: 3, reps: 12 },
      { day_of_week: 'Friday', day_subtitle: 'Upper Body Hypertrophy', exercise_name: 'Dumbbell Incline Bench Press', sets: 4, reps: 10 },
      { day_of_week: 'Friday', day_subtitle: 'Upper Body Hypertrophy', exercise_name: 'Seated Cable Rows', sets: 4, reps: 10 },
      { day_of_week: 'Saturday', day_subtitle: 'Lower Body & Calves Focus', exercise_name: 'Romanian Deadlifts', sets: 4, reps: 10 },
      { day_of_week: 'Saturday', day_subtitle: 'Lower Body & Calves Focus', exercise_name: 'Standing Calf Raises', sets: 4, reps: 15 },
    ],
  },
  {
    id: 'master-2',
    name: 'Beginner 6-Day Full Body & Conditioning',
    tag: 'Monday – Saturday',
    description: 'Balanced Monday to Saturday schedule alternating strength workouts and light recovery cardio.',
    daySubtitles: {
      Monday: 'Full Body Push/Pull',
      Tuesday: 'Cardio & Active Recovery',
      Wednesday: 'Legs & Shoulder Focus',
      Thursday: 'Core & Ab Conditioning',
      Friday: 'Deadlift & Strength Focus',
      Saturday: 'HIIT Cardio Burner',
    },
    exercises: [
      { day_of_week: 'Monday', day_subtitle: 'Full Body Push/Pull', exercise_name: 'Flat Bench Press', sets: 3, reps: 10 },
      { day_of_week: 'Monday', day_subtitle: 'Full Body Push/Pull', exercise_name: 'Goblet Squats', sets: 4, reps: 12 },
      { day_of_week: 'Tuesday', day_subtitle: 'Cardio & Active Recovery', exercise_name: 'Treadmill Incline Walk', sets: 1, reps: 30 },
      { day_of_week: 'Wednesday', day_subtitle: 'Legs & Shoulder Focus', exercise_name: 'Lat Pulldowns', sets: 3, reps: 10 },
      { day_of_week: 'Wednesday', day_subtitle: 'Legs & Shoulder Focus', exercise_name: 'Overhead Dumbbell Press', sets: 3, reps: 12 },
      { day_of_week: 'Thursday', day_subtitle: 'Core & Ab Conditioning', exercise_name: 'Core Planks Hold', sets: 3, reps: 15 },
      { day_of_week: 'Friday', day_subtitle: 'Deadlift & Strength Focus', exercise_name: 'Deadlifts', sets: 3, reps: 8 },
      { day_of_week: 'Friday', day_subtitle: 'Deadlift & Strength Focus', exercise_name: 'Push-Ups', sets: 3, reps: 15 },
      { day_of_week: 'Saturday', day_subtitle: 'HIIT Cardio Burner', exercise_name: 'HIIT Cardio & Abs Circuit', sets: 4, reps: 20 },
    ],
  },
  {
    id: 'master-3',
    name: 'Fat Loss & Athletic Conditioning (Mon–Sat)',
    tag: 'Monday – Saturday',
    description: 'High burn 6-day conditioning routine designed for calorie burn and athletic endurance.',
    daySubtitles: {
      Monday: 'Kettlebell & HIIT Burn',
      Tuesday: 'Cardio & Bodyweight Split',
      Wednesday: 'Thrusters & Burpees Blitz',
      Thursday: 'Plyometrics & Ab Sculpting',
      Friday: 'Farmers Carry & Strength',
      Saturday: 'Endurance Circuit Burner',
    },
    exercises: [
      { day_of_week: 'Monday', day_subtitle: 'Kettlebell & HIIT Burn', exercise_name: 'Kettlebell Swings', sets: 4, reps: 15 },
      { day_of_week: 'Monday', day_subtitle: 'Kettlebell & HIIT Burn', exercise_name: 'Mountain Climbers', sets: 4, reps: 20 },
      { day_of_week: 'Tuesday', day_subtitle: 'Cardio & Bodyweight Split', exercise_name: 'Jump Rope Circuit', sets: 4, reps: 30 },
      { day_of_week: 'Tuesday', day_subtitle: 'Cardio & Bodyweight Split', exercise_name: 'Bodyweight Air Squats', sets: 4, reps: 15 },
      { day_of_week: 'Wednesday', day_subtitle: 'Thrusters & Burpees Blitz', exercise_name: 'Dumbbell Thrusters', sets: 4, reps: 12 },
      { day_of_week: 'Wednesday', day_subtitle: 'Thrusters & Burpees Blitz', exercise_name: 'Burpees', sets: 3, reps: 12 },
      { day_of_week: 'Thursday', day_subtitle: 'Plyometrics & Ab Sculpting', exercise_name: 'Bicycle Crunches', sets: 4, reps: 20 },
      { day_of_week: 'Thursday', day_subtitle: 'Plyometrics & Ab Sculpting', exercise_name: 'Box Jumps', sets: 3, reps: 10 },
      { day_of_week: 'Friday', day_subtitle: 'Farmers Carry & Strength', exercise_name: 'Dumbbell Farmers Walk', sets: 4, reps: 15 },
      { day_of_week: 'Friday', day_subtitle: 'Farmers Carry & Strength', exercise_name: 'Dumbbell Renegade Rows', sets: 3, reps: 12 },
      { day_of_week: 'Saturday', day_subtitle: 'Endurance Circuit Burner', exercise_name: 'Full Body Burner Circuit', sets: 4, reps: 15 },
    ],
  },
];

const TrainerWorkoutPlan = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Active Tab: 'master' or 'assigned'
  const [activeTab, setActiveTab] = useState('master');

  // Master Plans state
  const [masterPlans, setMasterPlans] = useState(() => {
    const saved = localStorage.getItem('trainer_master_workout_plans_v3');
    return saved ? JSON.parse(saved) : DEFAULT_MASTER_PLANS;
  });

  // Assign Modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPlanToAssign, setSelectedPlanToAssign] = useState(null);
  const [assignMemberId, setAssignMemberId] = useState('');
  const [assigning, setAssigning] = useState(false);

  // New Plan Creation state
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanTag, setNewPlanTag] = useState('Monday – Saturday');
  const [newPlanDesc, setNewPlanDesc] = useState('');

  // Editing Day Subtitle State: { planId, day } -> subtitle string
  const [editingDaySubtitleKey, setEditingDaySubtitleKey] = useState(null);
  const [tempDaySubtitle, setTempDaySubtitle] = useState('');

  // Add Exercise to Master Plan state
  const [addingExerciseToPlanId, setAddingExerciseToPlanId] = useState(null);
  const [newExDay, setNewExDay] = useState('Monday');
  const [newExName, setNewExName] = useState('');
  const [newExSets, setNewExSets] = useState('3');
  const [newExReps, setNewExReps] = useState('10');

  // Member Assigned Routine Tab state
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [memberPlanItems, setMemberPlanItems] = useState([]);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const gymId = user?.gym_id;
  const trainerId = user?._id || user?.id;

  // Persist master plans to local storage
  useEffect(() => {
    localStorage.setItem('trainer_master_workout_plans_v3', JSON.stringify(masterPlans));
  }, [masterPlans]);

  // Fetch Trainer's assigned members
  useEffect(() => {
    const fetchMembers = async () => {
      if (!gymId) return;
      try {
        setLoading(true);
        const res = await API.get(`/members/gym/${gymId}`);
        const assigned = res.data.filter((m) => {
          const tId = m.assigned_trainer_id?._id || m.assigned_trainer_id;
          const dId = m.assigned_dietitian_id?._id || m.assigned_dietitian_id;
          return (tId && tId.toString() === trainerId?.toString()) || (dId && dId.toString() === trainerId?.toString());
        });
        setMembers(assigned);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch assigned clients list');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [gymId, trainerId]);

  // Fetch member active routine
  const fetchMemberPlan = async (memberId) => {
    if (!memberId) {
      setMemberPlanItems([]);
      return;
    }
    try {
      setLoadingPlan(true);
      const res = await API.get(`/workout-plans/member/${memberId}`);
      setMemberPlanItems(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch member plan');
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleOpenAssignModal = (plan) => {
    setSelectedPlanToAssign(plan);
    setAssignMemberId(members.length > 0 ? members[0]._id : '');
    setShowAssignModal(true);
  };

  const handleConfirmAssignPlan = async (e) => {
    e.preventDefault();
    if (!selectedPlanToAssign || !assignMemberId) {
      alert('Please select a client to assign this workout plan');
      return;
    }

    const targetMember = members.find((m) => m._id === assignMemberId);

    setAssigning(true);
    try {
      // Ensure exercises carry day_subtitle from master plan
      const exercisesWithSubtitles = selectedPlanToAssign.exercises.map((ex) => ({
        ...ex,
        day_subtitle:
          ex.day_subtitle ||
          (selectedPlanToAssign.daySubtitles && selectedPlanToAssign.daySubtitles[ex.day_of_week]) ||
          DEFAULT_DAY_SUBTITLES[ex.day_of_week] ||
          '',
      }));

      await API.post('/workout-plans/assign-bulk', {
        member_id: assignMemberId,
        exercises: exercisesWithSubtitles,
      });

      setSuccessMsg(
        `Successfully assigned "${selectedPlanToAssign.name}" (Monday–Saturday) to client ${targetMember?.user_id?.name || 'Member'}!`
      );
      setShowAssignModal(false);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign workout plan to client');
    } finally {
      setAssigning(false);
    }
  };

  const handleCreateMasterPlan = (e) => {
    e.preventDefault();
    if (!newPlanName.trim()) {
      alert('Please enter a plan name');
      return;
    }

    const newPlan = {
      id: `master-${Date.now()}`,
      name: newPlanName.trim(),
      tag: newPlanTag || 'Monday – Saturday',
      description: newPlanDesc.trim() || 'Custom Monday to Saturday routine.',
      daySubtitles: { ...DEFAULT_DAY_SUBTITLES },
      exercises: [
        { day_of_week: 'Monday', day_subtitle: 'Chest & Triceps Focus', exercise_name: 'Bench Press', sets: 3, reps: 10 },
        { day_of_week: 'Tuesday', day_subtitle: 'Back & Biceps Focus', exercise_name: 'Lat Pulldown', sets: 3, reps: 10 },
        { day_of_week: 'Wednesday', day_subtitle: 'Legs & Core Focus', exercise_name: 'Barbell Squats', sets: 3, reps: 10 },
        { day_of_week: 'Thursday', day_subtitle: 'Shoulders & Arms Focus', exercise_name: 'Overhead Press', sets: 3, reps: 10 },
        { day_of_week: 'Friday', day_subtitle: 'Upper Body Hypertrophy', exercise_name: 'Deadlifts', sets: 3, reps: 8 },
        { day_of_week: 'Saturday', day_subtitle: 'Lower Body & Conditioning', exercise_name: 'Core & Cardio Circuit', sets: 4, reps: 15 },
      ],
    };

    setMasterPlans([newPlan, ...masterPlans]);
    setNewPlanName('');
    setNewPlanDesc('');
    setShowNewPlanModal(false);
  };

  const handleSaveDaySubtitle = (planId, day) => {
    setMasterPlans((prev) =>
      prev.map((plan) => {
        if (plan.id === planId) {
          const updatedSubtitles = {
            ...(plan.daySubtitles || DEFAULT_DAY_SUBTITLES),
            [day]: tempDaySubtitle.trim(),
          };
          const updatedExercises = plan.exercises.map((ex) => {
            if ((ex.day_of_week || 'Monday').toLowerCase() === day.toLowerCase()) {
              return { ...ex, day_subtitle: tempDaySubtitle.trim() };
            }
            return ex;
          });

          return {
            ...plan,
            daySubtitles: updatedSubtitles,
            exercises: updatedExercises,
          };
        }
        return plan;
      })
    );

    setEditingDaySubtitleKey(null);
  };

  const handleAddExerciseToMaster = (planId) => {
    if (!newExName.trim()) return;

    setMasterPlans((prev) =>
      prev.map((plan) => {
        if (plan.id === planId) {
          const currentDaySubtitle =
            (plan.daySubtitles && plan.daySubtitles[newExDay]) ||
            DEFAULT_DAY_SUBTITLES[newExDay] ||
            'Workout Focus';

          return {
            ...plan,
            exercises: [
              ...plan.exercises,
              {
                day_of_week: newExDay,
                day_subtitle: currentDaySubtitle,
                exercise_name: newExName.trim(),
                sets: Number(newExSets) || 3,
                reps: Number(newExReps) || 10,
              },
            ],
          };
        }
        return plan;
      })
    );

    setNewExName('');
    setAddingExerciseToPlanId(null);
  };

  const handleDeleteExerciseFromMaster = (planId, exIndex) => {
    setMasterPlans((prev) =>
      prev.map((plan) => {
        if (plan.id === planId) {
          return {
            ...plan,
            exercises: plan.exercises.filter((_, idx) => idx !== exIndex),
          };
        }
        return plan;
      })
    );
  };

  const handleDeleteMasterPlan = (planId) => {
    if (window.confirm('Are you sure you want to delete this Master Workout Plan template?')) {
      setMasterPlans((prev) => prev.filter((p) => p.id !== planId));
    }
  };

  if (loading) {
    return (
      <div className="main-content flex-center" style={{ minHeight: '60vh' }}>
        <div className="text-slate-400 text-sm">Loading workout planner...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white">
            Client <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Workout Planner</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Design Monday to Saturday workout plans with muscle focus subtitles (e.g., Chest & Triceps, Back & Biceps) and assign to trainees.
          </p>
        </div>

        <button
          onClick={() => setShowNewPlanModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-lg text-xs transition-all duration-200 flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer self-start md:self-auto"
        >
          <PlusCircle size={16} />
          <span>Create New Master Plan</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm">
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 max-w-md">
        <button
          onClick={() => setActiveTab('master')}
          className={`flex-1 pb-3 text-xs font-bold border-b-2 transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'master'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Layers size={16} />
          <span>Monday–Saturday Master Plans ({masterPlans.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('assigned')}
          className={`flex-1 pb-3 text-xs font-bold border-b-2 transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'assigned'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Dumbbell size={16} />
          <span>Assigned Client Routines</span>
        </button>
      </div>

      {/* TAB 1: MASTER MONDAY - SATURDAY PLANS GRID */}
      {activeTab === 'master' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {masterPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl p-6 shadow-xl flex flex-col justify-between space-y-6 transition-all"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                        📅 {plan.tag}
                      </span>
                      <h3 className="text-base font-bold text-slate-100">{plan.name}</h3>
                    </div>
                    <button
                      onClick={() => handleDeleteMasterPlan(plan.id)}
                      className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                      title="Delete Plan"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <p className="text-xs text-slate-400">{plan.description}</p>

                  {/* Monday to Saturday Day-by-Day Roster with Subtitles */}
                  <div className="space-y-3 border-t border-slate-800/80 pt-3">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center">
                      <span>Weekly Schedule & Day Focus</span>
                      <span>{plan.exercises.length} Exercises Total</span>
                    </div>

                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {DAYS_OF_WEEK.map((day) => {
                        const daySub =
                          (plan.daySubtitles && plan.daySubtitles[day]) ||
                          DEFAULT_DAY_SUBTITLES[day] ||
                          'General Fitness';

                        const dayExercises = plan.exercises.filter(
                          (ex) => (ex.day_of_week || 'Monday').toLowerCase() === day.toLowerCase()
                        );

                        const isEditingThisSubtitle = editingDaySubtitleKey === `${plan.id}-${day}`;

                        return (
                          <div key={day} className="bg-slate-950/80 border border-slate-850 rounded-lg p-3 space-y-2">
                            {/* Day Header + Subtitle */}
                            <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                              <div>
                                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider">
                                  <Calendar size={10} />
                                  <span>{day}</span>
                                </div>
                                {isEditingThisSubtitle ? (
                                  <div className="flex gap-1.5 mt-1">
                                    <input
                                      type="text"
                                      className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                                      placeholder="e.g. Chest + Biceps Day"
                                      value={tempDaySubtitle}
                                      onChange={(e) => setTempDaySubtitle(e.target.value)}
                                    />
                                    <button
                                      onClick={() => handleSaveDaySubtitle(plan.id, day)}
                                      className="bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded"
                                    >
                                      Save
                                    </button>
                                  </div>
                                ) : (
                                  <div className="text-xs font-bold text-slate-200 mt-0.5 flex items-center gap-1.5">
                                    <span>{daySub}</span>
                                    <button
                                      onClick={() => {
                                        setEditingDaySubtitleKey(`${plan.id}-${day}`);
                                        setTempDaySubtitle(daySub);
                                      }}
                                      className="text-slate-500 hover:text-indigo-400"
                                      title="Edit Day Subtitle"
                                    >
                                      <Edit3 size={11} />
                                    </button>
                                  </div>
                                )}
                              </div>

                              <span className="text-[10px] text-slate-500 font-bold">
                                {dayExercises.length} Ex
                              </span>
                            </div>

                            {dayExercises.length === 0 ? (
                              <div className="text-[10px] text-slate-600 italic py-1">Rest / Active Recovery Day</div>
                            ) : (
                              <div className="space-y-1">
                                {dayExercises.map((ex, exIdx) => {
                                  const realIdx = plan.exercises.indexOf(ex);
                                  return (
                                    <div
                                      key={exIdx}
                                      className="flex justify-between items-center bg-slate-900/90 px-2.5 py-1 rounded text-xs"
                                    >
                                      <span className="font-semibold text-slate-200 text-[11px] truncate">
                                        {ex.exercise_name}
                                      </span>
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <span className="text-[9px] text-indigo-300 font-bold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                                          {ex.sets}×{ex.reps}
                                        </span>
                                        <button
                                          onClick={() => handleDeleteExerciseFromMaster(plan.id, realIdx)}
                                          className="text-slate-600 hover:text-red-400"
                                        >
                                          <X size={11} />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Inline Add Exercise to Plan */}
                    {addingExerciseToPlanId === plan.id ? (
                      <div className="bg-slate-950 p-3 rounded-lg border border-indigo-500/30 space-y-2 mt-2">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Select Day</label>
                          <select
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                            value={newExDay}
                            onChange={(e) => setNewExDay(e.target.value)}
                          >
                            {DAYS_OF_WEEK.map((d) => (
                              <option key={d} value={d}>
                                {d} ({(plan.daySubtitles && plan.daySubtitles[d]) || DEFAULT_DAY_SUBTITLES[d]})
                              </option>
                            ))}
                          </select>
                        </div>
                        <input
                          type="text"
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                          placeholder="Exercise name (e.g. Incline Bench)"
                          value={newExName}
                          onChange={(e) => setNewExName(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            className="w-1/2 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200"
                            placeholder="Sets"
                            value={newExSets}
                            onChange={(e) => setNewExSets(e.target.value)}
                          />
                          <input
                            type="number"
                            className="w-1/2 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200"
                            placeholder="Reps"
                            value={newExReps}
                            onChange={(e) => setNewExReps(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => handleAddExerciseToMaster(plan.id)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-2.5 py-1 rounded"
                          >
                            Add to {newExDay}
                          </button>
                          <button
                            onClick={() => setAddingExerciseToPlanId(null)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setAddingExerciseToPlanId(plan.id);
                          setNewExName('');
                        }}
                        className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 pt-1"
                      >
                        <PlusCircle size={12} />
                        <span>+ Add Exercise to Day</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Action: Add Member Button */}
                <div className="pt-4 border-t border-slate-850">
                  <button
                    onClick={() => handleOpenAssignModal(plan)}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
                  >
                    <UserPlus size={16} />
                    <span>Add Member to Plan</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ASSIGNED CLIENT ROUTINES VIEW */}
      {activeTab === 'assigned' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md max-w-md">
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Select Client to Inspect Active Routine
            </label>
            <select
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              value={selectedMemberId}
              onChange={(e) => {
                setSelectedMemberId(e.target.value);
                fetchMemberPlan(e.target.value);
              }}
            >
              <option value="">-- Choose Client --</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.user_id?.name} ({m.user_id?.email})
                </option>
              ))}
            </select>
          </div>

          {selectedMemberId && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
              <h3 className="text-base font-bold text-slate-100">Active Prescribed Monday–Saturday Routine</h3>
              {loadingPlan ? (
                <div className="text-xs text-slate-500 py-4 animate-pulse">Loading active plan details...</div>
              ) : memberPlanItems.length === 0 ? (
                <div className="text-xs text-slate-500 py-4">No exercises assigned to this client yet. Assign a Monday–Saturday Master Plan from the first tab!</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {DAYS_OF_WEEK.map((day) => {
                    const dayExs = memberPlanItems.filter(
                      (item) => (item.day_of_week || 'Monday').toLowerCase() === day.toLowerCase()
                    );
                    const daySub = dayExs.find((item) => item.day_subtitle)?.day_subtitle || DEFAULT_DAY_SUBTITLES[day];

                    return (
                      <div key={day} className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2">
                        <div className="border-b border-slate-850 pb-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                            <Calendar size={12} />
                            <span>{day}</span>
                          </div>
                          <div className="text-xs font-bold text-slate-200 mt-0.5">{daySub}</div>
                        </div>
                        {dayExs.length === 0 ? (
                          <div className="text-[10px] text-slate-600 italic py-2">Rest / Recovery Day</div>
                        ) : (
                          <div className="space-y-1.5 pt-1">
                            {dayExs.map((item) => (
                              <div key={item._id} className="flex justify-between items-center bg-slate-900/90 px-2.5 py-1.5 rounded text-xs">
                                <span className="font-bold text-slate-200">{item.exercise_name}</span>
                                <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                                  {item.sets}×{item.reps}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ASSIGN PLAN TO MEMBER ("ADD MEMBER") */}
      {showAssignModal && selectedPlanToAssign && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Add Member to Plan</h3>
                <p className="text-xs text-indigo-400 font-medium mt-0.5">{selectedPlanToAssign.name}</p>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmAssignPlan} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Select Assigned Client
                </label>
                {members.length === 0 ? (
                  <div className="text-xs text-amber-400 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                    No active clients assigned to your profile yet.
                  </div>
                ) : (
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                    value={assignMemberId}
                    onChange={(e) => setAssignMemberId(e.target.value)}
                    required
                  >
                    {members.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.user_id?.name} ({m.user_id?.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Routine Exercises Preview */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Monday–Saturday Routine ({selectedPlanToAssign.exercises.length} Exercises)
                </span>
                <div className="space-y-1.5 max-h-44 overflow-y-auto">
                  {selectedPlanToAssign.exercises.map((ex, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-slate-300 py-1 border-b border-slate-900 last:border-0">
                      <span className="font-semibold">
                        <span className="text-indigo-400 mr-1.5 font-bold">[{ex.day_of_week || 'Mon'}]</span>
                        {ex.exercise_name}
                      </span>
                      <span className="text-indigo-300 font-bold">{ex.sets}×{ex.reps}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={assigning || members.length === 0}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg text-xs transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {assigning ? 'Assigning Routine...' : 'Confirm Assignment'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2.5 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE NEW MASTER PLAN */}
      {showNewPlanModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-slate-100">Create Monday–Saturday Master Plan</h3>
              <button
                onClick={() => setShowNewPlanModal(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateMasterPlan} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Plan Name
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. 6-Day Powerlifting Split"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Category Tag
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Monday – Saturday"
                  value={newPlanTag}
                  onChange={(e) => setNewPlanTag(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 h-20"
                  placeholder="Brief 6-day routine description..."
                  value={newPlanDesc}
                  onChange={(e) => setNewPlanDesc(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg text-xs transition-colors shadow-lg shadow-indigo-600/20"
                >
                  Create Plan Template
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewPlanModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2.5 rounded-lg text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerWorkoutPlan;
