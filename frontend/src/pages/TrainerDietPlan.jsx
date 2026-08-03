import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Trash2, UserPlus, X, Apple, ShieldCheck, Layers, Calendar, Edit3 } from 'lucide-react';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_DAY_SUBTITLES = {
  Monday: 'High Protein Focus',
  Tuesday: 'Low Carb Conditioning',
  Wednesday: 'Moderate Energy Balance',
  Thursday: 'Clean Nutrition Roster',
  Friday: 'High Protein Focus',
  Saturday: 'Refeed & Recovery Focus',
};

const DEFAULT_MASTER_PLANS = [
  {
    id: 'diet-master-1',
    name: 'Balanced Carb-Cycling Plan',
    tag: 'Monday – Saturday',
    description: 'Alternates between low-carb and high-carb days to maximize fat loss while preserving muscle.',
    daySubtitles: {
      Monday: 'Low Carb Focus',
      Tuesday: 'High Carb Day',
      Wednesday: 'Low Carb Focus',
      Thursday: 'High Carb Day',
      Friday: 'Low Carb Focus',
      Saturday: 'High Carb Refeed',
    },
    exercises: [
      { day_of_week: 'Monday', day_subtitle: 'Low Carb Focus', meal_name: 'Scrambled Eggs & Avocado', calories: 350, protein: 22, carbs: 3, fat: 28 },
      { day_of_week: 'Monday', day_subtitle: 'Low Carb Focus', meal_name: 'Grilled Chicken & Broccoli', calories: 450, protein: 45, carbs: 10, fat: 12 },
      { day_of_week: 'Monday', day_subtitle: 'Low Carb Focus', meal_name: 'Baked Salmon & Asparagus', calories: 500, protein: 40, carbs: 5, fat: 28 },
      { day_of_week: 'Tuesday', day_subtitle: 'High Carb Day', meal_name: 'Oats with Honey & Banana', calories: 500, protein: 20, carbs: 80, fat: 8 },
      { day_of_week: 'Tuesday', day_subtitle: 'High Carb Day', meal_name: 'Chicken Rice & Black Beans Bowl', calories: 750, protein: 48, carbs: 95, fat: 12 },
      { day_of_week: 'Wednesday', day_subtitle: 'Low Carb Focus', meal_name: 'Keto Whey Protein Shake', calories: 300, protein: 30, carbs: 5, fat: 15 },
      { day_of_week: 'Wednesday', day_subtitle: 'Low Carb Focus', meal_name: 'Grilled Steak & Cauliflower Mash', calories: 600, protein: 48, carbs: 8, fat: 34 },
      { day_of_week: 'Thursday', day_subtitle: 'High Carb Day', meal_name: 'Cream of Rice & Protein Powder', calories: 450, protein: 35, carbs: 65, fat: 5 },
      { day_of_week: 'Thursday', day_subtitle: 'High Carb Day', meal_name: 'Turkey Breast & Quinoa Salad', calories: 700, protein: 45, carbs: 80, fat: 10 },
      { day_of_week: 'Friday', day_subtitle: 'Low Carb Focus', meal_name: 'Egg Muffins with Spinach', calories: 300, protein: 20, carbs: 4, fat: 20 },
      { day_of_week: 'Friday', day_subtitle: 'Low Carb Focus', meal_name: 'Chicken Caesar Salad (No Croutons)', calories: 550, protein: 38, carbs: 8, fat: 38 },
      { day_of_week: 'Saturday', day_subtitle: 'High Carb Refeed', meal_name: 'Protein Pancakes with Maple Syrup', calories: 550, protein: 32, carbs: 85, fat: 6 },
    ],
  },
  {
    id: 'diet-master-2',
    name: 'High Protein Clean Bulk',
    tag: 'Monday – Saturday',
    description: 'High calorie, macro-dense nutrition routine designed for clean muscle gains and lifting performance.',
    daySubtitles: {
      Monday: 'Clean Muscle Builder',
      Tuesday: 'Clean Muscle Builder',
      Wednesday: 'Clean Muscle Builder',
      Thursday: 'Clean Muscle Builder',
      Friday: 'Clean Muscle Builder',
      Saturday: 'High Calorie Strength Load',
    },
    exercises: [
      { day_of_week: 'Monday', day_subtitle: 'Clean Muscle Builder', meal_name: 'Oats with Whey & Peanut Butter', calories: 550, protein: 35, carbs: 60, fat: 15 },
      { day_of_week: 'Monday', day_subtitle: 'Clean Muscle Builder', meal_name: 'Grilled Chicken & Rice Bowl', calories: 750, protein: 50, carbs: 85, fat: 18 },
      { day_of_week: 'Monday', day_subtitle: 'Clean Muscle Builder', meal_name: 'Beef Stir-Fry with Jasmine Rice', calories: 850, protein: 55, carbs: 90, fat: 22 },
      { day_of_week: 'Tuesday', day_subtitle: 'Clean Muscle Builder', meal_name: 'Scrambled Eggs & Avocado Toast', calories: 500, protein: 30, carbs: 40, fat: 20 },
      { day_of_week: 'Tuesday', day_subtitle: 'Clean Muscle Builder', meal_name: 'Salmon Fillet & Quinoa Salad', calories: 800, protein: 45, carbs: 75, fat: 28 },
      { day_of_week: 'Wednesday', day_subtitle: 'Clean Muscle Builder', meal_name: 'Greek Yogurt with Granola & Honey', calories: 450, protein: 28, carbs: 55, fat: 10 },
      { day_of_week: 'Wednesday', day_subtitle: 'Clean Muscle Builder', meal_name: 'Sweet Potatoes & Grilled Chicken', calories: 700, protein: 48, carbs: 80, fat: 12 },
      { day_of_week: 'Thursday', day_subtitle: 'Clean Muscle Builder', meal_name: 'Banana Protein Pancakes', calories: 500, protein: 32, carbs: 65, fat: 8 },
      { day_of_week: 'Thursday', day_subtitle: 'Clean Muscle Builder', meal_name: 'Tuna Salad Sandwich (Whole Wheat)', calories: 600, protein: 40, carbs: 50, fat: 18 },
      { day_of_week: 'Friday', day_subtitle: 'Clean Muscle Builder', meal_name: 'Beef Meatballs & Whole Wheat Pasta', calories: 850, protein: 55, carbs: 100, fat: 20 },
      { day_of_week: 'Saturday', day_subtitle: 'High Calorie Strength Load', meal_name: 'Turkey Wrap & Swiss Cheese', calories: 600, protein: 38, carbs: 50, fat: 18 },
      { day_of_week: 'Saturday', day_subtitle: 'High Calorie Strength Load', meal_name: 'Salmon Fillet with Jasmine Rice', calories: 800, protein: 48, carbs: 80, fat: 22 },
    ],
  },
  {
    id: 'diet-master-3',
    name: 'Keto Weight Loss Split',
    tag: 'Monday – Saturday',
    description: 'High fat, ultra-low carb ketogenic schedule to promote ketosis and efficient fat loss.',
    daySubtitles: {
      Monday: 'High Fat Ketosis',
      Tuesday: 'High Fat Ketosis',
      Wednesday: 'High Fat Ketosis',
      Thursday: 'High Fat Ketosis',
      Friday: 'High Fat Ketosis',
      Saturday: 'High Fat Ketosis',
    },
    exercises: [
      { day_of_week: 'Monday', day_subtitle: 'High Fat Ketosis', meal_name: 'Bulletproof Coffee & Boiled Eggs', calories: 350, protein: 12, carbs: 1, fat: 32 },
      { day_of_week: 'Monday', day_subtitle: 'High Fat Ketosis', meal_name: 'Salmon Avocado Cobb Salad', calories: 600, protein: 38, carbs: 4, fat: 48 },
      { day_of_week: 'Monday', day_subtitle: 'High Fat Ketosis', meal_name: 'Grilled Ribeye & Buttered Asparagus', calories: 800, protein: 55, carbs: 2, fat: 64 },
      { day_of_week: 'Tuesday', day_subtitle: 'High Fat Ketosis', meal_name: 'Bacon, Spinach & Cheddar Omelette', calories: 450, protein: 28, carbs: 2, fat: 38 },
      { day_of_week: 'Tuesday', day_subtitle: 'High Fat Ketosis', meal_name: 'Avocado Tuna Salad lettuce wraps', calories: 500, protein: 32, carbs: 3, fat: 40 },
      { day_of_week: 'Wednesday', day_subtitle: 'High Fat Ketosis', meal_name: 'Keto Protein Shake with Coconut Oil', calories: 300, protein: 30, carbs: 2, fat: 20 },
      { day_of_week: 'Wednesday', day_subtitle: 'High Fat Ketosis', meal_name: 'Pork Chops & Garlic Butter Broccoli', calories: 700, protein: 45, carbs: 4, fat: 56 },
      { day_of_week: 'Thursday', day_subtitle: 'High Fat Ketosis', meal_name: 'Shrimp Zucchini Noodles (Pesto)', calories: 450, protein: 35, carbs: 6, fat: 32 },
      { day_of_week: 'Thursday', day_subtitle: 'High Fat Ketosis', meal_name: 'Baked Cod with Lemon Herb Butter', calories: 500, protein: 40, carbs: 2, fat: 38 },
      { day_of_week: 'Friday', day_subtitle: 'High Fat Ketosis', meal_name: 'Keto Chia Seed Pudding', calories: 250, protein: 8, carbs: 4, fat: 22 },
      { day_of_week: 'Friday', day_subtitle: 'High Fat Ketosis', meal_name: 'Caesar Salad with Chicken & Avocado', calories: 600, protein: 35, carbs: 5, fat: 48 },
      { day_of_week: 'Saturday', day_subtitle: 'High Fat Ketosis', meal_name: 'Bunless Bacon Cheeseburger', calories: 750, protein: 48, carbs: 4, fat: 60 },
    ],
  },
];

const TrainerDietPlan = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Active Tab: 'master' or 'assigned'
  const [activeTab, setActiveTab] = useState('master');

  // Master Plans state
  const [masterPlans, setMasterPlans] = useState(() => {
    const saved = localStorage.getItem('trainer_master_diet_plans_v1');
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

  // Editing Day Subtitle State
  const [editingDaySubtitleKey, setEditingDaySubtitleKey] = useState(null);
  const [tempDaySubtitle, setTempDaySubtitle] = useState('');

  // Add Meal to Master Plan state
  const [addingMealToPlanId, setAddingMealToPlanId] = useState(null);
  const [newMealDay, setNewMealDay] = useState('Monday');
  const [newMealName, setNewMealName] = useState('');
  const [newMealCalories, setNewMealCalories] = useState('400');
  const [newMealProtein, setNewMealProtein] = useState('30');
  const [newMealCarbs, setNewMealCarbs] = useState('40');
  const [newMealFat, setNewMealFat] = useState('10');

  // Member Assigned Routine Tab state
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [memberPlanItems, setMemberPlanItems] = useState([]);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const gymId = user?.gym_id;
  const trainerId = user?._id || user?.id;

  // Persist master plans to local storage
  useEffect(() => {
    localStorage.setItem('trainer_master_diet_plans_v1', JSON.stringify(masterPlans));
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

  // Fetch member active diet plan
  const fetchMemberPlan = async (memberId) => {
    if (!memberId) {
      setMemberPlanItems([]);
      return;
    }
    try {
      setLoadingPlan(true);
      const res = await API.get(`/diet-plans/member/${memberId}`);
      setMemberPlanItems(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setMemberPlanItems([]);
      } else {
        alert(err.response?.data?.message || 'Failed to fetch member diet plan');
      }
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
      alert('Please select a client to assign this diet plan');
      return;
    }

    const targetMember = members.find((m) => m._id === assignMemberId);

    setAssigning(true);
    try {
      // Structure meals layout mapping expected exercises payload
      const mealsToSend = selectedPlanToAssign.exercises.map((meal) => ({
        ...meal,
        day_subtitle:
          meal.day_subtitle ||
          (selectedPlanToAssign.daySubtitles && selectedPlanToAssign.daySubtitles[meal.day_of_week]) ||
          DEFAULT_DAY_SUBTITLES[meal.day_of_week] ||
          '',
      }));

      await API.post('/diet-plans/assign-bulk', {
        member_id: assignMemberId,
        exercises: mealsToSend,
      });

      setSuccessMsg(
        `Successfully assigned "${selectedPlanToAssign.name}" (Monday–Saturday) to client ${targetMember?.user_id?.name || 'Member'}!`
      );
      setShowAssignModal(false);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign diet plan to client');
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
      id: `diet-master-${Date.now()}`,
      name: newPlanName.trim(),
      tag: newPlanTag || 'Monday – Saturday',
      description: newPlanDesc.trim() || 'Custom Monday to Saturday nutrition routine.',
      daySubtitles: { ...DEFAULT_DAY_SUBTITLES },
      exercises: [
        { day_of_week: 'Monday', day_subtitle: 'High Protein Focus', meal_name: 'Eggs, Oats & Whey', calories: 500, protein: 40, carbs: 50, fat: 12 },
        { day_of_week: 'Tuesday', day_subtitle: 'Low Carb Conditioning', meal_name: 'Chicken Breast & Greens', calories: 400, protein: 45, carbs: 10, fat: 8 },
        { day_of_week: 'Wednesday', day_subtitle: 'Moderate Energy Balance', meal_name: 'Salmon Fillet & Rice', calories: 600, protein: 40, carbs: 50, fat: 20 },
        { day_of_week: 'Thursday', day_subtitle: 'Clean Nutrition Roster', meal_name: 'Turkey wrap & Salad', calories: 450, protein: 35, carbs: 40, fat: 12 },
        { day_of_week: 'Friday', day_subtitle: 'High Protein Focus', meal_name: 'Whey shake & Almonds', calories: 350, protein: 30, carbs: 10, fat: 18 },
        { day_of_week: 'Saturday', day_subtitle: 'Refeed & Recovery Focus', meal_name: 'Clean Beef Burger Bowl', calories: 700, protein: 50, carbs: 60, fat: 24 },
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

  const handleAddMealToMaster = (planId) => {
    if (!newMealName.trim()) return;

    setMasterPlans((prev) =>
      prev.map((plan) => {
        if (plan.id === planId) {
          const currentDaySubtitle =
            (plan.daySubtitles && plan.daySubtitles[newMealDay]) ||
            DEFAULT_DAY_SUBTITLES[newMealDay] ||
            'Nutrition Focus';

          return {
            ...plan,
            exercises: [
              ...plan.exercises,
              {
                day_of_week: newMealDay,
                day_subtitle: currentDaySubtitle,
                meal_name: newMealName.trim(),
                calories: Number(newMealCalories) || 0,
                protein: Number(newMealProtein) || 0,
                carbs: Number(newMealCarbs) || 0,
                fat: Number(newMealFat) || 0,
              },
            ],
          };
        }
        return plan;
      })
    );

    setNewMealName('');
    setAddingMealToPlanId(null);
  };

  const handleDeleteMealFromMaster = (planId, mealIndex) => {
    setMasterPlans((prev) =>
      prev.map((plan) => {
        if (plan.id === planId) {
          return {
            ...plan,
            exercises: plan.exercises.filter((_, idx) => idx !== mealIndex),
          };
        }
        return plan;
      })
    );
  };

  const handleDeleteMasterPlan = (planId) => {
    if (window.confirm('Are you sure you want to delete this Master Diet Plan template?')) {
      setMasterPlans((prev) => prev.filter((p) => p.id !== planId));
    }
  };

  if (loading) {
    return (
      <div className="main-content flex-center" style={{ minHeight: '60vh' }}>
        <div className="text-slate-400 text-sm">Loading diet planner...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white">
            Client <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Diet Planner</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Design Monday to Saturday Master Diet Plans with nutrition focus subtitles and assign to trainees.
          </p>
        </div>

        <button
          onClick={() => setShowNewPlanModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-lg text-xs transition-all duration-200 flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer self-start md:self-auto"
        >
          <PlusCircle size={16} />
          <span>Create New Master Diet</span>
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
          <span>Monday–Saturday Diet Plans ({masterPlans.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('assigned')}
          className={`flex-1 pb-3 text-xs font-bold border-b-2 transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'assigned'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Apple size={16} />
          <span>Assigned Client Diets</span>
        </button>
      </div>

      {/* TAB 1: MASTER DIET PLANS GRID */}
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
                        🥗 {plan.tag}
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
                      <span>Weekly Meals & Nutrition Focus</span>
                      <span>{plan.exercises.length} Meals Total</span>
                    </div>

                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {DAYS_OF_WEEK.map((day) => {
                        const daySub =
                          (plan.daySubtitles && plan.daySubtitles[day]) ||
                          DEFAULT_DAY_SUBTITLES[day] ||
                          'Healthy Focus';

                        const dayMeals = plan.exercises.filter(
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
                                      placeholder="e.g. Low Carb Day"
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
                                {dayMeals.length} Meals
                              </span>
                            </div>

                            {dayMeals.length === 0 ? (
                              <div className="text-[10px] text-slate-600 italic py-1">Cheat / Rest Day</div>
                            ) : (
                              <div className="space-y-1">
                                {dayMeals.map((ex, exIdx) => {
                                  const realIdx = plan.exercises.indexOf(ex);
                                  return (
                                    <div
                                      key={exIdx}
                                      className="flex flex-col bg-slate-900/90 px-2.5 py-1.5 rounded text-xs gap-1"
                                    >
                                      <div className="flex justify-between items-center">
                                        <span className="font-semibold text-slate-200 text-[11px] truncate">
                                          {ex.meal_name}
                                        </span>
                                        <button
                                          onClick={() => handleDeleteMealFromMaster(plan.id, realIdx)}
                                          className="text-slate-600 hover:text-red-400"
                                        >
                                          <X size={11} />
                                        </button>
                                      </div>
                                      <div className="flex gap-2 text-[9px] text-slate-400 font-bold">
                                        <span className="bg-slate-950 px-1 py-0.2 rounded border border-slate-850 text-indigo-300">
                                          🔥 {ex.calories} kcal
                                        </span>
                                        <span>P: {ex.protein}g</span>
                                        <span>C: {ex.carbs}g</span>
                                        <span>F: {ex.fat}g</span>
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

                    {/* Inline Add Meal to Plan */}
                    {addingMealToPlanId === plan.id ? (
                      <div className="bg-slate-950 p-3 rounded-lg border border-indigo-500/30 space-y-2 mt-2">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Select Day</label>
                          <select
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                            value={newMealDay}
                            onChange={(e) => setNewMealDay(e.target.value)}
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
                          placeholder="Meal item name (e.g. Oats & Whey)"
                          value={newMealName}
                          onChange={(e) => setNewMealName(e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                            placeholder="Calories"
                            value={newMealCalories}
                            onChange={(e) => setNewMealCalories(e.target.value)}
                          />
                          <input
                            type="number"
                            className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                            placeholder="Protein (g)"
                            value={newMealProtein}
                            onChange={(e) => setNewMealProtein(e.target.value)}
                          />
                          <input
                            type="number"
                            className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                            placeholder="Carbs (g)"
                            value={newMealCarbs}
                            onChange={(e) => setNewMealCarbs(e.target.value)}
                          />
                          <input
                            type="number"
                            className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                            placeholder="Fat (g)"
                            value={newMealFat}
                            onChange={(e) => setNewMealFat(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => handleAddMealToMaster(plan.id)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-2.5 py-1 rounded"
                          >
                            Add to {newMealDay}
                          </button>
                          <button
                            onClick={() => setAddingMealToPlanId(null)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setAddingMealToPlanId(plan.id);
                          setNewMealName('');
                        }}
                        className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 pt-1"
                      >
                        <PlusCircle size={12} />
                        <span>+ Add Meal to Day</span>
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

      {/* TAB 2: ASSIGNED CLIENT DIETS VIEW */}
      {activeTab === 'assigned' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md max-w-md">
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Select Client to Inspect Active Diet Plan
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
              <h3 className="text-base font-bold text-slate-100">Active Prescribed Monday–Saturday Diet Plan</h3>
              {loadingPlan ? (
                <div className="text-xs text-slate-500 py-4 animate-pulse">Loading active plan details...</div>
              ) : memberPlanItems.length === 0 ? (
                <div className="text-xs text-slate-500 py-4">No diet plan assigned to this client yet. Assign a Monday–Saturday Master Diet from the first tab!</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {DAYS_OF_WEEK.map((day) => {
                    const dayMeals = memberPlanItems.filter(
                      (item) => (item.day_of_week || 'Monday').toLowerCase() === day.toLowerCase()
                    );
                    const daySub = dayMeals.find((item) => item.day_subtitle)?.day_subtitle || DEFAULT_DAY_SUBTITLES[day];

                    return (
                      <div key={day} className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2">
                        <div className="border-b border-slate-850 pb-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                            <Calendar size={12} />
                            <span>{day}</span>
                          </div>
                          <div className="text-xs font-bold text-slate-200 mt-0.5">{daySub}</div>
                        </div>
                        {dayMeals.length === 0 ? (
                          <div className="text-[10px] text-slate-600 italic py-2">Cheat / Rest Day</div>
                        ) : (
                          <div className="space-y-1.5 pt-1">
                            {dayMeals.map((item) => (
                              <div key={item._id} className="flex flex-col bg-slate-900/90 p-2 rounded text-xs gap-0.5">
                                <span className="font-bold text-slate-200">{item.meal_name}</span>
                                <span className="text-[9px] font-bold text-indigo-300">
                                  🔥 {item.calories} kcal | P:{item.protein}g C:{item.carbs}g F:{item.fat}g
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
                <h3 className="text-lg font-bold text-slate-100">Add Member to Diet Plan</h3>
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

              {/* Diet Plan Meals Preview */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Monday–Saturday Diet ({selectedPlanToAssign.exercises.length} Meals)
                </span>
                <div className="space-y-1.5 max-h-44 overflow-y-auto">
                  {selectedPlanToAssign.exercises.map((ex, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-slate-300 py-1 border-b border-slate-900 last:border-0">
                      <span className="font-semibold">
                        <span className="text-indigo-400 mr-1.5 font-bold">[{ex.day_of_week || 'Mon'}]</span>
                        {ex.meal_name}
                      </span>
                      <span className="text-indigo-300 font-bold">{ex.calories} kcal</span>
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
                  {assigning ? 'Assigning Diet Plan...' : 'Confirm Assignment'}
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

      {/* MODAL 2: CREATE NEW MASTER DIET PLAN */}
      {showNewPlanModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-slate-100">Create Monday–Saturday Master Diet</h3>
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
                  placeholder="e.g. Lean Shred Carb Cycling"
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
                  placeholder="Brief 6-day diet description..."
                  value={newPlanDesc}
                  onChange={(e) => setNewPlanDesc(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg text-xs transition-colors shadow-lg shadow-indigo-600/20"
                >
                  Create Diet Template
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

export default TrainerDietPlan;
